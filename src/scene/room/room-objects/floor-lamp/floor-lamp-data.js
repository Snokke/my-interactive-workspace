const FLOOR_LAMP_PART_TYPE = {
  Lamp: 'lamp',
  Stand: 'stand',
  Tube: 'tube',
}

const FLOOR_LAMP_PART_CONFIG = {
  [FLOOR_LAMP_PART_TYPE.Lamp]: {
    isActive: true,
  },
  [FLOOR_LAMP_PART_TYPE.Stand]: {
    isActive: true,
  },
  [FLOOR_LAMP_PART_TYPE.Tube]: {
    isActive: true,
  },
}

export { FLOOR_LAMP_PART_TYPE, FLOOR_LAMP_PART_CONFIG };
