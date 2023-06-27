import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { BORDER_TYPE, CHAIR_BOUNDING_BOX_TYPE, CHAIR_MOVEMENT_STATE, CHAIR_PART_TYPE, CHAIR_ROTATION_STATE, LEGS_PARTS, MOVING_AREA_TYPE, SEAT_ROTATION_DIRECTION } from './data/chair-data';
import { CHAIR_CONFIG } from './data/chair-config';
import Loader from '../../../../core/loader';
import SoundHelper from '../../shared-objects/sound-helper';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import ChairMovingAreaHelper from './helpers/chair-moving-area-helper';
import { checkBottomBorderBounce, checkLeftBorderBounce, checkRightBorderBounce, checkTopBorderBounce, getChairBoundingBox, getMovingArea, getWheelsParts } from './helpers/chair-helpers';
import HelpArrows from '../../shared-objects/help-arrows/help-arrows';
import { HELP_ARROW_TYPE } from '../../shared-objects/help-arrows/help-arrows-config';
import { isVectorXZEqual, randomBetween } from '../../shared-objects/helpers';
import ChairSeatHelper from './helpers/chair-seat-helper';
import { Black } from 'black-engine';
import Materials from '../../../../core/materials';
import SCENE_CONFIG from '../../../../core/configs/scene-config';
// import Materials from '../../../../core/materials';

