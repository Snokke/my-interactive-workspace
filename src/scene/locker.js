import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { OBJECT_TYPE } from './scene3d';

export default class Locker extends THREE.Group {
  constructor(lockerGroup) {
    super();

    this._lockerGroup = lockerGroup;
    this._objectType = OBJECT_TYPE.Locker;

    this._lockerParts = null;
    this._allMeshes = [];

    this._lockerScale = 1;

    this._init();
  }

  getObjectType() {
    return this._objectType;
  }

  getAllMeshes() {
    return this._allMeshes;
  }

  _init() {
    // this.add(this._lockerGroup);

    this._removeExtraLockerParts(this._lockerGroup);
    const lockerParts = this._lockerParts = this._getLockerParts(this._lockerGroup);
    this._addMaterials(lockerParts);

    const body = lockerParts[LOCKER_PART_NAME.BODY];
    this.add(body);

    body.position.x += this._lockerGroup.position.x;
    body.position.y += this._lockerGroup.position.y;
    body.position.z += this._lockerGroup.position.z;


    const caseStartPosition = lockerParts[LOCKER_PART_NAME.CASE01].position.clone();
    caseStartPosition.x += this._lockerGroup.position.x;
    caseStartPosition.y += this._lockerGroup.position.y;
    caseStartPosition.z += this._lockerGroup.position.z;

    const material = new THREE.MeshLambertMaterial({
      color: Math.random() * 0xffffff,
    });

    const geometry = lockerParts[LOCKER_PART_NAME.CASE01].geometry;

    const mesh = new THREE.InstancedMesh(geometry, material, 6);
    this.add(mesh);

    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const matrix = new THREE.Matrix4();

    for (let i = 0; i < 6; i += 1) {
      matrix.setPosition(new THREE.Vector3(caseStartPosition.x, caseStartPosition.y - i * 1.03, caseStartPosition.z));
      mesh.setMatrixAt(i, matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;

    mesh.userData['objectType'] = this._objectType;
    this._allMeshes.push(mesh);


    // this._tableGroup.scale.set(this._tableScale, this._tableScale, this._tableScale);
    // topPartsGroup.scale.set(this._tableScale, this._tableScale, this._tableScale);
  }

  _createTopPartsGroup(tableParts) {
    const topPartsGroup = new THREE.Group();
    topPartsGroup.add(tableParts[LOCKER_PART_NAME.BODY], tableParts[LOCKER_PART_NAME.TOP_PART], tableParts[LOCKER_PART_NAME.HANDLE]);

    return topPartsGroup;
  }

  _getLockerParts(lockerGroup) {
    const lockerParts = {};

    for (const partName in LOCKER_PART_NAME) {
      const part = lockerGroup.children.find(child => child.name === LOCKER_PART_NAME[partName]);
      lockerParts[LOCKER_PART_NAME[partName]] = part;

      part.userData['objectType'] = this._objectType;
      this._allMeshes.push(part);
    }

    return lockerParts;
  }

  _removeExtraLockerParts(lockerGroup) {
    for (const partName in LOCKER_PART_NAME_TO_DELETE) {
      const part = lockerGroup.children.find(child => child.name === LOCKER_PART_NAME_TO_DELETE[partName]);
      part.geometry.dispose();
      lockerGroup.remove(part);
    }
  }

  _addMaterials(tableParts) {
    for (const partName in tableParts) {
      const part = tableParts[partName];
      const material = new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff,
      });

      part.material = material;
    }
  }
}

const LOCKER_PART_NAME = {
  BODY: 'body',
  CASE01: 'case01',
}

const LOCKER_PART_NAME_TO_DELETE = {
  CASE02: 'case02',
  CASE03: 'case03',
  CASE04: 'case04',
  CASE05: 'case05',
  CASE06: 'case06',
}
