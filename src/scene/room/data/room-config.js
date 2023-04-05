import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { TABLE_PART_CONFIG, TABLE_PART_TYPE } from '../room-active-objects/table/table-data';
import { WALLS_PART_CONFIG, WALLS_PART_TYPE } from '../room-active-objects/walls/walls-data';
import { LOCKER_PART_CONFIG, LOCKER_PART_TYPE } from '../room-active-objects/locker/locker-data';
import { FLOOR_LAMP_PART_CONFIG, FLOOR_LAMP_PART_TYPE } from '../room-active-objects/floor-lamp/floor-lamp-data';
import { CHAIR_PART_CONFIG, CHAIR_PART_TYPE } from '../room-active-objects/chair/chair-data';
import { AIR_CONDITIONER_PART_CONFIG, AIR_CONDITIONER_PART_TYPE } from '../room-active-objects/air-conditioner/air-conditioner-data';
import { MOUSE_PART_CONFIG, MOUSE_PART_TYPE } from '../room-active-objects/mouse/mouse-data';
import { SPEAKERS_PART_CONFIG, SPEAKERS_PART_TYPE } from '../room-active-objects/speakers/speakers-data';
import { KEYBOARD_PART_CONFIG, KEYBOARD_PART_TYPE } from '../room-active-objects/keyboard/keyboard-data';
import { MONITOR_PART_CONFIG, MONITOR_PART_TYPE } from '../room-active-objects/monitor/monitor-data';
import { NOTEBOOK_PART_CONFIG, NOTEBOOK_PART_TYPE } from '../room-active-objects/notebook/notebook-data';

const ROOM_CONFIG = {
  outlineEnabled: true,
  autoOpenDebugFolders: true,
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
  AirConditioner: 'AIR_CONDITIONER',
  FloorLamp: 'FLOOR_LAMP',
  Locker: 'LOCKER',
  Chair: 'CHAIR',
  Table: 'TABLE',
  Speakers: 'SPEAKERS',
  Monitor: 'MONITOR',
  Notebook: 'NOTEBOOK',
  Keyboard: 'KEYBOARD',
  Mouse: 'MOUSE',

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
    createObject: true,
    label: 'Walls',
    debugFolderLabel: 'Window',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Walls',
    partTypes: WALLS_PART_TYPE,
    partConfig: WALLS_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Table]: {
    createObject: true,
    label: 'Table',
    debugFolderLabel: 'Table',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Table',
    partTypes: TABLE_PART_TYPE,
    partConfig: TABLE_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Locker]: {
    createObject: true,
    label: 'Locker',
    debugFolderLabel: 'Locker',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Locker',
    partTypes: LOCKER_PART_TYPE,
    partConfig: LOCKER_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.FloorLamp]: {
    createObject: true,
    label: 'Floor lamp',
    debugFolderLabel: 'Floor lamp',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Floor_lamp',
    partTypes: FLOOR_LAMP_PART_TYPE,
    partConfig: FLOOR_LAMP_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Chair]: {
    createObject: true,
    label: 'Chair',
    debugFolderLabel: 'Chair',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Chair',
    partTypes: CHAIR_PART_TYPE,
    partConfig: CHAIR_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.AirConditioner]: {
    createObject: true,
    label: 'Air cond.',
    debugFolderLabel: 'Air conditioner',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Air_conditioner',
    partTypes: AIR_CONDITIONER_PART_TYPE,
    partConfig: AIR_CONDITIONER_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Mouse]: {
    createObject: true,
    label: 'Mouse',
    debugFolderLabel: 'Mouse',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Mouse',
    tableGroup: true,
    partTypes: MOUSE_PART_TYPE,
    partConfig: MOUSE_PART_CONFIG,
    isDraggable: true,
  },
  [ROOM_OBJECT_TYPE.Speakers]: {
    createObject: true,
    label: 'Speakers',
    debugFolderLabel: 'Speakers',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Speakers',
    tableGroup: true,
    partTypes: SPEAKERS_PART_TYPE,
    partConfig: SPEAKERS_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Keyboard]: {
    createObject: true,
    label: 'Keyboard',
    debugFolderLabel: 'Keyboard',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Keyboard',
    tableGroup: true,
    partTypes: KEYBOARD_PART_TYPE,
    partConfig: KEYBOARD_PART_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Monitor]: {
    createObject: true,
    label: 'Monitor',
    debugFolderLabel: 'Monitor',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Monitor',
    tableGroup: true,
    partTypes: MONITOR_PART_TYPE,
    partConfig: MONITOR_PART_CONFIG,
    isDraggable: true,
  },
  [ROOM_OBJECT_TYPE.Notebook]: {
    createObject: true,
    label: 'Notebook',
    debugFolderLabel: 'Notebook',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Notebook',
    tableGroup: true,
    partTypes: NOTEBOOK_PART_TYPE,
    partConfig: NOTEBOOK_PART_CONFIG,
  },

  // Inactive objects
  [ROOM_OBJECT_TYPE.Scales]: {
    createObject: true,
    label: 'Scales',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Scales',
  },
  [ROOM_OBJECT_TYPE.Map]: {
    createObject: true,
    label: 'Map',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Map',
  },
  [ROOM_OBJECT_TYPE.Carpet]: {
    createObject: true,
    label: 'Carpet',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Carpet',
  },
  [ROOM_OBJECT_TYPE.Bin]: {
    createObject: true,
    label: 'Bin',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Bin',
  },
  [ROOM_OBJECT_TYPE.Pouf]: {
    createObject: true,
    label: 'Pouf',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Pouf',
  },
  [ROOM_OBJECT_TYPE.MousePad]: {
    createObject: true,
    label: 'Mouse pad',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Mouse_pad',
    tableGroup: true,
  },
  [ROOM_OBJECT_TYPE.Coaster]: {
    createObject: true,
    label: 'Coaster',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Coaster',
    tableGroup: true,
  },
  [ROOM_OBJECT_TYPE.Cup]: {
    createObject: true,
    label: 'Cup',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Cup',
    tableGroup: true,
  },
  [ROOM_OBJECT_TYPE.Organizer]: {
    createObject: true,
    label: 'Organizer',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Organizer',
    tableGroup: true,
  },
}

const START_ANIMATION_ALL_OBJECTS = 'START_ANIMATION_ALL_OBJECTS';

export { ROOM_CONFIG, ROOM_OBJECT_TYPE, ROOM_OBJECT_CONFIG, START_ANIMATION_ALL_OBJECTS, ROOM_OBJECT_ACTIVITY_TYPE };
