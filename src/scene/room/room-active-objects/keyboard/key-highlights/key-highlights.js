import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import vertexShader from './key-highlight-shaders/key-highlight-vertex.glsl';
import fragmentShader from './key-highlight-shaders/key-highlight-fragment.glsl';
import { KEYBOARD_CONFIG } from '../keyboard-config';
import { KEYS_HIGHLIGHT_CONFIG, KEYS_HIGHLIGHT_TYPE, KEYS_HIGHLIGHT_TYPE_ORDER, KEY_HIGHLIGHT_CONFIG } from './key-highlights-config';
import { Vector2 } from 'three';
import { KEYS_CONFIG, KEYS_ID_BY_ROW } from '../keys-config';

const SCALE_ZERO = 0.01;

export default class KeyHighlights extends THREE.Group {
  constructor() {
    super();

    this._view = null;

    this._currentHighlightType = KEYS_HIGHLIGHT_TYPE_ORDER[0];
    this._startColorsFunctionByType = {};
    this._keyPressedFunctionByType = {};
    this._updateFunctionByType = {};

    this._highlightsCount = 0;
    this._time = 0;
    this._updateTypeHighlightIndex = 0;

    this._HSLAngle = [];
    this._activeHighlightScale = [];

    this._init();
  }

  update(dt) {
    const config = KEYS_HIGHLIGHT_CONFIG[this._currentHighlightType];

    if (config.colors.change) {
      this._updateColors(dt);
    }

    if (config.scaleChange) {
      this._updateScale(dt);
    }

    if (this._updateFunctionByType[this._currentHighlightType]) {
      this._updateFunctionByType[this._currentHighlightType](dt);
    }
  }

  switchType() {
    const nextType = this._getNextHighlightType();
    this._setHighlightType(nextType);
  }

  onKeyClick(keyId) {
    if (this._keyPressedFunctionByType[this._currentHighlightType]) {
      this._keyPressedFunctionByType[this._currentHighlightType](keyId);
    }
  }

