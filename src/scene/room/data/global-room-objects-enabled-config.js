import { ROOM_OBJECT_TYPE } from "./room-config";

const GLOBAL_ROOM_OBJECT_ENABLED_CONFIG = {
  [ROOM_OBJECT_TYPE.Walls]: true,
  [ROOM_OBJECT_TYPE.AirConditioner]: true,
  [ROOM_OBJECT_TYPE.AirConditionerRemote]: true,
  [ROOM_OBJECT_TYPE.FloorLamp]: false,
  [ROOM_OBJECT_TYPE.Locker]: true,
  [ROOM_OBJECT_TYPE.Chair]: true,
  [ROOM_OBJECT_TYPE.Table]: true,
  [ROOM_OBJECT_TYPE.Speakers]: true,
  [ROOM_OBJECT_TYPE.Monitor]: true,
  [ROOM_OBJECT_TYPE.Laptop]: true,
  [ROOM_OBJECT_TYPE.Keyboard]: true,
  [ROOM_OBJECT_TYPE.Mouse]: true,
  [ROOM_OBJECT_TYPE.SocialNetworkLogos]: true,
  [ROOM_OBJECT_TYPE.Book]: true,
}

export { GLOBAL_ROOM_OBJECT_ENABLED_CONFIG };
