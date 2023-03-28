import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { CASES, LOCKER_CASES_ANIMATION_SEQUENCE, LOCKER_CASES_ANIMATION_TYPE, LOCKER_CASES_RANDOM_ANIMATIONS, LOCKER_CASE_MOVE_DIRECTION, LOCKER_CASE_STATE, LOCKER_PART_CONFIG, LOCKER_PART_TYPE } from './locker-data';
import LOCKER_CONFIG from './locker-config';
import LockerDebug from './locker-debug';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';

export default class Locker extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._currentAnimationType = LOCKER_CASES_RANDOM_ANIMATIONS;

    this._lockerDebug = null;
    this._casesState = [];
    this._casesPreviousState = [];
    this._caseMoveTween = [];

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._lockerDebug.disable();

    this._reset();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = 600;

      const body = this._parts[LOCKER_PART_TYPE.Body];
      const cases = CASES.map((partType) => this._parts[partType]);

      new TWEEN.Tween(body.position)
        .to({ y: body.userData.startPosition.y }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start();

      for (let i = 0; i < cases.length; i += 1) {
        const casePart = cases[i];

        const scaleTween = new TWEEN.Tween(casePart.scale)
          .to({ x: 1, y: 1, z: 1 }, 300)
          .easing(TWEEN.Easing.Back.Out)
          .delay(500 + i * 100)
          .start();

        scaleTween.onComplete(() => {
          new TWEEN.Tween(casePart.position)
            .to({ z: casePart.userData.startPosition.z }, 300)
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .start();
        });
      }

      Delayed.call(500 + cases.length * 100 + 300 + 300, () => {
        this._lockerDebug.enable();
        this._onShowAnimationComplete();
      })
    });
  }

  onClick(roomObject) {
    if (!this._isInputEnabled) {
      return;
    }

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
      return [this._parts[LOCKER_PART_TYPE.Body]];
    }

    const partName = `case0${mesh.userData.caseId + 1}`;
    const casePart = this._parts[partName];

    return [casePart];
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

    this._caseMoveTween[caseId].onStart(() => {
      this._casesState[caseId] = LOCKER_CASE_STATE.Moving;
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
    const startPositionY = 13;

    const body = this._parts[LOCKER_PART_TYPE.Body];
    body.position.y = body.userData.startPosition.y + startPositionY;

    const caseStartPositionZ = 3;
    const startScale = 0;

    CASES.forEach((partName) => {
      const casePart = this._parts[partName];
      casePart.position.z = caseStartPositionZ;
      casePart.scale.set(startScale, startScale, startScale);
    });
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
    this._initParts(LOCKER_PART_TYPE, LOCKER_PART_CONFIG);
    this._addMaterials();
    this._addPartsToScene();
    this._initDebug();
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

  _initDebug() {
    const lockerDebug = this._lockerDebug = new LockerDebug(this._currentAnimationType);

    lockerDebug.events.on('pushCase', (msg, caseId) => this.pushCase(caseId));
    lockerDebug.events.on('pushAllCases', () => this.pushAllCases());
    lockerDebug.events.on('changeAllCasesAnimation', (msg, allCasesAnimation) => this._currentAnimationType = allCasesAnimation);
  }
}
