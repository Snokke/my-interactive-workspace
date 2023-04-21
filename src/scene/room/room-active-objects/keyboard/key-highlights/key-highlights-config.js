const KEY_HIGHLIGHT_CONFIG = {
  size: 0.15,
}

const KEYS_HIGHLIGHT_TYPE = {
  FromLeftToRight: 'FROM_LEFT_TO_RIGHT',
  FromTopToBottom: 'FROM_TOP_TO_BOTTOM',
}

const KEYS_HIGHLIGHT_TYPE_ORDER = [
  KEYS_HIGHLIGHT_TYPE.FromLeftToRight,
  KEYS_HIGHLIGHT_TYPE.FromTopToBottom,
]

const KEYS_HIGHLIGHT_CONFIG = {
  [KEYS_HIGHLIGHT_TYPE.FromLeftToRight]: {
    changeColorSpeed: 3,
    direction: -1,
  },
  [KEYS_HIGHLIGHT_TYPE.FromTopToBottom]: {
    changeColorSpeed: 1,
    direction: 1,
  },
}

export { KEY_HIGHLIGHT_CONFIG, KEYS_HIGHLIGHT_TYPE, KEYS_HIGHLIGHT_TYPE_ORDER, KEYS_HIGHLIGHT_CONFIG };
