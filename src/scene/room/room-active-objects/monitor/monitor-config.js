const MONITOR_CONFIG = {
  monitor: {
    positionZ: 0,
    minZ: -0.7,
    maxZ: 0.4,
  },
  armMount: {
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
  },
}

export default MONITOR_CONFIG;
