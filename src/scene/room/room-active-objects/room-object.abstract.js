import * as THREE from 'three';
import { MessageDispatcher } from 'black-engine';
import { ROOM_CONFIG, ROOM_OBJECT_CONFIG } from '../data/room-config';
import { ROOM_OBJECT_CLASS } from '../data/room-objects-classes';

export default class RoomObjectAbstract extends THREE.Group {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super();

    this.events = new MessageDispatcher();

    this._meshesGroup = meshesGroup;
    this._roomObjectType = roomObjectType;
    this._audioListener = audioListener;

    this._debugMenu = null;

    this._allMeshes = [];
    this._activeMeshes = [];
    this._parts = {};

    this._isShowAnimationActive = false;
    this._isInputEnabled = true;
    this._isPointerOver = false;
  }

  update(dt) { }

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

  openDebugMenu() {
    this._debugMenu.openFolder();
  }

  closeDebugMenu() {
    this._debugMenu.closeFolder();
  }

  hideDebugMenu() {
    this._debugMenu.hideFolder();
  }

  showDebugMenu() {
    this._debugMenu.showFolder();
  }

  onClick() { }

  onPointerOver(intersect) {
    this._isPointerOver = true;
  }

  onPointerOut() {
    this._isPointerOver = false;
  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

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

  _setPositionForShowAnimation() {
    for (let key in this._parts) {
      const part = this._parts[key];
      part.position.y = part.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;
    }
  }

  _onShowAnimationComplete() {
    this._isInputEnabled = true;
    this._isShowAnimationActive = false;
    this.events.post('showAnimationComplete');
  }

  _initParts() {
    const partTypes = ROOM_OBJECT_CONFIG[this._roomObjectType].partTypes;
    const config = ROOM_OBJECT_CONFIG[this._roomObjectType].partsActiveConfig;

    for (const partName in partTypes) {
      const part = this._meshesGroup.children.find(child => child.name === partTypes[partName]);
      const partsActiveConfig = config[partTypes[partName]];

      this._parts[partTypes[partName]] = part;

      part.userData['objectType'] = this._roomObjectType;
      part.userData['partType'] = partTypes[partName];
      part.userData['startPosition'] = part.position.clone();
      part.userData['startAngle'] = part.rotation.clone();
      part.userData['isActive'] = partsActiveConfig;

      this._allMeshes.push(part);

      if (partsActiveConfig) {
        this._activeMeshes.push(part);
      }
    }
  }

  _addMaterials() {
    for (const partName in this._parts) {
      const part = this._parts[partName];
      const material = new THREE.MeshStandardMaterial({
        color: `hsl(${Math.random() * 360}, 80%, 50%)`,
      });

      part.material = material;
    }
  }

  _addPartsToScene() {
    for (let key in this._parts) {
      const part = this._parts[key];

      this.add(part);
    }
  }

  _initDebugMenu() {
    const debugMenuClass = ROOM_OBJECT_CLASS[this._roomObjectType].debugMenu;
    const debugMenu = this._debugMenu = new debugMenuClass(this._roomObjectType);
    this.add(debugMenu);
  }
}
