import Table from './room-objects/table/table';
import Locker from './room-objects/locker/locker';

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

export { ROOM_OBJECT_TYPE, ROOM_OBJECT_CONFIG };
