import * as THREE from 'three';
import { MessageDispatcher } from 'black-engine';
import vertexShader from './keys-backlight-shaders/keys-backlight-vertex.glsl';
import fragmentShader from './keys-backlight-shaders/keys-backlight-fragment.glsl';
import { KEYBOARD_CONFIG } from '../data/keyboard-config';
import { KEYS_BACKLIGHT_TYPE_CONFIG, KEYS_BACKLIGHT_CONFIG } from './keys-backlight-config';
import { Vector2 } from 'three';
import { KEYS_CONFIG, KEYS_ID_BY_ROW } from '../data/keys-config';
import { KEYS_BACKLIGHT_TYPE, KEYS_BACKLIGHT_TYPE_ORDER } from './keys-backlight-data';
import Delayed from '../../../../../core/helpers/delayed-call';
import { from0To1Tween, from0To1YoyoTween, getClosestKeyByX, toZeroTween } from '../data/keys-helper';
import { SCALE_ZERO } from '../../../data/room-config';
import KeysSymbols from '../keys-symbols/keys-symbols';

export default class KeysBacklight extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._view = null;

    this._currentBacklightType = KEYS_BACKLIGHT_CONFIG.currentType;
    this._startColorsFunctionByType = {};
    this._keyPressedFunctionByType = {};
    this._updateFunctionByType = {};

    this._keysBacklightCount = 0;
    this._time = 0;
    this._updateTypeBacklightIndex = 0;

    this._HSLAngle = [];
    this._activeBacklightScale = [];

    this._init();
  }

  update(dt) {
    if (!this.visible) {
      return;
    }

    const config = KEYS_BACKLIGHT_TYPE_CONFIG[this._currentBacklightType];

    if (config.colors.change) {
      this._updateColors(dt);
    }

    if (config.scaleChange) {
      this._updateScale(dt);
    }

    if (this._updateFunctionByType[this._currentBacklightType]) {
      this._updateFunctionByType[this._currentBacklightType](dt);
    }
  }

  switchType() {
    const nextType = this._getNextBacklightType();
    this.setBacklightType(nextType);
  }

  setBacklightType(type) {
    this._updateBacklightType(type)

    if (type !== KEYS_BACKLIGHT_TYPE.None) {
      this._startColorsFunctionByType[type]();
      this._updateStartColors();
    }

    this._resetScale();

    if (KEYS_BACKLIGHT_TYPE_CONFIG[type].scaleChange) {
      this._setStartScale(SCALE_ZERO);
    }

    this._time = 0;
    this._updateTypeBacklightIndex = 0;
  }

  onKeyPressDown(keyId) {
    if (this._keyPressedFunctionByType[this._currentBacklightType]) {
      this._keyPressedFunctionByType[this._currentBacklightType](keyId);
    }

    this._keysSymbols.onKeyPressDown(keyId);
  }

  onKeyPressUp(keyId) {
    this._keysSymbols.onKeyPressUp(keyId);
  }

  show() {
    this.visible = true;

    this._colorsFromLeftToRight();
    this._updateStartColors();

    const step = 0.09;
    const startX = KEYBOARD_CONFIG.size.x * 0.5;

    let index = 0;

    for (let x = startX; x < KEYBOARD_CONFIG.size.x; x += step) {
      this._showBacklightClosestKeyToX(x, index);

      index += 1;
    }

    index = 1;

    for (let x = startX - step; x > 0; x -= step) {
      this._showBacklightClosestKeyToX(x, index);

      index += 1;
    }

    Delayed.call(450 + 300, () => {
      this.setBacklightType(KEYS_BACKLIGHT_TYPE_ORDER[0]);
    })
  }

  hide() {
    this.visible = false;
    this.setBacklightType(KEYS_BACKLIGHT_TYPE.None);
    this._setStartScale(SCALE_ZERO);
  }

  _updateColors(dt) {
    const config = KEYS_BACKLIGHT_TYPE_CONFIG[this._currentBacklightType];

    for (let i = 0; i < this._keysBacklightCount; i += 1) {
      this._HSLAngle[i] += config.colors.changeSpeed * config.colors.direction * (dt * 60);

      if (this._HSLAngle[i] >= 360) {
        this._HSLAngle[i] = 0;
      }

      if (this._HSLAngle[i] < 0) {
        this._HSLAngle[i] = 359;
      }

      const color = new THREE.Color(`hsl(${this._HSLAngle[i]}, 100%, 50%)`);
      this._view.setColorAt(i, color);
    }

    this._keysSymbols.updateHSLAngle(this._HSLAngle);
    this._view.instanceColor.needsUpdate = true;
  }

  _updateScale(dt) { // eslint-disable-line
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    this._activeBacklightScale.forEach((backlightObject) => {
      const index = backlightObject.id;

      this._view.getMatrixAt(index, matrix);
      matrix.decompose(position, rotation, scale);

      scale.x = scale.y = backlightObject.value;

      matrix.compose(position, rotation, scale);
      this._view.setMatrixAt(index, matrix);
    });

    this._keysSymbols.updateSaturation(this._activeBacklightScale);
    this._view.instanceMatrix.needsUpdate = true;
  }

  _showKeyBacklight(keyId, tweenFunction, startValue, time, delay) {
    const backlightIndex = this._getBacklightScaleIndex(keyId);

    if (backlightIndex !== -1) {
      const backlightObject = this._activeBacklightScale[backlightIndex];
      backlightObject.tween.stop();
      this._activeBacklightScale.splice(backlightIndex, 1);
    }

    const object = { id: keyId, value: startValue };

    object.tween = tweenFunction(object, time, delay)
      .onComplete(() => {
        const currentBacklightIndex = this._getBacklightScaleIndex(keyId);
        this._activeBacklightScale.splice(currentBacklightIndex, 1);
      });

    this._activeBacklightScale.push(object);
  }

  _getBacklightScaleIndex(keyId) {
    return this._activeBacklightScale.findIndex((item) => item.id === keyId);
  }

  _getNextBacklightType() {
    const index = KEYS_BACKLIGHT_TYPE_ORDER.indexOf(this._currentBacklightType);
    const nextType = KEYS_BACKLIGHT_TYPE_ORDER[index + 1];

    if (nextType) {
      return nextType;
    }

    return KEYS_BACKLIGHT_TYPE_ORDER[0];
  }

  _resetScale() {
    this._activeBacklightScale.forEach((backlightObject) => {
      backlightObject.tween.stop();
    });

    this._activeBacklightScale = [];

    this._setStartScale(1);
  }

  _updateBacklightType(type) {
    this._currentBacklightType = type;
    KEYS_BACKLIGHT_CONFIG.currentType = type;
    this.events.post('keysBacklightTypeChanged');
  }

  _init() {
    this._initKeysBacklightInstanceMesh();
    this._setKeysBacklightPosition();
    this._initKeysSymbols();
    this._initStartHSLAngle();
    this._initFunctionsByType();

    this.setBacklightType(KEYS_BACKLIGHT_TYPE_ORDER[0]);
  }

  _initKeysBacklightInstanceMesh() {
    const size = KEYS_BACKLIGHT_CONFIG.size;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    const keysBacklightCount = this._keysBacklightCount = KEYS_CONFIG.length;
    const view = this._view = new THREE.InstancedMesh(geometry, material, keysBacklightCount);
    this.add(view);
  }

  _setKeysBacklightPosition() {
    this._view.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const dummy = new THREE.Object3D();

    const keyboardSize = KEYBOARD_CONFIG.size;
    const offsetLeft = KEYBOARD_CONFIG.keys.offsetX;
    const offsetTop = KEYBOARD_CONFIG.keys.offsetZ;
    const offsetY = KEYBOARD_CONFIG.keys.offsetY;

    const leftX = -keyboardSize.x * 0.5 + offsetLeft;
    const heightY = keyboardSize.y * 0.5 + offsetY;
    const topZ = -keyboardSize.z * 0.5 + offsetTop;

    for (let i = 0; i < this._keysBacklightCount; i += 1) {
      const backlightPosition = KEYS_CONFIG[i].position;

      dummy.position.set(leftX + backlightPosition.x, heightY + backlightPosition.y, topZ - backlightPosition.z);
      dummy.rotation.x = -Math.PI * 0.5 + KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
      dummy.updateMatrix();

      this._view.setMatrixAt(i, dummy.matrix);
      this._view.setColorAt(i, new THREE.Color(0xffffff));
    }

    this._view.instanceMatrix.needsUpdate = true;
    this._view.instanceColor.needsUpdate = true;
  }

  _initKeysSymbols() {
    const keysSymbols = this._keysSymbols = new KeysSymbols();
    this.add(keysSymbols);
  }

  _setStartScale(scaleValue) {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const scaleArray = [];

    for (let i = 0; i < this._keysBacklightCount; i += 1) {
      this._view.getMatrixAt(i, matrix);
      matrix.decompose(position, rotation, scale);

      scale.x = scale.y = scaleValue;

      matrix.compose(position, rotation, scale);
      this._view.setMatrixAt(i, matrix);

      scaleArray.push({ id: i, value: scaleValue });
    }

    this._keysSymbols.updateSaturation(scaleArray);
    this._view.instanceMatrix.needsUpdate = true;
  }

  _initStartHSLAngle() {
    for (let i = 0; i < this._keysBacklightCount; i += 1) {
      this._HSLAngle.push(0);
    }
  }

  _initFunctionsByType() {
    this._initColorsFunctionByType();
    this._initKeyPressedFunctionByType();
    this._initUpdateFunctionByType();
  }

  _initColorsFunctionByType() {
    this._startColorsFunctionByType = {
      [KEYS_BACKLIGHT_TYPE.FromLeftToRight]: () => this._colorsFromLeftToRight(),
      [KEYS_BACKLIGHT_TYPE.FromTopToBottom]: () => this._colorsFromTopToBottom(),
      [KEYS_BACKLIGHT_TYPE.SameColor]: () => this._colorsSameColor(),
      [KEYS_BACKLIGHT_TYPE.FromCenterToSides]: () => this._colorsFromCenterToSides(),
      [KEYS_BACKLIGHT_TYPE.RandomColors]: () => this._colorsRandomColors(),
      [KEYS_BACKLIGHT_TYPE.FromFirstToLastKey]: () => this._colorsRandomColors(),
      [KEYS_BACKLIGHT_TYPE.PressKey]: () => this._colorsRandomColors(),
      [KEYS_BACKLIGHT_TYPE.PressKeyToSides]: () => this._colorsRandomColors(),
      [KEYS_BACKLIGHT_TYPE.PressKeyToSidesRow]: () => this._colorsRandomColors(),
    }
  }

  _initKeyPressedFunctionByType() {
    this._keyPressedFunctionByType = {
      [KEYS_BACKLIGHT_TYPE.PressKey]: (keyId) => this._pressedKeyBacklight(keyId),
      [KEYS_BACKLIGHT_TYPE.PressKeyToSides]: (keyId) => this._pressedKeyToSides(keyId),
      [KEYS_BACKLIGHT_TYPE.PressKeyToSidesRow]: (keyId) => this._pressedKeyToSidesSingleRow(keyId),
    }
  }

  _initUpdateFunctionByType() {
    this._updateFunctionByType = {
      [KEYS_BACKLIGHT_TYPE.FromFirstToLastKey]: (dt) => this._backlightFromFirstToLastKeyLogic(dt),
    }
  }

  _colorsFromLeftToRight() {
    this._setColorsArray(normalizedPosition => normalizedPosition.x * 360);
  }

  _colorsFromTopToBottom() {
    this._setColorsArray(normalizedPosition => normalizedPosition.y * 0.5 * 360);
  }

  _colorsSameColor() {
    this._setColorsArray(() => 0);
  }

  _colorsFromCenterToSides() {
    this._setColorsArray((normalizedPosition) => {
      if (normalizedPosition.x < 0.5) {
        return normalizedPosition.x * 360;
      } else {
        return (1 - normalizedPosition.x) * 360;
      }
    });
  }

  _colorsRandomColors() {
    this._setColorsArray(() => Math.random() * 360);
  }

  _pressedKeyBacklight(keyId) {
    this._showKeyBacklight(keyId, toZeroTween, 1, 3000, 0);
  }

  _pressedKeyToSides(keyId) {
    const pressedKeyConfig = KEYS_CONFIG[keyId];
    const step = 0.09;

    let index = 0;

    for (let x = pressedKeyConfig.position.x; x < KEYBOARD_CONFIG.size.x; x += step) {
      this._showBacklightClosestKeyToXYoyo(x, index);

      index += 1;
    }

    index = 1;

    for (let x = pressedKeyConfig.position.x - step; x > 0; x -= step) {
      this._showBacklightClosestKeyToXYoyo(x, index);

      index += 1;
    }
  }

  _showBacklightClosestKeyToXYoyo(x, index) {
    for (let row = 0; row < KEYS_ID_BY_ROW.length; row += 1) {
      const closestKeyId = getClosestKeyByX(x, row);

      if (closestKeyId !== null) {
        this._showKeyBacklight(closestKeyId, from0To1YoyoTween, SCALE_ZERO, 300, index * 50);
      }
    }
  }

  _showBacklightClosestKeyToX(x, index) {
    for (let row = 0; row < KEYS_ID_BY_ROW.length; row += 1) {
      const closestKeyId = getClosestKeyByX(x, row);

      if (closestKeyId !== null) {
        this._showKeyBacklight(closestKeyId, from0To1Tween, SCALE_ZERO, 300, index * 50);
      }
    }
  }

  _pressedKeyToSidesSingleRow(keyId) {
    const pressedKeyPosition = KEYS_CONFIG[keyId].position;

    this._showKeyBacklight(keyId, from0To1YoyoTween, SCALE_ZERO, 300, 0);

    let index = 1;

    for (let i = keyId + 1; i < KEYS_CONFIG.length; i++) {
      if (KEYS_CONFIG[i].position.z === pressedKeyPosition.z) {
        this._showKeyBacklight(i, from0To1YoyoTween, SCALE_ZERO, 300, index * 50);
        index += 1;
      } else {
        break;
      }
    }

    index = 1;

    for (let i = keyId - 1; i > 0; i--) {
      if (KEYS_CONFIG[i].position.z === pressedKeyPosition.z) {
        this._showKeyBacklight(i, from0To1YoyoTween, SCALE_ZERO, 300, index * 50);
        index += 1;
      } else {
        break;
      }
    }
  }

  _backlightFromFirstToLastKeyLogic(dt) {
    this._time += dt;

    if (this._time > 0.08) {
      this._time = 0;

      this._showKeyBacklight(this._updateTypeBacklightIndex, from0To1YoyoTween, SCALE_ZERO, 1200, 0);

      this._updateTypeBacklightIndex += 1;

      if (this._updateTypeBacklightIndex >= this._keysBacklightCount) {
        this._updateTypeBacklightIndex = 0;
      }
    }
  }

  _setColorsArray(callback) {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    for (let i = 0; i < this._keysBacklightCount; i += 1) {
      this._view.getMatrixAt(i, matrix);
      position.setFromMatrixPosition(matrix);

      const normalizedPosition = new Vector2(
        (position.x + KEYBOARD_CONFIG.size.x * 0.5) / KEYBOARD_CONFIG.size.x,
        (position.z + KEYBOARD_CONFIG.size.z * 0.5) / KEYBOARD_CONFIG.size.z,
      );

      const angle = callback(normalizedPosition);
      this._HSLAngle[i] = angle;
    }
  }

  _updateStartColors() {
    for (let i = 0; i < this._keysBacklightCount; i += 1) {
      const color = new THREE.Color(`hsl(${this._HSLAngle[i]}, 100%, 50%)`);
      this._view.setColorAt(i, color);
    }

    this._keysSymbols.updateHSLAngle(this._HSLAngle);
    this._view.instanceColor.needsUpdate = true;
  }
}
