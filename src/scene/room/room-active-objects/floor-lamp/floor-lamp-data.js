const FLOOR_LAMP_PART_TYPE = {
  Stand: 'stand',
  Tube: 'tube',
  Lamp: 'lamp',
}

const FLOOR_LAMP_PART_ACTIVITY_CONFIG = {
  [FLOOR_LAMP_PART_TYPE.Stand]: true,
  [FLOOR_LAMP_PART_TYPE.Tube]: true,
  [FLOOR_LAMP_PART_TYPE.Lamp]: true,
}

export { FLOOR_LAMP_PART_TYPE, FLOOR_LAMP_PART_ACTIVITY_CONFIG };
