import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG, SCALE_ZERO } from '../../data/room-config';
import { KEYBOARD_PART_ACTIVITY_CONFIG, KEYBOARD_PART_TYPE, KEY_COLOR_CONFIG } from './data/keyboard-data';
import KeysBacklight from './keys-backlight/keys-backlight';
import Loader from '../../../../core/loader';
import { KEYS_CONFIG, KEYS_ID_BY_ROW } from './data/keys-config';
import { KEYBOARD_CONFIG } from './data/keyboard-config';
import { getClosestKeyByX } from './data/keys-helper';
import SoundHelper from '../../shared-objects/sound-helper';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import { Black } from 'black-engine';

export default class Keyboard extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._keysGroup = null;
    this._keysBacklight = null;
    this._soundHelper = null;

    this._keySounds = [];
    this._keySoundIndex = 0;
    this._keysCount = 0;
    this._keysDownTweens = [];
    this._keysUpTweens = [];
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
      this.visible = true;

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
      this.events.post('onKeyboardBaseClick');
    }

    if (partType === KEYBOARD_PART_TYPE.Keys) {
      const keyId = intersect.instanceId;
      if (keyId !== 79) {
        this._onKeyClick(keyId);
      }
    }

    if (partType === KEYBOARD_PART_TYPE.SpaceKey) {
      this._onSpaceKeyClick(intersect);
    }

    if (partType === KEYBOARD_PART_TYPE.CloseFocusIcon) {
      this.events.post('onCloseFocusIconClick')
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
      if (intersect.instanceId !== 79) {
        this._showKeyHighlight(intersect);
      }
    }

    if (type === KEYBOARD_PART_TYPE.SpaceKey) {
      this._showSpaceKeyHighlight();
    }

    if (type === KEYBOARD_PART_TYPE.Base) {
      Black.engine.containerElement.style.cursor = 'zoom-in';
    }
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    this._stopHighlightTweens();
    this._setKeysDefaultColors();
    this._setSpaceKeyDefaultColor();
  }

  getMeshesForOutline(mesh) {
    return [mesh];
  }

  onVolumeChanged(volume) {
    this._globalVolume = volume;

    if (this._isSoundsEnabled) {
      this._keySounds.forEach((sound) => {
        sound.setVolume(this._globalVolume * this._objectVolume);
      });
    }
  }

  enableSound() {
    this._isSoundsEnabled = true;

    this._keySounds.forEach((sound) => {
      sound.setVolume(this._globalVolume * this._objectVolume);
    });
  }

  disableSound() {
    this._isSoundsEnabled = false;

    this._keySounds.forEach((sound) => {
      sound.setVolume(0);
    });
  }

  getFocusPosition() {
    const keyboardGlobalPosition = new THREE.Vector3();
    const base = this._parts[KEYBOARD_PART_TYPE.Base];
    base.getWorldPosition(keyboardGlobalPosition);

    return keyboardGlobalPosition;
  }

  setBaseActive() {
    this._parts[KEYBOARD_PART_TYPE.Base].userData.isActive = true;
  }

  setBaseInactive() {
    this._parts[KEYBOARD_PART_TYPE.Base].userData.isActive = false;
  }

  showCloseFocusIcon() {
    const closeFocusIcon = this._parts[KEYBOARD_PART_TYPE.CloseFocusIcon];
    closeFocusIcon.visible = true;
    closeFocusIcon.scale.set(0, 0, 0);

    if (this._closeFocusIconTween) {
      this._closeFocusIconTween.stop();
    }

    this._closeFocusIconTween = new TWEEN.Tween(closeFocusIcon.scale)
      .to({ x: 1, y: 1, z: 1 }, 200)
      .easing(TWEEN.Easing.Back.Out)
      .delay(100)
      .start();
  }

  hideCloseFocusIcon() {
    const closeFocusIcon = this._parts[KEYBOARD_PART_TYPE.CloseFocusIcon];

    if (this._closeFocusIconTween) {
      this._closeFocusIconTween.stop();
    }

    this._closeFocusIconTween = new TWEEN.Tween(closeFocusIcon.scale)
      .to({ x: 0, y: 0, z: 0 }, 200)
      .easing(TWEEN.Easing.Back.In)
      .start()
      .onComplete(() => {
        closeFocusIcon.visible = false;
      });
  }

  _onKeyClick(keyId) {
    this._onKeyPressDown(keyId);

    this._keysDownTweens[keyId].onComplete(() => {
      this._onKeyPressUp(keyId);
    });
  }

  _onKeyPressDown(keyId) {
    this._playSound(keyId);

    if (this._keysDownTweens[keyId] && this._keysDownTweens[keyId].isPlaying()) {
      this._keysDownTweens[keyId].stop();
    }

    this._onActiveKeysClick(keyId);
    this._keysBacklight.onKeyPressDown(keyId);

    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];
    const keysAngle = KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
    const keyStartPosition = this._keysStartPosition[keyId];

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    keys.getMatrixAt(keyId, matrix);
    position.setFromMatrixPosition(matrix);

    const movingDistance = { value: 0 };

    this._keysDownTweens[keyId] = new TWEEN.Tween(movingDistance)
      .to({ value: KEYBOARD_CONFIG.keys.movingDistance }, 80)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        position.y = keyStartPosition.y - Math.cos(keysAngle) * movingDistance.value;
        position.z = keyStartPosition.z - Math.sin(keysAngle) * movingDistance.value;
        matrix.setPosition(position);

        keys.setMatrixAt(keyId, matrix);
        keys.instanceMatrix.needsUpdate = true;
      })
      .start();
  }

  _onKeyPressUp(keyId) {
    if (this._keysUpTweens[keyId] && this._keysUpTweens[keyId].isPlaying()) {
      this._keysUpTweens[keyId].stop();
    }

    this._keysBacklight.onKeyPressUp(keyId);

    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];
    const keysAngle = KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
    const keyStartPosition = this._keysStartPosition[keyId];

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();

    keys.getMatrixAt(keyId, matrix);
    position.setFromMatrixPosition(matrix);

    const movingDistance = { value: KEYBOARD_CONFIG.keys.movingDistance };

    this._keysUpTweens[keyId] = new TWEEN.Tween(movingDistance)
      .to({ value: 0 }, 80)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        position.y = keyStartPosition.y - Math.cos(keysAngle) * movingDistance.value;
        position.z = keyStartPosition.z - Math.sin(keysAngle) * movingDistance.value;
        matrix.setPosition(position);

        keys.setMatrixAt(keyId, matrix);
        keys.instanceMatrix.needsUpdate = true;
      })
      .start();
  }

  _onSpaceKeyClick() {
    this._onSpaceKeyPressDown();

    this._keysDownTweens[79].onComplete(() => {
      this._onSpaceKeyPressUp();
    });
  }

  _onSpaceKeyPressDown() {
    const keyId = 79;
    this._playSound(keyId);

    if (this._keysDownTweens[keyId] && this._keysDownTweens[keyId].isPlaying()) {
      this._keysDownTweens[keyId].stop();
    }

    this._onActiveKeysClick(keyId);
    this._keysBacklight.onKeyPressDown(keyId);

    const spaceKey = this._parts[KEYBOARD_PART_TYPE.SpaceKey];
    const keysAngle = KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
    const keyStartPosition = this._keysStartPosition[keyId];

    const position = new THREE.Vector3();
    position.copy(spaceKey.position);

    const movingDistance = { value: 0 };

    this._keysDownTweens[keyId] = new TWEEN.Tween(movingDistance)
      .to({ value: KEYBOARD_CONFIG.keys.movingDistance }, 80)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        position.y = keyStartPosition.y - Math.cos(keysAngle) * movingDistance.value;
        position.z = keyStartPosition.z - Math.sin(keysAngle) * movingDistance.value;

        spaceKey.position.copy(position);
      })
      .start();
  }

  _onSpaceKeyPressUp() {
    const keyId = 79;

    if (this._keysUpTweens[keyId] && this._keysUpTweens[keyId].isPlaying()) {
      this._keysUpTweens[keyId].stop();
    }

    this._keysBacklight.onKeyPressUp(keyId);

    const spaceKey = this._parts[KEYBOARD_PART_TYPE.SpaceKey];
    const keysAngle = KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
    const keyStartPosition = this._keysStartPosition[keyId];

    const position = new THREE.Vector3();
    position.copy(spaceKey.position);

    const movingDistance = { value: KEYBOARD_CONFIG.keys.movingDistance };

    this._keysUpTweens[keyId] = new TWEEN.Tween(movingDistance)
      .to({ value: 0 }, 80)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        position.y = keyStartPosition.y - Math.cos(keysAngle) * movingDistance.value;
        position.z = keyStartPosition.z - Math.sin(keysAngle) * movingDistance.value;

        spaceKey.position.copy(position);
      })
      .start();
  }

  _onActiveKeysClick(keyId) {
    const keysAction = {
      0: () => this.events.post('onKeyboardEscClick'), // ESC
      79: () => this.events.post('onKeyboardSpaceClick'), // Space
      15: () => this._keysBacklight.switchType(), // Backlight

      10: () => this.events.post('onKeyboardMuteClick'), // F10 - Mute
      11: () => this.events.post('onKeyboardVolumeDownClick'), // F11 - Volume Down
      12: () => this.events.post('onKeyboardVolumeUpClick'), // F12 - Volume Up

      7: () => this.events.post('onKeyboardPreviousTrackClick'), // F7 - Previous Track
      8: () => this.events.post('onKeyboardPlayPauseClick'), // F8 - Play/Pause
      9: () => this.events.post('onKeyboardNextTrackClick'), // F9 - Next Track
    };

    if (keysAction[keyId]) {
      keysAction[keyId]();
    }
  }

  _showKeyHighlight(intersect) {
    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];
    const keyId = intersect.instanceId;
    const keyConfig = KEYS_CONFIG[keyId];
    const keyColor = KEY_COLOR_CONFIG[keyConfig.colorType];
    const highlightColor = new THREE.Color(KEYBOARD_CONFIG.keys.highlightColor);
    const startColor = new THREE.Color().lerpColors(keyColor, highlightColor, 0.5);

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

  _showSpaceKeyHighlight() {
    const spaceKey = this._parts[KEYBOARD_PART_TYPE.SpaceKey];
    const keyId = 79
    const keyConfig = KEYS_CONFIG[keyId];
    const keyColor = KEY_COLOR_CONFIG[keyConfig.colorType];
    const highlightColor = new THREE.Color(KEYBOARD_CONFIG.keys.highlightColor);
    const startColor = new THREE.Color().lerpColors(keyColor, highlightColor, 0.5);

    const object = { value: 0 };

    this._keysHighlightTweens[keyId] = new TWEEN.Tween(object)
      .to({ value: 1 }, 700)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .yoyo(true)
      .repeat(Infinity)
      .start()
      .onUpdate(() => {
        const color = new THREE.Color().lerpColors(startColor, highlightColor, object.value);

        spaceKey.material.color = color;
      });
  }

  _showKeysAnimation() {
    this._setKeysScaleZero();
    this._setSpaceKeyScaleZero();

    const keys = this._parts[KEYBOARD_PART_TYPE.Keys];
    keys.visible = true;

    const step = 0.09;
    let index = 0;

    for (let x = 0; x < KEYBOARD_CONFIG.size.x; x += step) {
      for (let row = 0; row < KEYS_ID_BY_ROW.length; row += 1) {
        const closestKeyId = getClosestKeyByX(x, row);

        if (closestKeyId !== null) {
          if (closestKeyId === 79) {
            this._showSpaceKey(index * 40);
          } else {
            this._showKey(closestKeyId, index * 40);
          }
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

  _showSpaceKey(delay) {
    const spaceKey = this._parts[KEYBOARD_PART_TYPE.SpaceKey];
    spaceKey.visible = true;

    new TWEEN.Tween(spaceKey.scale)
      .to({ x: 1, y: 1, z: 1 }, 180)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(delay)
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

  _setSpaceKeyScaleZero() {
    const spaceKey = this._parts[KEYBOARD_PART_TYPE.SpaceKey];
    spaceKey.scale.set(SCALE_ZERO, SCALE_ZERO, SCALE_ZERO);
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

  _setSpaceKeyDefaultColor() {
    const spaceKey = this._parts[KEYBOARD_PART_TYPE.SpaceKey];
    const keyConfig = KEYS_CONFIG[79];
    const color = KEY_COLOR_CONFIG[keyConfig.colorType];
    spaceKey.material.color = color;
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
    const spaceKey = this._parts[KEYBOARD_PART_TYPE.SpaceKey];

    base.position.y = base.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;
    keys.visible = false;
    spaceKey.visible = false;
  }

  _playSound(keyId) {
    const sound = this._keySounds[this._keySoundIndex];
    const keyConfig = KEYS_CONFIG[keyId];

    const keyboardSize = KEYBOARD_CONFIG.size;
    const leftX = -keyboardSize.x * 0.5 + KEYBOARD_CONFIG.keys.offsetX;
    const heightY = keyboardSize.y * 0.5;
    const topZ = -keyboardSize.z * 0.5 + KEYBOARD_CONFIG.keys.offsetZ;

    sound.position.set(leftX + keyConfig.position.x, heightY + keyConfig.position.y, topZ - keyConfig.position.z);
    this._soundHelper.position.copy(sound.position);

    if (sound.isPlaying) {
      sound.stop();
    }

    sound.play();

    this._keySoundIndex += 1;

    if (this._keySoundIndex >= this._keySounds.length) {
      this._keySoundIndex = 0;
    }
  }

  _init() {
    this._initParts();
    this._initKeysBacklight();

    this._addMaterials();
    this._addPartsToScene();
    this._initKeys();
    this._initCloseFocusIcon();
    this._initSounds();
    this._initDebugMenu();
    this._initRealKeyboardSignals();
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
    this._initSpaceKey();
    this._setSpaceKeyPositionAndColor();
    this._setKeysPositionsAndColors();
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

  _setKeysPositionsAndColors() {
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

      if (i === 79) {
        dummy.scale.set(SCALE_ZERO, SCALE_ZERO, SCALE_ZERO);
      }

      dummy.updateMatrix();

      keys.setMatrixAt(i, dummy.matrix);

      const color = KEY_COLOR_CONFIG[keyConfig.colorType];
      keys.setColorAt(i, color);

      this._keysDownTweens.push();
      this._keysUpTweens.push();
      this._keysHighlightTweens.push();
      this._keysStartPosition.push(dummy.position.clone());
    }

    keys.instanceMatrix.needsUpdate = true;
    keys.instanceColor.needsUpdate = true;
  }

  _initSpaceKey() {
    const model = Loader.assets['keyboard-key-space'];
    const spaceKey = model.scene.children[0];

    const material = new THREE.MeshStandardMaterial();
    spaceKey.material = material;

    this._keysGroup.add(spaceKey);

    KEYBOARD_PART_TYPE['SpaceKey'] = 'space_key';
    this._parts[KEYBOARD_PART_TYPE.SpaceKey] = spaceKey;

    KEYBOARD_PART_ACTIVITY_CONFIG[KEYBOARD_PART_TYPE.SpaceKey] = true;

    spaceKey.name = KEYBOARD_PART_TYPE.SpaceKey;
    spaceKey.userData['isActive'] = true;
    spaceKey.userData['objectType'] = this._roomObjectType;
    spaceKey.userData['partType'] = KEYBOARD_PART_TYPE.SpaceKey;
    spaceKey.userData['hideOutline'] = true;

    this._allMeshes.push(spaceKey);
    this._activeMeshes.push(spaceKey);
  }

  _setSpaceKeyPositionAndColor() {
    const spaceKey = this._parts[KEYBOARD_PART_TYPE.SpaceKey];

    const spaceConfig = KEYS_CONFIG[79];
    const color = KEY_COLOR_CONFIG[spaceConfig.colorType];
    spaceKey.material.color.set(color);

    const keyboardSize = KEYBOARD_CONFIG.size;
    const offsetLeft = KEYBOARD_CONFIG.keys.offsetX;
    const offsetTop = KEYBOARD_CONFIG.keys.offsetZ;

    const leftX = -keyboardSize.x * 0.5 + offsetLeft;
    const heightY = keyboardSize.y * 0.5;
    const topZ = -keyboardSize.z * 0.5 + offsetTop;

    spaceKey.position.set(leftX + spaceConfig.position.x, heightY + spaceConfig.position.y, topZ - spaceConfig.position.z);
    spaceKey.rotation.x = KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD;
    spaceKey.translateOnAxis(new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), KEYBOARD_CONFIG.keys.angle * THREE.MathUtils.DEG2RAD), KEYBOARD_CONFIG.keys.offsetYFromKeyboard);
  }

  _initKeysBacklight() {
    const keysBacklight = this._keysBacklight = new KeysBacklight();
    this.add(keysBacklight);

    const base = this._parts[KEYBOARD_PART_TYPE.Base];
    keysBacklight.position.copy(base.position);
  }

  _initCloseFocusIcon() {
    const texture = Loader.assets['close-icon'];
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    const closeFocusIcon = this._parts[KEYBOARD_PART_TYPE.CloseFocusIcon];
    closeFocusIcon.material = material;

    closeFocusIcon.visible = false;
  }

  _initSounds() {
    this._initKeySounds();
    this._initSoundHelper();
  }

  _initKeySounds() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];

    const soundsCount = 3;

    for (let i = 0; i < soundsCount; i++) {
      const sound = new THREE.PositionalAudio(this._audioListener);
      sound.setRefDistance(soundConfig.refDistance);
      sound.position.y = 0.1;

      sound.setVolume(this._globalVolume * this._objectVolume);

      this._keysGroup.add(sound);
      this._keySounds.push(sound);
    }

    Loader.events.on('onAudioLoaded', () => {
      this._keySounds.forEach((sound) => {
        sound.setBuffer(Loader.assets['keyboard-key-press']);
      });
    });
  }

  _initSoundHelper() {
    const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;
    const soundHelper = this._soundHelper = new SoundHelper(helperSize);
    this._keysGroup.add(soundHelper);

    soundHelper.position.copy(this._keySounds[0].position);
  }

  _initRealKeyboardSignals() {
    this._onPressDownSignal = this._onPressDownSignal.bind(this);
    this._onPressUpSignal = this._onPressUpSignal.bind(this);

    window.addEventListener("keydown", this._onPressDownSignal);
    window.addEventListener("keyup", this._onPressUpSignal);
  }

  _onPressDownSignal(e) {
    if (e.repeat) {
      return;
    }

    if (e.code === KEYS_CONFIG[33].code) {
      this._onKeyClick(33);
      return;
    }

    if (e.code === KEYS_CONFIG[79].code) {
      this._onSpaceKeyPressDown();
      return;
    }

    KEYS_CONFIG.forEach(({ id, code }) => {
      if (e.code === code) {
        this._onKeyPressDown(id);
        return;
      }
    });
  }

  _onPressUpSignal(e) {
    if (e.repeat || e.code === KEYS_CONFIG[33].code) {
      return;
    }

    if (e.code === KEYS_CONFIG[79].code) {
      this._onSpaceKeyPressUp();
      return;
    }

    KEYS_CONFIG.forEach(({ id, code }) => {
      if (e.code === code) {
        this._onKeyPressUp(id);
        return;
      }
    });
  }

  _initSignals() {
    this._debugMenu.events.on('onChangeBacklightType', () => this._keysBacklight.switchType());
    this._debugMenu.events.on('onSetBacklightType', (msg, selectedBacklightType) => this._keysBacklight.setBacklightType(selectedBacklightType));
    this._debugMenu.events.on('onChangeRealKeyboardEnabled', () => this._onChangeRealKeyboardEnabled());
    this._keysBacklight.events.on('keysBacklightTypeChanged', () => this._debugMenu.updateBacklightType());
  }

  _onChangeRealKeyboardEnabled() {
    if (KEYBOARD_CONFIG.realKeyboardEnabled) {
      this._initRealKeyboardSignals();
    } else {
      window.removeEventListener("keydown", this._onPressDownSignal);
      window.removeEventListener("keyup", this._onPressUpSignal);
    }
  }
}
