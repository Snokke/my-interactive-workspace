const SPEAKERS_PART_TYPE = {
  Left: 'left_speaker',
  Right: 'right_speaker',
}

const SPEAKERS_PART_CONFIG = {
  [SPEAKERS_PART_TYPE.Left]: {
    isActive: true,
  },
  [SPEAKERS_PART_TYPE.Right]: {
    isActive: true,
  },
}

export { SPEAKERS_PART_TYPE, SPEAKERS_PART_CONFIG };
