import * as THREE from 'three';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import { ROOM_CONFIG, ROOM_OBJECT_ACTIVITY_TYPE, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from './data/room-config';
import { Black, MessageDispatcher } from 'black-engine';
import { ROOM_OBJECT_ENABLED_CONFIG } from './data/room-objects-enabled-config';
import { MONITOR_SCREEN_BUTTONS } from './room-active-objects/monitor/data/monitor-data';
import { arraysEqual } from './shared-objects/helpers';
import { SOUNDS_CONFIG } from './data/sounds-config';
import { LAPTOP_SCREEN_MUSIC_PARTS, MUSIC_TYPE } from './room-active-objects/laptop/data/laptop-data';
import { LAPTOP_SCREEN_MUSIC_CONFIG } from './room-active-objects/laptop/data/laptop-config';
import { CAMERA_FOCUS_OBJECT_TYPE, CAMERA_MODE } from './camera-controller/data/camera-data';
import { CAMERA_CONFIG } from './camera-controller/data/camera-config';
import { WINDOW_OPEN_TYPE } from './room-active-objects/walls/data/walls-data';

export default class RoomController {
  constructor(data) {
    this.events = new MessageDispatcher();

    this._scene = data.scene;
    this._camera = data.camera;
    this._renderer = data.renderer;
    this._orbitControls = data.orbitControls;
    this._outlinePass = data.outlinePass;
    this._audioListener = data.audioListener,
    this._cameraController = data.cameraController;
    this._raycasterController = data.raycasterController;

    this._roomScene = data.roomScene;
    this._roomDebug = data.roomDebug;
    this._cursor = data.cursor;

    this._roomActiveObject = data.roomActiveObject;
    this._roomInactiveObject = data.roomInactiveObject;
    this._roomObjectsByActivityType = data.roomObjectsByActivityType;

    this._pointerPositionOnDown = new THREE.Vector2();
    this._previousPointerPosition = new THREE.Vector2();
    this._pointerPosition = new THREE.Vector2();
    this._draggingObject = null;

    this._previousZoomInPosition = new THREE.Vector2();
    this._currentZoomInPosition = new THREE.Vector2();

    this._glowMeshesNames = [];
    this._previousGlowMeshesNames = [];

    this._init();
  }

  update(dt) {
    if (dt > 0.1) {
      dt = 0.1;
    }

    const intersect = this._raycasterController.checkIntersection(this._pointerPosition.x, this._pointerPosition.y);

    if (intersect === null) {
      Black.engine.containerElement.style.cursor = 'auto';
      this._glowMeshesNames = [];
      this._previousGlowMeshesNames = [];
    }

    if (intersect && intersect.object && !this._draggingObject) {
      this._checkToGlow(intersect);
    }

    if (intersect === null || intersect.instanceId !== undefined) {
      this._resetGlow();
    }

    for (const objectType in this._roomActiveObject) {
      this._roomActiveObject[objectType].update(dt);
    }

    for (const objectType in this._roomInactiveObject) {
      this._roomInactiveObject[objectType].update(dt);
    }

    this._cursor.update(dt);
    this._cameraController.update(dt);
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);
    this._cameraController.onPointerMove(x, y);

    if (this._draggingObject) {
      const raycaster = this._raycasterController.getRaycaster();
      this._draggingObject.onPointerMove(raycaster);
    }
  }

  onPointerDown(x, y) {
    this._pointerPositionOnDown.set(x, y);
    const intersect = this._raycasterController.checkIntersection(x, y);

    if (!intersect) {
      return;
    }

    const intersectObject = intersect.object;

    if (intersectObject && intersectObject.userData.isActive && ROOM_OBJECT_ENABLED_CONFIG[intersect.object.userData.objectType]) {
      const objectType = intersect.object.userData.objectType;
      const objectConfig = ROOM_OBJECT_CONFIG[objectType];
      const roomObject = this._roomActiveObject[objectType];

      if (objectConfig.isDraggable) {
        const isObjectDraggable = roomObject.onClick(intersect, true);

        if (isObjectDraggable) {
          this._checkToShowDebugFolders(roomObject);

          this._draggingObject = roomObject;
          this._cameraController.onObjectDragStart();

          this._setGlow(this._draggingObject.getMeshesForOutline(intersectObject));
        }
      }
    }
  }

  onPointerUp(x, y) {
    const isCursorMoved = Math.abs(Math.round(this._pointerPositionOnDown.x) - Math.round(x)) <= ROOM_CONFIG.clickActiveObjectError
      && Math.abs(Math.round(this._pointerPositionOnDown.y) - Math.round(y)) <= ROOM_CONFIG.clickActiveObjectError;

    if (this._draggingObject === null && isCursorMoved) {
      this._onPointerClick(x, y);
    }

    if (this._draggingObject) {
      this._draggingObject.onPointerUp();
      this._draggingObject = null;
      this._cameraController.onObjectDragEnd();
    }
  }

  onPointerLeave() {
    this._cameraController.onPointerLeave();
    this._resetGlow();
  }

  onWheelScroll(delta) {
    this._cameraController.onWheelScroll(delta);
  }

  showWithAnimation(startDelay = 0) {
    this._roomDebug.disableShowAnimationControllers();
    const delayBetweenObjects = ROOM_CONFIG.startAnimation.delayBetweenObjects;

    this._showRoomObject(ROOM_OBJECT_TYPE.Walls, startDelay);
    const wallShowDelay = 600;

    // floor objects
    this._showRoomObject(ROOM_OBJECT_TYPE.FloorLamp, startDelay + wallShowDelay);
    this._showRoomObject(ROOM_OBJECT_TYPE.Locker, startDelay + wallShowDelay + delayBetweenObjects);
    this._showRoomObject(ROOM_OBJECT_TYPE.Carpet, startDelay + wallShowDelay + delayBetweenObjects * 3);
    this._showRoomObject(ROOM_OBJECT_TYPE.Chair, startDelay + wallShowDelay + delayBetweenObjects * 5);
    this._showRoomObject(ROOM_OBJECT_TYPE.Scales, startDelay + wallShowDelay + delayBetweenObjects * 6);

    const leftWallObjectsShowDelay = 1500;

    // left wall objects
    this._showRoomObject(ROOM_OBJECT_TYPE.Picture, startDelay + leftWallObjectsShowDelay);
    this._showRoomObject(ROOM_OBJECT_TYPE.AirConditioner, startDelay + leftWallObjectsShowDelay + delayBetweenObjects);

    const tableShowDelay = 1500;
    const tableObjectsShowDelay = 2100;

    // table objects
    this._showRoomObject(ROOM_OBJECT_TYPE.Table, startDelay + tableShowDelay);
    this._showRoomObject(ROOM_OBJECT_TYPE.MousePad, startDelay + tableObjectsShowDelay);
    this._showRoomObject(ROOM_OBJECT_TYPE.Speakers, startDelay + tableObjectsShowDelay + delayBetweenObjects * 0.5);
    this._showRoomObject(ROOM_OBJECT_TYPE.Organizer, startDelay + tableObjectsShowDelay + delayBetweenObjects * 1.5);
    this._showRoomObject(ROOM_OBJECT_TYPE.Laptop, startDelay + tableObjectsShowDelay + delayBetweenObjects * 2);
    this._showRoomObject(ROOM_OBJECT_TYPE.Monitor, startDelay + tableObjectsShowDelay + delayBetweenObjects * 2.5);
    this._cursor.hideAndShow(startDelay + tableObjectsShowDelay + delayBetweenObjects * 2.5);
    this._showRoomObject(ROOM_OBJECT_TYPE.Keyboard, startDelay + tableObjectsShowDelay + delayBetweenObjects * 3);
    this._showRoomObject(ROOM_OBJECT_TYPE.Mouse, startDelay + tableObjectsShowDelay + delayBetweenObjects * 3.5);
    this._showRoomObject(ROOM_OBJECT_TYPE.Coaster, startDelay + tableObjectsShowDelay + delayBetweenObjects * 4);
    this._showRoomObject(ROOM_OBJECT_TYPE.Cup, startDelay + tableObjectsShowDelay + delayBetweenObjects * 4.5);

    this._showRoomObject(ROOM_OBJECT_TYPE.SocialNetworkLogos, startDelay + tableObjectsShowDelay + delayBetweenObjects * 10);
  }

  onSoundsEnabledChanged() {
    for (const key in this._roomActiveObject) {
      if (SOUNDS_CONFIG.enabled) {
        this._roomActiveObject[key].enableSound();
      } else {
        this._roomActiveObject[key].disableSound();
      }
    }
  }

  onUISoundIconChanged() {
    this.onSoundsEnabledChanged();
    this._roomDebug.updateSoundsEnabledController();
  }

  _showRoomObject(objectType, startDelay = 0) {
    const activityType = ROOM_OBJECT_CONFIG[objectType].activityType;

    if (activityType === ROOM_OBJECT_ACTIVITY_TYPE.Active) {
      this._roomActiveObject[objectType].showWithAnimation(startDelay);
    }

    if (activityType === ROOM_OBJECT_ACTIVITY_TYPE.Inactive) {
      this._roomInactiveObject[objectType].showWithAnimation(startDelay);
    }
  }

  _onPointerClick(x, y) {
    const intersect = this._raycasterController.checkIntersection(x, y);

    if (!intersect) {
      return;
    }

    const intersectObject = intersect.object;

    if (intersectObject && intersectObject.userData.isActive && ROOM_OBJECT_ENABLED_CONFIG[intersect.object.userData.objectType]) {
      const objectType = intersect.object.userData.objectType;
      const roomObject = this._roomActiveObject[objectType];

      this._checkToShowDebugFolders(roomObject);
      roomObject.onClick(intersect, false);
    }
  }

  _checkToGlow(intersect) {
    const object = intersect.object;

    if (object === null || !object.userData.isActive || !this._roomActiveObject[object.userData.objectType].isInputEnabled() || !ROOM_OBJECT_ENABLED_CONFIG[object.userData.objectType]) {
      this._resetGlow();
      Black.engine.containerElement.style.cursor = 'auto';

      this._glowMeshesNames = [];
      this._previousGlowMeshesNames = [];
      this._resetRoomObjectsPointerOver();

      return;
    }

    const roomObject = this._roomActiveObject[object.userData.objectType];
    const meshes = roomObject.getMeshesForOutline(object);

    if (meshes.length === 1 && this._isInstancedObject(meshes[0])) {
      this._glowMeshesNames = [`${meshes[0].name}${intersect.instanceId}`];
    } else {
      this._glowMeshesNames = meshes.map(mesh => mesh.name);
    }

    if (!arraysEqual(this._glowMeshesNames, this._previousGlowMeshesNames)) {
      this._resetRoomObjectsPointerOver();

      if (!(meshes[0] && meshes[0].userData.hideOutline === true)) {
        this._setGlow(meshes);
      }

      roomObject.onPointerOver(intersect);
    }

    this._previousGlowMeshesNames = this._glowMeshesNames;
  }

  _setGlow(items) {
    if (ROOM_CONFIG.outlineEnabled && !DEBUG_CONFIG.wireframe && !this._isInstancedObject(items[0])) {
      this._outlinePass.selectedObjects = items;
    }
  }

  _resetGlow() {
    if (this._outlinePass.selectedObjects.length > 0) {
      this._outlinePass.selectedObjects = [];
    }
  }

  _resetRoomObjectsPointerOver() {
    for (const key in this._roomActiveObject) {
      this._roomActiveObject[key].onPointerOut();
    }
  }

  _hideAllOtherObjectsDebugMenu(roomObject) {
    for (const key in this._roomActiveObject) {
      if (this._roomActiveObject[key] !== roomObject && this._roomActiveObject[key].hasDebugMenu()) {
        this._roomActiveObject[key].closeDebugMenu();
      }
    }
  }

  _checkToShowDebugFolders(roomObject) {
    if (ROOM_CONFIG.autoOpenActiveDebugFolder && roomObject.hasDebugMenu()) {
      this._hideAllOtherObjectsDebugMenu(roomObject);
      roomObject.openDebugMenu();
    }
  }

  _isInstancedObject(object) {
    return object instanceof THREE.InstancedMesh;
  }

  _init() {
    this._initSignals();

    if (ROOM_CONFIG.startAnimation.showOnStart) {
      this.showWithAnimation(600);
    }

    if (SOUNDS_CONFIG.debugHelpers) {
      for (const key in this._roomActiveObject) {
        this._roomActiveObject[key].showSoundHelpers();
      }
    }
  }

  _onDebugStartShowAnimation(selectedObjectType) {
    if (selectedObjectType === START_ANIMATION_ALL_OBJECTS) {
      this.showWithAnimation();
    } else {
      const activityType = ROOM_OBJECT_CONFIG[selectedObjectType].activityType;
      const roomObjects = this._roomObjectsByActivityType[activityType];

      roomObjects[selectedObjectType].showWithAnimation();
    }
  }

  _initSignals() {
    this._initDebugShowAnimationSignals();
    this._initLaptopMusicSignals();
    this._initCursorSignals();
    this._initKeyboardSignals();
    this._initDebugMenuSignals();
    this._initRealKeyboardSignals();
    this._initOtherSignals();
  }

  _initDebugShowAnimationSignals() {
    for (const key in this._roomActiveObject) {
      const roomObject = this._roomActiveObject[key];

      roomObject.events.on('showAnimationComplete', () => {
        if (this._checkIsShowAnimationComplete()) {
          this._roomDebug.enableShowAnimationControllers();
        }
      });
    }
  }

  _initLaptopMusicSignals() {
    const laptop = this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop];
    const speakers = this._roomActiveObject[ROOM_OBJECT_TYPE.Speakers];

    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType) => {
      const signalName = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[partType].signalName;
      const musicType = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[partType].musicType;

      laptop.events.on(signalName, () => speakers.playMusic(musicType));
    });

    speakers.events.on('onMusicChanged', (msg, musicType, musicDuration) => laptop.onDebugMusicChanged(musicType, musicDuration));
    speakers.events.on('updateCurrentSongTime', (msg, songCurrentTime) => laptop.updateCurrentSongTime(songCurrentTime));
    speakers.events.on('onSongEnded', () => laptop.onSongEnded());
  }

  _initCursorSignals() {
    const laptop = this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop];
    const monitor = this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor];

    this._cursor.events.on('onLaptopButtonOver', (msg, buttonType) => laptop.onButtonOver(buttonType));
    this._cursor.events.on('onLaptopButtonOut', () => laptop.onButtonOut());
    this._cursor.events.on('onMonitorButtonOver', (msg, buttonType) => monitor.onButtonOver(buttonType));
    this._cursor.events.on('onMonitorButtonOut', () => monitor.onButtonOut());
    this._cursor.events.on('onLeftKeyClick', (msg, buttonType) => this._onMouseOnButtonClick(buttonType));
  }

  _initKeyboardSignals() {
    const keyboard = this._roomActiveObject[ROOM_OBJECT_TYPE.Keyboard];
    const monitor = this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor];
    const laptop = this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop];

    keyboard.events.on('onKeyboardEscClick', () => monitor.stopShowreelVideo());
    keyboard.events.on('onKeyboardSpaceClick', () => monitor.pauseShowreelVideo());
    keyboard.events.on('onKeyboardMuteClick', () => this._onKeyboardMuteClick());
    keyboard.events.on('onKeyboardVolumeDownClick', () => this._onKeyboardVolumeDownClick());
    keyboard.events.on('onKeyboardVolumeUpClick', () => this._onKeyboardVolumeUpClick());
    keyboard.events.on('onKeyboardPreviousTrackClick', () => laptop.playPreviousSong());
    keyboard.events.on('onKeyboardPlayPauseClick', () => laptop.playPauseCurrentMusic());
    keyboard.events.on('onKeyboardNextTrackClick', () => laptop.playNextSong());
    keyboard.events.on('onKeyboardBaseClick', () => this._onKeyboardFocus());
    keyboard.events.on('onCloseFocusIconClick', () => this._onExitFocusMode());
  }

  _initDebugMenuSignals() {
    this._roomDebug.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
    this._roomDebug.events.on('debugHelpersChanged', () => this._onDebugHelpersChanged());
    this._roomDebug.events.on('volumeChanged', () => this._onVolumeChanged());
    this._roomDebug.events.on('soundsEnabledChanged', () => this.onDebugSoundsEnabledChanged());
    this._roomDebug.events.on('startShowAnimation', (msg, selectedObjectType) => this._onDebugStartShowAnimation(selectedObjectType));
    this._roomDebug.events.on('onMonitorFocus', () => this._onMonitorFocus());
    this._roomDebug.events.on('onKeyboardFocus', () => this._onKeyboardFocus());
    this._roomDebug.events.on('onRoomFocus', () => this._onRoomFocus());
    this._roomDebug.events.on('onExitFocusMode', () => this._onExitFocusMode());
  }

  _initOtherSignals() {
    const speakers = this._roomActiveObject[ROOM_OBJECT_TYPE.Speakers];
    const laptop = this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop];
    const mouse = this._roomActiveObject[ROOM_OBJECT_TYPE.Mouse];
    const walls = this._roomActiveObject[ROOM_OBJECT_TYPE.Walls];
    const monitor = this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor];
    const chair = this._roomActiveObject[ROOM_OBJECT_TYPE.Chair];
    const locker = this._roomActiveObject[ROOM_OBJECT_TYPE.Locker];
    const table = this._roomActiveObject[ROOM_OBJECT_TYPE.Table];

    laptop.events.on('onLaptopClosed', () => this._cursor.onLaptopClosed());
    laptop.events.on('onLaptopScreenClick', () => this._onMonitorFocus());
    mouse.events.on('onCursorScaleChanged', () => this._cursor.onCursorScaleChanged());
    mouse.events.on('onLeftKeyClick', () => this._cursor.onMouseLeftKeyClicked());
    walls.events.on('onWindowStartOpening', () => this._onWindowStartOpening());
    walls.events.on('onWindowClosed', () => this._onWindowClosed());
    walls.events.on('onWindowOpened', (msg, openType) => this._onWindowFullyOpened(openType));
    monitor.events.on('onShowreelStart', () => this._onShowreelStart());
    monitor.events.on('onShowreelStop', () => this._onShowreelStop());
    monitor.events.on('onShowreelPause', () => speakers.onShowreelPause());
    monitor.events.on('onMonitorScreenClick', () => this._onMonitorFocus());
    monitor.events.on('onCloseFocusIconClick', () => this._onExitFocusMode());
    chair.events.on('onLockerAreaChange', (msg, areaType, state) => locker.onChairNearLocker(areaType, state));
    table.events.on('onTableMoving', () => this._disableFocusObjects());
    table.events.on('onTableStop', (msg, tableState) => this._onTableStop(tableState));
    locker.events.on('onWorkplacePhotoClickToShow', (msg, workplacePhoto) => this._onWorkplacePhotoClickToShow(workplacePhoto));
    locker.events.on('onWorkplacePhotoClickToHide', () => this._onWorkplacePhotoClickToHide());
    this._cameraController.events.on('onObjectFocused', (msg, focusedObject) => this._onObjectFocused(focusedObject));
  }

  _initRealKeyboardSignals() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (CAMERA_CONFIG.mode === CAMERA_MODE.Static) {
          this._onWorkplacePhotoClickToHide();
        }

        const monitor = this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor];

        if (CAMERA_CONFIG.mode === CAMERA_MODE.Focused) {
          if (CAMERA_CONFIG.focusObjectType === CAMERA_FOCUS_OBJECT_TYPE.Monitor && monitor.isShowreelPlaying()) {
            monitor.stopShowreelVideo();
          } else {
            this._onExitFocusMode();
          }
        }
      }
    });
  }

  _onMonitorFocus() {
    const chair = this._roomActiveObject[ROOM_OBJECT_TYPE.Chair];
    chair.moveToStartPosition();

    this._disableScreensOnMonitorFocus();
    this._enableBaseOnKeyboardFocus();
    ROOM_OBJECT_ENABLED_CONFIG[ROOM_OBJECT_TYPE.Table] = false;
    this._roomActiveObject[ROOM_OBJECT_TYPE.Table].disableDebugMenu();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Keyboard].hideCloseFocusIcon();
    this._cameraController.focusCamera(CAMERA_FOCUS_OBJECT_TYPE.Monitor);
  }

  _onKeyboardFocus() {
    this._disableBaseOnKeyboardFocus();
    this._enableScreensOnMonitorFocus();
    ROOM_OBJECT_ENABLED_CONFIG[ROOM_OBJECT_TYPE.Table] = false;
    this._roomActiveObject[ROOM_OBJECT_TYPE.Table].disableDebugMenu();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].hideCloseFocusIcon();
    this._cameraController.focusCamera(CAMERA_FOCUS_OBJECT_TYPE.Keyboard);
  }

  _onRoomFocus() {
    this._enableBaseOnKeyboardFocus();
    this._enableScreensOnMonitorFocus();
    ROOM_OBJECT_ENABLED_CONFIG[ROOM_OBJECT_TYPE.Table] = true;
    this._roomActiveObject[ROOM_OBJECT_TYPE.Table].enableDebugMenu();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Keyboard].hideCloseFocusIcon();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].hideCloseFocusIcon();
    this._cameraController.focusCamera(CAMERA_FOCUS_OBJECT_TYPE.Room);
  }

  _onExitFocusMode() {
    this._enableBaseOnKeyboardFocus();
    this._enableScreensOnMonitorFocus();
    ROOM_OBJECT_ENABLED_CONFIG[ROOM_OBJECT_TYPE.Table] = true;
    this._roomActiveObject[ROOM_OBJECT_TYPE.Table].enableDebugMenu();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Keyboard].hideCloseFocusIcon();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].hideCloseFocusIcon();
    this._cameraController.focusCamera(CAMERA_FOCUS_OBJECT_TYPE.LastPosition);
  }

  _disableFocusObjects() {
    this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].setScreenInactive();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop].setScreenInactive();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Keyboard].setBaseInactive();
    this._roomDebug.disableMonitorFocusButton();
    this._roomDebug.disableKeyboardFocusButton();
  }

  _enableFocusObjects() {
    this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].setScreenActive();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop].setScreenActive();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Keyboard].setBaseActive();
    this._roomDebug.enableMonitorFocusButton();
    this._roomDebug.enableKeyboardFocusButton();
  }

  _onTableStop(tableState) {
    this._enableFocusObjects();
    this._roomActiveObject[ROOM_OBJECT_TYPE.AirConditioner].setTableState(tableState);
  }

  _onWorkplacePhotoClickToShow(workplacePhoto) {
    this._cameraController.setStaticState(workplacePhoto);
    this._roomDebug.disableStartCameraPositionButton();
    this._disableFocusObjects();
    this._disableAllObjects();

    ROOM_OBJECT_ENABLED_CONFIG[ROOM_OBJECT_TYPE.Locker] = true;
    this._roomActiveObject[ROOM_OBJECT_TYPE.Locker].enableDebugMenu();
  }

  _onWorkplacePhotoClickToHide() {
    this._roomActiveObject[ROOM_OBJECT_TYPE.Locker].hideWorkplacePhoto();
    this._cameraController.setOrbitState();
    this._roomDebug.enableStartCameraPositionButton();
    this._enableFocusObjects();
    this._enableAllObjects();
  }

  _disableAllObjects() {
    for (let key in this._roomActiveObject) {
      ROOM_OBJECT_ENABLED_CONFIG[key] = false;
      const roomObject = this._roomActiveObject[key];
      roomObject.disableDebugMenu();
    }
  }

  _enableAllObjects() {
    for (let key in this._roomActiveObject) {
      ROOM_OBJECT_ENABLED_CONFIG[key] = true;
      const roomObject = this._roomActiveObject[key];
      roomObject.enableDebugMenu();
    }
  }

  _onObjectFocused(focusedObjectType) {
    this._roomActiveObject[focusedObjectType].showCloseFocusIcon();
  }

  _disableBaseOnKeyboardFocus() {
    this._roomActiveObject[ROOM_OBJECT_TYPE.Keyboard].setBaseInactive();
  }

  _enableBaseOnKeyboardFocus() {
    this._roomActiveObject[ROOM_OBJECT_TYPE.Keyboard].setBaseActive();
  }

  _disableScreensOnMonitorFocus() {
    this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].setScreenInactive();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop].setScreenInactive();
  }

  _enableScreensOnMonitorFocus() {
    this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].setScreenActive();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop].setScreenActive();
  }

  _onKeyboardMuteClick() {
    SOUNDS_CONFIG.enabled = !SOUNDS_CONFIG.enabled;
    this._roomDebug.updateSoundsEnabledController();
    this.onSoundsEnabledChanged();
    this.events.post('updateSoundIcon');
  }

  _onKeyboardVolumeUpClick() {
    SOUNDS_CONFIG.volume += 0.1;

    if (SOUNDS_CONFIG.volume > 1) {
      SOUNDS_CONFIG.volume = 1;
    }

    this._roomDebug.updateSoundsVolumeController();
    this._onVolumeChanged();
  }

  _onKeyboardVolumeDownClick() {
    SOUNDS_CONFIG.volume -= 0.1;
    if (SOUNDS_CONFIG.volume < 0) {
      SOUNDS_CONFIG.volume = 0;
    }

    this._roomDebug.updateSoundsVolumeController();
    this._onVolumeChanged();
  }

  _onWindowStartOpening() {
    this._roomActiveObject[ROOM_OBJECT_TYPE.Speakers].onWindowOpened();
    this._roomActiveObject[ROOM_OBJECT_TYPE.AirConditioner].onWindowOpened();
  }

  _onWindowClosed() {
    this._roomActiveObject[ROOM_OBJECT_TYPE.Speakers].onWindowClosed();
    this._roomActiveObject[ROOM_OBJECT_TYPE.AirConditioner].onWindowClosed();
  }

  _onWindowFullyOpened(openType) {
    if (openType === WINDOW_OPEN_TYPE.Horizontally) {
      this._roomActiveObject[ROOM_OBJECT_TYPE.AirConditioner].onWindowFullyOpened();
    }
  }

  _onShowreelStart() {
    this._cursor.onFullScreenVideoStart();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop].stopCurrentMusic();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Speakers].playMusic(MUSIC_TYPE.TheStomp);
  }

  _onShowreelStop() {
    this._cursor.onFullScreenVideoStop();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Speakers].onShowreelStop()
  }

  _onDebugHelpersChanged() {
    for (const key in this._roomActiveObject) {
      if (SOUNDS_CONFIG.debugHelpers) {
        this._roomActiveObject[key].showSoundHelpers();
      } else {
        this._roomActiveObject[key].hideSoundHelpers();
      }
    }
  }

  _onVolumeChanged() {
    for (const key in this._roomActiveObject) {
      this._roomActiveObject[key].onVolumeChanged(SOUNDS_CONFIG.volume);
    }
  }

  onDebugSoundsEnabledChanged() {
    this.onSoundsEnabledChanged();
    this.events.post('updateSoundIcon');
  }

  _onMouseOnButtonClick(buttonType) {
    if (LAPTOP_SCREEN_MUSIC_PARTS.includes(buttonType)) {
      this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop].onLeftKeyClick(buttonType)
    }

    if (MONITOR_SCREEN_BUTTONS.includes(buttonType)) {
      this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].onLeftKeyClick(buttonType)
    }
  }

  _checkIsShowAnimationComplete() {
    for (const key in this._roomActiveObject) {
      if (this._roomActiveObject[key].isShowAnimationActive()) {
        return false;
      }
    }

    return true;
  }
}
