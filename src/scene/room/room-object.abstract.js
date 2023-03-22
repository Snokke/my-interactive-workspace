import * as THREE from 'three';

export default class RoomObjectAbstract extends THREE.Group {
  constructor(meshesGroup, roomObjectType) {
    super();

    this._meshesGroup = meshesGroup;
    this._roomObjectType = roomObjectType;

    this._meshes = [];
    this._parts = {};

    this._isInputEnabled = true;
  }

  show() {
    this._isInputEnabled = false;
  }

  onClick(roomObject) { }

  getObjectType() {
    return this._roomObjectType;
  }

  getAllMeshes() {
    return this._meshes;
  }

  isInputEnabled() {
    return this._isInputEnabled;
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
