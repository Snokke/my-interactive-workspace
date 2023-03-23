import Table from './room-objects/table/table';
import Locker from './room-objects/locker/locker';

const ROOM_CONFIG = {
  outlineEnabled: true,
  showStartAnimations: false,
}

const ROOM_OBJECT_TYPE = {
  Table: 'TABLE',
  Locker: 'LOCKER',
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
}

const START_ANIMATION_ALL_OBJECTS = 'START_ANIMATION_ALL_OBJECTS';

export { ROOM_CONFIG, ROOM_OBJECT_TYPE, ROOM_OBJECT_CONFIG, START_ANIMATION_ALL_OBJECTS };
