import { NOTEBOOK_POSITION_STATE, NOTEBOOK_STATE } from "./notebook-data";

const NOTEBOOK_CONFIG = {
  state: NOTEBOOK_STATE.Idle,
  positionType: NOTEBOOK_POSITION_STATE.Opened,
  maxOpenAngle: 123,
  rotationSpeed: 18,
}

const NOTEBOOK_MOUNT_CONFIG = {
  startAngle: 23,
}

export { NOTEBOOK_CONFIG, NOTEBOOK_MOUNT_CONFIG };
