import { TABLE_PART_ACTIVITY_CONFIG, TABLE_PART_TYPE } from '../room-active-objects/table/data/table-data';
import { WALLS_PART_ACTIVITY_CONFIG, WALLS_PART_TYPE } from '../room-active-objects/walls/data/walls-data';
import { LOCKER_PART_ACTIVITY_CONFIG, LOCKER_PART_TYPE } from '../room-active-objects/locker/data/locker-data';
import { FLOOR_LAMP_PART_ACTIVITY_CONFIG, FLOOR_LAMP_PART_TYPE } from '../room-active-objects/floor-lamp/data/floor-lamp-data';
import { CHAIR_PART_ACTIVITY_CONFIG, CHAIR_PART_TYPE } from '../room-active-objects/chair/data/chair-data';
import { AIR_CONDITIONER_PART_ACTIVITY_CONFIG, AIR_CONDITIONER_PART_TYPE } from '../room-active-objects/air-conditioner/data/air-conditioner-data';
import { MOUSE_PART_ACTIVITY_CONFIG, MOUSE_PART_TYPE } from '../room-active-objects/mouse/data/mouse-data';
import { SPEAKERS_PART_ACTIVITY_CONFIG, SPEAKERS_PART_TYPE } from '../room-active-objects/speakers/data/speakers-data';
import { KEYBOARD_PART_ACTIVITY_CONFIG, KEYBOARD_PART_TYPE } from '../room-active-objects/keyboard/data/keyboard-data';
import { MONITOR_PART_ACTIVITY_CONFIG, MONITOR_PART_TYPE } from '../room-active-objects/monitor/data/monitor-data';
import { LAPTOP_PART_ACTIVITY_CONFIG, LAPTOP_PART_TYPE } from '../room-active-objects/laptop/data/laptop-data';
import { SOCIAL_NETWORK_LOGOS_PART_ACTIVITY_CONFIG, SOCIAL_NETWORK_LOGOS_PART_TYPE } from '../room-active-objects/social-network-logos/social-network-logos-data';
import { AIR_CONDITIONER_REMOTE_PART_ACTIVITY_CONFIG, AIR_CONDITIONER_REMOTE_PART_TYPE } from '../room-active-objects/air-conditioner-remote/data/air-conditioner-remote-data';
import { BOOK_PART_ACTIVITY_CONFIG, BOOK_PART_TYPE } from '../room-active-objects/book/data/book-data';

const ROOM_CONFIG = {
  outlineEnabled: true,
  autoOpenActiveDebugFolder: true,
  clickActiveObjectError: 2,
}

