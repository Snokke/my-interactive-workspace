import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { AIR_CONDITIONER_DOOR_POSITION_STATE, AIR_CONDITIONER_DOOR_STATE, AIR_CONDITIONER_PART_TYPE, AIR_CONDITIONER_STATE } from './air-conditioner-data';
import { ROOM_CONFIG } from '../../data/room-config';
import { AIR_CONDITIONER_CONFIG } from './air-conditioner-config';
import Loader from '../../../../core/loader';
import SnowflakeParticles from './snowflake-particles/snowflake-particles';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import SnowflakeParticlesController from './snowflake-particles/snowflake-particles-controller';

export default class AirConditioner extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._snowflakeParticlesController = null;
    this._airConditionerTween = null;
    this._temperatureTween = null;
    this._sound = null;

    this._init();
  }

  update(dt) {
    this._snowflakeParticlesController.update(dt);
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const body = this._parts[AIR_CONDITIONER_PART_TYPE.Body];
      const door = this._parts[AIR_CONDITIONER_PART_TYPE.Door];
      const temperature = this._parts[AIR_CONDITIONER_PART_TYPE.Temperature];

      new TWEEN.Tween(temperature.position)
        .to({ y: temperature.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(door.position)
        .to({ y: door.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

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
      this._snowflakeParticlesController.hide();
      this._sound.stop();
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

  onWindowOpened() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];
    this._sound.setDirectionalCone(soundConfig.coneInnerAngle, soundConfig.coneOuterAngle, SOUNDS_CONFIG.openedWindowOuterGain);
  }

  onWindowClosed() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];
    this._sound.setDirectionalCone(soundConfig.coneInnerAngle, soundConfig.coneOuterAngle, SOUNDS_CONFIG.closedWindowOuterGain);
  }

  showSoundHelpers() {
    this._soundHelper.visible = true;
  }

  hideSoundHelpers() {
    this._soundHelper.visible = false;
  }

  _onConditionerTweenComplete() {
    this._updateAirConditionerDoorPositionType();

    AIR_CONDITIONER_CONFIG.doorState = AIR_CONDITIONER_DOOR_STATE.Idle;

    if (AIR_CONDITIONER_CONFIG.powerState === AIR_CONDITIONER_STATE.PowerOn
       && AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Closed) {
      AIR_CONDITIONER_CONFIG.powerState = AIR_CONDITIONER_STATE.PowerOff;
    }

    if (AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Opened) {
      this._snowflakeParticlesController.show();
      this._sound.play();
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
    this._initSounds();
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
    const snowflakeParticlesController = this._snowflakeParticlesController = new SnowflakeParticlesController();
    this.add(snowflakeParticlesController);

    snowflakeParticlesController.position.copy(this._parts[AIR_CONDITIONER_PART_TYPE.Body].position);
  }

  _initSounds() {
    this._initSound();
    this._initSoundHelper();
  }

  _initSound() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];

    const sound = this._sound = new THREE.PositionalAudio(this._audioListener);
    this.add(sound);

    sound.setRefDistance(soundConfig.refDistance);
    sound.setDirectionalCone(soundConfig.coneInnerAngle, soundConfig.coneOuterAngle, SOUNDS_CONFIG.closedWindowOuterGain);
    sound.loop = true;

    const door = this._parts[AIR_CONDITIONER_PART_TYPE.Door];
    sound.position.copy(door.position);

    sound.rotation.y = soundConfig.rotation * THREE.MathUtils.DEG2RAD;

    sound.setVolume(this._globalVolume * soundConfig.volume);

    Loader.events.on('onAudioLoaded', () => {
      sound.setBuffer(Loader.assets['air-conditioner']);
    });
  }

  _initSoundHelper() {
    const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;
    const soundHelper = this._soundHelper = new PositionalAudioHelper(this._sound, helperSize);
    this.add(soundHelper);

    soundHelper.position.copy(this._sound.position);
    soundHelper.rotation.y = this._sound.rotation.y;
    soundHelper.visible = false;
  }

  _initSignals() {
    this._debugMenu.events.on('switchOn', () => {
      this.onClick();
    });
  }
}
