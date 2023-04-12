import { LAPTOP_POSITION_STATE, LAPTOP_STATE } from "./laptop-data";

const LAPTOP_CONFIG = {
  state: LAPTOP_STATE.Idle,
  positionType: LAPTOP_POSITION_STATE.Opened,
  defaultAngle: 123,
  maxOpenAngle: 123,
  rotationSpeed: 18,
  angle: 0,
}

const LAPTOP_MOUNT_CONFIG = {
  startAngle: 35,
  angle: 0,
  leftEdgeAngle: 0,
  rightEdgeAngle: 35,
}

export { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG };
