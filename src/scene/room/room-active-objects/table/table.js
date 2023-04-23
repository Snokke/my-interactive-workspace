import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { TABLE_HANDLE_STATE, TABLE_PART_TYPE, TABLE_STATE } from './table-data';
import TABLE_CONFIG from './table-config';
import RoomObjectAbstract from '../room-object.abstract';
import Delayed from '../../../../core/helpers/delayed-call';
import { ROOM_CONFIG } from '../../data/room-config';
import Loader from '../../../../core/loader';
import SoundHelper from '../../shared-objects/sound-helper';

export default class Table extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._handleState = TABLE_HANDLE_STATE.Idle;
    this._currentTableState = TABLE_STATE.SittingMode;
    this._previousTableState = this._currentTableState;

    this._topPartsGroup = null;

    this._tweenHandleMoveOut = null;
    this._tweenHandleMoveIn = null;
    this._tweenHandleRotation = null;

    this._sound = null;
    this._soundHelper = null;

    this._previousHandleAngle = 0;
    this._current360HandleAngle = 0;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();

    this._reset();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const legs = this._parts[TABLE_PART_TYPE.Legs];
      const topPart = this._parts[TABLE_PART_TYPE.TopPart];
      const tableTop = this._parts[TABLE_PART_TYPE.Tabletop];
      const handle = this._parts[TABLE_PART_TYPE.Handle];

      new TWEEN.Tween(legs.position)
        .to({ y: legs.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(topPart.position)
        .to({ y: topPart.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5)
        .start();

      new TWEEN.Tween(tableTop.position)
        .to({ y: tableTop.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5 * 2)
        .start();

      const handleScaleTween = new TWEEN.Tween(handle.scale)
        .to({ x: 1, y: 1, z: 1 }, 300)
        .easing(ROOM_CONFIG.startAnimation.objectScaleEasing)
        .delay(fallDownTime * 0.5 * 3)
        .start();

      handleScaleTween.onComplete(() => {
        const handleMoveTween = new TWEEN.Tween(handle.position)
        .to({ z: handle.userData.startPosition.z }, 300)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start();

        handleMoveTween.onComplete(() => {
          this._debugMenu.enable();
          this._onShowAnimationComplete();
        });
      });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const handle = this._parts[TABLE_PART_TYPE.Handle];

    if (this._currentTableState === TABLE_STATE.Moving) {
      this._changeDirection(handle);

      return;
    }

    this._setTableState(TABLE_STATE.Moving);
    this._startFromHandleMoveOut(handle);
  }

  onVolumeChanged(volume) {
    super.onVolumeChanged(volume);

    if (this._isSoundsEnabled) {
      this._sound.setVolume(this._volume);
    }
  }

  enableSound() {
    super.enableSound();

    this._sound.setVolume(this._volume);
  }

  disableSound() {
    super.disableSound();

    this._sound.setVolume(0);
  }

  getTopTableGroup() {
    return this._topPartsGroup;
  }

  _changeDirection(handle) {
    this._updateTableState();
    this._stopTweens();
    this._setTableState(TABLE_STATE.Moving);
    this._current360HandleAngle = 0;

    switch (this._handleState) {
      case TABLE_HANDLE_STATE.MovingOut:
        this._startFromHandleMoveIn(handle);
        break;

      case TABLE_HANDLE_STATE.Rotating:
        this._startFromHandleRotation(handle);
        break;

      case TABLE_HANDLE_STATE.MovingIn:
        this._startFromHandleMoveOut(handle);
        break;
    }
  }

  _startFromHandleMoveOut(handle) {
    this._handleState = TABLE_HANDLE_STATE.MovingOut;

    const positionZ = 0.75;
    const time = Math.abs(handle.userData.startPosition.z + positionZ - handle.position.z) / TABLE_CONFIG.handleMoveOutSpeed * 1000;

    const tweenHandleMoveOut = this._tweenHandleMoveOut = new TWEEN.Tween(handle.position)
      .to({ z: handle.userData.startPosition.z + positionZ }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    tweenHandleMoveOut.onComplete(() => {
      this._startFromHandleRotation(handle);
    });
  }

  _startFromHandleRotation(handle) {
    this._handleState = TABLE_HANDLE_STATE.Rotating;
    this._previousHandleAngle = handle.rotation.z;

    const maxRotationAngle = Math.PI * 2 * TABLE_CONFIG.handleMaxRotations;
    const rotationAngle = this._previousTableState === TABLE_STATE.SittingMode ? maxRotationAngle : 0;
    const remainingRotationAngle = this._previousTableState === TABLE_STATE.SittingMode ? maxRotationAngle - handle.rotation.z : handle.rotation.z;
    const time = remainingRotationAngle / TABLE_CONFIG.handleRotationSpeed * 1000;

    const tweenHandleRotation = this._tweenHandleRotation = new TWEEN.Tween(handle.rotation)
      .to({ z: rotationAngle }, time)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start();

    tweenHandleRotation.onUpdate(() => {
      const angleDelta = handle.rotation.z - this._previousHandleAngle;
      this._previousHandleAngle = handle.rotation.z;

      const positionDeltaY = angleDelta / Math.PI * TABLE_CONFIG.handle360RotationDeltaY;
      this._topPartsGroup.position.y += positionDeltaY;

      this._sound.position.y += positionDeltaY;
      this._soundHelper.position.copy(this._sound.position);

      this._current360HandleAngle += Math.abs(angleDelta);

      if (this._current360HandleAngle >= Math.PI * 2) {
        this._current360HandleAngle = 0;
        this._playSound();
      }
    });

    tweenHandleRotation.onComplete(() => {
      this._startFromHandleMoveIn(handle);
      this._current360HandleAngle = 0;
    });
  }

  _startFromHandleMoveIn(handle) {
    this._handleState = TABLE_HANDLE_STATE.MovingIn;

    const time = Math.abs(handle.userData.startPosition.z - handle.position.z) / TABLE_CONFIG.handleMoveOutSpeed * 1000;
    const tweenHandleMoveIn = this._tweenHandleMoveIn = new TWEEN.Tween(handle.position)
      .to({ z: handle.userData.startPosition.z }, time)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();

    tweenHandleMoveIn.onComplete(() => {
      this._handleState = TABLE_HANDLE_STATE.Idle;
      this._updateTableState();
    });
  }

  _updateTableState() {
    this._setTableState(this._previousTableState === TABLE_STATE.SittingMode ? TABLE_STATE.StandingMode : TABLE_STATE.SittingMode);
    this._previousTableState = this._currentTableState;
  }

  _stopTweens() {
    if (this._tweenHandleMoveOut) {
      this._tweenHandleMoveOut.stop();
    }

    if (this._tweenHandleMoveIn) {
      this._tweenHandleMoveIn.stop();
    }

    if (this._tweenHandleRotation) {
      this._tweenHandleRotation.stop();
    }
  }

  _setTableState(state) {
    this._currentTableState = state;
    this._debugMenu.updateTableState(state);
  }

  _setPositionForShowAnimation() {
    super._setPositionForShowAnimation();

    const handle = this._parts[TABLE_PART_TYPE.Handle];
    handle.position.copy(handle.userData.startPosition);
    handle.position.z = 2.5;
    handle.scale.set(0, 0, 0);
  }

  _reset() {
    this._stopTweens();

    this._handleState = TABLE_HANDLE_STATE.Idle;
    this._setTableState(TABLE_STATE.SittingMode);
    this._previousTableState = this._currentTableState;

    this._topPartsGroup.position.y = 0;

    const handle = this._parts[TABLE_PART_TYPE.Handle];

    handle.rotation.z = 0;
    handle.position.z = handle.userData.startPosition.z;
  }

  _playSound() {
    if (this._sound.isPlaying) {
      this._sound.stop();
    }

    this._sound.play();
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._initTopPartsGroup();
    this._addPartsToScene();
    this._initSounds();
    this._initDebugMenu();
    this._initSignals();
  }

  _initTopPartsGroup() {
    const topPartsGroup = this._topPartsGroup = this._createTopPartsGroup(this._parts);
    this.add(topPartsGroup);
  }

  _addPartsToScene() {
    this.add(this._parts[TABLE_PART_TYPE.Legs]);
  }

  _createTopPartsGroup(tableParts) {
    const topPartsGroup = new THREE.Group();
    topPartsGroup.add(tableParts[TABLE_PART_TYPE.Tabletop], tableParts[TABLE_PART_TYPE.TopPart], tableParts[TABLE_PART_TYPE.Handle]);

    return topPartsGroup;
  }

  _initSounds() {
    this._initSound();
    this._initSoundHelper();
  }

  _initSound() {
    const sound = this._sound = new THREE.PositionalAudio(this._audioListener);
    this.add(sound);

    sound.setRefDistance(10);

    const handle = this._parts[TABLE_PART_TYPE.Handle];
    sound.position.copy(handle.position);
    sound.position.z += 1.6;

    Loader.events.on('onAudioLoaded', () => {
      sound.setBuffer(Loader.assets['keyboard-key-press']);
    });
  }

  _initSoundHelper() {
    const soundHelper = this._soundHelper = new SoundHelper(0.2);
    this.add(soundHelper);
    soundHelper.position.copy(this._sound.position);
  }

  _initSignals() {
    this._debugMenu.events.on('changeState', () => this.onClick());
  }
}
