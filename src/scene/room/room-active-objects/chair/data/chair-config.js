import * as THREE from "three";
import { CHAIR_BOUNDING_BOX_TYPE, CHAIR_MOVEMENT_STATE, MOVING_AREA_TYPE, SEAT_ROTATION_DIRECTION } from "./chair-data";

const CHAIR_CONFIG = {
  seatRotation: {
    showSeatHelper: false,
    direction: SEAT_ROTATION_DIRECTION.Clockwise,
    speed: 0,
    impulse: 6,
    speedDecrease: 3.2,
    maxSpeed: 30,
    hitDampingCoefficient: 0.9,
    tableEdgeZ: 0.38,
    rotationRadius: 1.7,
    seatWidthAngle: 105,
  },
  chairMoving: {
    showMovingArea: false,
    movementState: CHAIR_MOVEMENT_STATE.Idle,
    lerpSpeed: 0.25,
    bouncingCoefficient: 1.2,
    borderEpsilon: 0.3,
    disableBouncingBorderError: 0.01,
    wheels: {
      rotationSpeed: 10,
      rotationSpeedError: 4,
      targetAngleMaxError: 10,
    },
    chairBoundingBox: {
      [CHAIR_BOUNDING_BOX_TYPE.Main]: {
        center: new THREE.Vector2(0, 0.2),
        size: new THREE.Vector2(3.5, 2.6),
      },
      [CHAIR_BOUNDING_BOX_TYPE.FrontWheel]: {
        center: new THREE.Vector2(0, -1.45),
        size: new THREE.Vector2(0.6, 0.7),
      },
    },
    movingArea: {
      [MOVING_AREA_TYPE.Main]: {
        center: new THREE.Vector2(0.4, 3),
        size: new THREE.Vector2(10.7, 5.4),
      },
      [MOVING_AREA_TYPE.UnderTable]: {
        center: new THREE.Vector2(0, -1),
        size: new THREE.Vector2(6.2 , 2.6),
      },
    },
    lockerArea: {
      center: new THREE.Vector2(-4.1, 0.5),
      size: new THREE.Vector2(1.8, 0.5),
    },
  }
}

export { CHAIR_CONFIG };
