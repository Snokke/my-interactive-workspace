import Table from './room-active-objects/table/table';
import Locker from './room-active-objects/locker/locker';
import FloorLamp from './room-active-objects/floor-lamp/floor-lamp';
import Walls from './room-active-objects/walls/walls';
import Chair from './room-active-objects/chair/chair';
import AirConditioner from './room-active-objects/air-conditioner/air-conditioner';

const ROOM_CONFIG = {
  outlineEnabled: true,
  showStartAnimations: false,
}

const ROOM_OBJECT_TYPE = {
  // Active objects
  Walls: 'WALLS',
  Table: 'TABLE',
  Locker: 'LOCKER',
  FloorLamp: 'FLOOR_LAMP',
  Chair: 'CHAIR',
  AirConditioner: 'AIR_CONDITIONER',

  // Inactive objects
  Scales: 'SCALES',
  Map: 'MAP',
  Carpet: 'CARPET',
  Bin: 'BIN',
  Pouf: 'POUF',
  MousePad: 'MOUSE_PAD',
}

const ROOM_OBJECT_ACTIVITY_TYPE = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
}

const ROOM_OBJECT_CONFIG = {
  // Active objects
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
    label: 'Chair',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Chair',
    class: Chair,
  },
  [ROOM_OBJECT_TYPE.AirConditioner]: {
    label: 'Air conditioner',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Air_conditioner',
    class: AirConditioner,
  },

  // Inactive objects
  [ROOM_OBJECT_TYPE.Scales]: {
    label: 'Scales',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Scales',
  },
  [ROOM_OBJECT_TYPE.Map]: {
    label: 'Map',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Map',
  },
  [ROOM_OBJECT_TYPE.Carpet]: {
    label: 'Carpet',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Carpet',
  },
  [ROOM_OBJECT_TYPE.Bin]: {
    label: 'Bin',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Bin',
  },
  [ROOM_OBJECT_TYPE.Pouf]: {
    label: 'Pouf',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Pouf',
  },
  [ROOM_OBJECT_TYPE.MousePad]: {
    label: 'Mouse pad',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Mouse_pad',
    tableGroup: true,
  },
}

const START_ANIMATION_ALL_OBJECTS = 'START_ANIMATION_ALL_OBJECTS';

export { ROOM_CONFIG, ROOM_OBJECT_TYPE, ROOM_OBJECT_CONFIG, START_ANIMATION_ALL_OBJECTS, ROOM_OBJECT_ACTIVITY_TYPE };
