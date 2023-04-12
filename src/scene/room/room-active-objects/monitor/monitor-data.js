const MONITOR_PART_TYPE = {
  Monitor: 'monitor',
  MonitorScreen: 'monitor_screen',
  MonitorArmMountBase: 'monitor_arm_mount_base',
  MonitorArmMountArm01: 'monitor_arm_mount_arm01',
  MonitorArmMountArm02: 'monitor_arm_mount_arm02',
  MonitorMount: 'monitor_mount',
}

const MONITOR_PART_ACTIVITY_CONFIG = {
  [MONITOR_PART_TYPE.Monitor]: true,
  [MONITOR_PART_TYPE.MonitorScreen]: true,
  [MONITOR_PART_TYPE.MonitorArmMountBase]: true,
  [MONITOR_PART_TYPE.MonitorArmMountArm01]: true,
  [MONITOR_PART_TYPE.MonitorArmMountArm02]: true,
  [MONITOR_PART_TYPE.MonitorMount]: true,
}

export { MONITOR_PART_TYPE, MONITOR_PART_ACTIVITY_CONFIG }
