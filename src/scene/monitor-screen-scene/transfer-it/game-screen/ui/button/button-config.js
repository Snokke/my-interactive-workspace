const BUTTON_TYPE = {
  Next: 'NEXT',
  Restart: 'RESTART',
}

const BUTTON_CONFIG = {
  [BUTTON_TYPE.Next]: {
    textureFrameName: 'transfer-it/button-next',
  },
  [BUTTON_TYPE.Restart]: {
    textureFrameName: 'transfer-it/button-restart',
  },
}

export { BUTTON_TYPE, BUTTON_CONFIG };
