import { LAPTOP_PART_TYPE, LAPTOP_POSITION_STATE, LAPTOP_STATE, MUSIC_BUTTON_TYPE, MUSIC_TYPE } from "./laptop-data";

const LAPTOP_CONFIG = {
  state: LAPTOP_STATE.Idle,
  positionType: LAPTOP_POSITION_STATE.Opened,
  defaultAngle: 123,
  maxOpenAngle: 123,
  rotationSpeed: 18,
  angle: 0,
}

const LAPTOP_MOUNT_CONFIG = {
  startAngle: 35,
  angle: 0,
  leftEdgeAngle: 0,
  rightEdgeAngle: 35,
}

const LAPTOP_SCREEN_MUSIC_CONFIG = {
  [LAPTOP_PART_TYPE.LaptopScreenMusic01]: {
    musicButtonType: MUSIC_BUTTON_TYPE.Button01,
    signalName: 'onLaptopScreenMusic01Click',
    musicType: MUSIC_TYPE.Giorgio,
  },
  [LAPTOP_PART_TYPE.LaptopScreenMusic02]: {
    musicButtonType: MUSIC_BUTTON_TYPE.Button02,
    signalName: 'onLaptopScreenMusic02Click',
    musicType: MUSIC_TYPE.ComeAndGetYourLove,
  },
  [LAPTOP_PART_TYPE.LaptopScreenMusic03]: {
    musicButtonType: MUSIC_BUTTON_TYPE.Button03,
    signalName: 'onLaptopScreenMusic03Click',
    musicType: MUSIC_TYPE.BigCityLife,
  },
}

export { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG, LAPTOP_SCREEN_MUSIC_CONFIG };
