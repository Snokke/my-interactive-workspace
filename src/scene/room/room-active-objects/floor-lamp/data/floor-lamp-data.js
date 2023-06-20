const FLOOR_LAMP_PART_TYPE = {
  Stand: 'stand',
  LampOuter: 'lamp_outer',
  LampInner: 'lamp_inner',
}

const FLOOR_LAMP_PART_ACTIVITY_CONFIG = {
  [FLOOR_LAMP_PART_TYPE.Stand]: true,
  [FLOOR_LAMP_PART_TYPE.LampOuter]: true,
  [FLOOR_LAMP_PART_TYPE.LampInner]: true,
}

const LIGHT_STATE = {
  On: 'ON',
  Off: 'OFF',
  Switching: 'SWITCHING',
}

export { FLOOR_LAMP_PART_TYPE, FLOOR_LAMP_PART_ACTIVITY_CONFIG, LIGHT_STATE };
