const DRONE_TYPE = {
  yellow: 0,
  blue: 1,
};

const DRONE_MODELS = {
  [DRONE_TYPE.yellow]: {
    modelName: 'transfer-it/drone-01',
  },
  [DRONE_TYPE.blue]: {
    modelName: 'transfer-it/drone-02',
  },
};

const DRONES = [
  DRONE_TYPE.yellow,
  DRONE_TYPE.blue,
];

export { DRONE_TYPE, DRONE_MODELS, DRONES };
