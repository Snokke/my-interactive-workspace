import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../data/room-config';
import { KEYBOARD_PART_ACTIVITY_CONFIG, KEYBOARD_PART_TYPE, KEY_COLOR_CONFIG } from './keyboard-data';
import KeysBacklight from './keys-backlight/keys-backlight';
import Loader from '../../../../core/loader';
import { KEYS_CONFIG, KEYS_ID_BY_ROW } from './keys-config';
import { KEYBOARD_CONFIG } from './keyboard-config';
import { getClosestKeyByX } from './keys-helper';

const SCALE_ZERO = 0.01;

export default class Keyboard extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._keysGroup = null;
    this._keysBacklight = null;
    this._keysCount = 0;
    this._keysTweens = [];
    this._keysHighlightTweens = [];
    this._keysStartPosition = [];

    this._init();
  }

  update(dt) {
    this._keysBacklight.update(dt);
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    this._keysBacklight.hide();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const base = this._parts[KEYBOARD_PART_TYPE.Base];

      new TWEEN.Tween(base.position)
        .to({ y: base.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start()
        .onComplete(() => {
          this._showKeysAnimation();
        });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (partType === KEYBOARD_PART_TYPE.Base) {
      this._keysBacklight.switchType();
    }

    if (partType === KEYBOARD_PART_TYPE.Keys) {
      this._onKeyClick(intersect);
    }
  }

  onPointerOver(intersect) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const roomObject = intersect.object;
    const type = roomObject.userData.partType;

    if (type === KEYBOARD_PART_TYPE.Keys) {
      this._showKeyHighlight(intersect);
    }
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    this._stopHighlightTweens();
    this._setKeysDefaultColors();
  }

  getMeshesForOutline(mesh) {
    return [mesh];
  }

  _onKeyClick(intersect) {
    const keyId = intersect.instanceId;

    if (this._keysTweens[keyId] && this._keysTweens[keyId].isPlaying()) {
      this._keysTweens[keyId].stop();
    }

    this._onActiveKeysClick(keyId);
    this._keysBacklight.onKeyClick(keyId);

    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];
    const keysAngle = KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
    const keyStartPosition = this._keysStartPosition[keyId];

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    keys.getMatrixAt(keyId, matrix);
    position.setFromMatrixPosition(matrix);

    const movingDistance = { value: 0 };

    this._keysTweens[keyId] = new TWEEN.Tween(movingDistance)
      .to({ value: KEYBOARD_CONFIG.keys.movingDistance }, 80)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        position.y = keyStartPosition.y - Math.cos(keysAngle) * movingDistance.value;
        position.z = keyStartPosition.z - Math.sin(keysAngle) * movingDistance.value;
        matrix.setPosition(position);

        keys.setMatrixAt(keyId, matrix);
        keys.instanceMatrix.needsUpdate = true;
      })
      .yoyo(true)
      .repeat(1)
      .start();
  }

  _onActiveKeysClick(keyId) {
    if (keyId === 15) { // Change backlight type key
      this._keysBacklight.switchType();
    }

    if (keyId === 0) { // ESC
      this.events.post('onKeyboardEscClick');
    }

    if (keyId === 79) { // Space
      this.events.post('onKeyboardBackspaceClick');
    }
  }

  _showKeyHighlight(intersect) {
    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];
    const keyId = intersect.instanceId;
    const keyConfig = KEYS_CONFIG[keyId];
    const keyColor = KEY_COLOR_CONFIG[keyConfig.colorType];
    const highlightColor = new THREE.Color(KEYBOARD_CONFIG.keys.highlightColor);
    const startColor = new THREE.Color().lerpColors(keyColor, highlightColor, 0.2);

    const object = { value: 0 };

    this._keysHighlightTweens[keyId] = new TWEEN.Tween(object)
      .to({ value: 1 }, 700)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .yoyo(true)
      .repeat(Infinity)
      .start()
      .onUpdate(() => {
        const color = new THREE.Color().lerpColors(startColor, highlightColor, object.value);

        keys.setColorAt(keyId, color);
        keys.instanceColor.needsUpdate = true;
      });
  }

  _showKeysAnimation() {
    this._setKeysScaleZero();

    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];
    keys.visible = true;

    const step = 0.09;
    let index = 0;

    for (let x = 0; x < KEYBOARD_CONFIG.size.x; x += step) {
      for (let row = 0; row < KEYS_ID_BY_ROW.length; row += 1) {
        const closestKeyId = getClosestKeyByX(x, row);

        if (closestKeyId !== null) {
          this._showKey(closestKeyId, index * 40);
        }
      }

      index += 1;
    }

    Delayed.call(720 + 180, () => {
      this._keysBacklight.show();

      this._debugMenu.enable();
      this._onShowAnimationComplete();
    });
  }

  _showKey(keyId, delay) {
    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const keyConfig = KEYS_CONFIG[keyId];

    const scaleObject = { value: 0 };

    keys.getMatrixAt(keyId, matrix);
    matrix.decompose(position, rotation, scale);

    new TWEEN.Tween(scaleObject)
      .to({ value: 1 }, 180)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(delay)
      .onUpdate(() => {
        scale.set(scaleObject.value * keyConfig.scaleX, scaleObject.value, scaleObject.value);

        matrix.compose(position, rotation, scale);
        keys.setMatrixAt(keyId, matrix);
        keys.instanceMatrix.needsUpdate = true;
      })
      .start();
  }

  _setKeysScaleZero() {
    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    for (let i = 0; i < this._keysCount; i++) {
      keys.getMatrixAt(i, matrix);
      matrix.decompose(position, rotation, scale);

      scale.set(SCALE_ZERO, SCALE_ZERO, SCALE_ZERO);

      matrix.compose(position, rotation, scale);
      keys.setMatrixAt(i, matrix);
    }

    keys.instanceMatrix.needsUpdate = true;
  }

  _setKeysDefaultColors() {
    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];

    for (let i = 0; i < this._keysCount; i++) {
      const keyConfig = KEYS_CONFIG[i];
      const color = KEY_COLOR_CONFIG[keyConfig.colorType];
      keys.setColorAt(i, color);
    }

    keys.instanceColor.needsUpdate = true;
  }

  _stopHighlightTweens() {
    this._keysHighlightTweens.forEach((tween) => {
      if (tween && tween.isPlaying()) {
        tween.stop();
      }
    });
  }

  _setPositionForShowAnimation() {
    const base = this._parts[KEYBOARD_PART_TYPE.Base];
    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];

    base.position.y = base.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;
    keys.visible = false;
  }

  _init() {
    this._initParts();
    this._initKeysBacklight();

    this._addMaterials();
    this._addPartsToScene();
    this._initKeys();
    this._initDebugMenu();
    this._initSignals();

    if (!ROOM_CONFIG.startAnimation.showOnStart) {
      this._keysBacklight.show();
    }
  }

  _addMaterials() {
    for (const partName in this._parts) {
      const part = this._parts[partName];
      const material = new THREE.MeshStandardMaterial({
        // color: `hsl(${Math.random() * 360}, 80%, 50%)`,
        color: 0x111111,
      });

      part.material = material;
    }
  }

  _initKeys() {
    this._initKeysGroup();
    this._initInstancedKeys();
    this._setKeysPositions();
  }

  _initKeysGroup() {
    const keysGroup = this._keysGroup = new THREE.Group();
    this.add(keysGroup);

    const base = this._parts[KEYBOARD_PART_TYPE.Base];
    keysGroup.position.copy(base.position);
  }

  _initInstancedKeys() {
    const keyModel = Loader.assets['keyboard-key'];
    const keyMesh = keyModel.scene.children[0];
    const geometry = keyMesh.geometry;

    const material = new THREE.MeshStandardMaterial();

    const keysCount = this._keysCount = KEYS_CONFIG.length;

    const keys = new THREE.InstancedMesh(geometry, material, keysCount);
    this._keysGroup.add(keys);

    KEYBOARD_PART_TYPE['Keys'] = 'keyboard_keys';
    this._parts[KEYBOARD_PART_TYPE.Keys] = keys;

    KEYBOARD_PART_ACTIVITY_CONFIG[KEYBOARD_PART_TYPE.Keys] = true;

    keys.name = KEYBOARD_PART_TYPE.Keys;
    keys.userData['isActive'] = true;
    keys.userData['objectType'] = this._roomObjectType;
    keys.userData['partType'] = KEYBOARD_PART_TYPE.Keys;

    this._allMeshes.push(keys);
    this._activeMeshes.push(keys);
  }

  _setKeysPositions() {
    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];
    keys.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();

    const keyboardSize = KEYBOARD_CONFIG.size;
    const offsetLeft = KEYBOARD_CONFIG.keys.offsetX;
    const offsetTop = KEYBOARD_CONFIG.keys.offsetZ;

    const leftX = -keyboardSize.x * 0.5 + offsetLeft;
    const heightY = keyboardSize.y * 0.5;
    const topZ = -keyboardSize.z * 0.5 + offsetTop;

    for (let i = 0; i < this._keysCount; i += 1) {
      const keyConfig = KEYS_CONFIG[i];

      dummy.position.set(leftX + keyConfig.position.x, heightY + keyConfig.position.y, topZ - keyConfig.position.z);
      dummy.rotation.x = KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
      dummy.scale.set(keyConfig.scaleX, 1, 1);
      dummy.translateOnAxis(new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD), KEYBOARD_CONFIG.keys.offsetYFromKeyboard);

      dummy.updateMatrix();

      keys.setMatrixAt(i, dummy.matrix);

      const color = KEY_COLOR_CONFIG[keyConfig.colorType];
      keys.setColorAt(i, color);

      this._keysTweens.push();
      this._keysHighlightTweens.push();
      this._keysStartPosition.push(dummy.position.clone());
    }

    keys.instanceMatrix.needsUpdate = true;
    keys.instanceColor.needsUpdate = true;
  }

  _initKeysBacklight() {
    const keysBacklight = this._keysBacklight = new KeysBacklight();
    this.add(keysBacklight);

    const base = this._parts[KEYBOARD_PART_TYPE.Base];
    keysBacklight.position.copy(base.position);
  }

  _initSignals() {
    this._debugMenu.events.on('onChangeBacklightType', () => this._keysBacklight.switchType());
    this._debugMenu.events.on('onSetBacklightType', (msg, selectedBacklightType) => this._keysBacklight.setBacklightType(selectedBacklightType));
    this._keysBacklight.events.on('keysBacklightTypeChanged', () => this._debugMenu.updateBacklightType());
  }
}
