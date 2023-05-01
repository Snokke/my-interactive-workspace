import * as THREE from 'three';
import Loader from '../../core/loader';
import { ROOM_OBJECT_ACTIVITY_TYPE, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from './data/room-config';
import RoomDebug from './room-debug';
import { ROOM_OBJECT_CLASS } from './data/room-objects-classes';
import Cursor from './room-active-objects/mouse/cursor/cursor';
import RoomController from './room-controller';
import CameraController from './camera-controller/camera-controller';
import { MessageDispatcher } from 'black-engine';

export default class Room extends THREE.Group {
  constructor(data, raycasterController) {
    super();

    this.events = new MessageDispatcher();

    this._data = data;
    this._data.raycasterController = raycasterController;

    this._orbitControls = this._data.orbitControls;
    this._camera = this._data.camera;

    this._roomController = null;
    this._cameraController = null;
    this._roomScene = null;
    this._roomDebug = null;
    this._cursor = null;

    this._roomActiveObject = {};
    this._roomInactiveObject = {};
    this._roomObjectsByActivityType = {};

    this._init();
  }

  update(dt) {
    this._roomController.update(dt);
  }

  onPointerMove(x, y) {
    this._roomController.onPointerMove(x, y);
  }

  onPointerDown(x, y) {
    this._roomController.onPointerDown(x, y);
  }

  onPointerUp(x, y) {
    this._roomController.onPointerUp(x, y);
  }

  onPointerLeave() {
    this._roomController.onPointerLeave();
  }

  showWithAnimation(startDelay = 0) {
    this._roomController.showWithAnimation(startDelay);
  }

  _init() {
    this._initRoomDebug();
    this._initRoomObjects();
    this._configureRaycaster();
    this._initRoomController();
    this._initSignals();
  }

  _initRoomDebug() {
    this._roomDebug = new RoomDebug(this._data.scene);
  }

  _initRoomObjects() {
    this._roomScene = Loader.assets['room'].scene;

    this._initActiveObjects();
    this._initInactiveObjects();
    this._initCameraController();
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
        const roomObject = new objectClass.object(group, type, this._data.audioListener);
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

  _initCameraController() {
    const focusObjects = {
      [ROOM_OBJECT_TYPE.Monitor]: this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor],
      [ROOM_OBJECT_TYPE.Keyboard]: this._roomActiveObject[ROOM_OBJECT_TYPE.Keyboard],
    };

    this._cameraController = new CameraController(this._camera, this._orbitControls, focusObjects, this._roomDebug);
  }

  _initCursor() {
    const mouse = this._roomActiveObject[ROOM_OBJECT_TYPE.Mouse];
    const monitorScreen = this._roomActiveObject[ROOM_OBJECT_TYPE.Monitor].getScreen();
    const laptopScreen = this._roomActiveObject[ROOM_OBJECT_TYPE.Laptop].getScreen();

    const cursor = this._cursor = new Cursor(mouse, monitorScreen, laptopScreen);
    this.add(cursor);
  }

  _initSignals() {
    this._roomController.events.on('onMonitorZoomIn', (msg, position) => this.events.post('onMonitorZoomIn', position));
  }

  _configureRaycaster() {
    const allMeshes = [];

    for (const key in this._roomActiveObject) {
      allMeshes.push(...this._roomActiveObject[key].getActiveMeshes());
    }

    for (const key in this._roomInactiveObject) {
      allMeshes.push(this._roomInactiveObject[key].getMesh());
    }

    this._data.raycasterController.addMeshes(allMeshes);
  }

  _initRoomController() {
    this._data.roomScene = this._roomScene;
    this._data.roomDebug = this._roomDebug;
    this._data.cursor = this._cursor;
    this._data.cameraController = this._cameraController;

    this._data.roomActiveObject = this._roomActiveObject;
    this._data.roomInactiveObject = this._roomInactiveObject;
    this._data.roomObjectsByActivityType = this._roomObjectsByActivityType;

    this._roomController = new RoomController(this._data);
  }
}
