import * as THREE from 'three';
import vertexShader from './key-highlight-shaders/key-highlight-vertex.glsl';
import fragmentShader from './key-highlight-shaders/key-highlight-fragment.glsl';
import { KEYBOARD_CONFIG } from '../keyboard-config';
import { KEYS_HIGHLIGHT_CONFIG, KEYS_HIGHLIGHT_TYPE, KEYS_HIGHLIGHT_TYPE_ORDER, KEY_HIGHLIGHT_CONFIG } from './key-highlights-config';
import { Vector2 } from 'three';
import { KEYS_CONFIG } from '../keys-config';

export default class KeyHighlights extends THREE.Group {
  constructor() {
    super();

    this._currentHighlightType = KEYS_HIGHLIGHT_TYPE.FromLeftToRight;
    this._setStartColorsByType = {};
    this._highlightsCount = 0;
    this._time = 0;

    this._HSLAngle = [];

    this._init();
  }

  update(dt) {
    const config = KEYS_HIGHLIGHT_CONFIG[this._currentHighlightType];

    for (let i = 0; i < this._highlightsCount; i += 1) {
      this._HSLAngle[i] += config.changeColorSpeed * config.direction * (dt * 60);

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

  switchType() {
    const nextType = this._getNextHighlightType();
    this.setHighlightType(nextType);
  }

  _getNextHighlightType() {
    const index = KEYS_HIGHLIGHT_TYPE_ORDER.indexOf(this._currentHighlightType);
    const nextType = KEYS_HIGHLIGHT_TYPE_ORDER[index + 1];

    if (nextType) {
      return nextType;
    }

    return KEYS_HIGHLIGHT_TYPE_ORDER[0];
  }

  setHighlightType(type) {
    this._currentHighlightType = type;
    this._setStartColorsByType[type]();
  }

  _init() {
    this._initHighlightsInstanceMesh();
    this._setHighlightsPosition();
    this._initStartHSLAngle();
    this._initConfigByHighlightType();

    this.setHighlightType(this._currentHighlightType);
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

      const randomColor = new THREE.Color(0xff0000);
      this._view.setColorAt(i, randomColor);
    }

    this._view.instanceMatrix.needsUpdate = true;
    this._view.instanceColor.needsUpdate = true;
  }

  _initStartHSLAngle() {
    for (let i = 0; i < this._highlightsCount; i += 1) {
      this._HSLAngle.push(0);
    }
  }

  _initConfigByHighlightType() {
    this._setStartColorsByType = {
      [KEYS_HIGHLIGHT_TYPE.FromLeftToRight]: () => this._colorsFromLeftToRight(),
      [KEYS_HIGHLIGHT_TYPE.FromTopToBottom]: () => this._colorsFromTopToBottom(),
    }
  }

  _colorsFromLeftToRight() {
    this._setColors((normalizedPosition) => {
      return normalizedPosition.x * 360;
    });
  }

  _colorsFromTopToBottom() {
    this._setColors((normalizedPosition) => {
      return normalizedPosition.y * 0.5 * 360;
    });
  }

  _setColors(callback) {
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
}
