import LOCKER_CONFIG from "./locker-config";
import { LOCKER_CASES_ANIMATION_TYPE, LOCKER_CASES_RANDOM_ANIMATIONS, LOCKER_CASE_MOVE_DIRECTION } from "./locker-data";

export default class LockerCaseAnimations {
  constructor() {

    this._currentAnimationType = LOCKER_CASES_RANDOM_ANIMATIONS;

    this._showAllCasesAnimation = null;

    this._init();
  }

  getCurrentAnimationType() {
    return this._currentAnimationType;
  }

  setCurrentAnimationType(animationType) {
    this._currentAnimationType = animationType;
  }

  getAnimationData() {
    let animationType = this._currentAnimationType;

    if (this._currentAnimationType === LOCKER_CASES_RANDOM_ANIMATIONS) {
      const animationTypes = Object.values(LOCKER_CASES_ANIMATION_TYPE);
      animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)];
    }

    return this._showAllCasesAnimation[animationType]();
  }

  _init() {
    this._showAllCasesAnimation = {
      [LOCKER_CASES_ANIMATION_TYPE.FromTop]: () => this._allCasesAnimationFromTop(),
      [LOCKER_CASES_ANIMATION_TYPE.FromBottom]: () => this._allCasesAnimationFromBottom(),
      [LOCKER_CASES_ANIMATION_TYPE.FromCenter]: () => this._allCasesAnimationFromCenter(),
      [LOCKER_CASES_ANIMATION_TYPE.FromRandom]: () => this._allCasesAnimationFromRandom(),
    };
  }

  _allCasesAnimationFromTop() {
    const result = [];

    for (let i = 0; i < LOCKER_CONFIG.casesCount; i += 1) {
      const delay = i * (1 / LOCKER_CONFIG.caseMoveSpeed) * LOCKER_CONFIG.allCasesAnimationDelayCoefficient;

      result.push({ i, direction: LOCKER_CASE_MOVE_DIRECTION.Out, delay });
    }

    return result;
  }

  _allCasesAnimationFromBottom() {
    const result = [];

    for (let i = LOCKER_CONFIG.casesCount - 1, j = 0; i >= 0; i -= 1, j += 1) {
      const delay = j * (1 / LOCKER_CONFIG.caseMoveSpeed) * LOCKER_CONFIG.allCasesAnimationDelayCoefficient;

      result.push({ i, direction: LOCKER_CASE_MOVE_DIRECTION.Out, delay });
    }

    return result;
  }

  _allCasesAnimationFromCenter() {
    const result = [];
    const casesCountHalf = Math.floor(LOCKER_CONFIG.casesCount / 2);

    for (let i = casesCountHalf - 1, j = 1; i >= 0; i -= 1, j += 1) {
      const delay = j * (1 / LOCKER_CONFIG.caseMoveSpeed) * LOCKER_CONFIG.allCasesAnimationDelayCoefficient;

      result.push({ i, direction: LOCKER_CASE_MOVE_DIRECTION.Out, delay });
      result.push({ i: LOCKER_CONFIG.casesCount - 1 - i, direction: LOCKER_CASE_MOVE_DIRECTION.Out, delay });
    }

    if (LOCKER_CONFIG.casesCount % 2 !== 0) {
      result.push({ i: casesCountHalf, direction: LOCKER_CASE_MOVE_DIRECTION.Out, delay: 0 });
    }

    return result;
  }

  _allCasesAnimationFromRandom() {
    const result = [];
    const randomIndexes = [];

    for (let i = 0; i < LOCKER_CONFIG.casesCount; i += 1) {
      randomIndexes.push(i);
    }

    randomIndexes.sort(() => Math.random() - 0.5);

    randomIndexes.forEach((i, j) => {
      const delay = j * (1 / LOCKER_CONFIG.caseMoveSpeed) * LOCKER_CONFIG.allCasesAnimationDelayCoefficient

      result.push({ i, direction: LOCKER_CASE_MOVE_DIRECTION.Out, delay });
    });

    return result;
  }
}
