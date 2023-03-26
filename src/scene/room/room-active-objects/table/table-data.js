const TABLE_PART_TYPE = {
  Tabletop: 'tabletop',
  TopPart: 'top-part',
  Handle: 'handle',
  Legs: 'legs',
}

const TABLE_PART_CONFIG = {
  [TABLE_PART_TYPE.Tabletop]: {
    isActive: true,
  },
  [TABLE_PART_TYPE.TopPart]: {
    isActive: true,
  },
  [TABLE_PART_TYPE.Handle]: {
    isActive: true,
  },
  [TABLE_PART_TYPE.Legs]: {
    isActive: true,
  },
}

const TABLE_STATE = {
  SittingMode: 'SITTING_MODE',
  StandingMode: 'STANDING_MODE',
  Moving: 'MOVING',
}

const TABLE_HANDLE_STATE = {
  Idle: 'IDLE',
  MovingOut: 'MOVING_OUT',
  MovingIn: 'MOVING_IN',
  Rotating: 'ROTATING',
}

export { TABLE_PART_TYPE, TABLE_STATE, TABLE_HANDLE_STATE, TABLE_PART_CONFIG };
