import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { MOUSE_PART_TYPE } from './mouse-data';
import MouseDebugMenu from './mouse-debug-menu';
import MOUSE_CONFIG from './mouse-config';
import { ROOM_CONFIG } from '../../room-config';

export default class Mouse extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._minAreaVector = null;
    this._maxAreaVector = null;

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

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  _setPositionForShowAnimation() {
    for (let key in this._parts) {
      const part = this._parts[key];
      part.position.y = part.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;
    }
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
    this._initDebug();
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
    const debugMenu = this._debugMenu = new MouseDebugMenu(body);
    this.add(debugMenu);

    debugMenu.events.on('onPositionChanged', (msg, position) => this._onDebugPositionChanged(position));
    debugMenu.events.on('onAreaChanged', () => this._onDebugAreaChanged());
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
