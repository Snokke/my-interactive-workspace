import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../room-config';
import MonitorDebug from './monitor-debug';

export default class Monitor extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._monitorDebug = null;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._monitorDebug.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      // const body = this._parts[AIR_CONDITIONER_PART_TYPE.Body];

      // new TWEEN.Tween(body.position)
      //   .to({ y: body.userData.startPosition.y }, fallDownTime)
      //   .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
      //   .start()
      //   .onComplete(() => {
      //     this._speakersDebug.enable();
      //     this._onShowAnimationComplete();
      //   });
    });
  }

  onClick(roomObject) {
    if (!this._isInputEnabled) {
      return;
    }

    console.log('Monitor click');
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
    const monitorDebug = this._monitorDebug = new MonitorDebug();

    monitorDebug.events.on('switchOn', () => {
      this.onClick();
    });
  }
}
