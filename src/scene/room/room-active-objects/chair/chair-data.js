const CHAIR_PART_TYPE = {
  ChairLegs: 'chair-legs',
  ChairSeat: 'chair-seat',
}

const CHAIR_PART_CONFIG = {
  [CHAIR_PART_TYPE.ChairLegs]: {
    isActive: true,
  },
  [CHAIR_PART_TYPE.ChairSeat]: {
    isActive: true,
  },
}

export { CHAIR_PART_TYPE, CHAIR_PART_CONFIG };
