const MONITOR_PART_TYPE = {
  Monitor: 'monitor',
  MonitorScreen: 'monitor_screen',
  MonitorArmMountBase: 'monitor_arm_mount_base',
  MonitorArmMountArm01: 'monitor_arm_mount_arm01',
  MonitorArmMountArm02: 'monitor_arm_mount_arm02',
  MonitorMount: 'monitor_mount',
}

const MONITOR_PART_CONFIG = {
  [MONITOR_PART_TYPE.Monitor]: {
    isActive: true,
  },
  [MONITOR_PART_TYPE.MonitorScreen]: {
    isActive: true,
  },
  [MONITOR_PART_TYPE.MonitorArmMountBase]: {
    isActive: true,
  },
  [MONITOR_PART_TYPE.MonitorArmMountArm01]: {
    isActive: true,
  },
  [MONITOR_PART_TYPE.MonitorArmMountArm02]: {
    isActive: true,
  },
  [MONITOR_PART_TYPE.MonitorMount]: {
    isActive: true,
  },
}

export { MONITOR_PART_TYPE, MONITOR_PART_CONFIG }
