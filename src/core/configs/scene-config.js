const SCENE_CONFIG = {
  antialias: false,
  backgroundColor: 0xCCCCCC,
  camera: {
    fov: 45,
    near: 1,
    far: 500,
    // startPosition: { x: 14, y: 14, z: 14 },
    // lookAt: { x: 0, y: 3.5, z: 0 },

    // monitor
    // startPosition: { x: 0, y: 5, z: 2 },
    // lookAt: { x: 0, y: 5, z: -1 },

    // keyboard
    startPosition: { x: 0, y: 6, z: 1 },
    lookAt: { x: 0, y: 3.5, z: -1 },
  },
  lights: {
    ambient: {
      color: 0xFFEFE4,
      intensity: 1,
    },
    directional: {
      color: 0xFFEFE4,
      intensity: 1,
      position: { x: -2, y: 7, z: 7 },
    },
  },
};

export default SCENE_CONFIG;
