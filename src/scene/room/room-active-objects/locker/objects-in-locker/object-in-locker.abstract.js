import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { MessageDispatcher } from 'black-engine';

export default class ObjectInLockerAbstract {
  constructor(view, caseType) {

    this.events = new MessageDispatcher();

    this._view = view;
    this._caseType = caseType;

    this._isShown = false;
    this._objectLastTransform = {};

    this._objectMoveTime = 250;

    this._initTransform();
  }

  onFocus() {
    this._isShown = true;
    this._updateMaterialOnFocus();
    this._objectLastTransform.position.copy(this._view.position);
    this._objectLastTransform.rotation.copy(this._view.rotation);

    this.setViewInactive();
    this._view.userData.hideOutline = true;
  }

  moveToStartPosition() {
    this._updateMaterialOnFocus();

    this._view.userData.isActive = false;

    const endPosition = this._objectLastTransform.position;
    const endRotation = this._objectLastTransform.rotation;

    new TWEEN.Tween(this._view.position)
      .to({ x: endPosition.x, y: endPosition.y, z: endPosition.z }, this._objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start()
      .onComplete(() => {
        this._view.userData.isActive = true;
        this.events.post('onObjectStopMoving');
      });

    new TWEEN.Tween(this._view.rotation)
      .to({ x: endRotation.x, y: endRotation.y, z: endRotation.z }, this._objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();
  }

  onLightPercentChange(lightPercent) { } // eslint-disable-line

  onFocusHide() {
    this._isShown = false;
    this._view.userData.hideOutline = false;
  }

  isShown() {
    return this._isShown;
  }

  getView() {
    return this._view;
  }

  getCaseId() {
    return parseInt(this._caseType.split('case')[1]);
  }

  setViewActive() {
    this._view.userData.isActive = true;
  }

  setViewInactive() {
    this._view.userData.isActive = false;
  }

  showView() {
    this._view.visible = true;
  }

  hideView() {
    this._view.visible = false;
  }

  setStartOffsetZ(offsetZ) {
    this._startOffsetZ = offsetZ;
  }

  getStartOffsetZ() {
    return this._startOffsetZ;
  }

  _updateMaterialOnFocus() { }

  _initTransform() {
    this._objectLastTransform = {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
    };

    this._view.visible = false;
  }
}
