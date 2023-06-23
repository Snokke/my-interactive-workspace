import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Loader from '../../../../../core/loader';
import vertexShader from './keys-symbols-shaders/keys-symbols-vertex.glsl';
import fragmentShader from './keys-symbols-shaders/keys-symbols-fragment.glsl';
import { KEYS_CONFIG } from '../data/keys-config';
import { KEYBOARD_CONFIG } from '../data/keyboard-config';
import { KEYS_SYMBOLS_CONFIG } from './keys-symbols-config';

export default class KeysSymbols extends THREE.Group {
  constructor() {
    super();

    this._view = null;
    this._keysCount = KEYS_CONFIG.length;

    this._keysDownTweens = [];
    this._keysUpTweens = [];
    this._keysStartPosition = [];
    this._keysActiveSaturation = [];
    this._keysSaturation = [];
    this._HSLAngle = [];

    this._init();
  }

  updateHSLAngle(HSLAngle) {
    this._HSLAngle = HSLAngle;
    this._updateColor();
  }

  updateSaturation(activeKeysSaturation) {
    this._keysActiveSaturation = activeKeysSaturation;
    this._updateColor();
  }

  _updateColor() {
    this._keysActiveSaturation.forEach(({ id, value }) => {
      this._keysSaturation[id] = value;
    });

    for (let i = 0; i < this._keysCount; i += 1) {
      const saturation = this._keysSaturation[i] * 100;
      const angle = this._HSLAngle[i];

      const color = new THREE.Color(`hsl(${angle}, ${saturation}%, 50%)`);
      this._view.setColorAt(i, color);
    }

    this._view.instanceColor.needsUpdate = true;
  }

  onKeyPressDown(keyId) {
    if (this._keysDownTweens[keyId] && this._keysDownTweens[keyId].isPlaying()) {
      this._keysDownTweens[keyId].stop();
    }

    const keysAngle = KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
    const keyStartPosition = this._keysStartPosition[keyId];

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    this._view.getMatrixAt(keyId, matrix);
    position.setFromMatrixPosition(matrix);

    const movingDistance = { value: 0 };

    this._keysDownTweens[keyId] = new TWEEN.Tween(movingDistance)
      .to({ value: KEYBOARD_CONFIG.keys.movingDistance }, 80)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        position.y = keyStartPosition.y - Math.cos(keysAngle) * movingDistance.value;
        position.z = keyStartPosition.z - Math.sin(keysAngle) * movingDistance.value;
        matrix.setPosition(position);

        this._view.setMatrixAt(keyId, matrix);
        this._view.instanceMatrix.needsUpdate = true;
      })
      .start();
  }

  onKeyPressUp(keyId) {
    if (this._keysUpTweens[keyId] && this._keysUpTweens[keyId].isPlaying()) {
      this._keysUpTweens[keyId].stop();
    }

    const keysAngle = KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
    const keyStartPosition = this._keysStartPosition[keyId];

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    this._view.getMatrixAt(keyId, matrix);
    position.setFromMatrixPosition(matrix);

    const movingDistance = { value: KEYBOARD_CONFIG.keys.movingDistance };

    this._keysUpTweens[keyId] = new TWEEN.Tween(movingDistance)
      .to({ value: 0 }, 80)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        position.y = keyStartPosition.y - Math.cos(keysAngle) * movingDistance.value;
        position.z = keyStartPosition.z - Math.sin(keysAngle) * movingDistance.value;
        matrix.setPosition(position);

        this._view.setMatrixAt(keyId, matrix);
        this._view.instanceMatrix.needsUpdate = true;
      })
      .start();
  }

  _init() {
    this._initInstanceMesh();
    this._setPositionsAndColors();
  }

  _initInstanceMesh() {
    const texture = Loader.assets['keyboard/keyboard-keys-atlas'];

    const geometry = new THREE.PlaneGeometry();
    const instancedGeometry = new THREE.InstancedBufferGeometry().copy(geometry);

    const uvOffset = this._getUVOffsetArray();
    instancedGeometry.setAttribute("uvOffset", new THREE.InstancedBufferAttribute(uvOffset, 2));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uAtlasSize: { value: KEYS_SYMBOLS_CONFIG.atlasSize },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    const view = this._view = new THREE.InstancedMesh(instancedGeometry, material, this._keysCount);
    this.add(view);
  }

  _getUVOffsetArray() {
    const uvOffset = new Float32Array(this._keysCount * 2);
    const atlasSize = KEYS_SYMBOLS_CONFIG.atlasSize;

    let index = 0;

    for (let row = 0; row < atlasSize; row++) {
      for (let column = 0; column < atlasSize; column++) {
        uvOffset[row * atlasSize * 2 + (column * 2 + 0)] = column / atlasSize;
        uvOffset[row * atlasSize * 2 + (column * 2 + 1)] = row / atlasSize;

        index += 1;

        if (index === this._keysCount) {
          break;
        }
      }
    }

    return uvOffset;
  }

  _setPositionsAndColors() {
    this._view.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();

    const keyboardSize = KEYBOARD_CONFIG.size;
    const offsetLeft = KEYBOARD_CONFIG.keys.offsetX;
    const offsetTop = KEYBOARD_CONFIG.keys.offsetZ;
    const offsetY = KEYBOARD_CONFIG.keys.offsetY;

    const leftX = -keyboardSize.x * 0.5 + offsetLeft;
    const heightY = keyboardSize.y * 0.5 + offsetY;
    const topZ = -keyboardSize.z * 0.5 + offsetTop;

    const keyboardAngle = KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;

    dummy.scale.set(KEYS_SYMBOLS_CONFIG.size, KEYS_SYMBOLS_CONFIG.size, 1);

    for (let i = 0; i < this._keysCount; i += 1) {
      const keyConfig = KEYS_CONFIG[i];

      dummy.position.set(leftX + keyConfig.position.x - 0.005, heightY + keyConfig.position.y, topZ - keyConfig.position.z + 0.004);
      dummy.rotation.x = -Math.PI * 0.5 + keyboardAngle;
      dummy.translateOnAxis(new THREE.Vector3(0, 0, 1)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), keyboardAngle), KEYBOARD_CONFIG.keys.offsetYFromKeyboard + KEYS_SYMBOLS_CONFIG.offsetY);

      dummy.updateMatrix();

      this._view.setMatrixAt(i, dummy.matrix);
      this._view.setColorAt(i, new THREE.Color('#ffffff'));

      this._keysDownTweens.push();
      this._keysUpTweens.push();
      this._keysStartPosition.push(dummy.position.clone());
      this._HSLAngle.push(0);
      this._keysSaturation.push(0);
    }

    this._view.instanceMatrix.needsUpdate = true;
    this._view.instanceColor.needsUpdate = true;
  }
}
