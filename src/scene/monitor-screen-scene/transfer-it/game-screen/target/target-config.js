const TARGET_TYPE = {
  small: 0,
  standard: 1,
  big: 2,
};

const TARGET_TEXTURE = {
  [TARGET_TYPE.small]: 'transfer-it/target-small',
  [TARGET_TYPE.standard]: 'transfer-it/target',
  [TARGET_TYPE.big]: 'transfer-it/target-big',
};

export { TARGET_TYPE, TARGET_TEXTURE };
