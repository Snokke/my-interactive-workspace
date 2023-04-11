import * as THREE from 'three';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import Loader from '../../core/loader';
import { ROOM_CONFIG, ROOM_OBJECT_ACTIVITY_TYPE, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from './data/room-config';
import RoomDebug from './room-debug';
import { Black } from 'black-engine';
import { ROOM_OBJECT_CLASS } from './data/room-objects-classes';
import { ROOM_OBJECT_ENABLED_CONFIG, ROOM_OBJECT_VISIBILITY_CONFIG } from './data/room-objects-visibility-config';
import Cursor from './room-active-objects/mouse/cursor';

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
      this._checkToGlow(intersect.object);
    }

    if (intersect === null) {
      this._resetGlow();
    }

    for (const objectType in this._roomActiveObject) {
      this._roomActiveObject[objectType].update(dt);
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

      this._checkToOpenDebugFolders(roomObject);
      roomObject.onClick(intersect);

      if (objectConfig.isDraggable) {
        this._draggingObject = roomObject;
        this._orbitControls.enabled = false;

        this._setGlow(this._draggingObject.getMeshesForOutline());
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
    this._showRoomObject(ROOM_OBJECT_TYPE.Speakers, startDelay + tableObjectsShowDelay + delayBetweenObjects);
    this._showRoomObject(ROOM_OBJECT_TYPE.Organizer, startDelay + tableObjectsShowDelay + delayBetweenObjects * 3);
    this._showRoomObject(ROOM_OBJECT_TYPE.Notebook, startDelay + tableObjectsShowDelay + delayBetweenObjects * 4);
    this._showRoomObject(ROOM_OBJECT_TYPE.Monitor, startDelay + tableObjectsShowDelay + delayBetweenObjects * 6);
    this._showRoomObject(ROOM_OBJECT_TYPE.Keyboard, startDelay + tableObjectsShowDelay + delayBetweenObjects * 7);
    this._showRoomObject(ROOM_OBJECT_TYPE.Mouse, startDelay + tableObjectsShowDelay + delayBetweenObjects * 8);
    this._showRoomObject(ROOM_OBJECT_TYPE.Coaster, startDelay + tableObjectsShowDelay + delayBetweenObjects * 9);
    this._showRoomObject(ROOM_OBJECT_TYPE.Cup, startDelay + tableObjectsShowDelay + delayBetweenObjects * 10);
  }

  _updateObjectsVisibility() {
    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];
      const isVisible = ROOM_OBJECT_VISIBILITY_CONFIG[type];

      if (config.createObject) {
        const activityType = config.activityType;

        if (activityType === ROOM_OBJECT_ACTIVITY_TYPE.Active) {
          this._roomActiveObject[type].setVisibility(isVisible);
        }

        if (activityType === ROOM_OBJECT_ACTIVITY_TYPE.Inactive) {
          this._roomInactiveObject[type].setVisibility(isVisible);
        }
      }
    }
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

  _checkToGlow(mesh) {
    if (mesh === null || !mesh.userData.isActive || !this._roomActiveObject[mesh.userData.objectType].isInputEnabled() || !ROOM_OBJECT_ENABLED_CONFIG[mesh.userData.objectType]) {
      this._resetGlow();
      Black.engine.containerElement.style.cursor = 'auto';

      this._glowMeshesNames = [];
      this._previousGlowMeshesNames = [];
      this._resetRoomObjectsPointerOver();

      return;
    }

    const roomObject = this._roomActiveObject[mesh.userData.objectType];
    const meshes = roomObject.getMeshesForOutline(mesh);
    this._glowMeshesNames = meshes.map(mesh => mesh.name);

    if (!this._arraysEqual(this._glowMeshesNames, this._previousGlowMeshesNames)) {
      this._resetRoomObjectsPointerOver();

      this._setGlow(meshes);
      roomObject.onPointerOver();
      Black.engine.containerElement.style.cursor = 'pointer';
    }

    this._previousGlowMeshesNames = this._glowMeshesNames;
  }

  _setGlow(items) {
    if (ROOM_CONFIG.outlineEnabled && !DEBUG_CONFIG.wireframe) {
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

  _closeAllObjectsDebugMenu() {
    for (const key in this._roomActiveObject) {
      this._roomActiveObject[key].closeDebugMenu();
    }
  }

  _checkToOpenDebugFolders(roomObject) {
    if (ROOM_CONFIG.autoOpenDebugFolders) {
      this._closeAllObjectsDebugMenu();
      roomObject.openDebugMenu();
    }
  }

  _init() {
    this._initRoomDebug();
    this._initRoomObjects();
    this._initSignals();
    this._configureRaycaster();

    this._updateObjectsVisibility();

    if (ROOM_CONFIG.startAnimation.showOnStart) {
      this.showWithAnimation(600);
    }
  }

  _initRoomDebug() {
    const roomDebug = this._roomDebug = new RoomDebug(this._scene);

    roomDebug.events.on('startShowAnimation', (msg, selectedObjectType) => this._onDebugStartShowAnimation(selectedObjectType));
    roomDebug.events.on('changeObjectVisibility', (msg) => this._updateObjectsVisibility());
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
    const notebookScreen = this._roomActiveObject[ROOM_OBJECT_TYPE.Notebook].getScreen();

    const cursor = this._cursor = new Cursor(mouse, monitorScreen, notebookScreen);
    this.add(cursor);
  }

  _initSignals() {
    for (const key in this._roomActiveObject) {
      const roomObject = this._roomActiveObject[key];

      roomObject.events.on('showAnimationComplete', () => {
        if (this._checkIsShowAnimationComplete()) {
          this._roomDebug.enableShowAnimationControllers();
        }
      });
    }

    this._roomActiveObject[ROOM_OBJECT_TYPE.Notebook].events.on('onNotebookClosed', () => this._cursor.onNotebookClosed());
    this._roomActiveObject[ROOM_OBJECT_TYPE.Mouse].events.on('onCursorScaleChanged', () => this._cursor.onCursorScaleChanged());
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

  _arraysEqual(a, b) {
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
        return false;
      }
    }

    return true;
  }
}
