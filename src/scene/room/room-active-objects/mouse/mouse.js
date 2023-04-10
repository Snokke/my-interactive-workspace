import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { MOUSE_HELP_ARROW_TYPE, MOUSE_PART_TYPE } from './mouse-data';
import { MOUSE_CONFIG } from './mouse-config';
import { ROOM_CONFIG } from '../../data/room-config';
import { Vector2 } from 'three';

export default class Mouse extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._minAreaVector = null;
    this._maxAreaVector = null;
    this._arrowsGroup = null;

    this._plane = new THREE.Plane();
    this._pNormal = new THREE.Vector3(0, 1, 0);
    this._shift = new THREE.Vector3();
    this._currentPosition = new THREE.Vector3();
    this._previousPosition = new THREE.Vector3();

    this._init();
  }

  update(dt) {
    if (this._currentPosition.equals(this._previousPosition)) {
      return;
    }

    const body = this._parts[MOUSE_PART_TYPE.Body];

    const newPosition = new THREE.Vector3()
      .copy(body.userData.startPosition)
      .add(this._currentPosition);
    body.position.copy(newPosition);

    this._arrowsGroup.position.copy(body.position);
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

    const pIntersect = new THREE.Vector3().copy(intersect.point);
    this._plane.setFromNormalAndCoplanarPoint(this._pNormal, pIntersect);
    this._shift.subVectors(intersect.object.position, intersect.point);
  }

  onPointerMove(raycaster) {
    const planeIntersect = new THREE.Vector3();

    raycaster.ray.intersectPlane(this._plane, planeIntersect);
    const body = this._parts[MOUSE_PART_TYPE.Body];

    this._currentPosition.addVectors(planeIntersect, this._shift);
    this._currentPosition.clamp(this._minAreaVector, this._maxAreaVector);
    this._currentPosition.sub(body.userData.startPosition);

    this._updatePosition();
  }

  getCurrentPosition() {
    return new Vector2(this._currentPosition.x, this._currentPosition.z);
  }

  onPointerOver() {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    this._arrowsGroup.visible = true;

    if (this._arrowsTween) {
      this._arrowsTween.stop();
    }

    this._arrowsGroup.scale.set(0, 0, 0);
    this._arrowsTween = new TWEEN.Tween(this._arrowsGroup.scale)
      .to({ x: 1, y: 1, z: 1 }, 200)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    if (this._arrowsTween) {
      this._arrowsTween.stop();
    }

    this._arrowsTween = new TWEEN.Tween(this._arrowsGroup.scale)
      .to({ x: 0, y: 0, z: 0 }, 200)
      .easing(TWEEN.Easing.Back.In)
      .start()
      .onComplete(() => {
        this._arrowsGroup.visible = false;
      });
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
    this._initArrows();
    this._initDebugMenu();
    this._initSignals();
  }

  _calculateMovingArea() {
    const body = this._parts[MOUSE_PART_TYPE.Body];

    const startPosition = new THREE.Vector2(body.userData.startPosition.x, body.userData.startPosition.z);
    const halfWidth = MOUSE_CONFIG.movingArea.width * 0.5;
    const halfHeight = MOUSE_CONFIG.movingArea.height * 0.5;

    this._minAreaVector = new THREE.Vector3(startPosition.x - halfWidth, body.position.y, startPosition.y - halfHeight);
    this._maxAreaVector = new THREE.Vector3(startPosition.x + halfWidth, body.position.y, startPosition.y + halfHeight);
  }

  _initArrows() {
    const arrowsGroup = this._arrowsGroup = new THREE.Group();
    this.add(arrowsGroup);

    const frontArrow = this._createArrow(MOUSE_HELP_ARROW_TYPE.Front);
    const backArrow = this._createArrow(MOUSE_HELP_ARROW_TYPE.Right);

    arrowsGroup.add(frontArrow, backArrow);
    arrowsGroup.position.copy(this._parts[MOUSE_PART_TYPE.Body].position.clone());
    arrowsGroup.visible = false;
  }

  _createArrow(type) {
    const arrow = new THREE.ArrowHelper(
      MOUSE_CONFIG.helpArrows[type].direction,
      MOUSE_CONFIG.helpArrows[type].offset,
      MOUSE_CONFIG.helpArrows[type].length,
      MOUSE_CONFIG.helpArrows[type].color,
    );

    return arrow;
  }

  _initDebugMenu() {
    super._initDebugMenu();

    const startPosition = this._parts[MOUSE_PART_TYPE.Body].userData.startPosition;
    this._debugMenu.initMovingAreaDebugPlane(startPosition);
  }

  _initSignals() {
    this._debugMenu.events.on('onPositionChanged', (msg, position) => this._onDebugPositionChanged(position));
    this._debugMenu.events.on('onAreaChanged', () => this._onDebugAreaChanged());
  }

  _onDebugPositionChanged(position) {
    this._currentPosition.x = position.x * MOUSE_CONFIG.movingArea.width * 0.5;
    this._currentPosition.z = position.y * MOUSE_CONFIG.movingArea.height * 0.5;
  }

  _onDebugAreaChanged() {
    this._calculateMovingArea();

    this._currentPosition.x = 0;
    this._currentPosition.z = 0;

    this._updatePosition();
  }
}