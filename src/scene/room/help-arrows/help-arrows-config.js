import * as THREE from 'three';

const HELP_ARROW_TYPE = {
  MouseFront: 'MOUSE_FRONT',
  MouseRight: 'MOUSE_RIGHT',
  MonitorFront: 'MONITOR_FRONT',
  MonitorBack: 'MONITOR_BACK',
  LaptopMountLeft: 'LAPTOP_MOUNT_LEFT',
  LaptopMountRight: 'LAPTOP_MOUNT_RIGHT',
}

const HELP_ARROWS_CONFIG = {
  [HELP_ARROW_TYPE.MouseFront]: {
    color: 0xff0000,
    direction: new THREE.Vector3(0, 0, -1),
    offset: new THREE.Vector3(0, 0, -0.3),
    length: 0.7,
  },
  [HELP_ARROW_TYPE.MouseRight]: {
    color: 0x00ff00,
    direction: new THREE.Vector3(1, 0, 0),
    offset: new THREE.Vector3(0.2, 0, 0),
    length: 0.7,
  },

  [HELP_ARROW_TYPE.MonitorFront]: {
    color: 0x00ff00,
    direction: new THREE.Vector3(0, 0, 1),
    offset: new THREE.Vector3(0, 0, 0.3),
    length: 1,
  },
  [HELP_ARROW_TYPE.MonitorBack]: {
    color: 0xff0000,
    direction: new THREE.Vector3(0, 0, -1),
    offset: new THREE.Vector3(0, 0, -0.3),
    length: 1,
  },
  [HELP_ARROW_TYPE.LaptopMountLeft]: {
    color: 0x00ff00,
    direction: new THREE.Vector3(-1, 0, 0),
    offset: new THREE.Vector3(-0.8, 0, 0),
    length: 0.7,
  },
  [HELP_ARROW_TYPE.LaptopMountRight]: {
    color: 0xff0000,
    direction: new THREE.Vector3(1, 0, 0),
    offset: new THREE.Vector3(0.8, 0, 0),
    length: 0.7,
  },
}

export { HELP_ARROWS_CONFIG, HELP_ARROW_TYPE };
