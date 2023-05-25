import * as THREE from 'three';

const KEYBOARD_PART_TYPE = {
  Base: 'keyboard_base',
  CloseFocusIcon: 'keyboard_close_focus_icon',
}

const KEYBOARD_PART_ACTIVITY_CONFIG = {
  [KEYBOARD_PART_TYPE.Base]: true,
  [KEYBOARD_PART_TYPE.CloseFocusIcon]: true,
}

const KEY_COLOR_TYPE = {
  Black: 'BLACK',
  Gray: 'GRAY',
  Red: 'RED',
}

const KEY_COLOR_CONFIG = {
  [KEY_COLOR_TYPE.Black]: new THREE.Color(0x32342f),
  [KEY_COLOR_TYPE.Gray]: new THREE.Color(0x7c7c7a),
  [KEY_COLOR_TYPE.Red]: new THREE.Color(0xcc0000),
}

export { KEYBOARD_PART_TYPE, KEYBOARD_PART_ACTIVITY_CONFIG, KEY_COLOR_TYPE, KEY_COLOR_CONFIG };
