import * as THREE from 'three';
import { AREA_BORDER_TYPE } from "./mouse-data";

const MOUSE_CONFIG = {
  size: new THREE.Vector3(0.35, 0.115, 0.54),
  position: { x: 0, y: 0 },
  movingArea: {
    showDebugPlane: false,
    width: 1.8,
    height: 1.5,
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

export { MOUSE_CONFIG, MOUSE_AREA_BORDER_CONFIG };
