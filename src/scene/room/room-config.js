import Table from './room-active-objects/table/table';
import Locker from './room-active-objects/locker/locker';
import FloorLamp from './room-active-objects/floor-lamp/floor-lamp';
import Walls from './room-active-objects/walls/walls';
import Chair from './room-active-objects/chair/chair';

const ROOM_CONFIG = {
  outlineEnabled: true,
  showStartAnimations: false,
}

const ROOM_OBJECT_TYPE = {
  Walls: 'WALLS',
  Table: 'TABLE',
  Locker: 'LOCKER',
  FloorLamp: 'FLOOR_LAMP',
  Chair: 'CHAIR',
  Scales: 'SCALES',
}

const ROOM_OBJECT_ACTIVITY_TYPE = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
}

const ROOM_OBJECT_CONFIG = {
  [ROOM_OBJECT_TYPE.Walls]: {
    label: 'Walls',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Walls',
    class: Walls,
  },
  [ROOM_OBJECT_TYPE.Table]: {
    label: 'Table',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Table',
    class: Table,
  },
  [ROOM_OBJECT_TYPE.Locker]: {
    label: 'Locker',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Locker',
    class: Locker,
  },
  [ROOM_OBJECT_TYPE.FloorLamp]: {
    label: 'Floor lamp',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Floor_lamp',
    class: FloorLamp,
  },
  [ROOM_OBJECT_TYPE.Chair]: {
    label: 'CHair',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Chair',
    class: Chair,
  },
  [ROOM_OBJECT_TYPE.Scales]: {
    label: 'Scales',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Scales',
  },
}

const START_ANIMATION_ALL_OBJECTS = 'START_ANIMATION_ALL_OBJECTS';

export { ROOM_CONFIG, ROOM_OBJECT_TYPE, ROOM_OBJECT_CONFIG, START_ANIMATION_ALL_OBJECTS, ROOM_OBJECT_ACTIVITY_TYPE };
