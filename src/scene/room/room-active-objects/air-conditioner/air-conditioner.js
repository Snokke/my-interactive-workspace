import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { AIR_CONDITIONER_DOOR_POSITION_STATE, AIR_CONDITIONER_DOOR_STATE, AIR_CONDITIONER_PART_TYPE, AIR_CONDITIONER_STATE } from './air-conditioner-data';
import { ROOM_CONFIG } from '../../data/room-config';
import { AIR_CONDITIONER_CONFIG } from './air-conditioner-config';
import Loader from '../../../../core/loader';
import SnowflakeParticles from './snowflake-particels';

export default class AirConditioner extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._snowflakeParticles = null;
    this._airConditionerTween = null;
    this._temperatureTween = null;

    this._init();
  }

  update(dt) {
    this._snowflakeParticles.update(dt);
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const body = this._parts[AIR_CONDITIONER_PART_TYPE.Body];

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

    const door = this._parts[AIR_CONDITIONER_PART_TYPE.Door];

    if (AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Opened) {
      this._snowflakeParticles.hide();
    }

    if (AIR_CONDITIONER_CONFIG.doorState === AIR_CONDITIONER_DOOR_STATE.Moving) {
      this._updateAirConditionerDoorPositionType();
    }

    if (AIR_CONDITIONER_CONFIG.powerState === AIR_CONDITIONER_STATE.PowerOff) {
      AIR_CONDITIONER_CONFIG.powerState = AIR_CONDITIONER_STATE.PowerOn;
    }

    AIR_CONDITIONER_CONFIG.doorState = AIR_CONDITIONER_DOOR_STATE.Moving;
    // this._debugMenu.updateTopPanelState();
    this._stopAirConditionerTween();

    const maxAngle = AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Opened ? 0 : AIR_CONDITIONER_CONFIG.maxOpenAngle;

    const remainingRotationAngle = maxAngle - (door.rotation.z * THREE.MathUtils.RAD2DEG);
    const time = Math.abs(remainingRotationAngle) / AIR_CONDITIONER_CONFIG.rotationSpeed * 100;

    this._airConditionerTween = new TWEEN.Tween(door.rotation)
      .to({ z: -maxAngle * THREE.MathUtils.DEG2RAD }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        AIR_CONDITIONER_CONFIG.doorAngle = door.rotation.z * THREE.MathUtils.RAD2DEG;
      })
      .onComplete(() => {
        this._onConditionerTweenComplete();
      });

    this._updateTemperatureVisibility();
  }

  _onConditionerTweenComplete() {
    this._updateAirConditionerDoorPositionType();

    AIR_CONDITIONER_CONFIG.doorState = AIR_CONDITIONER_DOOR_STATE.Idle;

    if (AIR_CONDITIONER_CONFIG.powerState === AIR_CONDITIONER_STATE.PowerOn
       && AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Closed) {
      AIR_CONDITIONER_CONFIG.powerState = AIR_CONDITIONER_STATE.PowerOff;
    }

    if (AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Opened) {
      this._snowflakeParticles.show();
    }

    // this._debugMenu.updateTopPanelState();
  }

  _updateTemperatureVisibility() {
    if (AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Closed) {
      this._showTemperature();
    } else {
      this._hideTemperature();
    }
  }

  _showTemperature() {
    const temperaturePart = this._parts[AIR_CONDITIONER_PART_TYPE.Temperature];
    temperaturePart.visible = true;

    if (this._temperatureTween) {
      this._temperatureTween.stop();
    }

    this._temperatureTween = new TWEEN.Tween(temperaturePart.material)
      .to({ opacity: 1 }, 300)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  _hideTemperature() {
    const temperaturePart = this._parts[AIR_CONDITIONER_PART_TYPE.Temperature];

    if (this._temperatureTween) {
      this._temperatureTween.stop();
    }

    this._temperatureTween = new TWEEN.Tween(temperaturePart.material)
      .to({ opacity: 0 }, 300)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        temperaturePart.visible = false;
      });
  }

  _updateAirConditionerDoorPositionType() {
    AIR_CONDITIONER_CONFIG.doorPositionType = AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Opened
      ? AIR_CONDITIONER_DOOR_POSITION_STATE.Closed
      : AIR_CONDITIONER_DOOR_POSITION_STATE.Opened;
  }

  _stopAirConditionerTween() {
    if (this._airConditionerTween) {
      this._airConditionerTween.stop();
    }
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initTemperature();
    this._initSnowflakeParticles();
    this._initDebugMenu();
    this._initSignals();
  }

  _initTemperature() {
    const temperaturePart = this._parts[AIR_CONDITIONER_PART_TYPE.Temperature];
    const texture = Loader.assets['temperature'];

    temperaturePart.material.map = texture;
    temperaturePart.material.transparent = true;
    temperaturePart.material.opacity = 0;
    temperaturePart.material.color = new THREE.Color(0xffffff);

    temperaturePart.visible = false;
  }

  _initSnowflakeParticles() {
    const snowflakeParticles = this._snowflakeParticles = new SnowflakeParticles();
    this.add(snowflakeParticles);

    snowflakeParticles.position.copy(this._parts[AIR_CONDITIONER_PART_TYPE.Body].position);
  }

  _initSignals() {
    this._debugMenu.events.on('switchOn', () => {
      this.onClick();
    });
  }
}
