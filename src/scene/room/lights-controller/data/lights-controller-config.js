import { LIGHT_TYPE } from "./lights-controller-data";

const LIGHTS_CONTROLLER_CONFIG = {
  lights: {
    [LIGHT_TYPE.Lamp]: {
      near: 1,
      far: 20,
      fov: 80,
      mapSize: 512,
    },
    [LIGHT_TYPE.Monitor]: {
      near: 1,
      far: 20,
      fov: 80,
      mapSize: 512,
    },
  },
  helpers: {
    colorOn: 0x00ff00,
    colorOff: 0xffffff,
  },
}

export { LIGHTS_CONTROLLER_CONFIG };
