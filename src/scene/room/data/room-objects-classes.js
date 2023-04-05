import AirConditioner from "../room-active-objects/air-conditioner/air-conditioner";
import AirConditionerDebugMenu from "../room-active-objects/air-conditioner/air-conditioner-debug-menu";
import Chair from "../room-active-objects/chair/chair";
import ChairDebugMenu from "../room-active-objects/chair/chair-debug-menu";
import FloorLamp from "../room-active-objects/floor-lamp/floor-lamp";
import FloorLampDebugMenu from "../room-active-objects/floor-lamp/floor-lamp-debug-menu";
import Keyboard from "../room-active-objects/keyboard/keyboard";
import KeyboardDebugMenu from "../room-active-objects/keyboard/keyboard-debug-menu";
import Locker from "../room-active-objects/locker/locker";
import LockerDebugMenu from "../room-active-objects/locker/locker-debug-menu";
import Monitor from "../room-active-objects/monitor/monitor";
import MonitorDebugMenu from "../room-active-objects/monitor/monitor-debug-menu";
import Mouse from "../room-active-objects/mouse/mouse";
import MouseDebugMenu from "../room-active-objects/mouse/mouse-debug-menu";
import Notebook from "../room-active-objects/notebook/notebook";
import NotebookDebugMenu from "../room-active-objects/notebook/notebook-debug-menu";
import Speakers from "../room-active-objects/speakers/speakers";
import SpeakersDebugMenu from "../room-active-objects/speakers/speakers-debug-menu";
import Table from "../room-active-objects/table/table";
import TableDebugMenu from "../room-active-objects/table/table-debug-menu";
import Walls from "../room-active-objects/walls/walls";
import WindowDebugMenu from "../room-active-objects/walls/window-debug-menu";
import { ROOM_OBJECT_TYPE } from "./room-config";

const ROOM_OBJECT_CLASS = {
  [ROOM_OBJECT_TYPE.Walls]: {
    object: Walls,
    debugMenu: WindowDebugMenu,
  },
  [ROOM_OBJECT_TYPE.AirConditioner]: {
    object: AirConditioner,
    debugMenu: AirConditionerDebugMenu,
  },
  [ROOM_OBJECT_TYPE.FloorLamp]: {
    object: FloorLamp,
    debugMenu: FloorLampDebugMenu,
  },
  [ROOM_OBJECT_TYPE.Locker]: {
    object: Locker,
    debugMenu: LockerDebugMenu,
  },
  [ROOM_OBJECT_TYPE.Chair]: {
    object: Chair,
    debugMenu: ChairDebugMenu,
  },
  [ROOM_OBJECT_TYPE.Table]: {
    object: Table,
    debugMenu: TableDebugMenu,
  },
  [ROOM_OBJECT_TYPE.Speakers]: {
    object: Speakers,
    debugMenu: SpeakersDebugMenu,
  },
  [ROOM_OBJECT_TYPE.Monitor]: {
    object: Monitor,
    debugMenu: MonitorDebugMenu,
  },
  [ROOM_OBJECT_TYPE.Notebook]: {
    object: Notebook,
    debugMenu: NotebookDebugMenu,
  },
  [ROOM_OBJECT_TYPE.Keyboard]: {
    object: Keyboard,
    debugMenu: KeyboardDebugMenu,
  },
  [ROOM_OBJECT_TYPE.Mouse]: {
    object: Mouse,
    debugMenu: MouseDebugMenu,
  },
}

export { ROOM_OBJECT_CLASS };
