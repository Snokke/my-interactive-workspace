const AIR_CONDITIONER_PART_TYPE = {
  Body: 'air-conditioner-body',
  Door: 'air-conditioner-door',
  Temperature: 'air-conditioner-temperature',
}

const AIR_CONDITIONER_PART_ACTIVITY_CONFIG = {
  [AIR_CONDITIONER_PART_TYPE.Body]: true,
  [AIR_CONDITIONER_PART_TYPE.Door]: true,
  [AIR_CONDITIONER_PART_TYPE.Temperature]: true,
}

const AIR_CONDITIONER_DOOR_STATE = {
  Idle: 'IDLE',
  Moving: 'MOVING',
}

const AIR_CONDITIONER_DOOR_POSITION_STATE = {
  Opened: 'OPENED',
  Closed: 'CLOSED',
}

const AIR_CONDITIONER_STATE = {
  PowerOn: 'POWER_ON',
  PowerOff: 'POWER_OFF',
}

export {
  AIR_CONDITIONER_PART_TYPE,
  AIR_CONDITIONER_PART_ACTIVITY_CONFIG,
  AIR_CONDITIONER_DOOR_STATE,
  AIR_CONDITIONER_STATE,
  AIR_CONDITIONER_DOOR_POSITION_STATE,
};