const ROOM_OBJECT_TYPE = {
  // Active objects
  Table: 'TABLE',
  Speakers: 'SPEAKERS',
  Monitor: 'MONITOR',
  Laptop: 'LAPTOP',
  Keyboard: 'KEYBOARD',
  Mouse: 'MOUSE',
  Walls: 'WALLS',
  AirConditioner: 'AIR_CONDITIONER',
  AirConditionerRemote: 'AIR_CONDITIONER_REMOTE',
  Locker: 'LOCKER',
  Chair: 'CHAIR',
  FloorLamp: 'FLOOR_LAMP',
  SocialNetworkLogos: 'SOCIAL_NETWORK_LOGOS',
  Book: 'BOOK',

  // Inactive objects
  Picture: 'PICTURE',
  Carpet: 'CARPET',
  BookShelf: 'BOOK_SHELF',
  Calendar: 'CALENDAR',
  MousePad: 'MOUSE_PAD',
  TableObjects: 'TABLE_OBJECTS',

  // Other
  Global: 'GLOBAL',
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
    partsActiveConfig: WALLS_PART_ACTIVITY_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Table]: {
    createObject: true,
    label: 'Table',
    debugFolderLabel: 'Table',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Table',
    partTypes: TABLE_PART_TYPE,
    partsActiveConfig: TABLE_PART_ACTIVITY_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Locker]: {
    createObject: true,
    label: 'Locker',
    debugFolderLabel: 'Locker',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Locker',
    partTypes: LOCKER_PART_TYPE,
    partsActiveConfig: LOCKER_PART_ACTIVITY_CONFIG,
  },
  [ROOM_OBJECT_TYPE.FloorLamp]: {
    createObject: true,
    label: 'Floor lamp',
    debugFolderLabel: 'Floor lamp',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Floor_lamp',
    partTypes: FLOOR_LAMP_PART_TYPE,
    partsActiveConfig: FLOOR_LAMP_PART_ACTIVITY_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Chair]: {
    createObject: true,
    label: 'Chair',
    debugFolderLabel: 'Chair',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Chair',
    partTypes: CHAIR_PART_TYPE,
    partsActiveConfig: CHAIR_PART_ACTIVITY_CONFIG,
    isDraggable: true,
  },
  [ROOM_OBJECT_TYPE.AirConditioner]: {
    createObject: true,
    label: 'Air conditioner',
    debugFolderLabel: 'Air conditioner',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Air_conditioner',
    partTypes: AIR_CONDITIONER_PART_TYPE,
    partsActiveConfig: AIR_CONDITIONER_PART_ACTIVITY_CONFIG,
  },
  [ROOM_OBJECT_TYPE.AirConditionerRemote]: {
    createObject: true,
    label: 'Air conditioner remote',
    debugFolderLabel: 'Air conditioner remote',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Air_conditioner_remote',
    partTypes: AIR_CONDITIONER_REMOTE_PART_TYPE,
    partsActiveConfig: AIR_CONDITIONER_REMOTE_PART_ACTIVITY_CONFIG,
    tableGroup: true,
  },
  [ROOM_OBJECT_TYPE.Mouse]: {
    createObject: true,
    label: 'Mouse',
    debugFolderLabel: 'Mouse',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Mouse',
    tableGroup: true,
    partTypes: MOUSE_PART_TYPE,
    partsActiveConfig: MOUSE_PART_ACTIVITY_CONFIG,
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
    partsActiveConfig: SPEAKERS_PART_ACTIVITY_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Keyboard]: {
    createObject: true,
    label: 'Keyboard',
    debugFolderLabel: 'Keyboard',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Keyboard',
    tableGroup: true,
    partTypes: KEYBOARD_PART_TYPE,
    partsActiveConfig: KEYBOARD_PART_ACTIVITY_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Monitor]: {
    createObject: true,
    label: 'Monitor',
    debugFolderLabel: 'Monitor',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Monitor',
    tableGroup: true,
    partTypes: MONITOR_PART_TYPE,
    partsActiveConfig: MONITOR_PART_ACTIVITY_CONFIG,
    isDraggable: true,
  },
  [ROOM_OBJECT_TYPE.Laptop]: {
    createObject: true,
    label: 'Laptop',
    debugFolderLabel: 'Laptop',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Laptop',
    tableGroup: true,
    partTypes: LAPTOP_PART_TYPE,
    partsActiveConfig: LAPTOP_PART_ACTIVITY_CONFIG,
    isDraggable: true,
  },
  [ROOM_OBJECT_TYPE.SocialNetworkLogos]: {
    createObject: true,
    label: 'Social network logos',
    debugFolderLabel: 'Social network logos',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Logos',
    partTypes: SOCIAL_NETWORK_LOGOS_PART_TYPE,
    partsActiveConfig: SOCIAL_NETWORK_LOGOS_PART_ACTIVITY_CONFIG,
  },
  [ROOM_OBJECT_TYPE.Book]: {
    createObject: true,
    label: 'Book',
    debugFolderLabel: 'Book',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Active,
    groupName: 'Book',
    partTypes: BOOK_PART_TYPE,
    partsActiveConfig: BOOK_PART_ACTIVITY_CONFIG,
  },

  // Inactive objects
  [ROOM_OBJECT_TYPE.Picture]: {
    createObject: true,
    label: 'Picture',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Picture',
  },
  [ROOM_OBJECT_TYPE.Carpet]: {
    createObject: true,
    label: 'Carpet',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Carpet',
  },
  [ROOM_OBJECT_TYPE.BookShelf]: {
    createObject: true,
    label: 'Book shelf',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Book_shelf',
  },
  [ROOM_OBJECT_TYPE.Calendar]: {
    createObject: true,
    label: 'Calendar',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Calendar',
  },
  [ROOM_OBJECT_TYPE.MousePad]: {
    createObject: true,
    label: 'Mouse pad',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Mouse_pad',
    tableGroup: true,
  },
  [ROOM_OBJECT_TYPE.TableObjects]: {
    createObject: true,
    label: 'Table objects',
    activityType: ROOM_OBJECT_ACTIVITY_TYPE.Inactive,
    meshName: 'Table_objects',
    tableGroup: true,
  },
}

const SCALE_ZERO = 0.01;

const MONITOR_TYPE = {
  Monitor: 'MONITOR',
  Laptop: 'LAPTOP',
}

export {
  ROOM_CONFIG,
  ROOM_OBJECT_TYPE,
  ROOM_OBJECT_CONFIG,
  ROOM_OBJECT_ACTIVITY_TYPE,
  MONITOR_TYPE,
  SCALE_ZERO,
};
