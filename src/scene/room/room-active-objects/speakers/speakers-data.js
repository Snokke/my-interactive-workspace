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

const MUSIC_TYPE = {
  ComeAndGetYourLove: 'COME_AND_GET_YOUR_LOVE',
  Giorgio: 'GIORGIO',
}

const MUSIC_CONFIG = {
  [MUSIC_TYPE.ComeAndGetYourLove]: {
    fileName: 'come_and_get_your_love',
    name: 'Come and get your love',
    artist: 'Redbone',
  },
  [MUSIC_TYPE.Giorgio]: {
    fileName: 'giorgio',
    name: 'Giorgio by Moroder',
    artist: 'Daft Punk',
  },
}

export {
  SPEAKERS_PART_TYPE,
  SPEAKERS_PART_ACTIVITY_CONFIG,
  SPEAKERS_POWER_STATUS,
  MUSIC_TYPE,
  MUSIC_CONFIG,
};
