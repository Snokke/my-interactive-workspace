import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { CHAIR_PART_CONFIG, CHAIR_PART_TYPE } from './chair-data';
import ChairDebug from './chair-debug';

export default class Chair extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._chairDebug = null;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._chairDebug.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = 600;

      const legs = this._parts[CHAIR_PART_TYPE.ChairLegs];
      const seat = this._parts[CHAIR_PART_TYPE.ChairSeat];

      // new TWEEN.Tween(stand.position)
      //   .to({ y: stand.userData.startPosition.y }, fallDownTime)
      //   .easing(TWEEN.Easing.Sinusoidal.Out)
      //   .start();

      // new TWEEN.Tween(tube.position)
      //   .to({ y: tube.userData.startPosition.y }, fallDownTime)
      //   .easing(TWEEN.Easing.Sinusoidal.Out)
      //   .delay(250)
      //   .start();

      // new TWEEN.Tween(lamp.position)
      //   .to({ y: lamp.userData.startPosition.y }, fallDownTime)
      //   .easing(TWEEN.Easing.Sinusoidal.Out)
      //   .delay(500)
      //   .start()
      //   .onComplete(() => {
      //     this._chairDebug.enable();
      //     this._onShowAnimationComplete();
      //   });
    });
  }

  onClick(roomObject) {
    if (!this._isInputEnabled) {
      return;
    }

  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  _setPositionForShowAnimation() {
    const startPositionY = 13;

    for (let key in this._parts) {
      const part = this._parts[key];
      part.position.y = part.userData.startPosition.y + startPositionY;
    }
  }

  _init() {
    this._initParts(CHAIR_PART_TYPE, CHAIR_PART_CONFIG);
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
    const chairDebug = this._chairDebug = new ChairDebug();

    chairDebug.events.on('rotate', () => {
      console.log('rotate');
    });
  }
}
