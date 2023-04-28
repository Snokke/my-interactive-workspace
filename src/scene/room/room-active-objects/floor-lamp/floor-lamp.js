import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { FLOOR_LAMP_PART_TYPE } from './data/floor-lamp-data';
import { ROOM_CONFIG } from '../../data/room-config';
import Loader from '../../../../core/loader';
import SoundHelper from '../../shared-objects/sound-helper';
import { SOUNDS_CONFIG } from '../../data/sounds-config';

export default class FloorLamp extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._sound = null;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      this.visible = true;

      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const stand = this._parts[FLOOR_LAMP_PART_TYPE.Stand];
      const lamp = this._parts[FLOOR_LAMP_PART_TYPE.Lamp];

      new TWEEN.Tween(stand.position)
        .to({ y: stand.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(lamp.position)
        .to({ y: lamp.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5 * 2)
        .start()
        .onComplete(() => {
          this._debugMenu.enable();
          this._onShowAnimationComplete();
        });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    this._playSound();
    console.log('Switch light');
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initSounds();
    this._initDebugMenu();
    this._initSignals();
  }

  _initSounds() {
    this._initSound();
    this._initSoundHelper();
  }

  _initSound() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];

    const sound = this._sound = new THREE.PositionalAudio(this._audioListener);
    this.add(sound);

    sound.setRefDistance(soundConfig.refDistance);

    const stand = this._parts[FLOOR_LAMP_PART_TYPE.Stand];
    sound.position.copy(stand.position);
    sound.position.y = 5;

    sound.setVolume(this._globalVolume * this._objectVolume);

    Loader.events.on('onAudioLoaded', () => {
      sound.setBuffer(Loader.assets['lamp-switch']);
    });
  }

  _initSoundHelper() {
    const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;
    const soundHelper = this._soundHelper = new SoundHelper(helperSize);
    this.add(soundHelper);

    soundHelper.position.copy(this._sound.position);
  }

  _initSignals() {
    this._debugMenu.events.on('switchLight', () => {
      this.onClick();
    });
  }
}
