import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../data/room-config';
import { SPEAKERS_PART_TYPE, SPEAKERS_POWER_STATUS } from './speakers-data';
import { SPEAKERS_CONFIG } from './speakers-config';
import Loader from '../../../../core/loader';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import SoundParticles from './sound-particels';

export default class Speakers extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._leftSpeakerGroup = null;
    this._rightSpeakerGroup = null;

    this._musicRight = null;
    this._musicLeft = null;
    this._analyzer = null;

    this._rightSoundParticles = null;

    this._rightHelper = null;

    this._powerStatus = SPEAKERS_POWER_STATUS.Off;

    this._init();
  }

  update(dt) {
    this._rightSoundParticles.update(dt);
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const leftSpeaker = this._parts[SPEAKERS_PART_TYPE.Left];
      const rightSpeaker = this._parts[SPEAKERS_PART_TYPE.Right];

      new TWEEN.Tween(leftSpeaker.position)
        .to({ y: leftSpeaker.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(rightSpeaker.position)
        .to({ y: rightSpeaker.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5)
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

    this._powerStatus = this._powerStatus === SPEAKERS_POWER_STATUS.On ? SPEAKERS_POWER_STATUS.Off : SPEAKERS_POWER_STATUS.On;
    this._debugMenu.updatePowerStatus(this._powerStatus);

    this._updatePowerIndicatorColor();

    if (this._powerStatus === SPEAKERS_POWER_STATUS.On) {
      this._musicRight.play();
    } else {
      this._musicRight.pause();
    }
  }

  _updatePowerIndicatorColor() {
    const powerIndicator = this._parts[SPEAKERS_PART_TYPE.PowerIndicator];

    const powerIndicatorColor = this._powerStatus === SPEAKERS_POWER_STATUS.On ? SPEAKERS_CONFIG.turnOnColor : SPEAKERS_CONFIG.turnOffColor;
    powerIndicator.material.color = new THREE.Color(powerIndicatorColor);
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initMusic();
    this._initDebugMenu();
    this._initSignals();

    this._updatePowerIndicatorColor();
  }

  _addPartsToScene() {
    const leftSpeakerGroup = this._leftSpeakerGroup = new THREE.Group();
    this.add(leftSpeakerGroup);

    const leftSpeaker = this._parts[SPEAKERS_PART_TYPE.Left];

    leftSpeakerGroup.add(leftSpeaker);
    leftSpeakerGroup.position.copy(leftSpeaker.userData.startPosition);
    leftSpeaker.position.set(0, 0, 0);

    const rightSpeakerGroup = this._rightSpeakerGroup = new THREE.Group();
    this.add(rightSpeakerGroup);

    const rightSpeaker = this._parts[SPEAKERS_PART_TYPE.Right];
    const powerIndicator = this._parts[SPEAKERS_PART_TYPE.PowerIndicator];

    rightSpeakerGroup.add(rightSpeaker);
    rightSpeakerGroup.add(powerIndicator);
    rightSpeakerGroup.position.copy(rightSpeaker.userData.startPosition);
    powerIndicator.position.sub(rightSpeaker.userData.startPosition);
    rightSpeaker.position.set(0, 0, 0);
  }

  _initMusic() {
    this._initRightMusic();
    this._initParticles();
    this._initLoaderSignals();

    this._showHelpers();
  }

  _initRightMusic() {
    this._musicRight = new THREE.PositionalAudio(this._audioListener);
    this._musicRight.setRefDistance(10);
    this._musicRight.setDirectionalCone(180, 230, 0.1);

    this._rightSpeakerGroup.add(this._musicRight);

    const fftSize = 128;
    this._analyser = new THREE.AudioAnalyser(this._musicRight, fftSize);
  }

  _initParticles() {
    const rightSoundParticles = this._rightSoundParticles = new SoundParticles(this._analyser);
    this._rightSpeakerGroup.add(rightSoundParticles);
  }

  _initHelpers() {
    const rightHelper = this._rightHelper = new PositionalAudioHelper(this._musicRight, 1);
    this._rightSpeakerGroup.add(rightHelper);
  }

  _initLoaderSignals() {
    Loader.events.on('onAudioLoaded', () => {
      this._musicRight.setBuffer(Loader.assets['giorgio']);
    })
  }

  _initSignals() {
    this._debugMenu.events.on('switch', () => {
      this.onClick();
    });

    this._debugMenu.events.on('onHelpersChanged', () => {
      this._showHelpers();
    });
  }

  _showHelpers() {
    if (!this._rightHelper) {
      this._initHelpers();
    }

    this._rightHelper.visible = SPEAKERS_CONFIG.helpersEnabled;
  }
}
