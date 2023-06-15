import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import RoomObjectAbstract from '../room-object.abstract';
import { AIR_CONDITIONER_DOOR_POSITION_STATE, AIR_CONDITIONER_DOOR_STATE, AIR_CONDITIONER_PART_TYPE, AIR_CONDITIONER_STATE } from './data/air-conditioner-data';
import { AIR_CONDITIONER_CONFIG } from './data/air-conditioner-config';
import Loader from '../../../../core/loader';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import SnowflakeParticlesController from './snowflake-particles/snowflake-particles-controller';
import Materials from '../../../../core/materials';

export default class AirConditioner extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._snowflakeParticlesController = null;
    this._airConditionerTween = null;
    this._temperatureTween = null;
    this._sound = null;
    this._temperatureScreenBitmap = null;

    this._init();
  }

  update(dt) {
    this._snowflakeParticlesController.update(dt);
  }

  onClick(intersect) { // eslint-disable-line
    if (!this._isInputEnabled) {
      return;
    }

    this.events.post('onDoorMoving');

    const door = this._parts[AIR_CONDITIONER_PART_TYPE.Door];

    if (AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Opened) {
      this._snowflakeParticlesController.hide();
      this._sound.stop();
    }

    if (AIR_CONDITIONER_CONFIG.doorState === AIR_CONDITIONER_DOOR_STATE.Moving) {
      this._updateAirConditionerDoorPositionType();
    }

    this._updatePowerState();

    AIR_CONDITIONER_CONFIG.doorState = AIR_CONDITIONER_DOOR_STATE.Moving;
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
    this.events.post('onChangePowerState');
  }

  onAllObjectsInteraction() {
    this.onClick();
  }

  setTableState(state) {
    this._snowflakeParticlesController.setTableState(state);
  }

  onWindowOpened() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];
    this._sound.setDirectionalCone(soundConfig.coneInnerAngle, soundConfig.coneOuterAngle, SOUNDS_CONFIG.openedWindowOuterGain);
  }

  onWindowClosed() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];
    this._sound.setDirectionalCone(soundConfig.coneInnerAngle, soundConfig.coneOuterAngle, SOUNDS_CONFIG.closedWindowOuterGain);
    this._snowflakeParticlesController.onWindowClosed();
  }

  onWindowFullyOpened() {
    this._snowflakeParticlesController.onWindowOpened();
  }

  showSoundHelpers() {
    this._soundHelper.visible = true;
  }

  hideSoundHelpers() {
    this._soundHelper.visible = false;
  }

  onChangeTemperature() {
    this._snowflakeParticlesController.onChangeTemperature();
    this.updateTemperatureScreen();
    this._debugMenu.updateTemperature();
  }

  updateTemperatureScreen() {
    const temperature = AIR_CONDITIONER_CONFIG.temperature.current;
    const bitmap = this._temperatureScreenBitmap;
    const context = bitmap.getContext('2d');

    context.clearRect(0, 0, bitmap.width, bitmap.height);

    context.fillStyle = AIR_CONDITIONER_CONFIG.screen.textColor;
    context.fillText(temperature, bitmap.width * 0.5, bitmap.height * 0.55);

    const temperatureScreen = this._parts[AIR_CONDITIONER_PART_TYPE.TemperatureScreen];
    temperatureScreen.material.map.needsUpdate = true;
  }

  _onConditionerTweenComplete() {
    this._updateAirConditionerDoorPositionType();

    AIR_CONDITIONER_CONFIG.doorState = AIR_CONDITIONER_DOOR_STATE.Idle;

    if (AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Opened) {
      this._snowflakeParticlesController.show();
      this._sound.play();
    }

    this.events.post('onDoorStopMoving');
  }

  _updatePowerState() {
    if (AIR_CONDITIONER_CONFIG.powerState === AIR_CONDITIONER_STATE.PowerOff) {
      AIR_CONDITIONER_CONFIG.powerState = AIR_CONDITIONER_STATE.PowerOn;
    } else {
      AIR_CONDITIONER_CONFIG.powerState = AIR_CONDITIONER_STATE.PowerOff;
    }

    this._debugMenu.updatePowerStateController();
  }

  _updateTemperatureVisibility() {
    if (AIR_CONDITIONER_CONFIG.doorPositionType === AIR_CONDITIONER_DOOR_POSITION_STATE.Closed) {
      this._showTemperature();
    } else {
      this._hideTemperature();
    }
  }

  _showTemperature() {
    const temperaturePart = this._parts[AIR_CONDITIONER_PART_TYPE.TemperatureScreen];
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
    const temperaturePart = this._parts[AIR_CONDITIONER_PART_TYPE.TemperatureScreen];

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

  _addMaterials() {
    const material = Materials.getMaterial(Materials.type.bakedBigObjects);

    for (const partName in this._parts) {
      const part = this._parts[partName];
      part.material = material;
    }
  }

  _initTemperature() {
    this._initTemperatureScreenBitmap();
    this._initTemperatureText();

    setTimeout(() => this.updateTemperatureScreen(), 10);
    setTimeout(() => this.updateTemperatureScreen(), 1000);

    this._parts[AIR_CONDITIONER_PART_TYPE.TemperatureScreen].visible = false;
  }

  _initTemperatureScreenBitmap() {
    const temperatureScreen = this._parts[AIR_CONDITIONER_PART_TYPE.TemperatureScreen];
    const temperatureScreenBox = new THREE.Box3().setFromObject(temperatureScreen);
    const size = temperatureScreenBox.getSize(new THREE.Vector3());

    const bitmap = this._temperatureScreenBitmap = document.createElement('canvas');
    bitmap.width = size.z * AIR_CONDITIONER_CONFIG.screen.resolution;
    bitmap.height = size.y * AIR_CONDITIONER_CONFIG.screen.resolution;

    const texture = new THREE.Texture(bitmap);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
    });

    temperatureScreen.material = material;
  }

  _initTemperatureText() {
    const context = this._temperatureScreenBitmap.getContext('2d');
    context.font = `${AIR_CONDITIONER_CONFIG.screen.textSize}px AlarmClock`;

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillStyle = AIR_CONDITIONER_CONFIG.screen.textColor;
    context.fillText('00', this._temperatureScreenBitmap.width * 0.5, this._temperatureScreenBitmap.height * 0.55);
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
    this._debugMenu.events.on('turnOnOff', () => this.onClick());
    this._debugMenu.events.on('increaseTemperature', () => this.events.post('onIncreaseTemperature'));
    this._debugMenu.events.on('decreaseTemperature', () => this.events.post('onDecreaseTemperature'));
  }
}