export default class Chair extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._rotateSeatTween = null;
    this._legsGroup = null;
    this._sound = null;
    this._soundHelper = null;
    this._wrapper = null;
    this._chairMovingAreaHelper = null;
    this._helpArrows = null;
    this._chairSeatHelper = null;

    this._plane = new THREE.Plane();
    this._pNormal = new THREE.Vector3(0, 1, 0);
    this._shift = new THREE.Vector3();
    this._previousWrapperPosition = new THREE.Vector3();
    this._currentPosition = new THREE.Vector3();
    this._startPosition = new THREE.Vector3();
    this._availableSeatAngle = Math.PI * 2;
    this._previousAvailableSeatAngle = Math.PI * 2;
    this._currentVolume = 1;

    this._lockerIntersect = { [CHAIR_BOUNDING_BOX_TYPE.Main]: false, [CHAIR_BOUNDING_BOX_TYPE.FrontWheel]: false};
    this._isDragActive = false;
    this._autoMoving = false;
    this._bounceDisable = {};
    this._chairMovementPreviousState = CHAIR_MOVEMENT_STATE.Idle;
    this._chairRotationState = CHAIR_ROTATION_STATE.Idle;
    this._chairPreviousRotationState = CHAIR_ROTATION_STATE.Idle;

    this._init();
  }

  update(dt) {
    this._checkIsChairMoving();
    this._updateChairMovement(dt);
    this._updateWheelsRotation(dt);
    this._updateSeatRotation(dt);
  }

  onClick(intersect, onPointerDownClick) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;
    let isObjectDraggable = false;

    if (onPointerDownClick === false && partType === CHAIR_PART_TYPE.Seat) {
      this._rotateSeat();
    }

    if (partType === CHAIR_PART_TYPE.Legs) {
      isObjectDraggable = true;
      this._autoMoving = false;
      this._dragChair(intersect);
      Black.engine.containerElement.style.cursor = 'grabbing';

      if (SCENE_CONFIG.isMobile) {
        this._helpArrows.show();
      }
    }

    return isObjectDraggable;
  }

  onAllObjectsInteraction() {
    if (CHAIR_CONFIG.seatRotation.speed < 5) {
      const randomRotateCount = Math.round(randomBetween(1, 2));

      for (let i = 0; i < randomRotateCount; i++) {
        this._rotateSeat();
      }
    }

    const movingAreaConfig = CHAIR_CONFIG.chairMoving.movingArea[MOVING_AREA_TYPE.Main];

    const leftX = movingAreaConfig.center.x - movingAreaConfig.size.x * 0.5;
    const rightX = movingAreaConfig.center.x + movingAreaConfig.size.x * 0.5;
    const topZ = movingAreaConfig.center.y + movingAreaConfig.size.y * 0.5;
    const bottomZ = movingAreaConfig.center.y - movingAreaConfig.size.y * 0.5;

    const randomX = randomBetween(leftX, rightX);
    const randomZ = randomBetween(bottomZ, topZ);

    const position = new THREE.Vector3(randomX, 0, randomZ);

    this._moveChairToPosition(position);
  }

  onPointerMove(raycaster) {
    const planeIntersect = new THREE.Vector3();

    raycaster.ray.intersectPlane(this._plane, planeIntersect);
    this._currentPosition.addVectors(planeIntersect, this._shift);

    if (this._currentPosition.y !== 0) {
      this._currentPosition.y = 0;
    }
  }

  onPointerUp() {
    this._isDragActive = false;
    Black.engine.containerElement.style.cursor = 'grab';

    this._checkToBounce();

    if (SCENE_CONFIG.isMobile) {
      this._helpArrows.hide();
    }
  }

  getMeshesForOutline(mesh) {
    if (mesh.userData.partType === CHAIR_PART_TYPE.Seat) {
      return [this._parts[CHAIR_PART_TYPE.Seat]];
    }

    const legsParts = this._getLegsParts();

    return [...legsParts];
  }

  moveToStartPosition() {
    this._moveChairToPosition(this._startPosition);
    this._rotateSeatForward();
  }

  onPointerOver(intersect) {
    if (this._isPointerOver || SCENE_CONFIG.isMobile) {
      return;
    }

    super.onPointerOver();

    const partType = intersect.object.userData.partType;

    if (LEGS_PARTS.includes(partType)) {
      this._helpArrows.show();
      Black.engine.containerElement.style.cursor = 'grab';
    }
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    this._helpArrows.hide();
  }

  onVolumeChanged(volume) {
    this._globalVolume = volume;

    if (this._sound && this._isSoundsEnabled) {
      this._sound.setVolume(this._globalVolume * this._objectVolume * this._currentVolume);
    }
  }

  enableSound() {
    this._isSoundsEnabled = true;

    if (this._sound) {
      this._sound.setVolume(this._globalVolume * this._objectVolume * this._currentVolume);
    }
  }

  _rotateSeat() {
    this._stopTweens();

    if (CHAIR_CONFIG.seatRotation.speed === 0) {
      this._changeRotationDirection();
    }

    CHAIR_CONFIG.seatRotation.speed += CHAIR_CONFIG.seatRotation.impulse;

    if (CHAIR_CONFIG.seatRotation.speed > CHAIR_CONFIG.seatRotation.maxSpeed) {
      CHAIR_CONFIG.seatRotation.speed = CHAIR_CONFIG.seatRotation.maxSpeed;
    }
  }

  _dragChair(intersect) {
    this._isDragActive = true;
    const pIntersect = new THREE.Vector3().copy(intersect.point);
    this._plane.setFromNormalAndCoplanarPoint(this._pNormal, pIntersect);
    this._shift.subVectors(this._wrapper.position, intersect.point);
  }

  _checkIsChairMoving() {
    this._chairMovementPreviousState = CHAIR_CONFIG.chairMoving.movementState;

    if (this._autoMoving) {
      CHAIR_CONFIG.chairMoving.movementState = CHAIR_MOVEMENT_STATE.Moving;

      if (this._chairMovementPreviousState !== CHAIR_CONFIG.chairMoving.movementState) {
        this._onChairMovementStateChanged();
      }

      return;
    }

    if (!this._isDragActive && isVectorXZEqual(this._wrapper.position, this._previousWrapperPosition)) {
      CHAIR_CONFIG.chairMoving.movementState = CHAIR_MOVEMENT_STATE.Idle;

      if (this._sound.isPlaying) {
        this._stopSound();
      }
    } else {
      CHAIR_CONFIG.chairMoving.movementState = CHAIR_MOVEMENT_STATE.Moving;
    }

    this._debugMenu.updateChairMovementState();

    if (this._chairMovementPreviousState !== CHAIR_CONFIG.chairMoving.movementState) {
      this._onChairMovementStateChanged();
    }
  }

  _updateChairMovement(dt) {
    if (CHAIR_CONFIG.chairMoving.movementState === CHAIR_MOVEMENT_STATE.Idle) {
      return;
    }

    this._previousWrapperPosition.copy(this._wrapper.position);
    this._wrapper.position.lerp(this._currentPosition, CHAIR_CONFIG.chairMoving.lerpSpeed * 0.1 * (dt * 60));

    this._checkLeftEdge();
    this._checkRightEdge();
    this._checkTopEdge();
    this._checkBottomEdge();

    const distance = this._previousWrapperPosition.distanceTo(this._wrapper.position);
    this._updateSound(distance);

    this._updateHelpArrowsPosition();
    this._updateHelpersPosition();
    this._updateAvailableSeatRotationAngle();
  }

  _onChairMovementStateChanged() {
    if (CHAIR_CONFIG.chairMoving.movementState === CHAIR_MOVEMENT_STATE.Moving) {
      this.events.post('onChairMoving');
    }

    if (CHAIR_CONFIG.chairMoving.movementState === CHAIR_MOVEMENT_STATE.Idle) {
      this.events.post('onChairStopMoving');
    }
  }

  _onChairRotationSpeedChange() {
    if (this._chairRotationState === CHAIR_ROTATION_STATE.Rotating) {
      this.events.post('onChairRotation');
    }

    if (this._chairRotationState === CHAIR_ROTATION_STATE.Idle) {
      this.events.post('onChairStopRotation');
    }
  }

  _checkLeftEdge() {
    const chairMainBoundingBox = getChairBoundingBox(CHAIR_BOUNDING_BOX_TYPE.Main);
    const mainMovingArea = getMovingArea(MOVING_AREA_TYPE.Main);
    const underTableMovingArea = getMovingArea(MOVING_AREA_TYPE.UnderTable);
    const epsilon = CHAIR_CONFIG.chairMoving.borderEpsilon;
    const wrapperPosition = this._wrapper.position;

    if (wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Left] < mainMovingArea[BORDER_TYPE.Left]) {
      wrapperPosition.x = mainMovingArea[BORDER_TYPE.Left] + chairMainBoundingBox[BORDER_TYPE.Left];

      if (!this._isDragActive && !this._bounceDisable[BORDER_TYPE.Left]) {
        const delta = Math.abs(this._currentPosition.x - chairMainBoundingBox[BORDER_TYPE.Left]) + mainMovingArea[BORDER_TYPE.Left];
        this._currentPosition.x += delta * CHAIR_CONFIG.chairMoving.bouncingCoefficient;
      }
    }

    if (wrapperPosition.z - chairMainBoundingBox[BORDER_TYPE.Top] + epsilon < mainMovingArea[BORDER_TYPE.Top]) {
      if (wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Left] < underTableMovingArea[BORDER_TYPE.Left]) {
        wrapperPosition.x = underTableMovingArea[BORDER_TYPE.Left] + chairMainBoundingBox[BORDER_TYPE.Left];

        if (!this._isDragActive && !this._bounceDisable[BORDER_TYPE.Left]) {
          const delta = Math.abs(this._currentPosition.x - chairMainBoundingBox[BORDER_TYPE.Left]) + underTableMovingArea[BORDER_TYPE.Left];
          this._currentPosition.x += delta * CHAIR_CONFIG.chairMoving.bouncingCoefficient;
        }
      }
    }
  }

  _checkRightEdge() {
    const chairMainBoundingBox = getChairBoundingBox(CHAIR_BOUNDING_BOX_TYPE.Main);
    const chairFrontWheelBoundingBox = getChairBoundingBox(CHAIR_BOUNDING_BOX_TYPE.FrontWheel);
    const mainMovingArea = getMovingArea(MOVING_AREA_TYPE.Main);
    const underTableMovingArea = getMovingArea(MOVING_AREA_TYPE.UnderTable);
    const epsilon = CHAIR_CONFIG.chairMoving.borderEpsilon;
    const wrapperPosition = this._wrapper.position;

    if (wrapperPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] + epsilon > mainMovingArea[BORDER_TYPE.Top]) {
      if (wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Right] > mainMovingArea[BORDER_TYPE.Right]) {
        wrapperPosition.x = mainMovingArea[BORDER_TYPE.Right] + chairMainBoundingBox[BORDER_TYPE.Right];

        if (!this._isDragActive && !this._bounceDisable[BORDER_TYPE.Right]) {
          const delta = Math.abs(this._currentPosition.x - chairMainBoundingBox[BORDER_TYPE.Right]) - mainMovingArea[BORDER_TYPE.Right];
          this._currentPosition.x -= delta * CHAIR_CONFIG.chairMoving.bouncingCoefficient;
        }
      }
    }

    if (wrapperPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] + epsilon < mainMovingArea[BORDER_TYPE.Top]) {
      if (wrapperPosition.x - chairFrontWheelBoundingBox[BORDER_TYPE.Right] > underTableMovingArea[BORDER_TYPE.Right]) {
        wrapperPosition.x = underTableMovingArea[BORDER_TYPE.Right] + chairFrontWheelBoundingBox[BORDER_TYPE.Right];

        if (!this._isDragActive && !this._bounceDisable[BORDER_TYPE.Right]) {
          const delta = Math.abs(this._currentPosition.x - chairFrontWheelBoundingBox[BORDER_TYPE.Right]) - underTableMovingArea[BORDER_TYPE.Right];
          this._currentPosition.x -= delta * CHAIR_CONFIG.chairMoving.bouncingCoefficient;
        }
      }
    }

    if (wrapperPosition.z - chairMainBoundingBox[BORDER_TYPE.Top] + epsilon < mainMovingArea[BORDER_TYPE.Top]) {
      if (wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Right] > underTableMovingArea[BORDER_TYPE.Right]) {
        wrapperPosition.x = underTableMovingArea[BORDER_TYPE.Right] + chairMainBoundingBox[BORDER_TYPE.Right];

        if (!this._isDragActive && !this._bounceDisable[BORDER_TYPE.Right]) {
          const delta = Math.abs(this._currentPosition.x - chairMainBoundingBox[BORDER_TYPE.Right]) - underTableMovingArea[BORDER_TYPE.Right];
          this._currentPosition.x -= delta * CHAIR_CONFIG.chairMoving.bouncingCoefficient;
        }
      }
    }
  }

  _checkTopEdge() {
    const chairMainBoundingBox = getChairBoundingBox(CHAIR_BOUNDING_BOX_TYPE.Main);
    const chairFrontWheelBoundingBox = getChairBoundingBox(CHAIR_BOUNDING_BOX_TYPE.FrontWheel);
    const mainMovingArea = getMovingArea(MOVING_AREA_TYPE.Main);
    const underTableMovingArea = getMovingArea(MOVING_AREA_TYPE.UnderTable);
    const epsilon = CHAIR_CONFIG.chairMoving.borderEpsilon;
    const wrapperPosition = this._wrapper.position;

    // last right and left, top wheel bounding box
    if ((wrapperPosition.x - chairFrontWheelBoundingBox[BORDER_TYPE.Right] - epsilon > underTableMovingArea[BORDER_TYPE.Right])
      || (wrapperPosition.x - chairFrontWheelBoundingBox[BORDER_TYPE.Left] + epsilon < underTableMovingArea[BORDER_TYPE.Left])) {
      if (wrapperPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] < mainMovingArea[BORDER_TYPE.Top]) {
        wrapperPosition.z = mainMovingArea[BORDER_TYPE.Top] + chairFrontWheelBoundingBox[BORDER_TYPE.Top];

        if (!this._isDragActive && !this._bounceDisable[BORDER_TYPE.Top]) {
          const delta = Math.abs(this._currentPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] + mainMovingArea[BORDER_TYPE.Top]);
          this._currentPosition.z += delta * CHAIR_CONFIG.chairMoving.bouncingCoefficient;
        }
      }
    }

    // right and left, top main bounding box
    if ((wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Right] - epsilon > underTableMovingArea[BORDER_TYPE.Right])
      || (wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Left] + epsilon < underTableMovingArea[BORDER_TYPE.Left])) {
      if (wrapperPosition.z - chairMainBoundingBox[BORDER_TYPE.Top] < mainMovingArea[BORDER_TYPE.Top]) {
        wrapperPosition.z = mainMovingArea[BORDER_TYPE.Top] + chairMainBoundingBox[BORDER_TYPE.Top];

        if (!this._isDragActive && !this._bounceDisable[BORDER_TYPE.Top]) {
          const delta = Math.abs(this._currentPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] + mainMovingArea[BORDER_TYPE.Top]);
          this._currentPosition.z += delta * CHAIR_CONFIG.chairMoving.bouncingCoefficient;
        }
      }
    }

    // center, top wheel bounding box
    if ((wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Right] - epsilon < underTableMovingArea[BORDER_TYPE.Right])
      && (wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Left] + epsilon > underTableMovingArea[BORDER_TYPE.Left])) {
      if (wrapperPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] < underTableMovingArea[BORDER_TYPE.Top]) {
        wrapperPosition.z = underTableMovingArea[BORDER_TYPE.Top] + chairFrontWheelBoundingBox[BORDER_TYPE.Top];

        if (!this._isDragActive && !this._bounceDisable[BORDER_TYPE.Top]) {
          const delta = Math.abs(this._currentPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] - underTableMovingArea[BORDER_TYPE.Top]);
          this._currentPosition.z += delta * CHAIR_CONFIG.chairMoving.bouncingCoefficient;
        }
      }
    }
  }

  _checkBottomEdge() {
    const chairMainBoundingBox = getChairBoundingBox(CHAIR_BOUNDING_BOX_TYPE.Main);
    const mainMovingArea = getMovingArea(MOVING_AREA_TYPE.Main);
    const wrapperPosition = this._wrapper.position;

    if (wrapperPosition.z - chairMainBoundingBox[BORDER_TYPE.Bottom] > mainMovingArea[BORDER_TYPE.Bottom]) {
      wrapperPosition.z = mainMovingArea[BORDER_TYPE.Bottom] + chairMainBoundingBox[BORDER_TYPE.Bottom];

      if (!this._isDragActive && !this._bounceDisable[BORDER_TYPE.Bottom]) {
        const delta = Math.abs(this._currentPosition.z - chairMainBoundingBox[BORDER_TYPE.Bottom]) - mainMovingArea[BORDER_TYPE.Bottom];
        this._currentPosition.z -= delta * CHAIR_CONFIG.chairMoving.bouncingCoefficient;
      }
    }
  }

  _updateAvailableSeatRotationAngle() {
    const topEdge = this._wrapper.position.z - CHAIR_CONFIG.seatRotation.rotationRadius;

    if (topEdge < CHAIR_CONFIG.seatRotation.tableEdgeZ) {
      const delta = CHAIR_CONFIG.seatRotation.tableEdgeZ - topEdge;

      const radius = CHAIR_CONFIG.seatRotation.rotationRadius;
      const side = radius - delta;
      this._availableSeatAngle = Math.acos(side / radius) * 2;

      this._checkCurrentSeatAngle();
    } else {
      this._availableSeatAngle = Math.PI * 2;
    }

    if (this._availableSeatAngle !== this._previousAvailableSeatAngle) {
      this._previousAvailableSeatAngle = this._availableSeatAngle;
      this._chairSeatHelper.setAvailableAngle(this._availableSeatAngle);
    }
  }

  _checkCurrentSeatAngle() {
    const seat = this._parts[CHAIR_PART_TYPE.Seat];
    const seatWidthAngle = CHAIR_CONFIG.seatRotation.seatWidthAngle * THREE.MathUtils.DEG2RAD;

    if (seat.rotation.y + seatWidthAngle * 0.5 > (Math.PI * 2 - this._availableSeatAngle) * 0.5 && seat.rotation.y < Math.PI) {
      seat.rotation.y = (Math.PI * 2 - this._availableSeatAngle) * 0.5 - seatWidthAngle * 0.5;
    }

    if (seat.rotation.y - seatWidthAngle * 0.5 < Math.PI + this._availableSeatAngle * 0.5 && seat.rotation.y > Math.PI) {
      seat.rotation.y = Math.PI + this._availableSeatAngle * 0.5 + seatWidthAngle * 0.5;
    }

    this._chairSeatHelper.updateSeatAngle(seat.rotation.y);
  }

  _updateHelpArrowsPosition() {
    this._helpArrows.position.copy(this._wrapper.position);
    this._helpArrows.position.y += 2.1;
  }

  _updateHelpersPosition() {
    if (CHAIR_CONFIG.chairMoving.showMovingArea) {
      this._chairMovingAreaHelper.setChairPosition(this._wrapper.position);
    }

    if (CHAIR_CONFIG.seatRotation.showSeatHelper) {
      this._chairSeatHelper.setChairPosition(this._wrapper.position);
    }
  }

  _checkToBounce() {
    if (CHAIR_CONFIG.chairMoving.bouncingCoefficient === 1) {
      return;
    }

    const chairMainBoundingBox = getChairBoundingBox(CHAIR_BOUNDING_BOX_TYPE.Main);
    const chairFrontWheelBoundingBox = getChairBoundingBox(CHAIR_BOUNDING_BOX_TYPE.FrontWheel);
    const mainMovingArea = getMovingArea(MOVING_AREA_TYPE.Main);
    const underTableMovingArea = getMovingArea(MOVING_AREA_TYPE.UnderTable);

    this._bounceDisable[BORDER_TYPE.Left] = checkLeftBorderBounce(this._wrapper.position, chairMainBoundingBox, chairFrontWheelBoundingBox, mainMovingArea, underTableMovingArea);
    this._bounceDisable[BORDER_TYPE.Right] = checkRightBorderBounce(this._wrapper.position, chairMainBoundingBox, chairFrontWheelBoundingBox, mainMovingArea, underTableMovingArea);
    this._bounceDisable[BORDER_TYPE.Top] = checkTopBorderBounce(this._wrapper.position, chairMainBoundingBox, chairFrontWheelBoundingBox, mainMovingArea, underTableMovingArea);
    this._bounceDisable[BORDER_TYPE.Bottom] = checkBottomBorderBounce(this._wrapper.position, chairMainBoundingBox, mainMovingArea);
  }

  _updateSeatRotation(dt) {
    this._chairPreviousRotationState = this._chairRotationState;

    if (CHAIR_CONFIG.seatRotation.speed === 0) {
      if (this._chairPreviousRotationState !== this._chairRotationState) {
        this._onChairRotationSpeedChange();
      }

      return;
    }

    this._chairPreviousRotationSpeed = CHAIR_CONFIG.seatRotation.speed;

    const seat = this._parts[CHAIR_PART_TYPE.Seat];
    const direction = CHAIR_CONFIG.seatRotation.direction === SEAT_ROTATION_DIRECTION.Clockwise ? -1 : 1;

    seat.rotation.y += direction * CHAIR_CONFIG.seatRotation.speed * dt * 60 * 0.01;

    if (seat.rotation.y > Math.PI * 2) {
      seat.rotation.y -= Math.PI * 2;
    }

    if (seat.rotation.y < 0) {
      seat.rotation.y += Math.PI * 2;
    }

    if (CHAIR_CONFIG.seatRotation.speed > 0) {
      CHAIR_CONFIG.seatRotation.speed -= CHAIR_CONFIG.seatRotation.speedDecrease * CHAIR_CONFIG.seatRotation.speedDecrease * dt * 60 * 0.01;
    } else {
      CHAIR_CONFIG.seatRotation.speed = 0;
    }

    this._updateRotationWithAvailableAngle();
    this._chairSeatHelper.updateSeatAngle(seat.rotation.y);
    this._debugMenu.updateSeatSpeed();

    if (CHAIR_CONFIG.seatRotation.speed !== 0) {
      this._chairRotationState = CHAIR_ROTATION_STATE.Rotating;
    } else {
      this._chairRotationState = CHAIR_ROTATION_STATE.Idle;
    }

    if (this._chairPreviousRotationState !== this._chairRotationState) {
      this._onChairRotationSpeedChange();
    }
  }

  _updateRotationWithAvailableAngle() {
    const seat = this._parts[CHAIR_PART_TYPE.Seat];

    if (this._availableSeatAngle !== Math.PI * 2) {
      const seatWidthAngle = CHAIR_CONFIG.seatRotation.seatWidthAngle * THREE.MathUtils.DEG2RAD;

      if (seat.rotation.y + seatWidthAngle * 0.5 > (Math.PI * 2 - this._availableSeatAngle) * 0.5 && seat.rotation.y < Math.PI) {
        CHAIR_CONFIG.seatRotation.direction = SEAT_ROTATION_DIRECTION.Clockwise;
        CHAIR_CONFIG.seatRotation.speed *= CHAIR_CONFIG.seatRotation.hitDampingCoefficient;
      }

      if (seat.rotation.y - seatWidthAngle * 0.5 < Math.PI + this._availableSeatAngle * 0.5 && seat.rotation.y > Math.PI) {
        CHAIR_CONFIG.seatRotation.direction = SEAT_ROTATION_DIRECTION.CounterClockwise;
        CHAIR_CONFIG.seatRotation.speed *= CHAIR_CONFIG.seatRotation.hitDampingCoefficient;
      }

      this._debugMenu.updateSeatRotationDirection();
    }
  }

  _updateWheelsRotation(dt) {
    if (CHAIR_CONFIG.chairMoving.movementState === CHAIR_MOVEMENT_STATE.Idle) {
      return;
    }

    const targetAngel = Math.atan2(this._currentPosition.x - this._wrapper.position.x, this._currentPosition.z - this._wrapper.position.z);
    const wheels = getWheelsParts(this._parts);

    wheels.forEach(wheel => {
      const errorAngle = wheel.userData.targetAngleError;
      const speed = CHAIR_CONFIG.chairMoving.wheels.rotationSpeed + wheel.userData.speedError;

      const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngel + errorAngle);
      wheel.quaternion.slerp(targetQuaternion, speed * dt * 60 * 0.01);
    });
  }

  _moveChairToPosition(position) {
    this._autoMoving = true;
    this._currentPosition.copy(position);

    Delayed.call(50, () => {
      this._autoMoving = false;
    });
  }

  _rotateSeatForward() {
    const seat = this._parts[CHAIR_PART_TYPE.Seat];
    CHAIR_CONFIG.seatRotation.speed = 0;

    this._stopTweens();

    const rotationY = seat.rotation.y < Math.PI ? 0 : Math.PI * 2;
    CHAIR_CONFIG.seatRotation.direction = seat.rotation.y < Math.PI ? SEAT_ROTATION_DIRECTION.Clockwise : SEAT_ROTATION_DIRECTION.CounterClockwise;
    this._debugMenu.updateSeatRotationDirection();

    this._rotateSeatTween = new TWEEN.Tween(seat.rotation)
      .to({ y: rotationY }, 1000)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .onUpdate(() => {
        this._chairSeatHelper.updateSeatAngle(seat.rotation.y);
      })
      .start();
  }

  _changeRotationDirection() {
    CHAIR_CONFIG.seatRotation.direction = CHAIR_CONFIG.seatRotation.direction === SEAT_ROTATION_DIRECTION.Clockwise
      ? SEAT_ROTATION_DIRECTION.CounterClockwise
      : SEAT_ROTATION_DIRECTION.Clockwise;

    this._debugMenu.updateSeatRotationDirection();
  }

  _resetSeatRotation() {
    CHAIR_CONFIG.seatRotation.speed = 0;
    this._debugMenu.updateSeatSpeed();
  }

  _stopTweens() {
    if (this._rotateSeatTween) {
      this._rotateSeatTween.stop();
    }
  }

  _updateSound(distance) {
    this._currentVolume = THREE.MathUtils.clamp(distance * 2, 0, 1);

    if (this._isSoundsEnabled) {
      this._sound.setVolume(this._globalVolume * this._objectVolume * this._currentVolume);
    }

    if (distance > 0.001 && !this._sound.isPlaying) {
      this._playSound();
    }
  }

  _stopSound() {
    if (this._sound.isPlaying) {
      this._sound.stop();
    }
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._initShadows();
    this._addPartsToScene();
    this._setWheelsRandomData();
    this._initChairMovingAreaHelper();
    this._initChairSeatHelper();
    this._initHelpArrows();
    this._initSounds();
    this._initDebugMenu();
    this._initSignals();
  }

  _addMaterials() {
    const material = Materials.getMaterial(Materials.type.bakedBigObjects);

    for (const partName in this._parts) {
      const part = this._parts[partName];
      part.material = material;
    }
  }

  _initShadows() {
    for (const key in this._parts) {
      const part = this._parts[key];
      part.castShadow = true;
    }
  }

  _addPartsToScene() {
    this._wrapper = new THREE.Group();
    this.add(this._wrapper);

    const seat = this._parts[CHAIR_PART_TYPE.Seat];
    this._wrapper.add(seat);

    seat.position.x = seat.position.z = 0;

    const legs = this._parts[CHAIR_PART_TYPE.Legs];
    const legsPositionZ = legs.position.z;
    const legsPositionX = legs.position.x;

    const legsGroup = this._legsGroup = new THREE.Group();
    this._wrapper.add(legsGroup);

    this._wrapper.position.x = legs.userData.startPosition.x;
    this._wrapper.position.z = legs.userData.startPosition.z;

    this._currentPosition.copy(this._wrapper.position);
    this._startPosition.copy(this._wrapper.position);

    const legsParts = this._getLegsParts();
    legsParts.forEach((part) => {
      part.position.z -= legsPositionZ;
      part.position.x -= legsPositionX;
      legsGroup.add(part);
    });

    legsGroup.position.x = legsGroup.position.z = 0;
  }

  _setWheelsRandomData() {
    const wheels = getWheelsParts(this._parts);

    wheels.forEach(wheel => {
      const sign = Math.random() > 0.5 ? 1 : -1;
      wheel.userData.targetAngleError = sign * Math.random() * CHAIR_CONFIG.chairMoving.wheels.targetAngleMaxError * THREE.MathUtils.DEG2RAD;
      wheel.userData.speedError = sign * Math.random() * CHAIR_CONFIG.chairMoving.wheels.rotationSpeedError;
    });
  }

  _initChairMovingAreaHelper() {
    const chairMovingAreaHelper = this._chairMovingAreaHelper = new ChairMovingAreaHelper();
    this.add(chairMovingAreaHelper);

    chairMovingAreaHelper.setChairPosition(this._wrapper.position);
  }

  _initChairSeatHelper() {
    const chairSeatHelper = this._chairSeatHelper = new ChairSeatHelper();
    this.add(chairSeatHelper);

    chairSeatHelper.setChairPosition(this._wrapper.position);
  }

  _initHelpArrows() {
    const helpArrowsTypes = [HELP_ARROW_TYPE.ChairFront, HELP_ARROW_TYPE.ChairRight];
    const helpArrows = this._helpArrows = new HelpArrows(helpArrowsTypes);
    this.add(helpArrows);

    this._updateHelpArrowsPosition();
  }

  _initSounds() {
    this._initSound();
    this._initSoundHelper();
  }

  _initSound() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];

    const sound = this._sound = new THREE.PositionalAudio(this._audioListener);
    this._legsGroup.add(sound);

    sound.setRefDistance(soundConfig.refDistance);
    sound.position.y = 0.5;
    sound.setLoop(true);

    sound.setVolume(this._globalVolume * this._objectVolume * this._currentVolume);

    Loader.events.on('onAudioLoaded', () => {
      sound.setBuffer(Loader.assets['chair-rolling']);
    });
  }

  _initSoundHelper() {
    const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;
    const soundHelper = this._soundHelper = new SoundHelper(helperSize);
    this._legsGroup.add(soundHelper);

    soundHelper.position.copy(this._sound.position);
  }

  _initSignals() {
    this._debugMenu.events.on('rotate', () => this._rotateSeat());
    this._debugMenu.events.on('moveChairToStartPosition', () => this.moveToStartPosition());
    this._debugMenu.events.on('onShowSeatHelper', () => this._onShowSeatHelper());
    this._debugMenu.events.on('onShowMovingArea', () => this._onShowMovingArea());
  }

  _onShowSeatHelper() {
    this._chairSeatHelper.setChairPosition(this._wrapper.position);
    this._chairSeatHelper.setAvailableAngle(this._availableSeatAngle);
    this._chairSeatHelper.updateVisibility();
  }

  _onShowMovingArea() {
    this._chairMovingAreaHelper.setChairPosition(this._wrapper.position);
    this._chairMovingAreaHelper.updateVisibility()
  }

  _getLegsParts() {
    const legs = this._parts[CHAIR_PART_TYPE.Legs];
    const wheels = getWheelsParts(this._parts);

    return [legs, ...wheels];
  }
}
