import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../room-config';
import { SPEAKERS_PART_TYPE } from './speakers-data';
import SpeakersDebug from './speakers-debug';

export default class Speakers extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._speakersDebug = null;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._speakersDebug.disable();
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
          this._speakersDebug.enable();
          this._onShowAnimationComplete();
        });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    console.log('Speakers switch on');
  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  _setPositionForShowAnimation() {
    for (let key in this._parts) {
      const part = this._parts[key];
      part.position.y = part.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;
    }
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initDebug();
  }

  _addPartsToScene() {
    for (let key in this._parts) {
      const part = this._parts[key];

      this.add(part);
    }
  }

  _initDebug() {
    const speakersDebug = this._speakersDebug = new SpeakersDebug();

    speakersDebug.events.on('switchOn', () => {
      this.onClick();
    });
  }
}
