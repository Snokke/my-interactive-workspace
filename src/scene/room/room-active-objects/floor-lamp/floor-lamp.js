import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import RoomObjectAbstract from '../room-object.abstract';
import { FLOOR_LAMP_PART_TYPE, LIGHT_STATE } from './data/floor-lamp-data';
import Loader from '../../../../core/loader';
import SoundHelper from '../../shared-objects/sound-helper';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import Materials from '../../../../core/materials';
import { FLOOR_LAMP_CONFIG } from './data/floor-lamp-config';
import vertexShader from './mix-texture-color-shaders/mix-texture-color-vertex.glsl';
import fragmentShader from './mix-texture-color-shaders/mix-texture-color-fragment.glsl';

export default class FloorLamp extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._sound = null;
    this._lightPercentTween = null;
    this._lightPreviousPercent = FLOOR_LAMP_CONFIG.lightPercent;

    this._init();
  }

  onClick(intersect) { // eslint-disable-line
    if (!this._isInputEnabled) {
      return;
    }

    this._playSound();
    this._changeLightPercent(FLOOR_LAMP_CONFIG.lightState);
  }

  onAllObjectsInteraction() {
    this.onClick();
  }

  _changeLightPercent(lightState) {
    this._stopLightTween();

    this._debugMenu.disableLightPercent();
    const endValue = lightState === LIGHT_STATE.On ? 0 : 1;
    const duration = Math.abs(FLOOR_LAMP_CONFIG.lightPercent - endValue) * FLOOR_LAMP_CONFIG.switchDuration;

    const roundedLightPercent = Math.round(FLOOR_LAMP_CONFIG.lightPercent * 100) / 100;

    if (roundedLightPercent === 1) {
      FLOOR_LAMP_CONFIG.lightPercent = 0.99;
    }

    if (roundedLightPercent === 0) {
      FLOOR_LAMP_CONFIG.lightPercent = 0.01;
    }

    const tweenObject = { lightPercent: FLOOR_LAMP_CONFIG.lightPercent };

    this._lightPercentTween = new TWEEN.Tween(tweenObject)
      .to({ lightPercent: endValue }, duration)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .onUpdate(() => {

        this._debugMenu.updateLightPercent(tweenObject.lightPercent);
      })
      .start()
      .onComplete(() => {
        this._debugMenu.enableLightPercent();
      });

    if (FLOOR_LAMP_CONFIG.lightState === LIGHT_STATE.On) {
      FLOOR_LAMP_CONFIG.lightState = LIGHT_STATE.Off;
    } else {
      FLOOR_LAMP_CONFIG.lightState = LIGHT_STATE.On;
    }

    this._debugMenu.updateSwitchButtonName();
  }

  _onLightPercentChange() {
    Materials.setLightPercent(FLOOR_LAMP_CONFIG.lightPercent);
    this._updateLampTexture(FLOOR_LAMP_CONFIG.lightPercent);

    this._updateLightState();
    this._debugMenu.updateLightState();

    this.events.post('onLightPercentChange', FLOOR_LAMP_CONFIG.lightPercent);

    if (this._lightPreviousPercent < 0.5 && FLOOR_LAMP_CONFIG.lightPercent >= 0.5) {
      this.events.post('onLightHalfOn');
    }

    if (this._lightPreviousPercent > 0.5 && FLOOR_LAMP_CONFIG.lightPercent <= 0.5) {
      this.events.post('onLightHalfOff');
    }

    this._lightPreviousPercent = FLOOR_LAMP_CONFIG.lightPercent;
  }

  _updateLampTexture(lightPercent) {
    const lampOuter = this._parts[FLOOR_LAMP_PART_TYPE.LampOuter];
    const lampInner = this._parts[FLOOR_LAMP_PART_TYPE.LampInner];

    lampOuter.material.uniforms.uMixPercent.value = lightPercent;
    lampInner.material.uniforms.uMixPercent.value = lightPercent;
  }

  _updateLightState() {
    const roundedLightPercent = Math.round(FLOOR_LAMP_CONFIG.lightPercent * 100) / 100;

    if (roundedLightPercent === 0) {
      FLOOR_LAMP_CONFIG.lightPercent = 0;
      FLOOR_LAMP_CONFIG.debugLightState = LIGHT_STATE.Off;
      FLOOR_LAMP_CONFIG.lightState = LIGHT_STATE.Off;
      this._debugMenu.updateSwitchButtonName();
      this._stopLightTween();

      return;
    }

    if (roundedLightPercent === 1) {
      FLOOR_LAMP_CONFIG.lightPercent = 1;
      FLOOR_LAMP_CONFIG.debugLightState = LIGHT_STATE.On;
      FLOOR_LAMP_CONFIG.lightState = LIGHT_STATE.On;
      this._debugMenu.updateSwitchButtonName();
      this._stopLightTween();

      return;
    }

    FLOOR_LAMP_CONFIG.debugLightState = LIGHT_STATE.Switching;
  }

  _stopLightTween() {
    if (this._lightPercentTween) {
      this._lightPercentTween.stop();
    }
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initSounds();
    this._initDebugMenu();
    this._initSignals();
  }

  _addMaterials() {
    const material = Materials.getMaterial(Materials.type.bakedBigObjects);
    this._parts[FLOOR_LAMP_PART_TYPE.Stand].material = material;

    const lampTexture = Loader.assets['baked-textures/baked-lamp-off'];
    lampTexture.flipY = false;

    const lampOuterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: lampTexture },
        uColor: { value: new THREE.Color(FLOOR_LAMP_CONFIG.lampOnColor.outer) },
        uMixPercent: { value: 1 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    this._parts[FLOOR_LAMP_PART_TYPE.LampOuter].material = lampOuterMaterial;

    const lampInnerMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: lampTexture },
        uColor: { value: new THREE.Color(FLOOR_LAMP_CONFIG.lampOnColor.inner) },
        uMixPercent: { value: 1 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    this._parts[FLOOR_LAMP_PART_TYPE.LampInner].material = lampInnerMaterial;
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

    const stand = this._parts[FLOOR_LAMP_PART_TYPE.Stand];
    sound.position.copy(stand.position);
    sound.position.y = 5;

    sound.setVolume(this._globalVolume * this._objectVolume);

    Loader.events.on('onAudioLoaded', () => {
      sound.setBuffer(Loader.assets['lamp-switch']);
    });
  }

  _initSoundHelper() {
    const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;
    const soundHelper = this._soundHelper = new SoundHelper(helperSize);
    this.add(soundHelper);

    soundHelper.position.copy(this._sound.position);
  }

  _initSignals() {
    this._debugMenu.events.on('switchLight', () => {
      this.onClick();
    });

    this._debugMenu.events.on('onLightPercentChange', () => {
      this._onLightPercentChange();
    });

    this._debugMenu.events.on('onHelpersChange', () => {
      this.events.post('onHelpersChange');
    });
  }
}
