import { ROOM_OBJECT_TYPE } from "./room-config";

const SOUNDS_CONFIG = {
  enabled: true,
  volume: 1,
  debugHelpers: true,
  closedWindowOuterGain: 0.1,
  openedWindowOuterGain: 0.6,
  objects: {
    [ROOM_OBJECT_TYPE.AirConditioner]: {
      enabled: true,
      volume: 1,
      refDistance: 10,
      helperSize: 0.2,
      // coneInnerAngle: 0,
      // coneOuterAngle: 0,
    },
    [ROOM_OBJECT_TYPE.Keyboard]: {
      enabled: true,
      volume: 1,
      refDistance: 10,
      helperSize: 0.2,
    },
    [ROOM_OBJECT_TYPE.Locker]: {
      enabled: true,
      volume: 1,
      refDistance: 10,
      helperSize: 0.2,
    },
    [ROOM_OBJECT_TYPE.Table]: {
      enabled: true,
      volume: 1,
      refDistance: 10,
      helperSize: 0.2,
    },
    [ROOM_OBJECT_TYPE.Window]: {
      enabled: true,
      volume: 1,
      refDistance: 10,
      helperSize: 0.2,
    },
    [ROOM_OBJECT_TYPE.Chair]: {
      enabled: true,
      volume: 1,
      refDistance: 10,
      helperSize: 0.2,
    },
    [ROOM_OBJECT_TYPE.Lamp]: {
      enabled: true,
      volume: 1,
      refDistance: 10,
      helperSize: 0.2,
    },
    [ROOM_OBJECT_TYPE.Mouse]: {
      enabled: true,
      volume: 1,
      refDistance: 10,
      helperSize: 0.2,
    },
  }
}

export { SOUNDS_CONFIG };
