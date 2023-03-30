import * as THREE from 'three';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import Loader from '../../core/loader';
import { ROOM_CONFIG, ROOM_OBJECT_ACTIVITY_TYPE, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from './room-config';
import RoomDebug from './room-debug';
import RoomInactiveObjects from './room-inactive-objects/room-inactive-objects';

export default class Room extends THREE.Group {
  constructor(raycaster, outlinePass) {
    super();

    this._raycaster = raycaster;
    this._outlinePass = outlinePass;

    this._roomScene = null;
    this._roomDebug = null;
    this._roomInactiveObjectsClass = null;

    this._roomActiveObject = {};
    this._roomInactiveMesh = {};
    this._roomObjectsByActivityType = {};

    this._pointerPosition = new THREE.Vector2();

    this._init();
  }

  update(dt) {
    if (ROOM_CONFIG.outlineEnabled) {
      const intersectedMesh = this._raycaster.checkIntersection(this._pointerPosition.x, this._pointerPosition.y);
      this._checkToGlow(intersectedMesh);
    }
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);
  }

  onPointerDown(x, y) {
    const intersectedObject = this._raycaster.checkIntersection(x, y);

    if (intersectedObject && intersectedObject.userData.isActive) {
      this._roomActiveObject[intersectedObject.userData.objectType].onClick(intersectedObject);
    }
  }

  showWithAnimation(startDelay = 0) {
    this._roomDebug.disableShowAnimationControllers();

    this._showRoomObject(ROOM_OBJECT_TYPE.Walls, startDelay);
    this._showRoomObject(ROOM_OBJECT_TYPE.FloorLamp, startDelay + 800);
    this._showRoomObject(ROOM_OBJECT_TYPE.Locker, startDelay + 1000);
    this._showRoomObject(ROOM_OBJECT_TYPE.Table, startDelay + 1200);
    this._showRoomObject(ROOM_OBJECT_TYPE.Scales, startDelay + 1400);
  }

  updateObjectsVisibility() {
    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];
      const activityType = config.activityType;

      if (activityType === ROOM_OBJECT_ACTIVITY_TYPE.Active) {
        this._roomActiveObject[type].setVisibility(config.visible);
      }

      if (activityType === ROOM_OBJECT_ACTIVITY_TYPE.Inactive) {
        this._roomInactiveMesh[type].visible = config.visible;
      }
    }
  }

  _showRoomObject(objectType, startDelay = 0) {
    const activityType = ROOM_OBJECT_CONFIG[objectType].activityType;

    if (activityType === ROOM_OBJECT_ACTIVITY_TYPE.Active) {
      this._roomActiveObject[objectType].showWithAnimation(startDelay);
    }

    if (activityType === ROOM_OBJECT_ACTIVITY_TYPE.Inactive) {
      this._roomInactiveObjectsClass.showWithAnimation(objectType, startDelay);
    }
  }

  _checkToGlow(mesh) {
    if (mesh === null || !mesh.userData.isActive || !this._roomActiveObject[mesh.userData.objectType].isInputEnabled()) {
      this._resetGlow();

      return;
    }

    const roomObject = this._roomActiveObject[mesh.userData.objectType];
    const meshes = roomObject.getMeshesForOutline(mesh);
    this._setGlow(meshes);
  }

  _setGlow(items) {
    if (!DEBUG_CONFIG.wireframe) {
      this._outlinePass.selectedObjects = items;
    }
  }

  _resetGlow() {
    if (this._outlinePass.selectedObjects.length > 0) {
      this._outlinePass.selectedObjects = [];
    }
  }

  _init() {
    this._initRoomDebug();
    this._initRoomObjects();
    this._initSignals();
    this._configureRaycaster();

    this.updateObjectsVisibility();

    if (ROOM_CONFIG.showStartAnimations) {
      this.showWithAnimation(600);
    }
  }

  _initRoomDebug() {
    const roomDebug = this._roomDebug = new RoomDebug();

    roomDebug.events.on('startShowAnimation', (msg, selectedObjectType) => {
      if (selectedObjectType === START_ANIMATION_ALL_OBJECTS) {
        this.showWithAnimation();
      } else {

        const activityType = ROOM_OBJECT_CONFIG[selectedObjectType].activityType;
        const roomObjects = this._roomObjectsByActivityType[activityType];

        if (activityType === ROOM_OBJECT_ACTIVITY_TYPE.Active) {
          roomObjects[selectedObjectType].showWithAnimation();
        }

        if (activityType === ROOM_OBJECT_ACTIVITY_TYPE.Inactive) {
          this._roomInactiveObjectsClass.showWithAnimation(selectedObjectType);
        }
      }
    });

    roomDebug.events.on('changeObjectVisibility', (msg) => {
      this.updateObjectsVisibility();
    });
  }

  _initRoomObjects() {
    this._roomScene = Loader.assets['room'].scene;

    this._initActiveObjects();
    this._initInactiveObjects();
    this._addObjectsToTableGroup();
  }

  _initActiveObjects() {
    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];

      if (config.enabled && config.activityType === ROOM_OBJECT_ACTIVITY_TYPE.Active) {
        const group = this._roomScene.getObjectByName(config.groupName);
        const roomObject = new config.class(group, type);
        this.add(roomObject);

        this._roomActiveObject[type] = roomObject;
      }
    }

    this._roomObjectsByActivityType[ROOM_OBJECT_ACTIVITY_TYPE.Active] = this._roomActiveObject;
  }

  _initInactiveObjects() {
    const roomInactiveObjectsClass = this._roomInactiveObjectsClass = new RoomInactiveObjects(this._roomScene);
    const inactiveObjects = this._roomInactiveMesh = roomInactiveObjectsClass.getInactiveMeshes();

    const inactiveObjectsArray = [];

    for (const key in inactiveObjects) {
      const roomInactiveObject = inactiveObjects[key];
      this.add(roomInactiveObject);

      inactiveObjectsArray.push(roomInactiveObject);
    }

    this._raycaster.addMeshes(inactiveObjectsArray);

    this._roomObjectsByActivityType[ROOM_OBJECT_ACTIVITY_TYPE.Inactive] = this._roomInactiveMesh;
  }

  _addObjectsToTableGroup() {
    const tableTopGroup = this._roomActiveObject[ROOM_OBJECT_TYPE.Table].getTopTableGroup();

    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];

      if (config.enabled && config.tableGroup) {
        const roomObjects = this._roomObjectsByActivityType[config.activityType];
        const roomObject = roomObjects[type];

        tableTopGroup.add(roomObject);
      }
    }
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
  }

  _configureRaycaster() {
    const allMeshes = [];

    for (const key in this._roomActiveObject) {
      allMeshes.push(...this._roomActiveObject[key].getActiveMeshes());
    }

    this._raycaster.addMeshes(allMeshes);
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
