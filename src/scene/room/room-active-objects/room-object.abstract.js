import * as THREE from 'three';
import { MessageDispatcher } from 'black-engine';
import { ROOM_CONFIG, ROOM_OBJECT_CONFIG } from '../data/room-config';
import { ROOM_OBJECT_CLASS } from '../data/room-objects-classes';
import SoundHelper from '../shared-objects/sound-helper';
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
    this._globalVolume = 1;
    this._isSoundsEnabled = true;

    this._hasDebugMenu = ROOM_OBJECT_CLASS[this._roomObjectType].debugMenu ? true : false;
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

  _playSound() {
    if (this._sound.isPlaying) {
      this._sound.stop();
    }

    this._sound.play();
  }

  // _initSound() {
  //   const sound = this._sound = new THREE.PositionalAudio(this._audioListener);

  //   const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];
  //   sound.setRefDistance(soundConfig.refDistance);

  //   sound.setVolume(this._globalVolume * this._objectVolume);
  // }

  // _initSoundHelper() {
  //   const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;
  //   this._soundHelper = new SoundHelper(helperSize);
  // }

  _initDebugMenu() {
    const debugMenuClass = ROOM_OBJECT_CLASS[this._roomObjectType].debugMenu;
    const debugMenu = this._debugMenu = new debugMenuClass(this._roomObjectType);
    this.add(debugMenu);
  }
}
