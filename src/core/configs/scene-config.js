const SCENE_CONFIG = {
  antialias: false,
  fxaaPass: true,
  backgroundColor: 0x000000,
  lights: {
    ambient: {
      color: 0xFFEFE4,
      intensity: 1,
    },
    directional: {
      color: 0xFFEFE4,
      intensity: 1,
      position: { x: 3, y: 13, z: -3 },
    },
  },
};

export default SCENE_CONFIG;
