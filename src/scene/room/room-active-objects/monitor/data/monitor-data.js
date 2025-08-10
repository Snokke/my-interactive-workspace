const MONITOR_PART_TYPE = {
  Monitor: 'monitor',
  MonitorScreen: 'monitor_screen',
  MonitorArmMountBase: 'monitor_arm_mount_base',
  MonitorArmMountArm01: 'monitor_arm_mount_arm01',
  MonitorArmMountArm02: 'monitor_arm_mount_arm02',
  MonitorScreenShowreelIcon: 'monitor_screen_showreel_icon',
  MonitorScreenTransferItIcon: 'monitor_screen_transfer_it_icon',
  MonitorScreenGameBoyIcon: 'monitor_screen_gameboy_icon',
  MonitorScreenCrazyPumpkinIcon: 'monitor_screen_crazy_pumpkin_icon',
  MonitorScreenCubeScapeIcon: 'monitor_screen_cubescape_icon',
  MonitorScreenHexCastleIcon: 'monitor_screen_hexcastle_icon',
  MonitorScreenCloseIcon: 'monitor_screen_close_icon',
  MonitorScreenVolume: 'monitor_screen_volume',
  MonitorScreenYoutubeLogo: 'monitor_screen_youtube_logo',
  MonitorCloseFocusIcon: 'monitor_close_focus_icon',
}

const MONITOR_PART_ACTIVITY_CONFIG = {
  [MONITOR_PART_TYPE.Monitor]: true,
  [MONITOR_PART_TYPE.MonitorScreen]: true,
  [MONITOR_PART_TYPE.MonitorArmMountBase]: true,
  [MONITOR_PART_TYPE.MonitorArmMountArm01]: true,
  [MONITOR_PART_TYPE.MonitorArmMountArm02]: true,
  [MONITOR_PART_TYPE.MonitorScreenShowreelIcon]: true,
  [MONITOR_PART_TYPE.MonitorScreenTransferItIcon]: true,
  [MONITOR_PART_TYPE.MonitorScreenGameBoyIcon]: true,
  [MONITOR_PART_TYPE.MonitorScreenCrazyPumpkinIcon]: true,
  [MONITOR_PART_TYPE.MonitorScreenCubeScapeIcon]: true,
  [MONITOR_PART_TYPE.MonitorScreenHexCastleIcon]: true,
  [MONITOR_PART_TYPE.MonitorScreenCloseIcon]: true,
  [MONITOR_PART_TYPE.MonitorScreenVolume]: false,
  [MONITOR_PART_TYPE.MonitorScreenYoutubeLogo]: true,
  [MONITOR_PART_TYPE.MonitorCloseFocusIcon]: true,
}

const MONITOR_PARTS_WITHOUT_BUTTONS = [
  MONITOR_PART_TYPE.Monitor,
  MONITOR_PART_TYPE.MonitorArmMountBase,
  MONITOR_PART_TYPE.MonitorArmMountArm01,
  MONITOR_PART_TYPE.MonitorArmMountArm02,
]

const MONITOR_SCREEN_BUTTONS = [
  MONITOR_PART_TYPE.MonitorScreenShowreelIcon,
  MONITOR_PART_TYPE.MonitorScreenTransferItIcon,
  MONITOR_PART_TYPE.MonitorScreenGameBoyIcon,
  MONITOR_PART_TYPE.MonitorScreenCrazyPumpkinIcon,
  MONITOR_PART_TYPE.MonitorScreenCubeScapeIcon,
  MONITOR_PART_TYPE.MonitorScreenHexCastleIcon,
  MONITOR_PART_TYPE.MonitorScreenCloseIcon,
  MONITOR_PART_TYPE.MonitorScreenYoutubeLogo,
]

export { MONITOR_PART_TYPE, MONITOR_PART_ACTIVITY_CONFIG, MONITOR_SCREEN_BUTTONS, MONITOR_PARTS_WITHOUT_BUTTONS }
