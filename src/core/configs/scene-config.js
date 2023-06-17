const SCENE_CONFIG = {
  antialias: false,
  fxaaPass: false,
  backgroundColor: 0x222222,
  lights: {
    ambient: {
      color: 0xFFEFE4,
      intensity: 2,
    },
    directional: {
      color: 0xFFEFE4,
      intensity: 1,
      position: { x: -4, y: 8, z: -4 },
    },
  },
};

export default SCENE_CONFIG;
