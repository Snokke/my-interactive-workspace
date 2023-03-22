import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { OBJECT_TYPE } from '../scene3d';
import { CASES, LOCKER_CASES_ANIMATION_SEQUENCE, LOCKER_CASES_ANIMATION_TYPE, LOCKER_CASES_RANDOM_ANIMATIONS, LOCKER_CASE_MOVE_DIRECTION, LOCKER_CASE_STATE, LOCKER_PART_TYPE } from './locker-data';
import LOCKER_CONFIG from './locker-config';
import LockerDebug from './locker-debug';

export default class Locker extends THREE.Group {
  constructor(lockerGroup) {
    super();

    this._lockerGroup = lockerGroup;
    this._objectType = OBJECT_TYPE.Locker;
    this._currentAnimationType = LOCKER_CASES_RANDOM_ANIMATIONS;

    this._lockerDebug = null;
    this._parts = null;

    this._allMeshes = [];
    this._casesState = [];
    this._casesPreviousState = [];
    this._caseMoveTween = [];

    this._isInputEnabled = true;

    this._init();
  }

  onClick(object) {
    const partType = object.userData.partType;

    if (partType === LOCKER_PART_TYPE.BODY) {
      this.pushAllCases();
    }

    if (CASES.includes(partType)) {
      this.pushCase(object.userData.caseId);
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

  isInputEnabled() {
    return this._isInputEnabled;
  }

  getObjectType() {
    return this._objectType;
  }

  getAllMeshes() {
    return this._allMeshes;
  }

  getBodyMesh() {
    return [this._parts[LOCKER_PART_TYPE.BODY]];
  }

  getCaseMesh(caseId) {
    const partName = `case0${caseId + 1}`;
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

  _showCasesAnimation(animationType) {
    const casesSequence = LOCKER_CASES_ANIMATION_SEQUENCE[animationType];

    for (let j = 0; j < casesSequence.length; j += 1) {
      casesSequence[j].forEach((i) => {
        const delay = j * (1 / LOCKER_CONFIG.caseMoveSpeed) * LOCKER_CONFIG.allCasesAnimationDelayCoefficient;
        this._moveCase(i, LOCKER_CASE_MOVE_DIRECTION.Out, delay);
      });
    }
  }

  _init() {
    const parts = this._parts = this._getParts(this._lockerGroup);
    this._addMaterials(parts);

    for (let key in parts) {
      this.add(parts[key]);
    }

    this._initDebug();
  }

  _getParts(lockerGroup) {
    const lockerParts = {};

    for (const partName in LOCKER_PART_TYPE) {
      const part = lockerGroup.children.find(child => child.name === LOCKER_PART_TYPE[partName]);
      lockerParts[LOCKER_PART_TYPE[partName]] = part;

      part.userData['objectType'] = this._objectType;
      part.userData['partType'] = LOCKER_PART_TYPE[partName];
      part.userData['startPosition'] = part.position.clone();

      if (CASES.includes(LOCKER_PART_TYPE[partName])) {
        part.userData['caseId'] = parseInt(part.name.replace('case', '')) - 1;
      }

      this._allMeshes.push(part);
    }

    return lockerParts;
  }

  _addMaterials(parts) {
    for (const partName in parts) {
      const part = parts[partName];
      const material = new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff,
      });

      part.material = material;
    }
  }

  _initDebug() {
    const lockerDebug = this._lockerDebug = new LockerDebug(this._currentAnimationType);

    lockerDebug.events.on('pushCase', (msg, caseId) => this.pushCase(caseId));
    lockerDebug.events.on('pushAllCases', () => this.pushAllCases());
    lockerDebug.events.on('changeAllCasesAnimation', (msg, allCasesAnimation) => this._currentAnimationType = allCasesAnimation);
  }
}
