import Table from './room-objects/table/table';
import Locker from './room-objects/locker/locker';
import FloorLamp from './room-objects/floor-lamp/floor-lamp';
import Walls from './room-objects/walls/walls';

const ROOM_CONFIG = {
  outlineEnabled: true,
  showStartAnimations: false,
}

const ROOM_OBJECT_TYPE = {
  Walls: 'WALLS',
  Table: 'TABLE',
  Locker: 'LOCKER',
  FloorLamp: 'FLOOR_LAMP',
}

const ROOM_OBJECT_CONFIG = {
  [ROOM_OBJECT_TYPE.Walls]: {
    enabled: true,
    groupName: 'Walls',
    class: Walls,
  },
  [ROOM_OBJECT_TYPE.Table]: {
    enabled: true,
    groupName: 'Table',
    class: Table,
  },
  [ROOM_OBJECT_TYPE.Locker]: {
    enabled: true,
    groupName: 'Locker',
    class: Locker,
  },
  [ROOM_OBJECT_TYPE.FloorLamp]: {
    enabled: true,
    groupName: 'Floor_lamp',
    class: FloorLamp,
  },
}

const START_ANIMATION_ALL_OBJECTS = 'START_ANIMATION_ALL_OBJECTS';

export { ROOM_CONFIG, ROOM_OBJECT_TYPE, ROOM_OBJECT_CONFIG, START_ANIMATION_ALL_OBJECTS };
