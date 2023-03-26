import * as THREE from 'three';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import Loader from '../../core/loader';
import { ROOM_CONFIG, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from './room-config';
import RoomDebug from './room-debug';

export default class Room extends THREE.Group {
  constructor(raycaster, outlinePass) {
    super();

    this._raycaster = raycaster;
    this._outlinePass = outlinePass;

    this._roomDebug = null;
    this._roomObject = {};

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
      this._roomObject[intersectedObject.userData.objectType].onClick(intersectedObject);
    }
  }

  show(startDelay = 0) {
    this._roomDebug.disableShowAnimationControllers();

    this._showRoomObject(ROOM_OBJECT_TYPE.FloorLamp, startDelay);
    this._showRoomObject(ROOM_OBJECT_TYPE.Locker, startDelay + 200);
    this._showRoomObject(ROOM_OBJECT_TYPE.Table, startDelay + 400);
  }

  _showRoomObject(objectType, startDelay = 0) {
    if (this._roomObject[objectType]) {
      this._roomObject[objectType].show(startDelay);
    }
  }

  _checkToGlow(mesh) {
    if (mesh === null || !mesh.userData.isActive || !this._roomObject[mesh.userData.objectType].isInputEnabled()) {
      this._resetGlow();

      return;
    }

    // console.log(mesh.userData.isActive);

    const roomObject = this._roomObject[mesh.userData.objectType];
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
    this._initObjects();
    this._initSignals();
    this._configureRaycaster();

    if (ROOM_CONFIG.showStartAnimations) {
      this.show(600);
    }
  }

  _initObjects() {
    const roomGroup = Loader.assets['room'].scene;

    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];

      if (config.enabled) {
        const group = roomGroup.getObjectByName(config.groupName);
        const roomObject = new config.class(group, type);
        this.add(roomObject);

        this._roomObject[type] = roomObject;
      }
    }
  }

  _initSignals() {
    for (const key in this._roomObject) {
      const roomObject = this._roomObject[key];

      roomObject.events.on('showAnimationComplete', () => {
        if (this._checkIsShowAnimationComplete()) {
          this._roomDebug.enableShowAnimationControllers();
        }
      });
    }
  }

  _configureRaycaster() {
    const allMeshes = [];

    for (const key in this._roomObject) {
      allMeshes.push(...this._roomObject[key].getActiveMeshes());
    }

    this._raycaster.addMeshes(allMeshes);
  }

  _initRoomDebug() {
    const roomDebug = this._roomDebug = new RoomDebug();

    roomDebug.events.on('startShowAnimation', (msg, selectedObjectType) => {
      if (selectedObjectType === START_ANIMATION_ALL_OBJECTS) {
        this.show();
      } else {
        this._roomObject[selectedObjectType].show();
      }
    });
  }

  _checkIsShowAnimationComplete() {
    for (const key in this._roomObject) {
      if (this._roomObject[key].isShowAnimationActive()) {
        return false;
      }
    }

    return true;
  }
}
