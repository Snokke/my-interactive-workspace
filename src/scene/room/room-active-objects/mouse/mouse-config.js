import * as THREE from 'three';
import { AREA_BORDER_TYPE } from "./mouse-data";

const MOUSE_CONFIG = {
  size: new THREE.Vector3(0.22, 0.115, 0.32),
  position: { x: 0, y: 0 },
  movingArea: {
    showDebugPlane: false,
    width: 1.8,
    height: 1.6,
  },
}

const MOUSE_AREA_BORDER_CONFIG = {
  height: 0.15,
  distanceToShow: 0.3,
  color: 0xff0000,
  rotation: {
    [AREA_BORDER_TYPE.Left]: Math.PI * 0.5,
    [AREA_BORDER_TYPE.Right]: Math.PI * 0.5,
    [AREA_BORDER_TYPE.Top]: 0,
    [AREA_BORDER_TYPE.Bottom]: 0,
  },
}

const CURSOR_CONFIG = {
  sensitivity: 3,
  view: {
    width: 0.06,
    height: 0.087,
    scale: 1.5,
  },
  laptopScreenBottomOffset: 0.07,
  laptopScreenSizeY: 1,
  monitorBottomOffsetToNotTransferCursor: 0.06,
  offsetZFromScreen: 0.01,
}

export { MOUSE_CONFIG, CURSOR_CONFIG, MOUSE_AREA_BORDER_CONFIG };
