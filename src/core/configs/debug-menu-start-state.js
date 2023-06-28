import { ROOM_OBJECT_TYPE } from "../../scene/room/data/room-config";

const DEBUG_MENU_START_STATE = {
  ControlPanel: true,
    Settings: true,
      General: false,
      Sound: false,
      Camera: true,
    ActiveRoomObjects: false,
      [ROOM_OBJECT_TYPE.Walls]: false,
      [ROOM_OBJECT_TYPE.AirConditioner]: false,
      [ROOM_OBJECT_TYPE.FloorLamp]: false,
      [ROOM_OBJECT_TYPE.Locker]: false,
      [ROOM_OBJECT_TYPE.Chair]: false,
      [ROOM_OBJECT_TYPE.Table]: false,
      [ROOM_OBJECT_TYPE.Speakers]: false,
      [ROOM_OBJECT_TYPE.Monitor]: false,
      [ROOM_OBJECT_TYPE.Laptop]: false,
      [ROOM_OBJECT_TYPE.Keyboard]: false,
      [ROOM_OBJECT_TYPE.Mouse]: false,
      [ROOM_OBJECT_TYPE.Book]: false,
}

export { DEBUG_MENU_START_STATE };
