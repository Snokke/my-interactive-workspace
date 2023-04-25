import { ROOM_OBJECT_TYPE } from "./room-config";

const SOUNDS_CONFIG = {
  enabled: true,
  volume: 1,
  debugHelpers: false,
  closedWindowOuterGain: 0.1,
  openedWindowOuterGain: 0.6,
  objects: {
    [ROOM_OBJECT_TYPE.Speakers]: {
      volume: 1,
      refDistance: 10,
      rotation: 40,
      coneInnerAngle: 120,
      coneOuterAngle: 160,
      helperSize: 2,
    },
    [ROOM_OBJECT_TYPE.AirConditioner]: {
      volume: 1,
      refDistance: 10,
      rotation: 52,
      coneInnerAngle: 90,
      coneOuterAngle: 130,
      helperSize: 2,
    },
    [ROOM_OBJECT_TYPE.Keyboard]: {
      volume: 1,
      refDistance: 10,
      helperSize: 0.15,
    },
    [ROOM_OBJECT_TYPE.Mouse]: {
      volume: 1,
      refDistance: 10,
      helperSize: 0.15,
    },
    [ROOM_OBJECT_TYPE.Locker]: {
      volume: 1,
      refDistance: 10,
      helperSize: 0.2,
    },
    [ROOM_OBJECT_TYPE.Table]: {
      volume: 1,
      refDistance: 10,
      helperSize: 0.2,
    },
    [ROOM_OBJECT_TYPE.Walls]: {
      volume: 1,
      refDistance: 10,
      helperSize: 0.4,
    },
    [ROOM_OBJECT_TYPE.Chair]: {
      volume: 0.5,
      refDistance: 10,
      helperSize: 0.4,
    },
    [ROOM_OBJECT_TYPE.FloorLamp]: {
      volume: 1,
      refDistance: 10,
      helperSize: 0.3,
    },
  }
}

export { SOUNDS_CONFIG };
