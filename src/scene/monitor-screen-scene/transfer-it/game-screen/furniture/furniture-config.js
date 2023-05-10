import * as CANNON from 'cannon-es';
import { TARGET_TYPE } from '../target/target-config';

const FURNITURE_TYPE = {
  refrigerator: 0,
  table1: 1,
  table2: 2,
  table_big: 3,
  chair: 4,
  gas_stove: 5,
  nightstand: 6,
  washing_machine: 7,
  cup: 8,
};

const FURNITURE_SIZE = {
  small: 0,
  standard: 1,
  big: 2,
};

const MIN_VECTOR = {
  [FURNITURE_SIZE.small]: new CANNON.Vec3(0.02, 0.02, 0.02).length(),
  [FURNITURE_SIZE.standard]: new CANNON.Vec3(0.017, 0.017, 0.017).length(),
  [FURNITURE_SIZE.big]: new CANNON.Vec3(0.026, 0.026, 0.026).length(),
};

const FURNITURE_CONFIG = {
  [FURNITURE_TYPE.refrigerator]: {
    modelName: 'transfer-it/refrigerator',
    size: FURNITURE_SIZE.big,
    isOneTile: true,
    targetType: TARGET_TYPE.standard,
  },
  [FURNITURE_TYPE.table1]: {
    modelName: 'transfer-it/table-1',
    size: FURNITURE_SIZE.standard,
    isOneTile: true,
    targetType: TARGET_TYPE.standard,
  },
  [FURNITURE_TYPE.table2]: {
    modelName: 'transfer-it/table-2',
    size: FURNITURE_SIZE.standard,
    isOneTile: true,
    targetType: TARGET_TYPE.standard,
  },
  [FURNITURE_TYPE.table_big]: {
    modelName: 'transfer-it/table-big',
    size: FURNITURE_SIZE.big,
    isOneTile: false,
    targetType: TARGET_TYPE.big,
  },
  [FURNITURE_TYPE.chair]: {
    modelName: 'transfer-it/chair',
    size: FURNITURE_SIZE.big,
    isOneTile: true,
    targetType: TARGET_TYPE.standard,
  },
  [FURNITURE_TYPE.gas_stove]: {
    modelName: 'transfer-it/gas-stove',
    size: FURNITURE_SIZE.standard,
    isOneTile: true,
    targetType: TARGET_TYPE.standard,
  },
  [FURNITURE_TYPE.nightstand]: {
    modelName: 'transfer-it/nightstand',
    size: FURNITURE_SIZE.big,
    isOneTile: false,
    targetType: TARGET_TYPE.big,
  },
  [FURNITURE_TYPE.washing_machine]: {
    modelName: 'transfer-it/washing-machine',
    size: FURNITURE_SIZE.standard,
    isOneTile: true,
    targetType: TARGET_TYPE.standard,
  },
  [FURNITURE_TYPE.cup]: {
    modelName: 'transfer-it/cup',
    size: FURNITURE_SIZE.small,
    isOneTile: true,
    targetType: TARGET_TYPE.small,
  },
};

export { FURNITURE_TYPE, FURNITURE_SIZE, FURNITURE_CONFIG, MIN_VECTOR };
