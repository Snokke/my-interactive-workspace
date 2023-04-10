import * as THREE from 'three';
import { MONITOR_HELP_ARROW_TYPE } from './monitor-data';

const MONITOR_CONFIG = {
  positionZ: 0,
  minZ: -0.7,
  maxZ: 0.4,
  helpArrows: {
    [MONITOR_HELP_ARROW_TYPE.Front]: {
      color: 0x00ff00,
      direction: new THREE.Vector3(0, 0, 1),
      offset: new THREE.Vector3(0, 0, 0.3),
      length: 1,
    },
    [MONITOR_HELP_ARROW_TYPE.Back]: {
      color: 0xff0000,
      direction: new THREE.Vector3(0, 0, -1),
      offset: new THREE.Vector3(0, 0, -0.3),
      length: 1,
    },
  },
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