  _updateColors(dt) {
    const config = KEYS_HIGHLIGHT_CONFIG[this._currentHighlightType];

    for (let i = 0; i < this._highlightsCount; i += 1) {
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

    this._view.instanceColor.needsUpdate = true;
  }

  _updateScale(dt) {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    this._activeHighlightScale.forEach((highlightObject) => {
      const index = highlightObject.id;

      this._view.getMatrixAt(index, matrix);
      matrix.decompose(position, rotation, scale);

      scale.x = scale.y = highlightObject.value;

      matrix.compose(position, rotation, scale);
      this._view.setMatrixAt(index, matrix);
    });

    this._view.instanceMatrix.needsUpdate = true;
  }

  _showKeyHighlight(keyId, tweenFunction, startValue, time, delay) {
    const highlightIndex = this._getHighlightScaleIndex(keyId);

    if (highlightIndex !== -1) {
      const highlightObject = this._activeHighlightScale[highlightIndex];
      highlightObject.tween.stop();
      this._activeHighlightScale.splice(highlightIndex, 1);
    }

    const object = { id: keyId, value: startValue };

    object.tween = tweenFunction(object, time, delay)
      .onComplete(() => {
        const currentHighlightIndex = this._getHighlightScaleIndex(keyId);
        this._activeHighlightScale.splice(currentHighlightIndex, 1);
      });

    this._activeHighlightScale.push(object);
  }

  _getHighlightScaleIndex(keyId) {
    return this._activeHighlightScale.findIndex((item) => item.id === keyId);
  }

  _setHighlightType(type) {
    this._currentHighlightType = type;
    this._startColorsFunctionByType[type]();
    this._updateStartColors();

    this._resetScale();

    if (KEYS_HIGHLIGHT_CONFIG[type].scaleChange) {
      this._setStartScale(SCALE_ZERO);
    }

    this._time = 0;
    this._updateTypeHighlightIndex = 0;
  }

  _getNextHighlightType() {
    const index = KEYS_HIGHLIGHT_TYPE_ORDER.indexOf(this._currentHighlightType);
    const nextType = KEYS_HIGHLIGHT_TYPE_ORDER[index + 1];

    if (nextType) {
      return nextType;
    }

    return KEYS_HIGHLIGHT_TYPE_ORDER[0];
  }

  _resetScale() {
    this._activeHighlightScale.forEach((highlightObject) => {
      highlightObject.tween.stop();
    });

    this._activeHighlightScale = [];

    this._setStartScale(1);
  }

  _init() {
    this._initHighlightsInstanceMesh();
    this._setHighlightsPosition();
    this._initStartHSLAngle();
    this._initFunctionsByType();

    this._setHighlightType(this._currentHighlightType);
  }

  _initHighlightsInstanceMesh() {
    const size = KEY_HIGHLIGHT_CONFIG.size;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    const highlightsCount = this._highlightsCount = KEYS_CONFIG.length;
    const view = this._view = new THREE.InstancedMesh(geometry, material, highlightsCount);
    this.add(view);
  }

  _setHighlightsPosition() {
    this._view.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const dummy = new THREE.Object3D();

    const keyboardSize = KEYBOARD_CONFIG.size;
    const offsetLeft = KEYBOARD_CONFIG.keys.offsetX;
    const offsetTop = KEYBOARD_CONFIG.keys.offsetZ;

    const leftX = -keyboardSize.x * 0.5 + offsetLeft;
    const heightY = keyboardSize.y * 0.5;
    const topZ = -keyboardSize.z * 0.5 + offsetTop;

    for (let i = 0; i < this._highlightsCount; i += 1) {
      const highlightPosition = KEYS_CONFIG[i].position;

      dummy.position.set(leftX + highlightPosition.x, heightY + highlightPosition.y, topZ - highlightPosition.z);
      dummy.rotation.x = -Math.PI * 0.5 + KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
      dummy.updateMatrix();

      this._view.setMatrixAt(i, dummy.matrix);
      this._view.setColorAt(i, new THREE.Color(0xffffff));
    }

    this._view.instanceMatrix.needsUpdate = true;
    this._view.instanceColor.needsUpdate = true;
  }

  _setStartScale(scaleValue) {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    for (let i = 0; i < this._highlightsCount; i += 1) {
      this._view.getMatrixAt(i, matrix);
      matrix.decompose(position, rotation, scale);

      scale.x = scale.y = scaleValue;

      matrix.compose(position, rotation, scale);
      this._view.setMatrixAt(i, matrix);
    }

    this._view.instanceMatrix.needsUpdate = true;
  }

  _initStartHSLAngle() {
    for (let i = 0; i < this._highlightsCount; i += 1) {
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
      [KEYS_HIGHLIGHT_TYPE.FromLeftToRight]: () => this._colorsFromLeftToRight(),
      [KEYS_HIGHLIGHT_TYPE.FromTopToBottom]: () => this._colorsFromTopToBottom(),
      [KEYS_HIGHLIGHT_TYPE.SameColor]: () => this._colorsSameColor(),
      [KEYS_HIGHLIGHT_TYPE.FromCenterToSides]: () => this._colorsFromCenterToSides(),
      [KEYS_HIGHLIGHT_TYPE.RandomColors]: () => this._colorsRandomColors(),
      [KEYS_HIGHLIGHT_TYPE.HighlightFromFirstToLastKey]: () => this._colorsRandomColors(),
      [KEYS_HIGHLIGHT_TYPE.PressedKey]: () => this._colorsRandomColors(),
      [KEYS_HIGHLIGHT_TYPE.PressedKeyToSides]: () => this._colorsRandomColors(),
      [KEYS_HIGHLIGHT_TYPE.PressedKeyToSidesSingleRow]: () => this._colorsRandomColors(),
    }
  }

  _initKeyPressedFunctionByType() {
    this._keyPressedFunctionByType = {
      [KEYS_HIGHLIGHT_TYPE.PressedKey]: (keyId) => this._pressedKeyHighlight(keyId),
      [KEYS_HIGHLIGHT_TYPE.PressedKeyToSides]: (keyId) => this._pressedKeyToSides(keyId),
      [KEYS_HIGHLIGHT_TYPE.PressedKeyToSidesSingleRow]: (keyId) => this._pressedKeyToSidesSingleRow(keyId),
    }
  }

  _initUpdateFunctionByType() {
    this._updateFunctionByType = {
      [KEYS_HIGHLIGHT_TYPE.HighlightFromFirstToLastKey]: (dt) => this._highlightFromFirstToLastKeyLogic(dt),
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

  _pressedKeyHighlight(keyId) {
    this._showKeyHighlight(keyId, this._toZeroTween, 1, 3000, 0);
  }

  _pressedKeyToSides(keyId) {
    const pressedKeyConfig = KEYS_CONFIG[keyId];
    const step = 0.1;

    let index = 0;

    for (let x = pressedKeyConfig.position.x; x < KEYBOARD_CONFIG.size.x; x += step) {
      this._showHighlightClosestKeyToX(x, index);

      index += 1;
    }

    index = 1;

    for (let x = pressedKeyConfig.position.x - step; x > 0; x -= step) {
      this._showHighlightClosestKeyToX(x, index);

      index += 1;
    }
  }

  _showHighlightClosestKeyToX(x, index) {
    for (let row = 0; row < KEYS_ID_BY_ROW.length; row += 1) {
      const closestKeyId = this._getClosestKeyByX(x, row);

      if (closestKeyId !== null) {
        this._showKeyHighlight(closestKeyId, this._from0To1YoyoTween, SCALE_ZERO, 300, index * 50);
      }
    }
  }

  _pressedKeyToSidesSingleRow(keyId) {
    const pressedKeyPosition = KEYS_CONFIG[keyId].position;

    this._showKeyHighlight(keyId, this._from0To1YoyoTween, SCALE_ZERO, 300, 0);

    let index = 1;

    for (let i = keyId + 1; i < KEYS_CONFIG.length; i++) {
      if (KEYS_CONFIG[i].position.z === pressedKeyPosition.z) {
        this._showKeyHighlight(i, this._from0To1YoyoTween, SCALE_ZERO, 300, index * 50);
        index += 1;
      } else {
        break;
      }
    }

    index = 1;

    for (let i = keyId - 1; i > 0; i--) {
      if (KEYS_CONFIG[i].position.z === pressedKeyPosition.z) {
        this._showKeyHighlight(i, this._from0To1YoyoTween, SCALE_ZERO, 300, index * 50);
        index += 1;
      } else {
        break;
      }
    }
  }

  _highlightFromFirstToLastKeyLogic(dt) {
    this._time += dt;

    if (this._time > 0.08) {
      this._time = 0;

      this._showKeyHighlight(this._updateTypeHighlightIndex, this._from0To1YoyoTween, SCALE_ZERO, 1200, 0);

      this._updateTypeHighlightIndex += 1;

      if (this._updateTypeHighlightIndex >= this._highlightsCount) {
        this._updateTypeHighlightIndex = 0;
      }
    }
  }

  _toZeroTween(object, time) {
    return new TWEEN.Tween(object)
      .to({ value: SCALE_ZERO }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  _from0To1YoyoTween(object, time, delay) {
    return new TWEEN.Tween(object)
      .to({ value: 1 }, time)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .delay(delay)
      .repeatDelay(0)
      .yoyo(true)
      .repeat(1)
      .start();
  }

  _setColorsArray(callback) {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    for (let i = 0; i < this._highlightsCount; i += 1) {
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
    for (let i = 0; i < this._highlightsCount; i += 1) {
      const color = new THREE.Color(`hsl(${this._HSLAngle[i]}, 100%, 50%)`);
      this._view.setColorAt(i, color);
    }

    this._view.instanceColor.needsUpdate = true;
  }

  _getClosestKeyByX(x, row) {
    const minDistance = 0.05;
    const rowIds = KEYS_ID_BY_ROW[row];

    let closestKeyId = null;
    let distance = Infinity;

    for (let i = rowIds[0]; i <= rowIds[rowIds.length - 1]; i++) {
      const keyConfig = KEYS_CONFIG[i];
      const currentDistance = Math.abs(keyConfig.position.x - x);

      if (currentDistance < distance) {
        distance = currentDistance;
        closestKeyId = i;
      }
    }

    return distance < minDistance ? closestKeyId : null;
  }
}
