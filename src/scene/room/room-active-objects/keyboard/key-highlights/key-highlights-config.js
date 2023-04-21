const KEY_HIGHLIGHT_CONFIG = {
  size: 0.15,
}

const KEYS_HIGHLIGHT_TYPE = {
  FromLeftToRight: 'FROM_LEFT_TO_RIGHT',
  FromTopToBottom: 'FROM_TOP_TO_BOTTOM',
  SameColor: 'SAME_COLOR',
  FromCenterToSides: 'FROM_CENTER_TO_SIDES',
  RandomColors: 'RANDOM_COLORS',
  HighlightFromFirstToLastKey: 'HIGHLIGHT_FROM_FIRST_TO_LAST_KEY',
  PressedKey: 'PRESSED_KEY',
  PressedKeyToSides: 'PRESSED_KEY_TO_SIDES',
  PressedKeyToSidesSingleRow: 'PRESSED_KEY_TO_SIDES_SINGLE_ROW',
}

const KEYS_HIGHLIGHT_TYPE_ORDER = [
  KEYS_HIGHLIGHT_TYPE.FromLeftToRight,
  KEYS_HIGHLIGHT_TYPE.FromTopToBottom,
  KEYS_HIGHLIGHT_TYPE.SameColor,
  KEYS_HIGHLIGHT_TYPE.FromCenterToSides,
  KEYS_HIGHLIGHT_TYPE.RandomColors,
  KEYS_HIGHLIGHT_TYPE.HighlightFromFirstToLastKey,
  KEYS_HIGHLIGHT_TYPE.PressedKey,
  KEYS_HIGHLIGHT_TYPE.PressedKeyToSides,
  KEYS_HIGHLIGHT_TYPE.PressedKeyToSidesSingleRow,
]

const KEYS_HIGHLIGHT_CONFIG = {
  [KEYS_HIGHLIGHT_TYPE.FromLeftToRight]: {
    colors: {
      change: true,
      changeSpeed: 3,
      direction: -1,
    },
    scaleChange: false,
  },
  [KEYS_HIGHLIGHT_TYPE.FromTopToBottom]: {
    colors: {
      change: true,
      changeSpeed: 1.5,
      direction: -1,
    },
    scaleChange: false,
  },
  [KEYS_HIGHLIGHT_TYPE.SameColor]: {
    colors: {
      change: true,
      changeSpeed: 0.7,
      direction: -1,
    },
    scaleChange: false,
  },
  [KEYS_HIGHLIGHT_TYPE.FromCenterToSides]: {
    colors: {
      change: true,
      changeSpeed: 2,
      direction: 1,
    },
    scaleChange: false,
  },
  [KEYS_HIGHLIGHT_TYPE.RandomColors]: {
    colors: {
      change: true,
      changeSpeed: 1,
      direction: 1,
    },
    scaleChange: false,
  },
  [KEYS_HIGHLIGHT_TYPE.HighlightFromFirstToLastKey]: {
    colors: {
      change: true,
      changeSpeed: 1,
      direction: 1,
    },
    scaleChange: true,
  },
  [KEYS_HIGHLIGHT_TYPE.PressedKey]: {
    colors: {
      change: false,
    },
    scaleChange: true,
  },
  [KEYS_HIGHLIGHT_TYPE.PressedKeyToSides]: {
    colors: {
      change: true,
      changeSpeed: 1,
      direction: 1,
    },
    scaleChange: true,
  },
  [KEYS_HIGHLIGHT_TYPE.PressedKeyToSidesSingleRow]: {
    colors: {
      change: true,
      changeSpeed: 1,
      direction: 1,
    },
    scaleChange: true,
  },
}

export {
  KEY_HIGHLIGHT_CONFIG,
  KEYS_HIGHLIGHT_TYPE,
  KEYS_HIGHLIGHT_TYPE_ORDER,
  KEYS_HIGHLIGHT_CONFIG,
};
