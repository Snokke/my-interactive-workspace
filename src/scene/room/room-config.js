import Table from './room-objects/table/table';
import Locker from './room-objects/locker/locker';
import FloorLamp from './room-objects/floor-lamp/floor-lamp';

const ROOM_CONFIG = {
  outlineEnabled: true,
  showStartAnimations: false,
}

const ROOM_OBJECT_TYPE = {
  Table: 'TABLE',
  Locker: 'LOCKER',
  FloorLamp: 'FLOOR_LAMP',
}

const ROOM_OBJECT_CONFIG = {
  [ROOM_OBJECT_TYPE.Table]: {
    groupName: 'Table',
    class: Table,
  },
  [ROOM_OBJECT_TYPE.Locker]: {
    groupName: 'Locker',
    class: Locker,
  },
  [ROOM_OBJECT_TYPE.FloorLamp]: {
    groupName: 'Floor_lamp',
    class: FloorLamp,
  },
}

const START_ANIMATION_ALL_OBJECTS = 'START_ANIMATION_ALL_OBJECTS';

export { ROOM_CONFIG, ROOM_OBJECT_TYPE, ROOM_OBJECT_CONFIG, START_ANIMATION_ALL_OBJECTS };
