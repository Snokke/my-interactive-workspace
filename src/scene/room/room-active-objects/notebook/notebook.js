import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../data/room-config';
import { NOTEBOOK_PART_TYPE } from './notebook-data';

export default class Notebook extends RoomObjectAbstract {
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

      const notebookStand = this._parts[NOTEBOOK_PART_TYPE.NotebookStand];
      const notebookMount = this._parts[NOTEBOOK_PART_TYPE.NotebookMount];
      const notebookArmMountBase = this._parts[NOTEBOOK_PART_TYPE.NotebookArmMountBase];
      const notebookArmMountArm01 = this._parts[NOTEBOOK_PART_TYPE.NotebookArmMountArm01];
      const notebookArmMountArm02 = this._parts[NOTEBOOK_PART_TYPE.NotebookArmMountArm02];
      const armMountParts = [notebookStand, notebookMount, notebookArmMountBase, notebookArmMountArm01, notebookArmMountArm02]

      const notebookKeyboard = this._parts[NOTEBOOK_PART_TYPE.NotebookKeyboard];
      const notebookMonitor = this._parts[NOTEBOOK_PART_TYPE.NotebookMonitor];
      const notebookScreen = this._parts[NOTEBOOK_PART_TYPE.NotebookScreen];
      const notebookParts = [notebookKeyboard, notebookMonitor, notebookScreen]

      armMountParts.forEach((part) => {
        new TWEEN.Tween(part.position)
          .to({ y: part.userData.startPosition.y }, fallDownTime)
          .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
          .start();
      });

      notebookParts.forEach((part) => {
        new TWEEN.Tween(part.position)
          .to({ y: part.userData.startPosition.y }, fallDownTime)
          .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
          .delay(fallDownTime * 0.5)
          .start();
      });

      Delayed.call(fallDownTime * 0.5 + fallDownTime, () => {
        this._debugMenu.enable();
        this._onShowAnimationComplete();
      });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    console.log('Notebook click');
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
