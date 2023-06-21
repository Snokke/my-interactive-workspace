import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import RoomObjectAbstract from '../room-object.abstract';
import { WALLS_PART_TYPE, WINDOW_HANDLE_STATE, WINDOW_OPEN_TYPE, WINDOW_OPEN_TYPE_BOTH, WINDOW_STATE } from './data/walls-data';
import { WINDOW_CONFIG } from './data/window-config';
import SoundHelper from '../../shared-objects/sound-helper';
import Loader from '../../../../core/loader';
import { rotateAroundPoint } from '../../shared-objects/helpers';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import Materials from '../../../../core/materials';
import { FLOOR_SHADOW_CONFIG } from './data/floor-shadow-config';

export default class Walls extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._floorLampDebug = null;
    this._windowGroup = null;
    this._rightWallGroup = null;
    this._shadowPlane = null;

    this._handleTween = null;
    this._windowTween = null;
    this._debugMenu = null;

    this._openSound = null;
    this._closeSound = null;
    this._soundHelper = null;

    this._windowHandleState = WINDOW_HANDLE_STATE.Idle;
    this._windowState = WINDOW_STATE.Closed;
    this._previousWindowState = this._windowState;
    this._windowOpenType = WINDOW_OPEN_TYPE.Horizontally;
    this._isBothOpenTypeSelected = true;

    this._init();
  }

  onClick(intersect) { // eslint-disable-line
    if (!this._isInputEnabled) {
      return;
    }

    this._stopTweens();
    this._debugMenu.disableActiveOpenType();
    this.events.post('onWindowMoving');

    if (this._windowState === WINDOW_STATE.Opening || this._windowState === WINDOW_STATE.Closing) {
      this._updateWindowState();

      if (this._windowHandleState === WINDOW_HANDLE_STATE.Rotating) {
        this._startFromHandle();
      } else {
        this._startFromWindow();
      }

      return;
    }

    if (this._windowState === WINDOW_STATE.Opened) {
      this._startFromWindow();
    } else {
      this._startFromHandle();
    }
  }

  onAllObjectsInteraction() {
    this.onClick();
  }

  onVolumeChanged(volume) {
    this._globalVolume = volume;

    if (this._isSoundsEnabled) {
      this._openSound.setVolume(this._globalVolume * this._objectVolume);
      this._closeSound.setVolume(this._globalVolume * this._objectVolume);
    }
  }

  enableSound() {
    this._isSoundsEnabled = true;

    this._openSound.setVolume(this._globalVolume * this._objectVolume);
    this._closeSound.setVolume(this._globalVolume * this._objectVolume);
  }

  disableSound() {
    this._isSoundsEnabled = false;

    this._openSound.setVolume(0);
    this._closeSound.setVolume(0);
  }

  getMeshesForOutlinePreview() {
    const window = this._parts[WALLS_PART_TYPE.Window];
    const windowHandle = this._parts[WALLS_PART_TYPE.WindowHandle];

    return [window, windowHandle];
  }

  onLightPercentChange(percent) {
    if (percent < 0.5) {
      const coeff = 1 - percent / 0.5;
      this._shadowPlane.material.opacity = coeff * FLOOR_SHADOW_CONFIG.lampOffShadowOpacity;
    }

    if (percent >= 0.5) {
      const coeff = (percent - 0.5) / 0.5;
      this._shadowPlane.material.opacity = coeff * FLOOR_SHADOW_CONFIG.lampOnShadowOpacity;
    }
  }

  _startFromHandle() {
    const newState = this._previousWindowState === WINDOW_STATE.Opened ? WINDOW_STATE.Closing : WINDOW_STATE.Opening;
    this._setWindowState(newState);
    this._rotateHandle();

    this._handleTween.onComplete(() => {
      this._windowHandleState = WINDOW_HANDLE_STATE.Idle;
      this._moveWindow();

      this._windowTween.onComplete(() => {
        this._updateWindowState();
        this._checkToChangeWindowOpenType();

        if (this._windowState === WINDOW_STATE.Opened) {
          this.events.post('onWindowOpened', this._windowOpenType);
        }

        this.events.post('onWindowStopMoving');
      });
    });
  }

  _startFromWindow() {
    const newState = this._previousWindowState === WINDOW_STATE.Opened ? WINDOW_STATE.Closing : WINDOW_STATE.Opening;
    this._setWindowState(newState);

    this._moveWindow();

    this._windowTween.onComplete(() => {
      if (this._previousWindowState === WINDOW_STATE.Opened) {
        this.events.post('onWindowClosed', this._windowOpenType);
      }

      this._rotateHandle();

      this._handleTween.onComplete(() => {
        this._windowHandleState = WINDOW_HANDLE_STATE.Idle;
        this._updateWindowState();
        this._checkToChangeWindowOpenType();

        if (this._windowState === WINDOW_STATE.Opened) {
          this.events.post('onWindowOpened', this._windowOpenType);
        }

        this.events.post('onWindowStopMoving');
      });
    });
  }

  _rotateHandle() {
    this._windowHandleState = WINDOW_HANDLE_STATE.Rotating;

    const windowHandle = this._parts[WALLS_PART_TYPE.WindowHandle];

    const maxAngle = WINDOW_CONFIG.openTypes[this._windowOpenType].handleAngle * (Math.PI / 180);
    const rotationAngle = this._previousWindowState === WINDOW_STATE.Closed ? maxAngle : 0;
    const remainingRotationAngle = this._previousWindowState === WINDOW_STATE.Closed ? maxAngle + windowHandle.rotation.z : windowHandle.rotation.z;
    const time = Math.abs(remainingRotationAngle) / WINDOW_CONFIG.handleRotationSpeed * 1000;

    if (this._previousWindowState === WINDOW_STATE.Opened) {
      this._playCloseSound();
    } else {
      if (time !== 0) {
        this._playSound();
      }
    }

    this._handleTween = new TWEEN.Tween(windowHandle.rotation)
      .to({ z: -rotationAngle }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  _moveWindow() {
    const window = this._parts[WALLS_PART_TYPE.Window];

    const windowRotationAxis = WINDOW_CONFIG.openTypes[this._windowOpenType].windowRotationAxis;
    const startAngle = this._windowGroup.rotation[windowRotationAxis];

    const currentAngle = { value: startAngle * (180 / Math.PI) };
    let previousAngle = currentAngle.value;

    const maxAngle = WINDOW_CONFIG.openTypes[this._windowOpenType].openAngle;
    const rotationAngle = this._previousWindowState === WINDOW_STATE.Closed ? -maxAngle : 0;
    const remainingRotationAngle = this._previousWindowState === WINDOW_STATE.Closed ? maxAngle + currentAngle.value : currentAngle.value;
    const time = Math.abs(remainingRotationAngle) / WINDOW_CONFIG.windowRotationSpeed * 1000;

    const pivot = window.position.clone()
      .add(WINDOW_CONFIG.openTypes[this._windowOpenType].pivotOffset);

    const rotateAxis = WINDOW_CONFIG.openTypes[this._windowOpenType].rotateAxis;
    const rotationSign = WINDOW_CONFIG.openTypes[this._windowOpenType].rotationSign;

    this._windowTween = new TWEEN.Tween(currentAngle)
      .to({ value: rotationSign * rotationAngle }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    this._windowTween.onUpdate(() => {
      const angle = (currentAngle.value - previousAngle) * (Math.PI / 180);
      rotateAroundPoint(this._windowGroup, pivot, rotateAxis, angle);
      previousAngle = currentAngle.value;
    });

    if (this._previousWindowState === WINDOW_STATE.Closed) {
      this.events.post('onWindowStartOpening');
    }
  }

  _updateWindowState() {
    const newState = this._previousWindowState === WINDOW_STATE.Closed ? WINDOW_STATE.Opened : WINDOW_STATE.Closed;
    this._setWindowState(newState);
    this._previousWindowState = this._windowState;
  }

  _setWindowState(state) {
    this._windowState = state;
    this._debugMenu.updateWindowState(state);
  }

  _checkToChangeWindowOpenType() {
    if (this._windowState === WINDOW_STATE.Closed) {
      this._debugMenu.enableActiveOpenType();

      if (this._isBothOpenTypeSelected) {
        this._windowOpenType = this._windowOpenType === WINDOW_OPEN_TYPE.Horizontally ? WINDOW_OPEN_TYPE.Vertically : WINDOW_OPEN_TYPE.Horizontally;
        this._debugMenu.updateWindowOpenType(this._windowOpenType);
      }
    }
  }

  _stopTweens() {
    if (this._handleTween) {
      this._handleTween.stop();
    }

    if (this._windowTween) {
      this._windowTween.stop();
    }
  }

  _playSound() {
    this._stopSounds();
    this._openSound.play();
  }

  _playCloseSound() {
    this._stopSounds();
    this._closeSound.play();
  }

  _stopSounds() {
    if (this._openSound.isPlaying) {
      this._openSound.stop();
    }

    if (this._closeSound.isPlaying) {
      this._closeSound.stop();
    }
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initGlass();
    this._initWindowGroup();
    this._initShadowPlane();
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

  _initGlass() {
    const topTexture = Loader.assets['glass-top-texture'];
    const glassTopMaterial = new THREE.MeshBasicMaterial({
      map: topTexture,
      transparent: true,
      opacity: 0.05,
    });

    this._parts[WALLS_PART_TYPE.GlassTop].material = glassTopMaterial;

    const glassBottomMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.02,
    });

    this._parts[WALLS_PART_TYPE.GlassTop].material = glassTopMaterial;
    this._parts[WALLS_PART_TYPE.GlassBottom].material = glassBottomMaterial;
  }

  _initWindowGroup() {
    const windowGroup = this._windowGroup = new THREE.Group();
    this.add(windowGroup);

    windowGroup.add(this._parts[WALLS_PART_TYPE.Window]);
    windowGroup.add(this._parts[WALLS_PART_TYPE.WindowHandle]);
    windowGroup.add(this._parts[WALLS_PART_TYPE.GlassTop]);
  }

  _initShadowPlane() {
    const geometry = new THREE.PlaneGeometry(10.71, 10.71);
    const material = new THREE.ShadowMaterial();
    material.opacity = FLOOR_SHADOW_CONFIG.lampOnShadowOpacity;

    const shadowPlane = this._shadowPlane = new THREE.Mesh(geometry, material);
    this.add(shadowPlane);

    shadowPlane.receiveShadow = true;

    shadowPlane.rotation.x = -Math.PI * 0.5;
    shadowPlane.position.x = 0.42;
    shadowPlane.position.z = 0.4;
  }

  _initSounds() {
    this._initSound();
    this._initSoundHelper();
  }

  _initSound() {
    this._initOpenSound();
    this._initCloseSound();

    const glassTop = this._parts[WALLS_PART_TYPE.GlassTop];
    this._openSound.position.copy(glassTop.position);
    this._closeSound.position.copy(glassTop.position);

    this._openSound.setVolume(this._globalVolume * this._objectVolume);
    this._closeSound.setVolume(this._globalVolume * this._objectVolume);

    Loader.events.on('onAudioLoaded', () => {
      this._openSound.setBuffer(Loader.assets['window-open']);
      this._closeSound.setBuffer(Loader.assets['window-close']);
    });
  }

  _initOpenSound() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];
    const openSound = this._openSound = new THREE.PositionalAudio(this._audioListener);
    this._windowGroup.add(openSound);

    openSound.setRefDistance(soundConfig.refDistance);
  }

  _initCloseSound() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];
    const closeSound = this._closeSound = new THREE.PositionalAudio(this._audioListener);
    this._windowGroup.add(closeSound);

    closeSound.setRefDistance(soundConfig.refDistance);
  }

  _initSoundHelper() {
    const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;
    const soundHelper = this._soundHelper = new SoundHelper(helperSize);
    this._windowGroup.add(soundHelper);

    soundHelper.position.copy(this._openSound.position);
  }

  _initDebugMenu() {
    super._initDebugMenu();

    const window = this._parts[WALLS_PART_TYPE.Window];
    this._debugMenu.initDebugRotateAxis(window);

    this._debugMenu.updateWindowState(this._windowState);
    this._debugMenu.updateWindowOpenType(this._windowOpenType);
  }

  _initSignals() {
    this._debugMenu.events.on('changeState', () => this.onClick());
    this._debugMenu.events.on('changeOpenType', (msg, openType) => this._onDebugChangeOpenType(openType));
  }

  _onDebugChangeOpenType(openType) {
    if (openType === WINDOW_OPEN_TYPE_BOTH) {
      this._isBothOpenTypeSelected = true;
    } else {
      this._isBothOpenTypeSelected = false;
      this._windowOpenType = openType;
    }

    this._debugMenu.updateWindowOpenType(this._windowOpenType);
  }
}
