const TABLE_PART_NAME = {
  Tabletop: 'tabletop',
  TopPart: 'top-part',
  Handle: 'handle',
  Legs: 'legs',
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

export { TABLE_PART_NAME, TABLE_STATE, TABLE_HANDLE_STATE };
