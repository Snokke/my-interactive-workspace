import * as THREE from 'three';
import { MessageDispatcher } from 'black-engine';

export default class RoomObjectAbstract extends THREE.Group {
  constructor(meshesGroup, roomObjectType) {
    super();

    this.events = new MessageDispatcher();

    this._meshesGroup = meshesGroup;
    this._roomObjectType = roomObjectType;

    this._allMeshes = [];
    this._activeMeshes = [];
    this._parts = {};

    this._isShowAnimationActive = false;
    this._isInputEnabled = true;
  }

  showWithAnimation() {
    this._isInputEnabled = false;
    this._isShowAnimationActive = true;
  }

  show() {
    this._allMeshes.forEach(mesh => mesh.visible = true);
  }

  hide() {
    this._allMeshes.forEach(mesh => mesh.visible = false);
  }

  setVisibility(isVisible) {
    this._allMeshes.forEach(mesh => mesh.visible = isVisible);
  }

  onClick() { }

  getMeshesForOutline(mesh) { }

  getObjectType() {
    return this._roomObjectType;
  }

  getActiveMeshes() {
    return this._allMeshes;
  }

  isInputEnabled() {
    return this._isInputEnabled;
  }

  isShowAnimationActive() {
    return this._isShowAnimationActive;
  }

  _onShowAnimationComplete() {
    this._isInputEnabled = true;
    this._isShowAnimationActive = false;
    this.events.post('showAnimationComplete');
  }

  _initParts(partTypeEnum, config) {
    for (const partName in partTypeEnum) {
      const part = this._meshesGroup.children.find(child => child.name === partTypeEnum[partName]);
      const partConfig = config[partTypeEnum[partName]];

      this._parts[partTypeEnum[partName]] = part;

      part.userData['objectType'] = this._roomObjectType;
      part.userData['partType'] = partTypeEnum[partName];
      part.userData['startPosition'] = part.position.clone();
      part.userData['isActive'] = partConfig.isActive;

      this._allMeshes.push(part);

      if (partConfig.isActive) {
        this._activeMeshes.push(part);
      }
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
