const SCENE_CONFIG = {
  antialias: false,
  backgroundColor: 0xCCCCCC,
  camera: {
    fov: 60,
    near: 0.1,
    far: 500,
    startPosition: { x: 14, y: 14, z: 14 },
  },
  lights: {
    ambient: {
      color: 0xFFEFE4,
      intensity: 0.8,
    },
    directional: {
      color: 0xFFEFE4,
      intensity: 0.8,
      position: { x: -2, y: 7, z: 7 },
    },
  },
};

export default SCENE_CONFIG;
