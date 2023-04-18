import * as THREE from 'three';
import { AIR_CONDITIONER_DOOR_POSITION_STATE, AIR_CONDITIONER_DOOR_STATE, AIR_CONDITIONER_STATE } from "./air-conditioner-data";

const AIR_CONDITIONER_CONFIG = {
  powerState: AIR_CONDITIONER_STATE.PowerOff,
  doorState: AIR_CONDITIONER_DOOR_STATE.Idle,
  doorPositionType: AIR_CONDITIONER_DOOR_POSITION_STATE.Closed,
  doorAngle: 0,
  rotationSpeed: 5,
  maxOpenAngle: 70,
}

const SNOWFLAKE_PARTICLES_CONFIG = {
  size: 80,
  count: 300,
  startOffset: new THREE.Vector3(0.3, -0.7, 0),
  doorWidth: 2.7,
  speed: 1,
}

export { AIR_CONDITIONER_CONFIG, SNOWFLAKE_PARTICLES_CONFIG };
