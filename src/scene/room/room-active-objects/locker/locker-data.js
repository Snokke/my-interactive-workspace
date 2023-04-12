const LOCKER_PART_TYPE = {
  Body: 'locker_body',
  Case01: 'case01',
  Case02: 'case02',
  Case03: 'case03',
  Case04: 'case04',
  Case05: 'case05',
  Case06: 'case06',
}

const LOCKER_PART_ACTIVITY_CONFIG = {
  [LOCKER_PART_TYPE.Body]: true,
  [LOCKER_PART_TYPE.Case01]: true,
  [LOCKER_PART_TYPE.Case02]: true,
  [LOCKER_PART_TYPE.Case03]: true,
  [LOCKER_PART_TYPE.Case04]: true,
  [LOCKER_PART_TYPE.Case05]: true,
  [LOCKER_PART_TYPE.Case06]: true,
}

const CASES = [
  LOCKER_PART_TYPE.Case01,
  LOCKER_PART_TYPE.Case02,
  LOCKER_PART_TYPE.Case03,
  LOCKER_PART_TYPE.Case04,
  LOCKER_PART_TYPE.Case05,
  LOCKER_PART_TYPE.Case06,
]

const LOCKER_CASE_STATE = {
  Closed: 'CLOSED',
  Opened: 'OPENED',
  Moving: 'MOVING',
}

const LOCKER_CASE_MOVE_DIRECTION = {
  In: 'IN',
  Out: 'OUT',
}

const LOCKER_CASES_ANIMATION_TYPE = {
  FromTop: 'FROM_TOP',
  FromBottom: 'FROM_BOTTOM',
  FromCenter: 'FROM_CENTER',
  ToCenter: 'TO_CENTER',
  FromTopByThree: 'FROM_TOP_BY_THREE',
  FromBottomByThree: 'FROM_BOTTOM_BY_THREE',
  Random01: 'RANDOM_01',
  Random02: 'RANDOM_02',
  Random03: 'RANDOM_03',
}

const LOCKER_CASES_ANIMATION_SEQUENCE = {
  [LOCKER_CASES_ANIMATION_TYPE.FromTop]: [
    [0], [1], [2], [3], [4], [5],
  ],
  [LOCKER_CASES_ANIMATION_TYPE.FromBottom]:[
    [5], [4], [3], [2], [1], [0]
  ],
  [LOCKER_CASES_ANIMATION_TYPE.FromCenter]: [
    [2, 3], [1, 4], [0, 5],
  ],
  [LOCKER_CASES_ANIMATION_TYPE.ToCenter]: [
    [0, 5], [1, 4], [2, 3],
  ],
  [LOCKER_CASES_ANIMATION_TYPE.FromTopByThree]: [
    [0, 2, 4], [1, 3, 5],
  ],
  [LOCKER_CASES_ANIMATION_TYPE.FromBottomByThree]: [
    [1, 3, 5], [0, 2, 4],
  ],
  [LOCKER_CASES_ANIMATION_TYPE.Random01]: [
    [0], [4], [1], [5], [2], [3],
  ],
  [LOCKER_CASES_ANIMATION_TYPE.Random02]: [
    [3], [1], [0], [5], [4], [2],
  ],
  [LOCKER_CASES_ANIMATION_TYPE.Random03]: [
    [5], [2], [1], [4], [0], [3],
  ],
}

const LOCKER_CASES_RANDOM_ANIMATIONS = 'LOCKER_CASES_RANDOM_ANIMATIONS';

export {
  LOCKER_PART_TYPE,
  LOCKER_CASE_STATE,
  LOCKER_CASE_MOVE_DIRECTION,
  LOCKER_CASES_ANIMATION_TYPE,
  LOCKER_CASES_RANDOM_ANIMATIONS,
  LOCKER_CASES_ANIMATION_SEQUENCE,
  CASES,
  LOCKER_PART_ACTIVITY_CONFIG,
};
