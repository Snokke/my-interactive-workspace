const MONITOR_CONFIG = {
  showDebugButtons: false,
  positionZ: 0,
  minZ: -0.7,
  maxZ: 0.4,
}

const MONITOR_ARM_MOUNT_CONFIG = {
  arm01: {
    angle: 0,
    shoulderCoeff: 0.85,
    angleCoeff: 1.08,
  },
  arm02: {
    angle: 0,
    shoulderCoeff: 1.25,
    angleCoeff: 0.18,
    bonusAngle: 5,
  },
}

export { MONITOR_CONFIG, MONITOR_ARM_MOUNT_CONFIG };
