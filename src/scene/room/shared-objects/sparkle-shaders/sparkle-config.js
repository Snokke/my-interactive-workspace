import * as THREE from 'three';
import { MONITOR_TYPE } from '../../data/room-config';

const SPARKLE_CONFIG = {
  [MONITOR_TYPE.Laptop]: {
    color: new THREE.Color(0xffffff),
    thickness: 0.03,
    blur: 0.04,
    angle: -6,
    speed: 15,
    movingWidth: 15,
  },
  [MONITOR_TYPE.Monitor]: {
    color: new THREE.Color(0xffffff),
    thickness: 0.1,
    blur: 0.06,
    angle: -30,
    speed: 30,
    movingWidth: 10,
  },
}

export { SPARKLE_CONFIG };
