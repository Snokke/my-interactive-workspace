import { ROOM_OBJECT_TYPE } from "./room-config";

const ROOM_OBJECT_VISIBILITY_CONFIG = {
  // Active objects
  [ROOM_OBJECT_TYPE.Walls]: true,
  [ROOM_OBJECT_TYPE.AirConditioner]: true,
  [ROOM_OBJECT_TYPE.FloorLamp]: true,
  [ROOM_OBJECT_TYPE.Locker]: true,
  [ROOM_OBJECT_TYPE.Chair]: true,
  [ROOM_OBJECT_TYPE.Table]: true,
  [ROOM_OBJECT_TYPE.Speakers]: true,
  [ROOM_OBJECT_TYPE.Monitor]: true,
  [ROOM_OBJECT_TYPE.Notebook]: true,
  [ROOM_OBJECT_TYPE.Keyboard]: true,
  [ROOM_OBJECT_TYPE.Mouse]: true,

  // Inactive objects
  [ROOM_OBJECT_TYPE.Scales]: true,
  [ROOM_OBJECT_TYPE.Map]: true,
  [ROOM_OBJECT_TYPE.Carpet]: true,
  [ROOM_OBJECT_TYPE.Bin]: true,
  [ROOM_OBJECT_TYPE.Pouf]: true,
  [ROOM_OBJECT_TYPE.MousePad]: true,
  [ROOM_OBJECT_TYPE.Coaster]: true,
  [ROOM_OBJECT_TYPE.Cup]: true,
  [ROOM_OBJECT_TYPE.Organizer]: true,
}

const ROOM_OBJECT_ENABLED_CONFIG = {
  // Active objects
  [ROOM_OBJECT_TYPE.Walls]: false,
  [ROOM_OBJECT_TYPE.AirConditioner]: false,
  [ROOM_OBJECT_TYPE.FloorLamp]: false,
  [ROOM_OBJECT_TYPE.Locker]: false,
  [ROOM_OBJECT_TYPE.Chair]: false,
  [ROOM_OBJECT_TYPE.Table]: false,
  [ROOM_OBJECT_TYPE.Speakers]: true,
  [ROOM_OBJECT_TYPE.Monitor]: false,
  [ROOM_OBJECT_TYPE.Notebook]: false,
  [ROOM_OBJECT_TYPE.Keyboard]: false,
  [ROOM_OBJECT_TYPE.Mouse]: false,
}

export { ROOM_OBJECT_VISIBILITY_CONFIG, ROOM_OBJECT_ENABLED_CONFIG };
