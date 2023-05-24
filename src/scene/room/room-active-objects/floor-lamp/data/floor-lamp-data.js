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

export { FLOOR_LAMP_PART_TYPE, FLOOR_LAMP_PART_ACTIVITY_CONFIG };
