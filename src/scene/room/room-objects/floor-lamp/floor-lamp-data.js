const FLOOR_LAMP_PART_TYPE = {
  Stand: 'stand',
  Tube: 'tube',
  Lamp: 'lamp',
}

const FLOOR_LAMP_PART_CONFIG = {
  [FLOOR_LAMP_PART_TYPE.Stand]: {
    isActive: true,
  },
  [FLOOR_LAMP_PART_TYPE.Tube]: {
    isActive: true,
  },
  [FLOOR_LAMP_PART_TYPE.Lamp]: {
    isActive: true,
  },
}

export { FLOOR_LAMP_PART_TYPE, FLOOR_LAMP_PART_CONFIG };
