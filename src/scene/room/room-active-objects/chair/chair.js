import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { CHAIR_MOVEMENT_STATE, CHAIR_PART_TYPE, CHAIR_POSITION_TYPE, SEAT_ROTATION_DIRECTION } from './chair-data';
import { ROOM_CONFIG } from '../../data/room-config';
import { CHAIR_CONFIG } from './chair-config';
import Loader from '../../../../core/loader';
import SoundHelper from '../../shared-objects/sound-helper';
import { SOUNDS_CONFIG } from '../../data/sounds-config';

export default class Chair extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._moveChairTween = null;
    this._rotateSeatTween = null;
    this._rotateLegsTween = null;
    this._legsGroup = null;
    this._sound = null;
    this._soundHelper = null;

    this._wrapper = null;

    this._init();
  }

  update(dt) {
    if (this._isShowAnimationActive) {
      return;
    }

    this._updateSeatRotation(dt);
    this._updateWheelsRotation(dt);
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const legs = this._parts[CHAIR_PART_TYPE.Legs];
      const seat = this._parts[CHAIR_PART_TYPE.Seat];
      const wheels = this._getWheelsParts();

      for (let i = 0; i < wheels.length; i++) {
        const wheel = wheels[i];

        new TWEEN.Tween(wheel.position)
          .to({ y: wheel.userData.startPosition.y }, fallDownTime)
          .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
          .start();
      }

      new TWEEN.Tween(legs.position)
        .to({ y: legs.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(seat.position)
        .to({ y: seat.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5)
        .start();

      new TWEEN.Tween(seat.rotation)
        .to({ y: Math.PI * 2 }, fallDownTime * 3)
        .easing(TWEEN.Easing.Back.Out)
        .delay(fallDownTime * 0.5)
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

    if (partType === CHAIR_PART_TYPE.Seat) {
      this._rotateSeat();
    } else {
      this._moveChair();
    }
  }

  getMeshesForOutline(mesh) {
    if (mesh.userData.partType === CHAIR_PART_TYPE.Seat) {
      return [this._parts[CHAIR_PART_TYPE.Seat]];
    }

    const legsParts = this._getLegsParts();

    return [...legsParts];
  }

  _rotateSeat() {
    if (CHAIR_CONFIG.chairMoving.state === CHAIR_MOVEMENT_STATE.Moving) {
      const isAroundTable = CHAIR_CONFIG.chairMoving.positionType === CHAIR_POSITION_TYPE.AwayFromTable
        || (CHAIR_CONFIG.chairMoving.positionType === CHAIR_POSITION_TYPE.NearTable && this._wrapper.position.z < -CHAIR_CONFIG.chairMoving.distanceToEnableRotation)

      if (isAroundTable) {
        return;
      }
    }

    if (CHAIR_CONFIG.seatRotation.speed === 0) {
      this._changeRotationDirection();
    }

    CHAIR_CONFIG.seatRotation.speed += CHAIR_CONFIG.seatRotation.impulse;

    if (CHAIR_CONFIG.seatRotation.speed > CHAIR_CONFIG.seatRotation.maxSpeed) {
      CHAIR_CONFIG.seatRotation.speed = CHAIR_CONFIG.seatRotation.maxSpeed;
    }
  }

  _moveChair() {
    if (CHAIR_CONFIG.chairMoving.state === CHAIR_MOVEMENT_STATE.Moving) {
      this._updatePositionType();
    }

    this._stopTweens();
    this._resetSeatRotation();
    this._playSound();

    CHAIR_CONFIG.chairMoving.state = CHAIR_MOVEMENT_STATE.Moving;
    this._debugMenu.updateChairState();

    const positionZ = CHAIR_CONFIG.chairMoving.positionType === CHAIR_POSITION_TYPE.AwayFromTable ? -CHAIR_CONFIG.chairMoving.distanceToTablePosition : 0;
    const time = Math.abs(this._wrapper.position.z - positionZ) / CHAIR_CONFIG.chairMoving.speed * 1000;

    this._moveChairTween = new TWEEN.Tween(this._wrapper.position)
      .to({ z: positionZ }, time)
      .easing(TWEEN.Easing.Cubic.Out)
      .start()
      .onComplete(() => {
        this._updatePositionType();

        CHAIR_CONFIG.chairMoving.state = CHAIR_MOVEMENT_STATE.Idle;
        this._debugMenu.updateChairState();
      });

    this._setWheelsRandomData();
    this._rotateLegs(time);

    if (CHAIR_CONFIG.chairMoving.positionType === CHAIR_POSITION_TYPE.AwayFromTable
      && CHAIR_CONFIG.chairMoving.distanceToTablePosition > CHAIR_CONFIG.chairMoving.distanceToEnableRotation) {
      this._rotateSeatForward(time);
    }
  }

  _updateSeatRotation(dt) {
    if (CHAIR_CONFIG.seatRotation.speed === 0) {
      return;
    }

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

    this._checkIsRotationNearTable();
    this._debugMenu.updateSeatSpeed();
  }

  _updateWheelsRotation(dt) {
    if (CHAIR_CONFIG.chairMoving.state === CHAIR_MOVEMENT_STATE.Moving) {
      const wheels = this._getWheelsParts();

      const targetAngle = CHAIR_CONFIG.chairMoving.wheels.targetAngle[CHAIR_CONFIG.chairMoving.positionType] - this._legsGroup.rotation.y;

      wheels.forEach(wheel => {
        const errorAngle = wheel.userData.targetAngleError;
        const speed = CHAIR_CONFIG.chairMoving.wheels.rotationSpeed + wheel.userData.speedError;

        wheel.rotation.y += (targetAngle + errorAngle - wheel.rotation.y) * speed * dt * 60 * 0.01;
      });
    }
  }

  _checkIsRotationNearTable() {
    const seat = this._parts[CHAIR_PART_TYPE.Seat];

    const maxDistance = CHAIR_CONFIG.chairMoving.maxDistanceToTable;
    const minDistance = CHAIR_CONFIG.chairMoving.distanceToEnableRotation;
    let distanceCoeff = (maxDistance - (-this._wrapper.position.z)) / (maxDistance) * (maxDistance / minDistance);
    distanceCoeff = THREE.MathUtils.clamp(distanceCoeff, 0, 1);

    const currentMaxAngle = distanceCoeff * Math.PI * 0.5 * 1.03;

    const isRotatingNearTable = CHAIR_CONFIG.chairMoving.state === CHAIR_MOVEMENT_STATE.Idle
      && CHAIR_CONFIG.chairMoving.positionType === CHAIR_POSITION_TYPE.NearTable
      && CHAIR_CONFIG.seatRotation.speed > 0
      && distanceCoeff < 1;

    if (isRotatingNearTable) {
      if (seat.rotation.y > currentMaxAngle && seat.rotation.y < Math.PI) {
        CHAIR_CONFIG.seatRotation.direction = SEAT_ROTATION_DIRECTION.Clockwise;
        CHAIR_CONFIG.seatRotation.speed *= CHAIR_CONFIG.seatRotation.hitDampingCoefficient;
      }

      if (seat.rotation.y < Math.PI * 2 - currentMaxAngle && seat.rotation.y > Math.PI) {
        CHAIR_CONFIG.seatRotation.direction = SEAT_ROTATION_DIRECTION.CounterClockwise;
        CHAIR_CONFIG.seatRotation.speed *= CHAIR_CONFIG.seatRotation.hitDampingCoefficient;
      }

      this._debugMenu.updateSeatRotationDirection();
    }
  }

  _setWheelsRandomData() {
    const wheels = this._getWheelsParts();

    wheels.forEach(wheel => {
      const sign = Math.random() > 0.5 ? 1 : -1;
      wheel.userData.targetAngleError = sign * Math.random() * CHAIR_CONFIG.chairMoving.wheels.targetAngleMaxError * THREE.MathUtils.DEG2RAD;
      wheel.userData.speedError = sign * Math.random() * CHAIR_CONFIG.chairMoving.wheels.rotationSpeedError;
    });
  }

  _rotateLegs(time) {
    const sign = Math.random() > 0.5 ? '+' : '-';
    const angle = THREE.MathUtils.DEG2RAD * 20 + Math.random() * THREE.MathUtils.DEG2RAD * 30;
    const timeCoefficient = 0.3 + Math.random() * 0.3;

    this._rotateLegsTween = new TWEEN.Tween(this._legsGroup.rotation)
      .to({ y: `${sign}${angle}` }, time * timeCoefficient)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
  }

  _rotateSeatForward(time) {
    const seat = this._parts[CHAIR_PART_TYPE.Seat];

    const rotationY = seat.rotation.y < Math.PI ? 0 : Math.PI * 2;
    CHAIR_CONFIG.seatRotation.direction = seat.rotation.y < Math.PI ? SEAT_ROTATION_DIRECTION.Clockwise : SEAT_ROTATION_DIRECTION.CounterClockwise;
    this._debugMenu.updateSeatRotationDirection();

    this._rotateSeatTween = new TWEEN.Tween(seat.rotation)
      .to({ y: rotationY }, time * 0.5)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
  }

  _updatePositionType() {
    CHAIR_CONFIG.chairMoving.positionType = CHAIR_CONFIG.chairMoving.positionType === CHAIR_POSITION_TYPE.AwayFromTable
      ? CHAIR_POSITION_TYPE.NearTable
      : CHAIR_POSITION_TYPE.AwayFromTable;
  }

  _changeRotationDirection() {
    CHAIR_CONFIG.seatRotation.direction = CHAIR_CONFIG.seatRotation.direction === SEAT_ROTATION_DIRECTION.Clockwise
      ? SEAT_ROTATION_DIRECTION.CounterClockwise
      : SEAT_ROTATION_DIRECTION.Clockwise;

    this._debugMenu.updateSeatRotationDirection();
  }

  _resetSeatRotation() {
    if (CHAIR_CONFIG.chairMoving.distanceToTablePosition < CHAIR_CONFIG.chairMoving.distanceToEnableRotation) {
      return;
    }

    CHAIR_CONFIG.seatRotation.speed = 0;
    this._debugMenu.updateSeatSpeed();
  }

  _stopTweens() {
    if (this._moveChairTween) {
      this._moveChairTween.stop();
    }

    if (this._rotateSeatTween) {
      this._rotateSeatTween.stop();
    }

    if (this._rotateLegsTween) {
      this._rotateLegsTween.stop();
    }
  }

  _setPositionForShowAnimation() {
    super._setPositionForShowAnimation();

    this._parts[CHAIR_PART_TYPE.Seat].rotation.y = 0;
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initSounds();
    this._initDebugMenu();
    this._initSignals();
  }

  _addPartsToScene() {
    this._wrapper = new THREE.Group();
    this.add(this._wrapper);

    const seat = this._parts[CHAIR_PART_TYPE.Seat];
    this._wrapper.add(seat);

    const legs = this._parts[CHAIR_PART_TYPE.Legs];
    const legsPositionZ = legs.position.z;
    const legsGroup = this._legsGroup = new THREE.Group();
    this._wrapper.add(legsGroup);

    const legsParts = this._getLegsParts();
    legsParts.forEach((part) => {
      part.position.z -= legsPositionZ;
      legsGroup.add(part);
    });

    legsGroup.position.z = legsPositionZ;
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

    sound.setVolume(this._globalVolume * this._objectVolume);

    Loader.events.on('onAudioLoaded', () => {
      sound.setBuffer(Loader.assets['keyboard-key-press']);
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
    this._debugMenu.events.on('move', () => this._moveChair());
  }

  _getLegsParts() {
    const legs = this._parts[CHAIR_PART_TYPE.Legs];
    const wheels = this._getWheelsParts();

    return [legs, ...wheels];
  }

  _getWheelsParts() {
    const parts = [];
    const wheelsPartsNames = [
      CHAIR_PART_TYPE.Wheel01,
      CHAIR_PART_TYPE.Wheel02,
      CHAIR_PART_TYPE.Wheel03,
      CHAIR_PART_TYPE.Wheel04,
      CHAIR_PART_TYPE.Wheel05,
    ];

    wheelsPartsNames.forEach((partName) => {
      parts.push(this._parts[partName]);
    });

    return parts;
  }
}
