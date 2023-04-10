import * as THREE from 'three';


const KEYBOARD_CONFIG = {
  size: new THREE.Vector3(1.8, 0.205, 0.59),
  offsetLeft: 0.055,
  offsetTop: 0.056,
}

const KEY_HIGHLIGHT_CONFIG = {
  size: 0.09,
  angle: 6.5,
}

const offsetKeyX = 0.0943;
const offsetRowY = -0.0115;
const offsetRowZ = 0.094;
const offsetTildeZ = 0.107;

const KEYS_POSITION = [
  // ------------------------------------------------
  // Row 1
  // ------------------------------------------------
  // ESC
  { position: new THREE.Vector3(0, 0, 0) },

  // F1 - F12
  { position: new THREE.Vector3(0.19, 0, 0) },
  { position: new THREE.Vector3(0.19 + offsetKeyX, 0, 0) },
  { position: new THREE.Vector3(0.19 + offsetKeyX * 2, 0, 0) },
  { position: new THREE.Vector3(0.19 + offsetKeyX * 3, 0, 0) },

  { position: new THREE.Vector3(0.619, 0, 0) },
  { position: new THREE.Vector3(0.619 + offsetKeyX, 0, 0) },
  { position: new THREE.Vector3(0.619 + offsetKeyX * 2, 0, 0) },
  { position: new THREE.Vector3(0.619 + offsetKeyX * 3, 0, 0) },

  { position: new THREE.Vector3(1.036, 0, 0) },
  { position: new THREE.Vector3(1.036 + offsetKeyX, 0, 0) },
  { position: new THREE.Vector3(1.036 + offsetKeyX * 2, 0, 0) },
  { position: new THREE.Vector3(1.036 + offsetKeyX * 3, 0, 0) },

  // Print Screen | Microphone | Highlight
  { position: new THREE.Vector3(1.44, 0, 0) },
  { position: new THREE.Vector3(1.44 + offsetKeyX, 0, 0) },
  { position: new THREE.Vector3(1.44 + offsetKeyX * 2, 0, 0) },

  // ------------------------------------------------
  // Row 2
  // ------------------------------------------------
  // ~
  { position: new THREE.Vector3(0, offsetRowY, -offsetTildeZ) },

  // 1 - 0
  { position: new THREE.Vector3(offsetKeyX, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(offsetKeyX * 2, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(offsetKeyX * 3, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(offsetKeyX * 4, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(offsetKeyX * 5, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(offsetKeyX * 6, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(offsetKeyX * 7, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(offsetKeyX * 8, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(offsetKeyX * 9, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(offsetKeyX * 10, offsetRowY, -offsetTildeZ) },

  // - | =
  { position: new THREE.Vector3(offsetKeyX * 11, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(offsetKeyX * 12, offsetRowY, -offsetTildeZ) },

  // Backspace
  { position: new THREE.Vector3(offsetKeyX * 13 + 0.05, offsetRowY, -offsetTildeZ) },

  // Delete | Home | Page Up
  { position: new THREE.Vector3(1.44, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(1.44 + offsetKeyX, offsetRowY, -offsetTildeZ) },
  { position: new THREE.Vector3(1.44 + offsetKeyX * 2, offsetRowY, -offsetTildeZ) },

  // ------------------------------------------------
  // Row 3
  // ------------------------------------------------
  // Tab
  { position: new THREE.Vector3(0.03, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },

  // Q - P
  { position: new THREE.Vector3(0.146, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX * 2, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX * 3, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX * 4, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX * 5, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX * 6, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX * 7, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX * 8, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX * 9, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },

  // [ | ] | \
  { position: new THREE.Vector3(0.146 + offsetKeyX * 10, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX * 11, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(0.146 + offsetKeyX * 12 + 0.02, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },

  // Insert | End | Page Down
  { position: new THREE.Vector3(1.44, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(1.44 + offsetKeyX, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },
  { position: new THREE.Vector3(1.44 + offsetKeyX * 2, offsetRowY * 2, -(offsetTildeZ + offsetRowZ)) },

  // ------------------------------------------------
  // Row 4
  // ------------------------------------------------
  // Caps Lock
  { position: new THREE.Vector3(0.04, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },

  // A - L
  { position: new THREE.Vector3(0.169, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },
  { position: new THREE.Vector3(0.169 + offsetKeyX, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },
  { position: new THREE.Vector3(0.169 + offsetKeyX * 2, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },
  { position: new THREE.Vector3(0.169 + offsetKeyX * 3, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },
  { position: new THREE.Vector3(0.169 + offsetKeyX * 4, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },
  { position: new THREE.Vector3(0.169 + offsetKeyX * 5, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },
  { position: new THREE.Vector3(0.169 + offsetKeyX * 6, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },
  { position: new THREE.Vector3(0.169 + offsetKeyX * 7, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },
  { position: new THREE.Vector3(0.169 + offsetKeyX * 8, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },

  // ; | ' | Enter
  { position: new THREE.Vector3(0.169 + offsetKeyX * 9, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },
  { position: new THREE.Vector3(0.169 + offsetKeyX * 10, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },
  { position: new THREE.Vector3(0.169 + offsetKeyX * 11 + 0.055, offsetRowY * 3, -(offsetTildeZ + offsetRowZ * 2)) },

  // ------------------------------------------------
  // Row 5
  // ------------------------------------------------
  // Left Shift
  { position: new THREE.Vector3(0.065, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },

  // Z - M
  { position: new THREE.Vector3(0.216, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },
  { position: new THREE.Vector3(0.216 + offsetKeyX, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },
  { position: new THREE.Vector3(0.216 + offsetKeyX * 2, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },
  { position: new THREE.Vector3(0.216 + offsetKeyX * 3, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },
  { position: new THREE.Vector3(0.216 + offsetKeyX * 4, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },
  { position: new THREE.Vector3(0.216 + offsetKeyX * 5, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },
  { position: new THREE.Vector3(0.216 + offsetKeyX * 6, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },

  // , | . | /
  { position: new THREE.Vector3(0.216 + offsetKeyX * 7, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },
  { position: new THREE.Vector3(0.216 + offsetKeyX * 8, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },
  { position: new THREE.Vector3(0.216 + offsetKeyX * 9, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },

  // Right Shift
  { position: new THREE.Vector3(0.216 + offsetKeyX * 10 + 0.077, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },

  // Arrow Up
  { position: new THREE.Vector3(1.44 + offsetKeyX, offsetRowY * 4, -(offsetTildeZ + offsetRowZ * 3)) },

  // ------------------------------------------------
  // Row 6
  // ------------------------------------------------
  // Left Ctrl | Left Option | Left Command
  { position: new THREE.Vector3(0.018, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },
  { position: new THREE.Vector3(0.14, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },
  { position: new THREE.Vector3(0.257, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },

  // Space
  { position: new THREE.Vector3(0.6, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },

  // Right Command | Right Option | Fn | Right Ctrl
  { position: new THREE.Vector3(0.947, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },
  { position: new THREE.Vector3(1.064, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },
  { position: new THREE.Vector3(1.181, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },
  { position: new THREE.Vector3(1.3, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },

  // Arrow Left | Arrow Down | Arrow Right
  { position: new THREE.Vector3(1.44, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },
  { position: new THREE.Vector3(1.44 + offsetKeyX, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },
  { position: new THREE.Vector3(1.44 + offsetKeyX * 2, offsetRowY * 5, -(offsetTildeZ + offsetRowZ * 4)) },
];

export { KEYBOARD_CONFIG, KEYS_POSITION, KEY_HIGHLIGHT_CONFIG };
