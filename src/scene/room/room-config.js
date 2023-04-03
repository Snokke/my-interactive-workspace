import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { TABLE_PART_CONFIG, TABLE_PART_TYPE } from './room-active-objects/table/table-data';
import { WALLS_PART_CONFIG, WALLS_PART_TYPE } from './room-active-objects/walls/walls-data';
import { LOCKER_PART_CONFIG, LOCKER_PART_TYPE } from './room-active-objects/locker/locker-data';
import { FLOOR_LAMP_PART_CONFIG, FLOOR_LAMP_PART_TYPE } from './room-active-objects/floor-lamp/floor-lamp-data';
import { CHAIR_PART_CONFIG, CHAIR_PART_TYPE } from './room-active-objects/chair/chair-data';
import { AIR_CONDITIONER_PART_CONFIG, AIR_CONDITIONER_PART_TYPE } from './room-active-objects/air-conditioner/air-conditioner-data';
import { MOUSE_PART_CONFIG, MOUSE_PART_TYPE } from './room-active-objects/mouse/mouse-data';
import { SPEAKERS_PART_CONFIG, SPEAKERS_PART_TYPE } from './room-active-objects/speakers/speakers-data';
import { KEYBOARD_PART_CONFIG, KEYBOARD_PART_TYPE } from './room-active-objects/keyboard/keyboard-data';
import { MONITOR_PART_CONFIG, MONITOR_PART_TYPE } from './room-active-objects/monitor/monitor-data';
import Table from './room-active-objects/table/table';
import Locker from './room-active-objects/locker/locker';
import FloorLamp from './room-active-objects/floor-lamp/floor-lamp';
import Walls from './room-active-objects/walls/walls';
import Chair from './room-active-objects/chair/chair';
import AirConditioner from './room-active-objects/air-conditioner/air-conditioner';
import Mouse from './room-active-objects/mouse/mouse';
import Speakers from './room-active-objects/speakers/speakers';
import Keyboard from './room-active-objects/keyboard/keyboard';
import Monitor from './room-active-objects/monitor/monitor';
import Notebook from './room-active-objects/notebook/notebook';
import { NOTEBOOK_PART_CONFIG, NOTEBOOK_PART_TYPE } from './room-active-objects/notebook/notebook-data';

const ROOM_CONFIG = {
  outlineEnabled: true,
  startAnimation: {
    showOnStart: false,
    startPositionY: 13,
    delayBetweenObjects: 150,
    objectFallDownTime: 400,
    objectFallDownEasing: TWEEN.Easing.Quadratic.Out,
    objectScaleEasing: TWEEN.Easing.Back.Out,
  }
}

const ROOM_OBJECT_TYPE = {
  // Active objects
  Walls: 'WALLS',
  Table: 'TABLE',
  Locker: 'LOCKER',
  FloorLamp: 'FLOOR_LAMP',
  Chair: 'CHAIR',
  AirConditioner: 'AIR_CONDITIONER',
  Mouse: 'MOUSE',
  Speakers: 'SPEAKERS',
  Keyboard: 'KEYBOARD',
  Monitor: 'MONITOR',
  Notebook: 'NOTEBOOK',

  // Inactive objects
  Scales: 'SCALES',
  Map: 'MAP',
  Carpet: 'CARPET',
  Bin: 'BIN',
  Pouf: 'POUF',
  MousePad: 'MOUSE_PAD',
  Coaster: 'COASTER',
  Cup: 'CUP',
  Organizer: 'ORGANIZER',
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
    partTypes: WALLS_PART_TYPE,
    partConfig: WALLS_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Table]: {
    label: 'Table',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Table',
    class: Table,
    partTypes: TABLE_PART_TYPE,
    partConfig: TABLE_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Locker]: {
    label: 'Locker',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Locker',
    class: Locker,
    partTypes: LOCKER_PART_TYPE,
    partConfig: LOCKER_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.FloorLamp]: {
    label: 'Floor lamp',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Floor_lamp',
    class: FloorLamp,
    partTypes: FLOOR_LAMP_PART_TYPE,
    partConfig: FLOOR_LAMP_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Chair]: {
    label: 'Chair',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Chair',
    class: Chair,
    partTypes: CHAIR_PART_TYPE,
    partConfig: CHAIR_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.AirConditioner]: {
    label: 'Air cond.',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Air_conditioner',
    class: AirConditioner,
    partTypes: AIR_CONDITIONER_PART_TYPE,
    partConfig: AIR_CONDITIONER_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Mouse]: {
    label: 'Mouse',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Mouse',
    class: Mouse,
    tableGroup: true,
    partTypes: MOUSE_PART_TYPE,
    partConfig: MOUSE_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Speakers]: {
    label: 'Speakers',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Speakers',
    class: Speakers,
    tableGroup: true,
    partTypes: SPEAKERS_PART_TYPE,
    partConfig: SPEAKERS_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Keyboard]: {
    label: 'Keyboard',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Keyboard',
    class: Keyboard,
    tableGroup: true,
    partTypes: KEYBOARD_PART_TYPE,
    partConfig: KEYBOARD_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Monitor]: {
    label: 'Monitor',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Monitor',
    class: Monitor,
    tableGroup: true,
    partTypes: MONITOR_PART_TYPE,
    partConfig: MONITOR_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Notebook]: {
    label: 'Notebook',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Notebook',
    class: Notebook,
    tableGroup: true,
    partTypes: NOTEBOOK_PART_TYPE,
    partConfig: NOTEBOOK_PART_CONFIG,
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
  [ROOM_OBJECT_TYPE.Coaster]: {
    label: 'Coaster',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Coaster',
    tableGroup: true,
  },
  [ROOM_OBJECT_TYPE.Cup]: {
    label: 'Cup',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Cup',
    tableGroup: true,
  },
  [ROOM_OBJECT_TYPE.Organizer]: {
    label: 'Organizer',
    enabled: true,
    visible: true,
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Organizer',
    tableGroup: true,
  },
}

const START_ANIMATION_ALL_OBJECTS = 'START_ANIMATION_ALL_OBJECTS';

export { ROOM_CONFIG, ROOM_OBJECT_TYPE, ROOM_OBJECT_CONFIG, START_ANIMATION_ALL_OBJECTS, ROOM_OBJECT_ACTIVITY_TYPE };
