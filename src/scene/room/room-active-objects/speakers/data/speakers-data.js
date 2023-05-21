const SPEAKERS_PART_TYPE = {
  Speakers: 'speakers',
  PowerIndicator: 'power_indicator',
}

const SPEAKERS_PART_ACTIVITY_CONFIG = {
  [SPEAKERS_PART_TYPE.Speakers]: true,
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
