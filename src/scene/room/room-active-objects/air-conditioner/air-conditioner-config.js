import { AIR_CONDITIONER_DOOR_POSITION_STATE, AIR_CONDITIONER_DOOR_STATE, AIR_CONDITIONER_STATE } from "./air-conditioner-data";

const AIR_CONDITIONER_CONFIG = {
  powerState: AIR_CONDITIONER_STATE.PowerOff,
  doorState: AIR_CONDITIONER_DOOR_STATE.Idle,
  doorPositionType: AIR_CONDITIONER_DOOR_POSITION_STATE.Closed,
  doorAngle: 0,
  rotationSpeed: 25, // 5
  maxOpenAngle: 80,
  doorWidth: 2.7,
}

export { AIR_CONDITIONER_CONFIG };
