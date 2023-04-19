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

const MUSIC_TYPE = {
  Giorgio: 'GIORGIO',
  ComeAndGetYourLove: 'COME_AND_GET_YOUR_LOVE',
  September: 'SEPTEMBER',
}

const MUSIC_ORDER = [
  MUSIC_TYPE.Giorgio,
  MUSIC_TYPE.ComeAndGetYourLove,
  MUSIC_TYPE.September,
]

export {
  LAPTOP_PART_TYPE,
  LAPTOP_PART_ACTIVITY_CONFIG,
  LAPTOP_PARTS,
  LAPTOP_MOUNT_PARTS,
  LAPTOP_STATE,
  LAPTOP_POSITION_STATE,
  LAPTOP_SCREEN_MUSIC_PARTS,
  MUSIC_TYPE,
  MUSIC_ORDER,
}
