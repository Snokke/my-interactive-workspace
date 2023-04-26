import * as THREE from 'three';
import { SNOWFLAKE_PARTICLES_TYPE } from './snowflake-particles-data';

const SNOWFLAKE_PARTICLES_CONFIG = {
  startOffset: new THREE.Vector3(0.3, -0.7, 0),
  alphaEdge: { x: 6, y: 4 },
  showDebugAlphaEdge: false,
}

const SNOWFLAKE_PARTICLES_CONFIG_BY_TYPE = {
  [SNOWFLAKE_PARTICLES_TYPE.Type01]: {
    count: 50,
    size: 0.4,
    texture: 'snowflake-01',
    color: 0xffffff,
    speed: 1,
  },
  [SNOWFLAKE_PARTICLES_TYPE.Type02]: {
    count: 300,
    size: 0.2,
    texture: 'snowflake-02',
    color: 0xffffff,
    speed: 2,
  },
}

export { SNOWFLAKE_PARTICLES_CONFIG, SNOWFLAKE_PARTICLES_CONFIG_BY_TYPE };
