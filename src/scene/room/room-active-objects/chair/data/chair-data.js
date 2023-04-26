const CHAIR_PART_TYPE = {
  Legs: 'chair-legs',
  Seat: 'chair-seat',
  Wheel01: 'chair-wheel-01',
  Wheel02: 'chair-wheel-02',
  Wheel03: 'chair-wheel-03',
  Wheel04: 'chair-wheel-04',
  Wheel05: 'chair-wheel-05',
}

const CHAIR_PART_ACTIVITY_CONFIG = {
  [CHAIR_PART_TYPE.Legs]: true,
  [CHAIR_PART_TYPE.Seat]: true,
  [CHAIR_PART_TYPE.Wheel01]: true,
  [CHAIR_PART_TYPE.Wheel02]: true,
  [CHAIR_PART_TYPE.Wheel03]: true,
  [CHAIR_PART_TYPE.Wheel04]: true,
  [CHAIR_PART_TYPE.Wheel05]: true,
}

const SEAT_ROTATION_DIRECTION = {
  Clockwise: 'CLOCKWISE',
  CounterClockwise: 'COUNTER_CLOCKWISE',
}

const CHAIR_MOVEMENT_STATE = {
  Moving: 'MOVING',
  Idle: 'IDLE',
}

const CHAIR_POSITION_TYPE = {
  AwayFromTable: 'AWAY_FROM_TABLE',
  NearTable: 'NEAR_TABLE',
}

export {
  CHAIR_PART_TYPE,
  CHAIR_PART_ACTIVITY_CONFIG,
  SEAT_ROTATION_DIRECTION,
  CHAIR_MOVEMENT_STATE,
  CHAIR_POSITION_TYPE,
};
