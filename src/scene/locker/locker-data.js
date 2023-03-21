const LOCKER_PART_TYPE = {
  BODY: 'body',
  CASE: 'case',
}

const LOCKER_PART_NAME = {
  BODY: 'body',
}

const LOCKER_PART_NAME_TO_DELETE = {
  // CASE01: 'case01',
  CASE02: 'case02',
  CASE03: 'case03',
  CASE04: 'case04',
  CASE05: 'case05',
  CASE06: 'case06',
  CASE07: 'case07',
}

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
  LOCKER_PART_NAME,
  LOCKER_PART_NAME_TO_DELETE,
  LOCKER_CASE_STATE,
  LOCKER_CASE_MOVE_DIRECTION,
  LOCKER_CASES_ANIMATION_TYPE,
  LOCKER_CASES_RANDOM_ANIMATIONS,
  LOCKER_CASES_ANIMATION_SEQUENCE,
};
