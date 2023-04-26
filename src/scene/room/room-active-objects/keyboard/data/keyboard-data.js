import * as THREE from 'three';

const KEYBOARD_PART_TYPE = {
  Base: 'keyboard_base',
}

const KEYBOARD_PART_ACTIVITY_CONFIG = {
  [KEYBOARD_PART_TYPE.Base]: true,
}

const KEY_COLOR_TYPE = {
  Black: 'BLACK',
  Gray: 'GRAY',
  Red: 'RED',
}

const KEY_COLOR_CONFIG = {
  [KEY_COLOR_TYPE.Black]: new THREE.Color(0x333333),
  [KEY_COLOR_TYPE.Gray]: new THREE.Color(0x999999),
  [KEY_COLOR_TYPE.Red]: new THREE.Color(0xdd0000),
}

export { KEYBOARD_PART_TYPE, KEYBOARD_PART_ACTIVITY_CONFIG, KEY_COLOR_TYPE, KEY_COLOR_CONFIG };
