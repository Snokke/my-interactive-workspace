import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../room-config';
import MonitorDebug from './monitor-debug';
import { MONITOR_PART_TYPE } from './monitor-data';

export default class Monitor extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._monitorDebug = null;
    this._monitorGroup = null;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._monitorDebug.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      for (let key in this._parts) {
        const part = this._parts[key];

        new TWEEN.Tween(part.position)
        .to({ y: part.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();
      }

      Delayed.call(fallDownTime, () => {
        this._monitorDebug.enable();
        this._onShowAnimationComplete();
      });
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
    this._initGroups();
    this._initDebug();
  }

  _addPartsToScene() {
    for (let key in this._parts) {
      const part = this._parts[key];

      this.add(part);
    }
  }

  _initGroups() {
    const monitorGroup = this._monitorGroup = new THREE.Group();
    this.add(monitorGroup);

    const monitor = this._parts[MONITOR_PART_TYPE.Monitor];
    const monitorScreen = this._parts[MONITOR_PART_TYPE.MonitorScreen];
    const monitorMount = this._parts[MONITOR_PART_TYPE.MonitorMount];

    monitorGroup.add(monitor, monitorScreen, monitorMount);
  }

  _initDebug() {
    const monitorDebug = this._monitorDebug = new MonitorDebug();

    monitorDebug.events.on('switchOn', () => {
      this.onClick();
    });
  }
}
