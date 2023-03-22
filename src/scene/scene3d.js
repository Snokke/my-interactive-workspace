import * as THREE from 'three';
import Loader from '../core/loader';
import Locker from './locker/locker';
import { LOCKER_PART_TYPE } from './locker/locker-data';
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

    this._pointerPosition = new THREE.Vector2();

    this._init();
  }

  update(dt) {
    const object = this._checkIntersection(this._pointerPosition.x, this._pointerPosition.y);
    this._checkToGlow(object);
  }

  onClick() {
    this._table.changeState();
  }

  onPointerMove(x, y) {
    this._pointerPosition.set(x, y);
  }

  onPointerDown(x, y) {
    const object = this._checkIntersection(x, y);

    if (object === null) {
      return;
    }

    this._roomObject[object.userData.objectType].onClick(object);
  }

  onPointerUp() {

  }

  _checkToGlow(object) {
    if (object === null) {
      this._resetGlow();

      return;
    }

    switch (object.userData.objectType) {
      case OBJECT_TYPE.Table:
        const table = this._roomObject[OBJECT_TYPE.Table];
        this._setGlow(table, table.getAllMeshes());
        break;

      case OBJECT_TYPE.Locker:
        const locker = this._roomObject[OBJECT_TYPE.Locker];

        if (object.userData.partType === LOCKER_PART_TYPE.BODY) {
          this._setGlow(locker, locker.getBodyMesh());
        } else {
          this._setGlow(locker, locker.getCaseMesh(object.userData.caseId));
        }
        break;
      }
  }

  _setGlow(object, items) {
    if (object.isInputEnabled()) {
      this._outlinePass.selectedObjects = items;
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

    let intersectedObject = null;

    if (intersects.length > 0) {
      intersectedObject = intersects[0].object;
    }

    return intersectedObject;
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
