import { CHAIR_MOVEMENT_STATE, CHAIR_POSITION_TYPE, SEAT_ROTATION_DIRECTION } from "./chair-data";

const CHAIR_CONFIG = {
  seatRotation: {
    speed: 0,
    direction: SEAT_ROTATION_DIRECTION.Clockwise,
    impulse: 6,
    speedDecrease: 4,
    maxSpeed: 30,
    maxAngleWhenNearTable: 0.78,
    hitDampingCoefficient: 0.9,
  },
  position: {
    state: CHAIR_MOVEMENT_STATE.Idle,
    positionType: CHAIR_POSITION_TYPE.AwayFromTable,
    speed: 1.8,
    distanceToTablePosition: -3.3,
    distanceToEnableRotation: -1.7,
  }
}

export { CHAIR_CONFIG };
