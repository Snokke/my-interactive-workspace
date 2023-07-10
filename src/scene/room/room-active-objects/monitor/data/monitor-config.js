import * as THREE from 'three';
import { MONITOR_PART_TYPE } from "./monitor-data";

const MONITOR_CONFIG = {
  showDebugButtons: false,
  positionZ: 0,
  minZ: -0.7,
  maxZ: 0.4,
  hideOffset: 0.01,
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

const MONITOR_LINKS_CONFIG = {
  cv: 'https://www.andriibabintsev.com/pdf/andrii-babintsev-cv.pdf',
  showreel: 'https://www.youtube.com/watch?v=HmZ_MUd3zJY',
}

const MONITOR_BUTTONS_CONFIG = {
  mouseOverColor: new THREE.Color(0x8ff88c),
  buttons: {
    [MONITOR_PART_TYPE.MonitorScreenShowreelIcon]: {
      area: {
        position: new THREE.Vector2(-0.495, 0.27),
        size: new THREE.Vector2(0.332, 0.332),
      },
      textureName: 'screens/monitor/showreel-icon',
    },
    [MONITOR_PART_TYPE.MonitorScreenCVIcon]: {
      area: {
        position: new THREE.Vector2(1.275, 0.58),
        size: new THREE.Vector2(0.332, 0.332),
      },
      textureName: 'screens/monitor/cv-icon',
    },
    [MONITOR_PART_TYPE.MonitorScreenTransferItIcon]: {
      area: {
        position: new THREE.Vector2(-0.06, 0.27),
        size: new THREE.Vector2(0.332, 0.332),
      },
      textureName: 'screens/monitor/game-transfer-it-icon',
    },
    [MONITOR_PART_TYPE.MonitorScreenCloseIcon]: {
      area: {
        position: new THREE.Vector2(-1.41, 0.74),
        size: new THREE.Vector2(0.11, 0.11),
      },
      textureName: 'close-icon',
    },
    [MONITOR_PART_TYPE.MonitorScreenYoutubeLogo]: {
      area: {
        position: new THREE.Vector2(-1.41, 0.74),
        size: new THREE.Vector2(0.11, 0.11),
      },
      textureName: 'screens/monitor/youtube-logo',
    },
  },
}

export {
  MONITOR_CONFIG,
  MONITOR_ARM_MOUNT_CONFIG,
  MONITOR_BUTTONS_CONFIG,
  MONITOR_LINKS_CONFIG,
};
