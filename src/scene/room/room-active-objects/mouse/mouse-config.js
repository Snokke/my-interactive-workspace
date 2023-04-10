import * as THREE from 'three';
import { MOUSE_HELP_ARROW_TYPE } from "./mouse-data";

const MOUSE_CONFIG = {
  movingArea: {
    showDebugPlane: false,
    width: 1.8,
    height: 1.6,
  },
  position: {
    x: 0,
    y: 0,
  },
  helpArrows: {
    [MOUSE_HELP_ARROW_TYPE.Front]: {
      color: 0xff0000,
      direction: new THREE.Vector3(0, 0, -1),
      offset: new THREE.Vector3(0, 0, -0.3),
      length: 0.7,
    },
    [MOUSE_HELP_ARROW_TYPE.Right]: {
      color: 0x00ff00,
      direction: new THREE.Vector3(1, 0, 0),
      offset: new THREE.Vector3(0.2, 0, 0),
      length: 0.7,
    },
  },
}

const CURSOR_CONFIG = {
  sensitivity: 3,
  view: {
    width: 0.06,
    height: 0.087,
    scale: 1.5,
  },
  notebookScreenBottomOffset: 0.07,
  notebookScreenSizeY: 1,
  monitorBottomOffsetToNotTransferCursor: 0.06,
  offsetFromScreen: 0.01,
}

export { MOUSE_CONFIG, CURSOR_CONFIG };
