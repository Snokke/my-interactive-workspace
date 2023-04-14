const LAPTOP_PART_TYPE = {
  LaptopKeyboard: 'laptop_keyboard',
  LaptopMonitor: 'laptop_monitor',
  LaptopScreen: 'laptop_screen',
  LaptopStand: 'laptop_stand',
  LaptopArmMountBase: 'laptop_arm_mount_base',
  LaptopArmMountArm01: 'laptop_arm_mount_arm01',
  LaptopArmMountArm02: 'laptop_arm_mount_arm02',
  LaptopMount: 'laptop_mount',
  LaptopScreenMusic01: 'laptop_screen_music_01',
  LaptopScreenMusic02: 'laptop_screen_music_02',
  LaptopScreenMusic03: 'laptop_screen_music_03',
}

const LAPTOP_PART_ACTIVITY_CONFIG = {
  [LAPTOP_PART_TYPE.LaptopKeyboard]: true,
  [LAPTOP_PART_TYPE.LaptopMonitor]: true,
  [LAPTOP_PART_TYPE.LaptopScreen]: false,
  [LAPTOP_PART_TYPE.LaptopStand]: true,
  [LAPTOP_PART_TYPE.LaptopArmMountBase]: true,
  [LAPTOP_PART_TYPE.LaptopArmMountArm01]: true,
  [LAPTOP_PART_TYPE.LaptopArmMountArm02]: true,
  [LAPTOP_PART_TYPE.LaptopMount]: true,
  [LAPTOP_PART_TYPE.LaptopScreenMusic01]: true,
  [LAPTOP_PART_TYPE.LaptopScreenMusic02]: true,
  [LAPTOP_PART_TYPE.LaptopScreenMusic03]: true,
}

const LAPTOP_PARTS = [
  LAPTOP_PART_TYPE.LaptopKeyboard,
  LAPTOP_PART_TYPE.LaptopMonitor,
]

const LAPTOP_MOUNT_PARTS = [
  LAPTOP_PART_TYPE.LaptopStand,
  LAPTOP_PART_TYPE.LaptopArmMountBase,
  LAPTOP_PART_TYPE.LaptopArmMountArm01,
  LAPTOP_PART_TYPE.LaptopArmMountArm02,
  LAPTOP_PART_TYPE.LaptopMount,
]

const LAPTOP_SCREEN_MUSIC_PARTS = [
  LAPTOP_PART_TYPE.LaptopScreenMusic01,
  LAPTOP_PART_TYPE.LaptopScreenMusic02,
  LAPTOP_PART_TYPE.LaptopScreenMusic03,
]

const LAPTOP_STATE = {
  Idle: 'IDLE',
  Moving: 'MOVING',
}

const LAPTOP_POSITION_STATE = {
  Opened: 'OPENED',
  Closed: 'CLOSED',
}

const MUSIC_BUTTON_TYPE = {
  Button01: 'BUTTON_01',
  Button02: 'BUTTON_02',
  Button03: 'BUTTON_03',
}

const MUSIC_TYPE = {
  ComeAndGetYourLove: 'COME_AND_GET_YOUR_LOVE',
  Giorgio: 'GIORGIO',
  BigCityLife: 'BIG_CITY_LIFE',
}

const MUSIC_CONFIG = {
  [MUSIC_TYPE.ComeAndGetYourLove]: {
    fileName: 'come_and_get_your_love',
    song: 'Come and get your love',
    artist: 'Redbone',
  },
  [MUSIC_TYPE.Giorgio]: {
    fileName: 'giorgio',
    song: 'Giorgio by Moroder',
    artist: 'Daft Punk',
  },
  [MUSIC_TYPE.BigCityLife]: {
    fileName: 'big_city_life',
    song: 'Big City Life',
    artist: 'Mattafix',
  },
}

export {
  LAPTOP_PART_TYPE,
  LAPTOP_PART_ACTIVITY_CONFIG,
  LAPTOP_PARTS,
  LAPTOP_MOUNT_PARTS,
  LAPTOP_STATE,
  LAPTOP_POSITION_STATE,
  MUSIC_BUTTON_TYPE,
  LAPTOP_SCREEN_MUSIC_PARTS,
  MUSIC_TYPE,
  MUSIC_CONFIG,
}
