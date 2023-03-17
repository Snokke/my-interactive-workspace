import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { OBJECT_TYPE } from './scene3d';

export default class Table extends THREE.Group {
  constructor(tableGroup) {
    super();

    this._tableGroup = tableGroup;
    this._objectType = OBJECT_TYPE.Table;

    this._tableParts = null;
    this._topPartsGroup = null;
    this._previousHandleAngle = 0;
    this._allMeshes = [];

    this._currentTableState = TABLE_STATE.SittingMode;
    this._previousTableState = this._currentTableState;
    this._handleState = HANDLE_STATE.Idle;

    this._tweenHandleMoveOut = null;
    this._tweenHandleMoveIn = null;
    this._tweenHandleRotation = null;
    this._scaleUpTween = null;

    this._isScaleUp = false;

    this._tableScale = 1;

    this._handleMoveOutSpeed = 7;
    this._handleRotationSpeed = 25;
    this._handleMaxRotations = 10;
    this._handle360RotationDeltaY = 0.15;

    this._init();
  }

  startScaleUp() {
    if (this._isScaleUp) {
      return;
    }

    this._isScaleUp = true;

    if (this._scaleUpTween) {
      this._scaleUpTween.stop();
    }

    const scale = 1.03;
    this._scaleUpTween = new TWEEN.Tween(this.scale)
      .to({ x: scale, y: scale, z: scale }, 400)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .yoyo(true)
      .repeat(Infinity)
      .start();
  }

  stopScaleUp() {
    if (!this._isScaleUp) {
      return;
    }

    this._isScaleUp = false;

    if (this._scaleUpTween) {
      this._scaleUpTween.stop();
    }

    this.scale.set(1, 1, 1);
  }

  changeState() {
    const handle = this._tableParts[TABLE_PART_NAME.Handle];

    if (this._currentTableState === TABLE_STATE.Moving) {
      this._changeDirection(handle);

      return;
    }

    this._currentTableState = TABLE_STATE.Moving;
    this._startFromHandleMoveOut(handle);
  }

  getAllMeshes() {
    return this._allMeshes;
  }

  getObjectType() {
    return this._objectType;
  }

  _changeDirection(handle) {
    this._updateTableState();
    this._stopTweens();
    this._currentTableState = TABLE_STATE.Moving;

    switch (this._handleState) {
      case HANDLE_STATE.MovingOut:
        this._startFromHandleMoveIn(handle);
        break;

      case HANDLE_STATE.Rotating:
        this._startFromHandleRotation(handle);
        break;

      case HANDLE_STATE.MovingIn:
        this._startFromHandleMoveOut(handle);
        break;
    }
  }

  _startFromHandleMoveOut(handle) {
    this._handleState = HANDLE_STATE.MovingOut;

    const positionZ = 1.6;
    const time = (positionZ - handle.position.z) / this._handleMoveOutSpeed * 1000;

    const tweenHandleMoveOut = this._tweenHandleMoveOut = new TWEEN.Tween(handle.position)
      .to({ z: positionZ }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    tweenHandleMoveOut.onComplete(() => {
      this._startFromHandleRotation(handle);
    });
  }

  _startFromHandleRotation(handle) {
    this._handleState = HANDLE_STATE.Rotating;
    this._previousHandleAngle = handle.rotation.z;

    const maxRotationAngle = Math.PI * 2 * this._handleMaxRotations;
    const rotationAngle = this._previousTableState === TABLE_STATE.SittingMode ? maxRotationAngle : 0;
    const remainingRotationAngle = this._previousTableState === TABLE_STATE.SittingMode ? maxRotationAngle - handle.rotation.z : handle.rotation.z;
    const time = remainingRotationAngle / this._handleRotationSpeed * 1000;

    const tweenHandleRotation = this._tweenHandleRotation = new TWEEN.Tween(handle.rotation)
      .to({ z: rotationAngle }, time)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start();

    tweenHandleRotation.onUpdate(() => {
      const angleDelta = handle.rotation.z - this._previousHandleAngle;
      this._previousHandleAngle = handle.rotation.z;

      const positionDeltaY = angleDelta / Math.PI * this._handle360RotationDeltaY;
      this._topPartsGroup.position.y += positionDeltaY * this._tableScale;
    });

    tweenHandleRotation.onComplete(() => {
      this._startFromHandleMoveIn(handle);
    });
  }

  _startFromHandleMoveIn(handle) {
    this._handleState = HANDLE_STATE.MovingIn;

    const time = handle.position.z / this._handleMoveOutSpeed * 1000;
    const tweenHandleMoveIn = this._tweenHandleMoveIn = new TWEEN.Tween(handle.position)
      .to({ z: 0 }, time)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();

    tweenHandleMoveIn.onComplete(() => {
      this._handleState = HANDLE_STATE.Idle;
      this._updateTableState();
    });
  }

  _updateTableState() {
    this._currentTableState = this._previousTableState === TABLE_STATE.SittingMode ? TABLE_STATE.StandingMode : TABLE_STATE.SittingMode;
    this._previousTableState = this._currentTableState;
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

  _init() {
    this.add(this._tableGroup);

    const tableParts = this._tableParts = this._getTableParts(this._tableGroup);
    this._addMaterials(tableParts);

    const topPartsGroup = this._topPartsGroup = this._createTopPartsGroup(tableParts);
    this.add(topPartsGroup);

    this._tableGroup.scale.set(this._tableScale, this._tableScale, this._tableScale);
    topPartsGroup.scale.set(this._tableScale, this._tableScale, this._tableScale);
  }

  _createTopPartsGroup(tableParts) {
    const topPartsGroup = new THREE.Group();
    topPartsGroup.add(tableParts[TABLE_PART_NAME.Tabletop], tableParts[TABLE_PART_NAME.TopPart], tableParts[TABLE_PART_NAME.Handle]);

    return topPartsGroup;
  }

  _getTableParts(table) {
    const tableParts = {};

    for (const partName in TABLE_PART_NAME) {
      const part = table.children.find(child => child.name === TABLE_PART_NAME[partName]);
      tableParts[TABLE_PART_NAME[partName]] = part;

      part.userData['objectType'] = this._objectType;
      this._allMeshes.push(part);
    }

    return tableParts;
  }

  _addMaterials(tableParts) {
    for (const partName in tableParts) {
      const part = tableParts[partName];
      const material = new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff,
      });

      part.material = material;
    }
  }
}

const TABLE_PART_NAME = {
  Tabletop: 'tabletop',
  TopPart: 'top-part',
  Handle: 'handle',
  Legs: 'legs',
}

const TABLE_STATE = {
  SittingMode: 'SITTING_MODE',
  StandingMode: 'STANDING_MODE',
  Moving: 'MOVING',
}

const HANDLE_STATE = {
  Idle: 'IDLE',
  MovingOut: 'MOVING_OUT',
  MovingIn: 'MOVING_IN',
  Rotating: 'ROTATING',
}
