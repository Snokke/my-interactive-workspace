import * as THREE from 'three';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import Loader from '../../core/loader';
import { ROOM_CONFIG, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE } from './room-config';
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

    if (intersectedObject) {
      this._roomObject[intersectedObject.userData.objectType].onClick(intersectedObject);
    }
  }

  show() {
    this._roomObject[ROOM_OBJECT_TYPE.Locker].show();
    this._roomObject[ROOM_OBJECT_TYPE.Table].show(200);
  }

  _checkToGlow(mesh) {
    if (mesh === null || !this._roomObject[mesh.userData.objectType].isInputEnabled()) {
      this._resetGlow();

      return;
    }

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
    this._configureRaycaster();
  }

  _initObjects() {
    const roomGroup = Loader.assets['room'].scene;

    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];

      const group = roomGroup.getObjectByName(config.groupName);
      const roomObject = new config.class(group, type);
      this.add(roomObject);

      this._roomObject[type] = roomObject;
    }
  }

  _configureRaycaster() {
    const allMeshes = [];

    for (const key in this._roomObject) {
      allMeshes.push(...this._roomObject[key].getAllMeshes());
    }

    this._raycaster.addMeshes(allMeshes);
  }

  _initRoomDebug() {
    const roomDebug = this._roomDebug = new RoomDebug();

    roomDebug.events.on('startShowAnimation', (msg, selectedObjectType) => {
      this._roomObject[selectedObjectType].show();
    });
  }
}
