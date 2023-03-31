import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { TABLE_HANDLE_STATE, TABLE_PART_CONFIG, TABLE_PART_TYPE, TABLE_STATE } from './table-data';
import TableDebug from './table-debug';
import TABLE_CONFIG from './table-config';
import RoomObjectAbstract from '../room-object.abstract';
import Delayed from '../../../../core/helpers/delayed-call';
import { ROOM_CONFIG } from '../../room-config';

export default class Table extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._handleState = { value: TABLE_HANDLE_STATE.Idle };
    this._currentTableState = { value: TABLE_STATE.SittingMode };
    this._previousTableState = this._currentTableState.value;

    this._tableDebug = null;
    this._topPartsGroup = null;

    this._tweenHandleMoveOut = null;
    this._tweenHandleMoveIn = null;
    this._tweenHandleRotation = null;

    this._previousHandleAngle = 0;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._tableDebug.disable();

    this._reset();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const legs = this._parts[TABLE_PART_TYPE.Legs];
      const topPart = this._parts[TABLE_PART_TYPE.TopPart];
      const tableTop = this._parts[TABLE_PART_TYPE.Tabletop];
      const handle = this._parts[TABLE_PART_TYPE.Handle];

      new TWEEN.Tween(legs.position)
        .to({ y: legs.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(topPart.position)
        .to({ y: topPart.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5)
        .start();

      new TWEEN.Tween(tableTop.position)
        .to({ y: tableTop.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5 * 2)
        .start();

      const handleScaleTween = new TWEEN.Tween(handle.scale)
        .to({ x: 1, y: 1, z: 1 }, 300)
        .easing(ROOM_CONFIG.startAnimation.objectScaleEasing)
        .delay(fallDownTime * 0.5 * 3)
        .start();

      handleScaleTween.onComplete(() => {
        const handleMoveTween = new TWEEN.Tween(handle.position)
        .to({ z: handle.userData.startPosition.z }, 300)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start();

        handleMoveTween.onComplete(() => {
          this._tableDebug.enable();
          this._onShowAnimationComplete();
        });
      });
    });
  }

  onClick(roomObject) {
    if (!this._isInputEnabled) {
      return;
    }

    const handle = this._parts[TABLE_PART_TYPE.Handle];

    if (this._currentTableState.value === TABLE_STATE.Moving) {
      this._changeDirection(handle);

      return;
    }

    this._setTableState(TABLE_STATE.Moving);
    this._startFromHandleMoveOut(handle);
  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  getTopTableGroup() {
    return this._topPartsGroup;
  }

  _changeDirection(handle) {
    this._updateTableState();
    this._stopTweens();
    this._setTableState(TABLE_STATE.Moving);

    switch (this._handleState.value) {
      case TABLE_HANDLE_STATE.MovingOut:
        this._startFromHandleMoveIn(handle);
        break;

      case TABLE_HANDLE_STATE.Rotating:
        this._startFromHandleRotation(handle);
        break;

      case TABLE_HANDLE_STATE.MovingIn:
        this._startFromHandleMoveOut(handle);
        break;
    }
  }

  _startFromHandleMoveOut(handle) {
    this._handleState.value = TABLE_HANDLE_STATE.MovingOut;

    const positionZ = 0.75;
    const time = Math.abs(handle.userData.startPosition.z + positionZ - handle.position.z) / TABLE_CONFIG.handleMoveOutSpeed * 1000;

    const tweenHandleMoveOut = this._tweenHandleMoveOut = new TWEEN.Tween(handle.position)
      .to({ z: handle.userData.startPosition.z + positionZ }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    tweenHandleMoveOut.onComplete(() => {
      this._startFromHandleRotation(handle);
    });
  }

  _startFromHandleRotation(handle) {
    this._handleState.value = TABLE_HANDLE_STATE.Rotating;
    this._previousHandleAngle = handle.rotation.z;

    const maxRotationAngle = Math.PI * 2 * TABLE_CONFIG.handleMaxRotations;
    const rotationAngle = this._previousTableState === TABLE_STATE.SittingMode ? maxRotationAngle : 0;
    const remainingRotationAngle = this._previousTableState === TABLE_STATE.SittingMode ? maxRotationAngle - handle.rotation.z : handle.rotation.z;
    const time = remainingRotationAngle / TABLE_CONFIG.handleRotationSpeed * 1000;

    const tweenHandleRotation = this._tweenHandleRotation = new TWEEN.Tween(handle.rotation)
      .to({ z: rotationAngle }, time)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start();

    tweenHandleRotation.onUpdate(() => {
      const angleDelta = handle.rotation.z - this._previousHandleAngle;
      this._previousHandleAngle = handle.rotation.z;

      const positionDeltaY = angleDelta / Math.PI * TABLE_CONFIG.handle360RotationDeltaY;
      this._topPartsGroup.position.y += positionDeltaY;
    });

    tweenHandleRotation.onComplete(() => {
      this._startFromHandleMoveIn(handle);
    });
  }

  _startFromHandleMoveIn(handle) {
    this._handleState.value = TABLE_HANDLE_STATE.MovingIn;

    const time = Math.abs(handle.userData.startPosition.z - handle.position.z) / TABLE_CONFIG.handleMoveOutSpeed * 1000;
    const tweenHandleMoveIn = this._tweenHandleMoveIn = new TWEEN.Tween(handle.position)
      .to({ z: handle.userData.startPosition.z }, time)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();

    tweenHandleMoveIn.onComplete(() => {
      this._handleState.value = TABLE_HANDLE_STATE.Idle;
      this._updateTableState();
    });
  }

  _updateTableState() {
    this._setTableState(this._previousTableState === TABLE_STATE.SittingMode ? TABLE_STATE.StandingMode : TABLE_STATE.SittingMode);
    this._previousTableState = this._currentTableState.value;
  }

  _stopTweens() {
    if (this._tweenHandleMoveOut) {
      this._tweenHandleMoveOut.stop();
    }

    if (this._tweenHandleMoveIn) {
      this._tweenHandleMoveIn.stop();
    }

    if (this._tweenHandleRotation) {
      this._tweenHandleRotation.stop();
    }
  }

  _setTableState(state) {
    this._currentTableState.value = state;
    this._tableDebug.updateTableState(state);
  }

  _setPositionForShowAnimation() {
    for (let key in this._parts) {
      this._parts[key].position.y = this._parts[key].userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;
    }

    const handle = this._parts[TABLE_PART_TYPE.Handle];
    handle.position.copy(handle.userData.startPosition);
    handle.position.z = 2.5;
    handle.scale.set(0, 0, 0);
  }

  _reset() {
    this._stopTweens();

    this._handleState = { value: TABLE_HANDLE_STATE.Idle };
    this._setTableState(TABLE_STATE.SittingMode);
    this._previousTableState = this._currentTableState.value;

    this._topPartsGroup.position.y = 0;

    const handle = this._parts[TABLE_PART_TYPE.Handle];

    handle.rotation.z = 0;
    handle.position.z = handle.userData.startPosition.z;
  }

  _init() {
    this._initParts(TABLE_PART_TYPE, TABLE_PART_CONFIG);
    this._addMaterials();
    this._initTopPartsGroup();
    this._addPartsToScene();
    this._initDebug();
  }

  _initTopPartsGroup() {
    const topPartsGroup = this._topPartsGroup = this._createTopPartsGroup(this._parts);
    this.add(topPartsGroup);
  }

  _addPartsToScene() {
    this.add(this._parts[TABLE_PART_TYPE.Legs]);
  }

  _createTopPartsGroup(tableParts) {
    const topPartsGroup = new THREE.Group();
    topPartsGroup.add(tableParts[TABLE_PART_TYPE.Tabletop], tableParts[TABLE_PART_TYPE.TopPart], tableParts[TABLE_PART_TYPE.Handle]);

    return topPartsGroup;
  }

  _initDebug() {
    const tableDebug = this._tableDebug = new TableDebug(this._currentTableState);

    tableDebug.events.on('changeState', () => this.onClick());
  }
}
