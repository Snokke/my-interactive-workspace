import * as THREE from "three";
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { CAMERA_FOCUS_OBJECT_TYPE, CAMERA_MODE, FOCUS_TYPE } from "./camera-data";
import { ROOM_OBJECT_TYPE } from "../../data/room-config";

const CAMERA_CONFIG = {
  fov: 45,
  near: 0.8,
  far: 50,
  focusObjectType: CAMERA_FOCUS_OBJECT_TYPE.Room,
  mode: CAMERA_MODE.OrbitControls,
  movementToFocusObject: {
    speed: 3,
    minTime: 500,
    maxTime: 1300,
  },
}

const FOCUSED_MODE_CAMERA_CONFIG = {
  rotation: {
    coefficient: 0.4,
    lerpTime: 0.06,
  },
  zoom: {
    coefficient: 0.1,
    lerpTime: 0.05,
    objects: {
      [CAMERA_FOCUS_OBJECT_TYPE.Monitor]: {
        minDistance: 3,
        maxDistance: 5.5,
      },
      [CAMERA_FOCUS_OBJECT_TYPE.Keyboard]: {
        minDistance: 1.5,
        maxDistance: 4,
      },
    },
  },
}

const STATIC_MODE_CAMERA_CONFIG = {
  [ROOM_OBJECT_TYPE.Book]: {
    objectMoveTime: 500,
    rotation: {
      coefficient: 0.1,
      lerpTime: 0.05,
      startRotation: {
        axis: new THREE.Vector3(0, 1, 0),
        angle: Math.PI * 0.5,
      },
    },
    zoom: {
      defaultDistance: 2,
      minDistance: 1,
      maxDistance: 2.7,
      coefficient: 0.1,
      lerpTime: 0.05,
    },
  },
  [ROOM_OBJECT_TYPE.AirConditionerRemote]: {
    objectMoveTime: 250,
    rotation: {
      coefficient: 0.5,
      lerpTime: 0.05,
      startRotation: {
        axis: new THREE.Vector3(1, 0, 0),
        angle: Math.PI * 0.5,
      },
    },
    zoom: {
      defaultDistance: 1.5,
      minDistance: 1,
      maxDistance: 2,
      coefficient: 0.1,
      lerpTime: 0.05,
    },
  },
  [ROOM_OBJECT_TYPE.Locker]: {
    objectMoveTime: 250,
    rotation: {
      coefficient: 0.5,
      lerpTime: 0.05,
      startRotation: {
        axis: new THREE.Vector3(1, 0, 0),
        angle: Math.PI * 0.5,
      },
    },
    zoom: {
      defaultDistance: 1.5,
      minDistance: 1,
      maxDistance: 2,
      coefficient: 0.1,
      lerpTime: 0.05,
    },
  },
}

const ORBIT_CONTROLS_MODE_CONFIG = {
  enabled: true,
  enableDamping: true,
  dampingFactor: 0.07,
  rotateSpeed: 0.5,
  panSpeed: 0.5,
  minPolarAngle: 0,
  maxPolarAngle: Math.PI * 0.5,
  minDistance: 1.7,
  maxDistance: 33,
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
      positionFromObject: new THREE.Vector3(1.5, 2, 1.5),
    },
    positionEasing: TWEEN.Easing.Linear.None,
    rotationEasing: TWEEN.Easing.Linear.None,
    enableOrbitControlsOnComplete: false,
  },
  [CAMERA_FOCUS_OBJECT_TYPE.LastPosition]: {
    focusType: FOCUS_TYPE.Position,
    positionEasing: TWEEN.Easing.Linear.None,
    rotationEasing: TWEEN.Easing.Linear.None,
    enableOrbitControlsOnComplete: true,
  },
}

export {
  CAMERA_FOCUS_POSITION_CONFIG,
  ORBIT_CONTROLS_MODE_CONFIG,
  CAMERA_CONFIG,
  STATIC_MODE_CAMERA_CONFIG,
  FOCUSED_MODE_CAMERA_CONFIG,
};
