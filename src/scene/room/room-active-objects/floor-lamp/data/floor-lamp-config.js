import { LIGHT_STATE } from "./floor-lamp-data";

const FLOOR_LAMP_CONFIG = {
  lightState: LIGHT_STATE.On,
  debugLightState: LIGHT_STATE.On,
  lightPercent: 1,
  switchDuration: 150,
  lampOnColor: {
    inner: 0xffffff,
    outer: 0xfafafa,
  },
}

export { FLOOR_LAMP_CONFIG };
