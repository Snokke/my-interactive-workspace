import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { CASES, LOCKER_CASES_ANIMATION_SEQUENCE, LOCKER_CASES_ANIMATION_TYPE, LOCKER_CASES_RANDOM_ANIMATIONS, LOCKER_CASE_MOVE_DIRECTION, LOCKER_CASE_STATE, LOCKER_PART_TYPE } from './locker-data';
import LOCKER_CONFIG from './locker-config';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../data/room-config';
import Loader from '../../../../core/loader';
import SoundHelper from '../../shared-objects/sound-helper';

export default class Locker extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._currentAnimationType = LOCKER_CASES_RANDOM_ANIMATIONS;

    this._casesState = [];
    this._casesPreviousState = [];
    this._caseMoveTween = [];
    this._sounds = [];
    this._soundHelpers = [];

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();

    this._reset();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const body = this._parts[LOCKER_PART_TYPE.Body];
      const cases = CASES.map((partType) => this._parts[partType]);

      new TWEEN.Tween(body.position)
        .to({ y: body.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      for (let i = 0; i < cases.length; i += 1) {
        const casePart = cases[i];

        const scaleTween = new TWEEN.Tween(casePart.scale)
          .to({ x: 1, y: 1, z: 1 }, 300)
          .easing(TWEEN.Easing.Back.Out)
          .delay(fallDownTime * 0.5 + i * 100)
          .start();

        scaleTween.onComplete(() => {
          new TWEEN.Tween(casePart.position)
            .to({ z: casePart.userData.startPosition.z }, 300)
            .easing(ROOM_CONFIG.startAnimation.objectScaleEasing)
            .start();
        });
      }

      Delayed.call(fallDownTime * 0.5 + cases.length * 100 + 300 + 300, () => {
        this._debugMenu.enable();
        this._onShowAnimationComplete();
      })
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (partType === LOCKER_PART_TYPE.Body) {
      this.pushAllCases();
    }

    if (CASES.includes(partType)) {
      this.pushCase(roomObject.userData.caseId);
    }
  }

  pushAllCases() {
    const isAllCasesClosed = this._casesState.every(state => state === LOCKER_CASE_STATE.Closed);

    if (isAllCasesClosed) {
      if (this._currentAnimationType === LOCKER_CASES_RANDOM_ANIMATIONS) {
        const animationTypes = Object.values(LOCKER_CASES_ANIMATION_TYPE);
        const animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)];

        this._showCasesAnimation(animationType);
      } else {
        this._showCasesAnimation(this._currentAnimationType);
      }
    } else {
      for (let i = 0; i < LOCKER_CONFIG.casesCount; i += 1) {
        this._moveCase(i, LOCKER_CASE_MOVE_DIRECTION.In);
      }
    }
  }

  pushCase(caseId) {
    if (this._casesState[caseId] === LOCKER_CASE_STATE.Moving) {
      this._stopCaseMoveTween(caseId);

      if (this._casesPreviousState[caseId] === LOCKER_CASE_STATE.Opened) {
        this._casesPreviousState[caseId] = LOCKER_CASE_STATE.Closed;
        this._moveCase(caseId, LOCKER_CASE_MOVE_DIRECTION.Out);
      } else {
        this._casesPreviousState[caseId] = LOCKER_CASE_STATE.Opened;
        this._moveCase(caseId, LOCKER_CASE_MOVE_DIRECTION.In);
      }

      return;
    }

    if (this._casesState[caseId] === LOCKER_CASE_STATE.Opened) {
      this._moveCase(caseId, LOCKER_CASE_MOVE_DIRECTION.In);
    } else {
      this._moveCase(caseId, LOCKER_CASE_MOVE_DIRECTION.Out);
    }
  }

  getMeshesForOutline(mesh) {
    if (mesh.userData.partType === LOCKER_PART_TYPE.Body) {
      return Object.values(this._parts);
    }

    const partName = `case0${mesh.userData.caseId + 1}`;
    const casePart = this._parts[partName];

    return [casePart];
  }

  onVolumeChanged(volume) {
    super.onVolumeChanged(volume);

    if (this._isSoundsEnabled) {
      this._sounds.forEach((sound) => {
        sound.setVolume(this._volume);
      });
    }
  }

  enableSound() {
    super.enableSound();

    this._sounds.forEach((sound) => {
      sound.setVolume(this._volume);
    });
  }

  disableSound() {
    super.disableSound();

    this._sounds.forEach((sound) => {
      sound.setVolume(0);
    });
  }

  showSoundHelpers() {
    if (this._soundHelpers) {
      this._soundHelpers.forEach((soundHelper) => {
        soundHelper.show();
      });
    }
  }

  hideSoundHelpers() {
    if (this._soundHelpers) {
      this._soundHelpers.forEach((soundHelper) => {
        soundHelper.hide();
      });
    }
  }

  _moveCase(caseId, direction, delay = 0) {
    this._stopCaseMoveTween(caseId);
    const endState = direction === LOCKER_CASE_MOVE_DIRECTION.Out ? LOCKER_CASE_STATE.Opened : LOCKER_CASE_STATE.Closed;

    if (this._casesState[caseId] === endState) {
      return;
    }

    const partName = `case0${caseId + 1}`;
    const casePart = this._parts[partName];

    const startPositionZ = casePart.userData.startPosition.z;
    const endPositionZ = direction === LOCKER_CASE_MOVE_DIRECTION.Out ? startPositionZ + LOCKER_CONFIG.caseMoveDistance : startPositionZ;
    const time = Math.abs(casePart.position.z - endPositionZ) / LOCKER_CONFIG.caseMoveSpeed * 1000;

    this._caseMoveTween[caseId] = new TWEEN.Tween(casePart.position)
      .to({ z: endPositionZ }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(delay)
      .start();

    this._caseMoveTween[caseId].onUpdate(() => {
      this._sounds[caseId].position.copy(casePart.position);
      this._sounds[caseId].position.z += 0.8;
      this._soundHelpers[caseId].position.copy(this._sounds[caseId].position);
    });

    this._caseMoveTween[caseId].onStart(() => {
      this._casesState[caseId] = LOCKER_CASE_STATE.Moving;
      this._playSound(caseId);
    });

    this._caseMoveTween[caseId].onComplete(() => {
      this._casesState[caseId] = direction === LOCKER_CASE_MOVE_DIRECTION.Out ? LOCKER_CASE_STATE.Opened : LOCKER_CASE_STATE.Closed;
      this._casesPreviousState[caseId] = this._casesState[caseId];
    });
  }

  _stopCaseMoveTween(caseId) {
    if (this._caseMoveTween[caseId]) {
      this._caseMoveTween[caseId].stop();
    }
  }

  _stopTweens() {
    for (let i = 0; i < this._caseMoveTween.length; i += 1) {
      this._stopCaseMoveTween(i);
    }
  }

  _showCasesAnimation(animationType) {
    const casesSequence = LOCKER_CASES_ANIMATION_SEQUENCE[animationType];

    for (let j = 0; j < casesSequence.length; j += 1) {
      casesSequence[j].forEach((i) => {
        const delay = j * (1 / LOCKER_CONFIG.caseMoveSpeed) * LOCKER_CONFIG.allCasesAnimationDelayCoefficient;
        this._moveCase(i, LOCKER_CASE_MOVE_DIRECTION.Out, delay);
      });
    }
  }

  _setPositionForShowAnimation() {
    const body = this._parts[LOCKER_PART_TYPE.Body];
    body.position.y = body.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;

    const caseStartPositionZ = 2.5;
    const startScale = 0;

    CASES.forEach((partName) => {
      const casePart = this._parts[partName];
      casePart.position.z = caseStartPositionZ;
      casePart.scale.set(startScale, startScale, startScale);
    });
  }

  _playSound(caseId) {
    if (this._sounds[caseId].isPlaying) {
      this._sounds[caseId].stop();
    }

    this._sounds[caseId].play();
  }

  _reset() {
    this._stopTweens();

    this._casesState = [];
    this._casesPreviousState = [];

    CASES.forEach((partName) => {
      const casePart = this._parts[partName];
      casePart.position.z = casePart.userData.startPosition.z;
    });
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initSounds();
    this._initDebugMenu();
    this._initSignals();
  }

  _addPartsToScene() {
    for (let key in this._parts) {
      const part = this._parts[key];
      const partType = part.userData.partType;

      if (CASES.includes(partType)) {
        part.userData['caseId'] = parseInt(part.name.replace('case', '')) - 1;
      }

      this.add(part);
    }
  }

  _initSounds() {
    this._initSound();
    this._initSoundHelper();
  }

  _initSound() {
    for (const key in CASES) {
      const sound = new THREE.PositionalAudio(this._audioListener);
      this.add(sound);

      sound.setRefDistance(10);

      const caseType = CASES[key];
      const caseObject = this._parts[caseType];
      sound.position.copy(caseObject.position);
      sound.position.z += 0.8;

      this._sounds.push(sound);
    }

    Loader.events.on('onAudioLoaded', () => {
      this._sounds.forEach((sound) => {
        sound.setBuffer(Loader.assets['keyboard-key-press'])
      });
    });
  }

  _initSoundHelper() {
    this._sounds.forEach((sound) => {
      const soundHelper = new SoundHelper(0.25);
      this.add(soundHelper);

      soundHelper.position.copy(sound.position);
      this._soundHelpers.push(soundHelper);
    });
  }

  _initSignals() {
    this._debugMenu.events.on('pushCase', (msg, caseId) => this.pushCase(caseId));
    this._debugMenu.events.on('pushAllCases', () => this.pushAllCases());
    this._debugMenu.events.on('changeAllCasesAnimation', (msg, allCasesAnimation) => this._currentAnimationType = allCasesAnimation);
  }
}
