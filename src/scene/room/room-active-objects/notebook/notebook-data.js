const NOTEBOOK_PART_TYPE = {
  NotebookKeyboard: 'notebook_keyboard',
  NotebookMonitor: 'notebook_monitor',
  NotebookScreen: 'notebook_screen',
  NotebookStand: 'notebook_stand',
  NotebookArmMountBase: 'notebook_arm_mount_base',
  NotebookArmMountArm01: 'notebook_arm_mount_arm01',
  NotebookArmMountArm02: 'notebook_arm_mount_arm02',
  NotebookMount: 'notebook_mount',
}

const NOTEBOOK_PART_CONFIG = {
  [NOTEBOOK_PART_TYPE.NotebookKeyboard]: {
    isActive: true,
  },
  [NOTEBOOK_PART_TYPE.NotebookMonitor]: {
    isActive: true,
  },
  [NOTEBOOK_PART_TYPE.NotebookScreen]: {
    isActive: true,
  },
  [NOTEBOOK_PART_TYPE.NotebookStand]: {
    isActive: true,
  },
  [NOTEBOOK_PART_TYPE.NotebookArmMountBase]: {
    isActive: true,
  },
  [NOTEBOOK_PART_TYPE.NotebookArmMountArm01]: {
    isActive: true,
  },
  [NOTEBOOK_PART_TYPE.NotebookArmMountArm02]: {
    isActive: true,
  },
  [NOTEBOOK_PART_TYPE.NotebookMount]: {
    isActive: true,
  },
}

const NOTEBOOK_PARTS = [
  NOTEBOOK_PART_TYPE.NotebookKeyboard,
  NOTEBOOK_PART_TYPE.NotebookMonitor,
  NOTEBOOK_PART_TYPE.NotebookScreen,
]

const NOTEBOOK_MOUNT_PARTS = [
  NOTEBOOK_PART_TYPE.NotebookStand,
  NOTEBOOK_PART_TYPE.NotebookArmMountBase,
  NOTEBOOK_PART_TYPE.NotebookArmMountArm01,
  NOTEBOOK_PART_TYPE.NotebookArmMountArm02,
  NOTEBOOK_PART_TYPE.NotebookMount,
]

const NOTEBOOK_STATE = {
  Idle: 'IDLE',
  Moving: 'MOVING',
}

const NOTEBOOK_POSITION_STATE = {
  Opened: 'OPENED',
  Closed: 'CLOSED',
}

export { NOTEBOOK_PART_TYPE, NOTEBOOK_PART_CONFIG, NOTEBOOK_PARTS, NOTEBOOK_MOUNT_PARTS, NOTEBOOK_STATE, NOTEBOOK_POSITION_STATE }
