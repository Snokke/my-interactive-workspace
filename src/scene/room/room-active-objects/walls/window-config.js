import * as THREE from 'three';
import { WINDOW_OPEN_TYPE } from './walls-data';

const WINDOW_CONFIG = {
  rotateAxisDebug: false,
  handleRotationSpeed: 5,
  windowRotationSpeed: 30,
  openTypes: {
    [WINDOW_OPEN_TYPE.Horizontally]: {
      openAngle: 19,
      handleAngle: 90,
      rotateAxis: new THREE.Vector3(0, 1, 0),
      pivotOffset: new THREE.Vector3(-2.3, 0, 0.15),
      rotationSign: 1,
      windowRotationAxis: 'y',
    },
    [WINDOW_OPEN_TYPE.Vertically]: {
      openAngle: 10,
      handleAngle: 180,
      rotateAxis: new THREE.Vector3(1, 0, 0),
      pivotOffset: new THREE.Vector3(0, -2.27, 0.15),
      rotationSign: -1,
      windowRotationAxis: 'x',
    },
  },
}

export { WINDOW_CONFIG };
