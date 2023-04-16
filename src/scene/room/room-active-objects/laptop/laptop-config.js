import * as THREE from 'three';
import { LAPTOP_PART_TYPE, LAPTOP_POSITION_STATE, LAPTOP_STATE, MUSIC_TYPE } from "./laptop-data";

const LAPTOP_CONFIG = {
  showDebugButtons: false,
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
    signalName: 'onLaptopScreenMusic01Click',
    musicType: MUSIC_TYPE.Giorgio,
    area: {
      position: new THREE.Vector2(0, 0.58),
      size: new THREE.Vector2(0.55, 0.1),
    },
  },
  [LAPTOP_PART_TYPE.LaptopScreenMusic02]: {
    signalName: 'onLaptopScreenMusic02Click',
    musicType: MUSIC_TYPE.ComeAndGetYourLove,
    area: {
      position: new THREE.Vector2(0, 0.44),
      size: new THREE.Vector2(0.55, 0.1),
    },
  },
  [LAPTOP_PART_TYPE.LaptopScreenMusic03]: {
    signalName: 'onLaptopScreenMusic03Click',
    musicType: MUSIC_TYPE.BigCityLife,
    area: {
      position: new THREE.Vector2(0, 0.3),
      size: new THREE.Vector2(0.55, 0.1),
    },
  },
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

export { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG, LAPTOP_SCREEN_MUSIC_CONFIG, MUSIC_CONFIG };
