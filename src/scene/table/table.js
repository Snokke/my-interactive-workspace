import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { OBJECT_TYPE } from '../scene3d';
import { TABLE_HANDLE_STATE, TABLE_PART_NAME, TABLE_STATE } from './table-data';
import TableDebug from './table-debug';
import TABLE_CONFIG from './table-config';

export default class Table extends THREE.Group {
  constructor(tableGroup) {
    super();

    this._tableGroup = tableGroup;
    this._objectType = OBJECT_TYPE.Table;

    this._handleState = { value: TABLE_HANDLE_STATE.Idle };
    this._currentTableState = { value: TABLE_STATE.SittingMode };
    this._previousTableState = this._currentTableState.value;

    this._tableDebug = null;
    this._parts = null;
    this._topPartsGroup = null;

    this._tweenHandleMoveOut = null;
    this._tweenHandleMoveIn = null;
    this._tweenHandleRotation = null;

    this._previousHandleAngle = 0;
    this._allMeshes = [];

    this._init();
  }

  show() {

  }

  changeState() {
    const handle = this._parts[TABLE_PART_NAME.Handle];

    if (this._currentTableState.value === TABLE_STATE.Moving) {
      this._changeDirection(handle);

      return;
    }

    this._setTableState(TABLE_STATE.Moving);
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
    const time = (positionZ - handle.position.z) / TABLE_CONFIG.handleMoveOutSpeed * 1000;

    const tweenHandleMoveOut = this._tweenHandleMoveOut = new TWEEN.Tween(handle.position)
      .to({ z: positionZ }, time)
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

    const time = handle.position.z / TABLE_CONFIG.handleMoveOutSpeed * 1000;
    const tweenHandleMoveIn = this._tweenHandleMoveIn = new TWEEN.Tween(handle.position)
      .to({ z: 0 }, time)
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

  _init() {
    this.add(this._tableGroup);

    const parts = this._parts = this._getParts(this._tableGroup);
    this._addMaterials(parts);

    const topPartsGroup = this._topPartsGroup = this._createTopPartsGroup(parts);
    this.add(topPartsGroup);

    this._initDebug();
  }

  _createTopPartsGroup(tableParts) {
    const topPartsGroup = new THREE.Group();
    topPartsGroup.add(tableParts[TABLE_PART_NAME.Tabletop], tableParts[TABLE_PART_NAME.TopPart], tableParts[TABLE_PART_NAME.Handle]);

    return topPartsGroup;
  }

  _getParts(table) {
    const parts = {};

    for (const partName in TABLE_PART_NAME) {
      const part = table.children.find(child => child.name === TABLE_PART_NAME[partName]);
      parts[TABLE_PART_NAME[partName]] = part;

      part.userData['objectType'] = this._objectType;
      this._allMeshes.push(part);
    }

    return parts;
  }

  _addMaterials(parts) {
    for (const partName in parts) {
      const part = parts[partName];
      const material = new THREE.MeshLambertMaterial({
        color: `hsl(${Math.random() * 360}, 80%, 50%)`,
      });

      part.material = material;
    }
  }

  _initDebug() {
    const tableDebug = this._tableDebug = new TableDebug(this._currentTableState);

    tableDebug.events.on('changeState', () => this.changeState());
  }
}
