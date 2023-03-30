const CHAIR_PART_TYPE = {
  Legs: 'chair-legs',
  Seat: 'chair-seat',
}

const CHAIR_PART_CONFIG = {
  [CHAIR_PART_TYPE.Legs]: {
    isActive: true,
  },
  [CHAIR_PART_TYPE.Seat]: {
    isActive: true,
  },
}

export { CHAIR_PART_TYPE, CHAIR_PART_CONFIG };
