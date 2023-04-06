import { CHAIR_MOVEMENT_STATE, CHAIR_POSITION_TYPE, SEAT_ROTATION_DIRECTION } from "./chair-data";

const CHAIR_CONFIG = {
  seatRotation: {
    speed: 0,
    direction: SEAT_ROTATION_DIRECTION.Clockwise,
    impulse: 6,
    speedDecrease: 4,
    maxSpeed: 30,
    hitDampingCoefficient: 0.9,
  },
  chairMoving: {
    state: CHAIR_MOVEMENT_STATE.Idle,
    positionType: CHAIR_POSITION_TYPE.AwayFromTable,
    speed: 1.8,
    distanceToTablePosition: 3.3,
    distanceToEnableRotation: 2.1,
    maxDistanceToTable: 4.3,
    wheels: {
      rotationSpeed: 10,
      rotationSpeedError: 4,
      targetAngle: {
        [CHAIR_POSITION_TYPE.AwayFromTable]: Math.PI,
        [CHAIR_POSITION_TYPE.NearTable]: 0,
      },
      targetAngleMaxError: 10,
    },
  }
}

export { CHAIR_CONFIG };
