import { NOTEBOOK_POSITION_STATE, NOTEBOOK_STATE } from "./notebook-data";

const NOTEBOOK_CONFIG = {
  state: NOTEBOOK_STATE.Idle,
  positionType: NOTEBOOK_POSITION_STATE.Opened,
  maxOpenAngle: 123,
  rotationSpeed: 18,
  angle: 0,
}

const NOTEBOOK_MOUNT_CONFIG = {
  startAngle: 35,
  angle: 0,
  leftEdgeAngle: 0,
  rightEdgeAngle: 35,
}

export { NOTEBOOK_CONFIG, NOTEBOOK_MOUNT_CONFIG };
