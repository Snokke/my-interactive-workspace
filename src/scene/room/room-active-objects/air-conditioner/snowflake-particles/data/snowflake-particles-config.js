import * as THREE from 'three';
import { SNOWFLAKE_PARTICLES_TYPE } from './snowflake-particles-data';
import { TABLE_STATE } from '../../../table/data/table-data';

const SNOWFLAKE_PARTICLES_CONFIG = {
  startOffset: new THREE.Vector3(0.15, 0, 0),
  alphaEdge: { x: 6, y: 4 },
  showDebugAlphaEdge: false,
  sizeByTemperatureCoeff: 2,
  speedByTemperatureCoeff: 2,
  dataByTableState: {
    [TABLE_STATE.SittingMode]: {
      tableYDelta: 1,
      tableYCoeff: 1,
    },
    [TABLE_STATE.StandingMode]: {
      tableYDelta: 1,
      tableYCoeff: 2,
    },
  },
}

const SNOWFLAKE_PARTICLES_CONFIG_BY_TYPE = {
  [SNOWFLAKE_PARTICLES_TYPE.Type01]: {
    count: 80,
    size: 0.3,
    texture: 'air-conditioner-particles/snowflake-01',
    color: 0xffffff,
    speed: 1,
    countIncrement: 0.5,
  },
  [SNOWFLAKE_PARTICLES_TYPE.Type02]: {
    count: 250,
    size: 0.14,
    texture: 'air-conditioner-particles/snowflake-02',
    color: 0xa5b9fd,
    speed: 1.8,
    countIncrement: 0.5,
  },
  [SNOWFLAKE_PARTICLES_TYPE.Type03]: {
    count: 150,
    size: 0.2,
    texture: 'air-conditioner-particles/snowflake-03',
    color: 0x9ba6f9,
    speed: 1.4,
    countIncrement: 0.5,
  },
}

export { SNOWFLAKE_PARTICLES_CONFIG, SNOWFLAKE_PARTICLES_CONFIG_BY_TYPE };
