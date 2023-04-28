import * as THREE from "three";
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { CAMERA_FOCUS_OBJECT_TYPE, FOCUS_TYPE } from "./camera-data";
import { ROOM_OBJECT_TYPE } from "../../data/room-config";

const CAMERA_CONFIG = {
  fov: 45,
  near: 1,
  far: 50,
  movementToFocusObject: {
    speed: 3,
    minTime: 500,
    maxTime: 1300,
  },
  focusedState: {
    rotationCoefficient: 0.5,
    lerpTime: 3,
  }
}

const ORBIT_CONTROLS_CONFIG = {
  enabled: true,
  enableDamping: true,
  dampingFactor: 0.04,
  rotateSpeed: 0.5,
  panSpeed: 0.5,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI * 0.5,
  minDistance: 1.7,
  maxDistance: 35,
  minPan: new THREE.Vector3(-5, 0, -5),
  maxPan: new THREE.Vector3(5, 10, 5),
}

const CAMERA_FOCUS_POSITION_CONFIG = {
  [CAMERA_FOCUS_OBJECT_TYPE.Room]: {
    focusType: FOCUS_TYPE.Position,
    focus: {
      position: new THREE.Vector3(14, 14, 14),
      lookAt: new THREE.Vector3(0, 3.5, 0),
    },
    positionEasing: TWEEN.Easing.Linear.None,
    rotationEasing: TWEEN.Easing.Linear.None,
    enableOrbitControlsOnComplete: true,
  },
  [CAMERA_FOCUS_OBJECT_TYPE.Monitor]: {
    focusType: FOCUS_TYPE.Object,
    focus: {
      objectType: ROOM_OBJECT_TYPE.Monitor,
      positionFromObject: new THREE.Vector3(0, 0, 5),
    },
    positionEasing: TWEEN.Easing.Linear.None,
    rotationEasing: TWEEN.Easing.Linear.None,
    enableOrbitControlsOnComplete: false,
  },
  [CAMERA_FOCUS_OBJECT_TYPE.Keyboard]: {
    focusType: FOCUS_TYPE.Object,
    focus: {
      objectType: ROOM_OBJECT_TYPE.Keyboard,
      positionFromObject: new THREE.Vector3(2, 3, 2),
    },
    positionEasing: TWEEN.Easing.Linear.None,
    rotationEasing: TWEEN.Easing.Linear.None,
    enableOrbitControlsOnComplete: false,
  },
}

export { CAMERA_FOCUS_POSITION_CONFIG, ORBIT_CONTROLS_CONFIG, CAMERA_CONFIG };
