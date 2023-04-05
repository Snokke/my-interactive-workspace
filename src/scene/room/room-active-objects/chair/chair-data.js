const CHAIR_PART_TYPE = {
  Legs: 'chair-legs',
  Seat: 'chair-seat',
  Wheel01: 'chair-wheel-01',
  Wheel02: 'chair-wheel-02',
  Wheel03: 'chair-wheel-03',
  Wheel04: 'chair-wheel-04',
  Wheel05: 'chair-wheel-05',
}

const CHAIR_PART_CONFIG = {
  [CHAIR_PART_TYPE.Legs]: {
    isActive: true,
  },
  [CHAIR_PART_TYPE.Seat]: {
    isActive: true,
  },
  [CHAIR_PART_TYPE.Wheel01]: {
    isActive: true,
  },
  [CHAIR_PART_TYPE.Wheel02]: {
    isActive: true,
  },
  [CHAIR_PART_TYPE.Wheel03]: {
    isActive: true,
  },
  [CHAIR_PART_TYPE.Wheel04]: {
    isActive: true,
  },
  [CHAIR_PART_TYPE.Wheel05]: {
    isActive: true,
  },
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

export { CHAIR_PART_TYPE, CHAIR_PART_CONFIG, SEAT_ROTATION_DIRECTION, CHAIR_MOVEMENT_STATE, CHAIR_POSITION_TYPE };
