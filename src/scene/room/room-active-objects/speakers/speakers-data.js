const SPEAKERS_PART_TYPE = {
  Left: 'left_speaker',
  Right: 'right_speaker',
  PowerIndicator: 'power_indicator',
}

const SPEAKERS_PART_CONFIG = {
  [SPEAKERS_PART_TYPE.Left]: {
    isActive: true,
  },
  [SPEAKERS_PART_TYPE.Right]: {
    isActive: true,
  },
  [SPEAKERS_PART_TYPE.PowerIndicator]: {
    isActive: true,
  },
}

const SPEAKERS_POWER_STATUS = {
  On: 'ON',
  Off: 'OFF',
}

export { SPEAKERS_PART_TYPE, SPEAKERS_PART_CONFIG, SPEAKERS_POWER_STATUS };
