import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../data/room-config';
import { SOCIAL_NETWORK_LOGOS_PART_TYPE } from './social-network-logos-data';

export default class SocialNetworkLogos extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      this.visible = true;

      const github = this._parts[SOCIAL_NETWORK_LOGOS_PART_TYPE.Github];
      const linkedin = this._parts[SOCIAL_NETWORK_LOGOS_PART_TYPE.Linkedin];

      new TWEEN.Tween(github.scale)
        .to({ x: 1, y: 1, z: 1 }, 300)
        .easing(ROOM_CONFIG.startAnimation.objectScaleEasing)
        .start();

      new TWEEN.Tween(linkedin.scale)
        .to({ x: 1, y: 1, z: 1 }, 300)
        .easing(ROOM_CONFIG.startAnimation.objectScaleEasing)
        .delay(200)
        .start()
        .onComplete(() => {
          this._onShowAnimationComplete();
        });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (partType === SOCIAL_NETWORK_LOGOS_PART_TYPE.Github) {
      window.open('https://github.com/Snokke/room-project', '_blank').focus();

    }

    if (partType === SOCIAL_NETWORK_LOGOS_PART_TYPE.Linkedin) {
      window.open('https://www.linkedin.com/in/andriibabintsev/', '_blank').focus();
    }
  }

  getMeshesForOutline(mesh) {
    return [mesh];
  }

  _setPositionForShowAnimation() {
    const github = this._parts[SOCIAL_NETWORK_LOGOS_PART_TYPE.Github];
    const linkedin = this._parts[SOCIAL_NETWORK_LOGOS_PART_TYPE.Linkedin];

    github.scale.set(0, 0, 0);
    linkedin.scale.set(0, 0, 0);
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
  }
}
