import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../data/room-config';
import { SPEAKERS_PART_TYPE } from './speakers-data';

export default class Speakers extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._init();
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

    console.log('Speakers switch on');
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initDebugMenu();
    this._initSignals();
  }

  _initSignals() {
    this._debugMenu.events.on('switchOn', () => {
      this.onClick();
    });
  }
}
