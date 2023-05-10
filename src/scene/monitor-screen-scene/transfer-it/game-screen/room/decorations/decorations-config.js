const CARPET_TYPE = {
  purple: 0,
};

const PICTURE_TYPE = {
  cat: 0,
  tomato: 1,
};

const CARPET_CONFIG = {
  [CARPET_TYPE.purple]: {
    texture: 'transfer-it/carpet-texture',
  },
};

const PICTURE_CONFIG = {
  [PICTURE_TYPE.cat]: {
    texture: 'transfer-it/cat',
  },
  [PICTURE_TYPE.tomato]: {
    texture: 'transfer-it/tomato',
  },
};

export { CARPET_TYPE, PICTURE_TYPE, CARPET_CONFIG, PICTURE_CONFIG };
