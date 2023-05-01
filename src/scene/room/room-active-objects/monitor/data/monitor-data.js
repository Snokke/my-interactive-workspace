const MONITOR_PART_TYPE = {
  Monitor: 'monitor',
  MonitorScreen: 'monitor_screen',
  MonitorArmMountBase: 'monitor_arm_mount_base',
  MonitorArmMountArm01: 'monitor_arm_mount_arm01',
  MonitorArmMountArm02: 'monitor_arm_mount_arm02',
  MonitorMount: 'monitor_mount',
  MonitorScreenShowreelIcon: 'monitor_screen_showreel_icon',
  MonitorScreenCVIcon: 'monitor_screen_cv_icon',
  MonitorScreenCloseIcon: 'monitor_screen_close_icon',
  MonitorScreenVolume: 'monitor_screen_volume',
}

const MONITOR_PART_ACTIVITY_CONFIG = {
  [MONITOR_PART_TYPE.Monitor]: true,
  [MONITOR_PART_TYPE.MonitorScreen]: true,
  [MONITOR_PART_TYPE.MonitorArmMountBase]: true,
  [MONITOR_PART_TYPE.MonitorArmMountArm01]: true,
  [MONITOR_PART_TYPE.MonitorArmMountArm02]: true,
  [MONITOR_PART_TYPE.MonitorMount]: true,
  [MONITOR_PART_TYPE.MonitorScreenShowreelIcon]: true,
  [MONITOR_PART_TYPE.MonitorScreenCVIcon]: true,
  [MONITOR_PART_TYPE.MonitorScreenCloseIcon]: true,
  [MONITOR_PART_TYPE.MonitorScreenVolume]: false,
}

const MONITOR_PARTS_WITHOUT_BUTTONS = [
  MONITOR_PART_TYPE.Monitor,
  MONITOR_PART_TYPE.MonitorArmMountBase,
  MONITOR_PART_TYPE.MonitorArmMountArm01,
  MONITOR_PART_TYPE.MonitorArmMountArm02,
  MONITOR_PART_TYPE.MonitorMount,
]

const MONITOR_SCREEN_BUTTONS = [
  MONITOR_PART_TYPE.MonitorScreenShowreelIcon,
  MONITOR_PART_TYPE.MonitorScreenCVIcon,
  MONITOR_PART_TYPE.MonitorScreenCloseIcon,
]

export { MONITOR_PART_TYPE, MONITOR_PART_ACTIVITY_CONFIG, MONITOR_SCREEN_BUTTONS, MONITOR_PARTS_WITHOUT_BUTTONS }
