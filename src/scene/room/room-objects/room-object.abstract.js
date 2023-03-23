import * as THREE from 'three';
import { MessageDispatcher } from 'black-engine';

export default class RoomObjectAbstract extends THREE.Group {
  constructor(meshesGroup, roomObjectType) {
    super();

    this.events = new MessageDispatcher();

    this._meshesGroup = meshesGroup;
    this._roomObjectType = roomObjectType;

    this._meshes = [];
    this._parts = {};

    this._isShowAnimationActive = false;
    this._isInputEnabled = true;
  }

  show() {
    this._isInputEnabled = false;
  }

  onClick() { }

  getMeshesForOutline(mesh) { }

  getObjectType() {
    return this._roomObjectType;
  }

  getAllMeshes() {
    return this._meshes;
  }

  isInputEnabled() {
    return this._isInputEnabled;
  }

  isShowAnimationActive() {
    return this._isShowAnimationActive;
  }

  _initParts(partTypeEnum) {
    for (const partName in partTypeEnum) {
      const part = this._meshesGroup.children.find(child => child.name === partTypeEnum[partName]);

      this._parts[partTypeEnum[partName]] = part;

      part.userData['objectType'] = this._roomObjectType;
      part.userData['partType'] = partTypeEnum[partName];
      part.userData['startPosition'] = part.position.clone();

      this._meshes.push(part);
    }
  }

  _addMaterials() {
    for (const partName in this._parts) {
      const part = this._parts[partName];
      const material = new THREE.MeshLambertMaterial({
        color: `hsl(${Math.random() * 360}, 80%, 50%)`,
      });

      part.material = material;
    }
  }
}
