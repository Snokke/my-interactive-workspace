import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { MOUSE_PART_CONFIG, MOUSE_PART_TYPE } from './mouse-data';
import MouseDebug from './mouse-debug';
import MOUSE_CONFIG from './mouse-config';

export default class Mouse extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._mouseDebug = null;
    this._minAreaVector = null;
    this._maxAreaVector = null;

    this._plane = new THREE.Plane();
    this._pNormal = new THREE.Vector3(0, 1, 0);
    this._shift = new THREE.Vector3();
    this._currentPosition = new THREE.Vector3();
    this._previousPosition = new THREE.Vector3();

    this._isDragging = false;

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

    this._previousPosition.copy(this._currentPosition);
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._mouseDebug.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = 600;

      const body = this._parts[MOUSE_PART_TYPE.Body];

      // new TWEEN.Tween(stand.position)
      //   .to({ y: stand.userData.startPosition.y }, fallDownTime)
      //   .easing(TWEEN.Easing.Sinusoidal.Out)
      //   .start();

      // new TWEEN.Tween(tube.position)
      //   .to({ y: tube.userData.startPosition.y }, fallDownTime)
      //   .easing(TWEEN.Easing.Sinusoidal.Out)
      //   .delay(250)
      //   .start();

      // new TWEEN.Tween(lamp.position)
      //   .to({ y: lamp.userData.startPosition.y }, fallDownTime)
      //   .easing(TWEEN.Easing.Sinusoidal.Out)
      //   .delay(500)
      //   .start()
      //   .onComplete(() => {
      //     this._chairDebug.enable();
      //     this._onShowAnimationComplete();
      //   });
    });
  }

  onClick(roomObject) {
    if (!this._isInputEnabled) {
      return;
    }

  }

  onPointerDown(intersect) {
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

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  _setPositionForShowAnimation() {
    const startPositionY = 13;

    for (let key in this._parts) {
      const part = this._parts[key];
      part.position.y = part.userData.startPosition.y + startPositionY;
    }
  }

  _updatePosition() {
    MOUSE_CONFIG.position.x = this._currentPosition.x / MOUSE_CONFIG.movingArea.width * 2;
    MOUSE_CONFIG.position.y = this._currentPosition.z / MOUSE_CONFIG.movingArea.height * 2;
    this._mouseDebug.updatePosition();
  }

  _init() {
    this._initParts(MOUSE_PART_TYPE, MOUSE_PART_CONFIG);
    this._addMaterials();
    this._addPartsToScene();
    this._calculateMovingArea();
    this._initDebug();
  }

  _addPartsToScene() {
    for (let key in this._parts) {
      const part = this._parts[key];

      this.add(part);
    }
  }

  _calculateMovingArea() {
    const body = this._parts[MOUSE_PART_TYPE.Body];

    const startPosition = new THREE.Vector2(body.userData.startPosition.x, body.userData.startPosition.z);
    const halfWidth = MOUSE_CONFIG.movingArea.width * 0.5;
    const halfHeight = MOUSE_CONFIG.movingArea.height * 0.5;

    this._minAreaVector = new THREE.Vector3(startPosition.x - halfWidth, body.position.y, startPosition.y - halfHeight);
    this._maxAreaVector = new THREE.Vector3(startPosition.x + halfWidth, body.position.y, startPosition.y + halfHeight);
  }

  _initDebug() {
    const body = this._parts[MOUSE_PART_TYPE.Body];
    const mouseDebug = this._mouseDebug = new MouseDebug(body);
    this.add(mouseDebug);

    mouseDebug.events.on('onPositionChanged', (msg, position) => {
      this._currentPosition.x = position.x * MOUSE_CONFIG.movingArea.width * 0.5;
      this._currentPosition.z = position.y * MOUSE_CONFIG.movingArea.height * 0.5;
    });

    mouseDebug.events.on('onAreaChanged', () => {
      this._calculateMovingArea();

      this._currentPosition.x = 0;
      this._currentPosition.z = 0;

      this._updatePosition();
    });
  }
}
