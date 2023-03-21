import * as THREE from 'three';
import Loader from '../core/loader';
import Locker from './locker/locker';
import Table from './table/table';

export default class Scene3D extends THREE.Group {
  constructor(camera, outlinePass) {
    super();

    this._camera = camera;
    this._outlinePass = outlinePass;

    this._raycaster = null;
    this._roomGroup = null;

    this._roomObject = {};
    this._allMeshes = [];

    this._init();
  }

  update(dt) {

  }

  onClick() {
    this._table.changeState();
  }

  onPointerMove(x, y) {
    const { objectType, instanceId } = this._checkIntersection(x, y);

    switch (objectType) {
      case OBJECT_TYPE.Table:
        this._setGlow(this._roomObject[OBJECT_TYPE.Table], this._roomObject[OBJECT_TYPE.Table].getAllMeshes());
        break;

      case OBJECT_TYPE.Locker:
        if (instanceId === undefined) {
          this._setGlow(this._roomObject[OBJECT_TYPE.Locker], this._roomObject[OBJECT_TYPE.Locker].getBodyMesh());
        } else {
          this._setGlow(this._roomObject[OBJECT_TYPE.Locker], this._roomObject[OBJECT_TYPE.Locker].getCaseMesh(instanceId));
        }
        break;

      default:
        this._resetGlow();
        break;
      }
  }

  onPointerDown(x, y) {
    const { objectType, instanceId } = this._checkIntersection(x, y);

    switch (objectType) {
      case OBJECT_TYPE.Table:
        this._roomObject[OBJECT_TYPE.Table].changeState();
        break;

      case OBJECT_TYPE.Locker:
        if (instanceId === undefined) {
          this._roomObject[OBJECT_TYPE.Locker].pushAllCases();
        } else {
          this._roomObject[OBJECT_TYPE.Locker].pushCase(instanceId);
        }
        break;
    }
  }

  onPointerUp() {

  }

  _setGlow(object, items) {
    if (object.isInputEnabled()) {
      this._outlinePass.selectedObjects = [...items];
    }
  }

  _resetGlow() {
    this._outlinePass.selectedObjects = [];
  }

  _checkIntersection(x, y) {
    const mousePositionX = (x / window.innerWidth) * 2 - 1;
    const mousePositionY = -(y / window.innerHeight) * 2 + 1;
    const mousePosition = new THREE.Vector2(mousePositionX, mousePositionY);

    this._raycaster.setFromCamera(mousePosition, this._camera);
    const intersects = this._raycaster.intersectObjects(this._allMeshes);

    let objectType = null;
    let instanceId = null;

    if (intersects.length > 0) {
      const intersect = intersects[0];
      objectType = intersect.object.userData.objectType;
      instanceId = intersect.instanceId;
    }

    return { objectType, instanceId };
  }

  _init() {
    this._initRaycaster();

    this._roomGroup = Loader.assets['room'].scene;

    this._initTable();
    this._initLocker();

    this._gatherAllMeshes();
  }

  _initRaycaster() {
    this._raycaster = new THREE.Raycaster();
  }

  _initTable() {
    const tableGroup = this._roomGroup.getObjectByName('Table');
    const table = new Table(tableGroup);
    this.add(table);

    this._roomObject[OBJECT_TYPE.Table] = table;
  }

  _initLocker() {
    const lockerGroup = this._roomGroup.getObjectByName('Locker');
    const locker = new Locker(lockerGroup);
    this.add(locker);

    this._roomObject[OBJECT_TYPE.Locker] = locker;
  }

  _gatherAllMeshes() {
    for (const key in this._roomObject) {
      this._allMeshes.push(...this._roomObject[key].getAllMeshes());
    }
  }
}

export const OBJECT_TYPE = {
  Table: 'TABLE',
  Locker: 'LOCKER',
}
