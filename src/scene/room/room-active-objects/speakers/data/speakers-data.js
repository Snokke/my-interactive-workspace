const SPEAKERS_PART_TYPE = {
  Left: 'left_speaker',
  Right: 'right_speaker',
  PowerIndicator: 'power_indicator',
}

const SPEAKERS_PART_ACTIVITY_CONFIG = {
  [SPEAKERS_PART_TYPE.Left]: true,
  [SPEAKERS_PART_TYPE.Right]: true,
  [SPEAKERS_PART_TYPE.PowerIndicator]: true,
}

const SPEAKERS_POWER_STATUS = {
  On: 'ON',
  Off: 'OFF',
}

export {
  SPEAKERS_PART_TYPE,
  SPEAKERS_PART_ACTIVITY_CONFIG,
  SPEAKERS_POWER_STATUS,
};
