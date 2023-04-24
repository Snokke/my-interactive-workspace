import * as THREE from 'three';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import Loader from '../../core/loader';
import { ROOM_CONFIG, ROOM_OBJECT_ACTIVITY_TYPE, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from './data/room-config';
import RoomDebug from './room-debug';
import { Black } from 'black-engine';
import { ROOM_OBJECT_CLASS } from './data/room-objects-classes';
import { ROOM_OBJECT_ENABLED_CONFIG } from './data/room-objects-enabled-config';
import Cursor from './room-active-objects/mouse/cursor/cursor';
import { LAPTOP_SCREEN_MUSIC_PARTS, MUSIC_TYPE } from './room-active-objects/laptop/laptop-data';
import { LAPTOP_SCREEN_MUSIC_CONFIG } from './room-active-objects/laptop/laptop-config';
import { MONITOR_SCREEN_BUTTONS } from './room-active-objects/monitor/monitor-data';
import { arraysEqual } from './shared-objects/helpers';
import { SOUNDS_CONFIG } from './data/sounds-config';

export default class Room extends THREE.Group {
  constructor(data, raycasterController) {
    super();

    this._scene = data.scene;
    this._camera = data.camera;
    this._renderer = data.renderer;
    this._orbitControls = data.orbitControls;
    this._outlinePass = data.outlinePass;
    this._audioListener = data.audioListener,
    this._raycasterController = raycasterController;

    this._roomScene = null;
    this._roomDebug = null;
    this._cursor = null;

    this._roomActiveObject = {};
    this._roomInactiveObject = {};
    this._roomObjectsByActivityType = {};

    this._pointerPosition = new THREE.Vector2();
    this._draggingObject = null;

    this._glowMeshesNames = [];
    this._previousGlowMeshesNames = [];

    this._init();
  }

  update(dt) {
    const intersect = this._raycasterController.checkIntersection(this._pointerPosition.x, this._pointerPosition.y);

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
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);

    if (this._draggingObject) {
      const raycaster = this._raycasterController.getRaycaster();
      this._draggingObject.onPointerMove(raycaster);
    }
  }

  onPointerDown(x, y) {
    const intersect = this._raycasterController.checkIntersection(x, y);

    if (!intersect) {
      return;
    }

    const intersectObject = intersect.object;

    if (intersectObject && intersectObject.userData.isActive && ROOM_OBJECT_ENABLED_CONFIG[intersect.object.userData.objectType]) {
      const objectType = intersect.object.userData.objectType;
      const objectConfig = ROOM_OBJECT_CONFIG[objectType];
      const roomObject = this._roomActiveObject[objectType];

      this._checkToShowDebugFolders(roomObject);
      roomObject.onClick(intersect);

      if (objectConfig.isDraggable) {
        this._draggingObject = roomObject;
        this._orbitControls.enabled = false;

        this._setGlow(this._draggingObject.getMeshesForOutline(intersectObject));
      }
    }
  }

  onPointerUp() {
    if (this._draggingObject) {
      this._draggingObject = null;
      this._orbitControls.enabled = true;
    }
  }

  showWithAnimation(startDelay = 0) {
    this._roomDebug.disableShowAnimationControllers();
    const delayBetweenObjects = ROOM_CONFIG.startAnimation.delayBetweenObjects;

    this._showRoomObject(ROOM_OBJECT_TYPE.Walls, startDelay);
    const wallShowDelay = 600;

    // floor objects
    this._showRoomObject(ROOM_OBJECT_TYPE.FloorLamp, startDelay + wallShowDelay);
    this._showRoomObject(ROOM_OBJECT_TYPE.Locker, startDelay + wallShowDelay + delayBetweenObjects);
    this._showRoomObject(ROOM_OBJECT_TYPE.Pouf, startDelay + wallShowDelay + delayBetweenObjects * 2);
    this._showRoomObject(ROOM_OBJECT_TYPE.Carpet, startDelay + wallShowDelay + delayBetweenObjects * 3);
    this._showRoomObject(ROOM_OBJECT_TYPE.Bin, startDelay + wallShowDelay + delayBetweenObjects * 4);
    this._showRoomObject(ROOM_OBJECT_TYPE.Chair, startDelay + wallShowDelay + delayBetweenObjects * 5);
    this._showRoomObject(ROOM_OBJECT_TYPE.Scales, startDelay + wallShowDelay + delayBetweenObjects * 6);

    const leftWallObjectsShowDelay = 1500;

    // left wall objects
    this._showRoomObject(ROOM_OBJECT_TYPE.Map, startDelay + leftWallObjectsShowDelay);
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
    this._showRoomObject(ROOM_OBJECT_TYPE.Keyboard, startDelay + tableObjectsShowDelay + delayBetweenObjects * 3);
    this._showRoomObject(ROOM_OBJECT_TYPE.Mouse, startDelay + tableObjectsShowDelay + delayBetweenObjects * 3.5);
    this._showRoomObject(ROOM_OBJECT_TYPE.Coaster, startDelay + tableObjectsShowDelay + delayBetweenObjects * 4);
    this._showRoomObject(ROOM_OBJECT_TYPE.Cup, startDelay + tableObjectsShowDelay + delayBetweenObjects * 4.5);

    this._showRoomObject(ROOM_OBJECT_TYPE.SocialNetworkLogos, startDelay + tableObjectsShowDelay + delayBetweenObjects * 10);
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

      this._setGlow(meshes);
      roomObject.onPointerOver(intersect);
      Black.engine.containerElement.style.cursor = 'pointer';
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
    this._initRoomDebug();
    this._initRoomObjects();
    this._initSignals();
    this._configureRaycaster();

    if (ROOM_CONFIG.startAnimation.showOnStart) {
      this.showWithAnimation(600);
    }

    if (SOUNDS_CONFIG.debugHelpers) {
      for (const key in this._roomActiveObject) {
        this._roomActiveObject[key].showSoundHelpers();
      }
    }
  }

  _initRoomDebug() {
    const roomDebug = this._roomDebug = new RoomDebug(this._scene);

    roomDebug.events.on('startShowAnimation', (msg, selectedObjectType) => this._onDebugStartShowAnimation(selectedObjectType));
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

  _initRoomObjects() {
    this._roomScene = Loader.assets['room'].scene;

    this._initActiveObjects();
    this._initInactiveObjects();
    this._addObjectsToTableGroup();
    this._initCursor();
  }

  _initActiveObjects() {
    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];
      const objectClass = ROOM_OBJECT_CLASS[type];

      if (config.createObject && config.activityType === ROOM_OBJECT_ACTIVITY_TYPE.Active) {
        const group = this._roomScene.getObjectByName(config.groupName);
        const roomObject = new objectClass.object(group, type, this._audioListener);
        this.add(roomObject);

        this._roomActiveObject[type] = roomObject;
      }
    }

    this._roomObjectsByActivityType[ROOM_OBJECT_ACTIVITY_TYPE.Active] = this._roomActiveObject;
  }

  _initInactiveObjects() {
    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];
      const objectClass = ROOM_OBJECT_CLASS[type];

      if (config.createObject && config.activityType === ROOM_OBJECT_ACTIVITY_TYPE.Inactive) {
        const roomObject = new objectClass.object(this._roomScene, type);
        this.add(roomObject);

        this._roomInactiveObject[type] = roomObject;
      }
    }

    this._roomObjectsByActivityType[ROOM_OBJECT_ACTIVITY_TYPE.Inactive] = this._roomInactiveObject;
  }

  _addObjectsToTableGroup() {
    const tableTopGroup = this._roomActiveObject[ROOM_OBJECT_TYPE.Table].getTopTableGroup();

    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];

      if (config.createObject && config.tableGroup) {
        const roomObjects = this._roomObjectsByActivityType[config.activityType];
        const roomObject = roomObjects[type];

        tableTopGroup.add(roomObject);
      }
    }
  }

  _initCursor() {
    const mouse = this._roomActiveObject[ROOM_OBJECT_TYPE.Mouse];
    const monitorScreen = this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].getScreen();
    const laptopScreen = this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop].getScreen();

    const cursor = this._cursor = new Cursor(mouse, monitorScreen, laptopScreen);
    this.add(cursor);
  }

  _initSignals() {
    this._initDebugShowAnimationSignals();
    this._initLaptopMusicSignals();
    this._initCursorSignals();
    this._initKeyboardSignals();
    this._initDebugMenuSignals();
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
  }

  _initDebugMenuSignals() {
    this._roomDebug.events.on('debugHelpersChanged', () => this._onDebugHelpersChanged());
    this._roomDebug.events.on('volumeChanged', () => this._onVolumeChanged());
    this._roomDebug.events.on('soundsEnabledChanged', () => this._onSoundsEnabledChanged());
  }

  _initOtherSignals() {
    const speakers = this._roomActiveObject[ROOM_OBJECT_TYPE.Speakers];
    const laptop = this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop];
    const mouse = this._roomActiveObject[ROOM_OBJECT_TYPE.Mouse];
    const walls = this._roomActiveObject[ROOM_OBJECT_TYPE.Walls];
    const monitor = this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor];

    laptop.events.on('onLaptopClosed', () => this._cursor.onLaptopClosed());
    mouse.events.on('onCursorScaleChanged', () => this._cursor.onCursorScaleChanged());
    mouse.events.on('onLeftKeyClick', () => this._cursor.onMouseLeftKeyClicked());
    walls.events.on('onWindowStartOpening', () => this._onWindowStartOpening());
    walls.events.on('onWindowClosed', () => this._onWindowClosed());
    monitor.events.on('onShowreelStart', () => this._onShowreelStart());
    monitor.events.on('onShowreelStop', () => speakers.onShowreelStop());
    monitor.events.on('onShowreelPause', () => speakers.onShowreelPause());
  }

  _onKeyboardMuteClick() {
    SOUNDS_CONFIG.enabled = !SOUNDS_CONFIG.enabled;
    this._roomDebug.updateSoundsEnabledController();
    this._onSoundsEnabledChanged();
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

  _onShowreelStart() {
    this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop].stopCurrentMusic();
    this._roomActiveObject[ROOM_OBJECT_TYPE.Speakers].playMusic(MUSIC_TYPE.TheStomp);
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

  _onSoundsEnabledChanged() {
    for (const key in this._roomActiveObject) {
      if (SOUNDS_CONFIG.enabled) {
        this._roomActiveObject[key].enableSound();
      } else {
        this._roomActiveObject[key].disableSound();
      }
    }
  }

  _onMouseOnButtonClick(buttonType) {
    if (LAPTOP_SCREEN_MUSIC_PARTS.includes(buttonType)) {
      this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop].onLeftKeyClick(buttonType)
    }

    if (MONITOR_SCREEN_BUTTONS.includes(buttonType)) {
      this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].onLeftKeyClick(buttonType)
    }
  }

  _configureRaycaster() {
    const allMeshes = [];

    for (const key in this._roomActiveObject) {
      allMeshes.push(...this._roomActiveObject[key].getActiveMeshes());
    }

    for (const key in this._roomInactiveObject) {
      allMeshes.push(this._roomInactiveObject[key].getMesh());
    }

    this._raycasterController.addMeshes(allMeshes);
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
