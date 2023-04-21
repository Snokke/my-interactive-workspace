import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { MOUSE_PART_TYPE } from './mouse-data';
import { MOUSE_CONFIG } from './mouse-config';
import { ROOM_CONFIG } from '../../data/room-config';
import { Vector2 } from 'three';
import MouseAreaBorders from './mouse-area-borders';
import HelpArrows from '../../shared-objects/help-arrows/help-arrows';
import { HELP_ARROW_TYPE } from '../../shared-objects/help-arrows/help-arrows-config';

export default class Mouse extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._minAreaVector = null;
    this._maxAreaVector = null;
    this._mouseAreaBorders = null;
    this._helpArrows = null;

    this._plane = new THREE.Plane();
    this._pNormal = new THREE.Vector3(0, 1, 0);
    this._shift = new THREE.Vector3();
    this._currentPosition = new THREE.Vector3();
    this._previousPosition = new THREE.Vector3();

    this._isMouseClick = false;

    this._init();
  }

  update(dt) {
    if (this._currentPosition.equals(this._previousPosition)) {
      return;
    }

    const body = this._parts[MOUSE_PART_TYPE.Body];
    const leftKey = this._parts[MOUSE_PART_TYPE.LeftKey];

    const newPosition = new THREE.Vector3()
      .copy(body.userData.startPosition)
      .add(this._currentPosition);
    body.position.copy(newPosition);
    leftKey.position.copy(newPosition).add(this._leftKeyPositionOffset);

    this._helpArrows.position.copy(body.position);
    this._previousPosition.copy(this._currentPosition);
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const body = this._parts[MOUSE_PART_TYPE.Body];

      new TWEEN.Tween(body.position)
        .to({ y: body.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
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

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;


    if (partType === MOUSE_PART_TYPE.Body) {
      this._onMouseClick(intersect);
    }

    if (partType === MOUSE_PART_TYPE.LeftKey) {
      this._onLeftKeyClick();
    }
  }

  onPointerMove(raycaster) {
    if (!this._isMouseClick) {
      return;
    }

    const planeIntersect = new THREE.Vector3();

    raycaster.ray.intersectPlane(this._plane, planeIntersect);
    const body = this._parts[MOUSE_PART_TYPE.Body];

    this._currentPosition.addVectors(planeIntersect, this._shift);
    this._currentPosition.clamp(this._minAreaVector, this._maxAreaVector);
    this._currentPosition.sub(body.userData.startPosition);

    this._updatePosition();
  }

  getMeshesForOutline(mesh) {
    const partType = mesh.userData.partType;

    if (partType === MOUSE_PART_TYPE.Body) {
      return this._activeMeshes;
    }

    if (partType === MOUSE_PART_TYPE.LeftKey) {
      return [mesh];
    }
  }

  getCurrentPosition() {
    return new Vector2(this._currentPosition.x, this._currentPosition.z);
  }

  onPointerOver(intersect) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const partType = intersect.object.userData.partType;

    if (partType === MOUSE_PART_TYPE.Body) {
      this._helpArrows.show();
    }
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    this._helpArrows.hide();
  }

  _onMouseClick(intersect) {
    this._isMouseClick = true;
    const pIntersect = new THREE.Vector3().copy(intersect.point);
    this._plane.setFromNormalAndCoplanarPoint(this._pNormal, pIntersect);
    this._shift.subVectors(intersect.object.position, intersect.point);
  }

  _onLeftKeyClick() {
    this._isMouseClick = false;
    this.events.post('onLeftKeyClick');
  }

  _updatePosition() {
    MOUSE_CONFIG.position.x = this._currentPosition.x / MOUSE_CONFIG.movingArea.width * 2;
    MOUSE_CONFIG.position.y = this._currentPosition.z / MOUSE_CONFIG.movingArea.height * 2;

    this._debugMenu.updatePosition();
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._calculateMovingArea();
    this._initHelpArrows();
    this._initMouseAreaBorders();
    this._initDebugMenu();
    this._initSignals();
  }

  _addPartsToScene() {
    const body = this._parts[MOUSE_PART_TYPE.Body];
    const leftKey = this._parts[MOUSE_PART_TYPE.LeftKey];
    this.add(body, leftKey);

    this._leftKeyPositionOffset = leftKey.position.clone().sub(body.position);
  }

  _calculateMovingArea() {
    const body = this._parts[MOUSE_PART_TYPE.Body];

    const startPosition = new THREE.Vector2(body.userData.startPosition.x, body.userData.startPosition.z);
    const halfWidth = MOUSE_CONFIG.movingArea.width * 0.5;
    const halfHeight = MOUSE_CONFIG.movingArea.height * 0.5;

    this._minAreaVector = new THREE.Vector3(startPosition.x - halfWidth, body.position.y, startPosition.y - halfHeight);
    this._maxAreaVector = new THREE.Vector3(startPosition.x + halfWidth, body.position.y, startPosition.y + halfHeight);
  }

  _initHelpArrows() {
    const helpArrowsTypes = [HELP_ARROW_TYPE.MouseFront, HELP_ARROW_TYPE.MouseRight];
    const helpArrows = this._helpArrows = new HelpArrows(helpArrowsTypes);
    this.add(helpArrows);

    helpArrows.position.copy(this._parts[MOUSE_PART_TYPE.Body].position.clone());
  }

  _initMouseAreaBorders() {
    const body = this._parts[MOUSE_PART_TYPE.Body];
    const mouseAreaBorders = this._mouseAreaBorders = new MouseAreaBorders(body.position);
    this.add(mouseAreaBorders)
  }

  _initDebugMenu() {
    super._initDebugMenu();

    const startPosition = this._parts[MOUSE_PART_TYPE.Body].userData.startPosition;
    this._debugMenu.initMovingAreaDebugPlane(startPosition);
  }

  _initSignals() {
    this._debugMenu.events.on('onPositionChanged', (msg, position) => this._onDebugPositionChanged(position));
    this._debugMenu.events.on('onAreaChanged', () => this._onDebugAreaChanged());
    this._debugMenu.events.on('onDistanceToShowBorderChanged', () => this._onDistanceToShowBorderChanged());
    this._debugMenu.events.on('onBorderColorUpdated', () => this._onBorderColorUpdated());
    this._debugMenu.events.on('onCursorScaleChanged', () => this._onCursorScaleChanged());
    this._debugMenu.events.on('onLeftKeyClick', () => this._onLeftKeyClick());
  }

  _onDebugPositionChanged(position) {
    this._currentPosition.x = position.x * MOUSE_CONFIG.movingArea.width * 0.5;
    this._currentPosition.z = position.y * MOUSE_CONFIG.movingArea.height * 0.5;

    this._mouseAreaBorders.updateMousePosition(this._currentPosition);
  }

  _onDebugAreaChanged() {
    this._calculateMovingArea();

    this._currentPosition.x = 0;
    this._currentPosition.z = 0;

    this._updatePosition();
    this._mouseAreaBorders.onAreaChanged();

    this.events.post('onAreaChanged');
  }

  _onDistanceToShowBorderChanged() {
    this._mouseAreaBorders.updateMousePosition(this._currentPosition);
  }

  _onBorderColorUpdated() {
    this._mouseAreaBorders.onBorderColorUpdated();
  }

  _onCursorScaleChanged() {
    this.events.post('onCursorScaleChanged');
  }
}
