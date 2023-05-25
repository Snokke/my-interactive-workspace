import * as THREE from 'three';
import { Black, MessageDispatcher } from 'black-engine';
import { ROOM_OBJECT_CONFIG } from '../data/room-config';
import { ROOM_OBJECT_CLASS } from '../data/room-objects-classes';
import { SOUNDS_CONFIG } from '../data/sounds-config';

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

    this._sound = null;
    this._soundHelper = null;
    this._objectVolume = SOUNDS_CONFIG.objects[roomObjectType] ? SOUNDS_CONFIG.objects[roomObjectType].volume : 1;
    this._globalVolume = SOUNDS_CONFIG.volume;
    this._isSoundsEnabled = true;

    this._hasDebugMenu = ROOM_OBJECT_CLASS[this._roomObjectType].debugMenu ? true : false;
  }

  update(dt) { }

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
    Black.engine.containerElement.style.cursor = 'pointer';
  }

  onPointerOut() {
    this._isPointerOver = false;
  }

  onPointerUp() { }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  getObjectType() {
    return this._roomObjectType;
  }

  getActiveMeshes() {
    return this._allMeshes;
  }

  hasDebugMenu() {
    return this._hasDebugMenu;
  }

  isInputEnabled() {
    return this._isInputEnabled;
  }

  isShowAnimationActive() {
    return this._isShowAnimationActive;
  }

  showSoundHelpers() {
    if (this._soundHelper) {
      this._soundHelper.show();
    }
  }

  hideSoundHelpers() {
    if (this._soundHelper) {
      this._soundHelper.hide();
    }
  }

  onVolumeChanged(volume) {
    this._globalVolume = volume;

    if (this._sound && this._isSoundsEnabled) {
      this._sound.setVolume(this._globalVolume * this._objectVolume);
    }
  }

  enableSound() {
    this._isSoundsEnabled = true;

    if (this._sound) {
      this._sound.setVolume(this._globalVolume * this._objectVolume);
    }
  }

  disableSound() {
    this._isSoundsEnabled = false;

    if (this._sound) {
      this._sound.setVolume(0);
    }
  }

  disableDebugMenu() {
    if (this._hasDebugMenu) {
      this._debugMenu.disable();
    }
  }

  enableDebugMenu() {
    if (this._hasDebugMenu) {
      this._debugMenu.enable();
    }
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

  _addPartsToScene() {
    for (let key in this._parts) {
      const part = this._parts[key];

      this.add(part);
    }
  }

  _playSound() {
    if (this._sound.isPlaying) {
      this._sound.stop();
    }

    this._sound.play();
  }

  _initDebugMenu() {
    const debugMenuClass = ROOM_OBJECT_CLASS[this._roomObjectType].debugMenu;
    const debugMenu = this._debugMenu = new debugMenuClass(this._roomObjectType);
    this.add(debugMenu);
  }
}
