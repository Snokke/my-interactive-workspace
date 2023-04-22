import { KEYS_BACKLIGHT_TYPE, KEYS_BACKLIGHT_TYPE_ORDER } from "./keys-backlight-data";

const KEYS_BACKLIGHT_CONFIG = {
  size: 0.15,
  currentType: KEYS_BACKLIGHT_TYPE_ORDER[0],
}

const KEYS_BACKLIGHT_TYPE_CONFIG = {
  [KEYS_BACKLIGHT_TYPE.FromLeftToRight]: {
    colors: {
      change: true,
      changeSpeed: 3,
      direction: -1,
    },
    scaleChange: false,
  },
  [KEYS_BACKLIGHT_TYPE.FromTopToBottom]: {
    colors: {
      change: true,
      changeSpeed: 1.5,
      direction: -1,
    },
    scaleChange: false,
  },
  [KEYS_BACKLIGHT_TYPE.SameColor]: {
    colors: {
      change: true,
      changeSpeed: 0.7,
      direction: -1,
    },
    scaleChange: false,
  },
  [KEYS_BACKLIGHT_TYPE.FromCenterToSides]: {
    colors: {
      change: true,
      changeSpeed: 2,
      direction: 1,
    },
    scaleChange: false,
  },
  [KEYS_BACKLIGHT_TYPE.RandomColors]: {
    colors: {
      change: true,
      changeSpeed: 1,
      direction: 1,
    },
    scaleChange: false,
  },
  [KEYS_BACKLIGHT_TYPE.FromFirstToLastKey]: {
    colors: {
      change: true,
      changeSpeed: 1,
      direction: 1,
    },
    scaleChange: true,
  },
  [KEYS_BACKLIGHT_TYPE.PressKey]: {
    colors: {
      change: false,
    },
    scaleChange: true,
  },
  [KEYS_BACKLIGHT_TYPE.PressKeyToSides]: {
    colors: {
      change: true,
      changeSpeed: 1,
      direction: 1,
    },
    scaleChange: true,
  },
  [KEYS_BACKLIGHT_TYPE.PressKeyToSidesRow]: {
    colors: {
      change: true,
      changeSpeed: 1,
      direction: 1,
    },
    scaleChange: true,
  },
}

export { KEYS_BACKLIGHT_CONFIG, KEYS_BACKLIGHT_TYPE_CONFIG };
