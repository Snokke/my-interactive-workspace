import { KEY_COLOR_TYPE } from "./keyboard-data";

const offsetKeyX = 0.0943;
const offsetRowY = -0.0115;
const offsetRowZ = 0.094;
const offsetTildeZ = 0.107;

const KEYS_CONFIG = [
  // ------------------------------------------------
  // Row 1
  // ------------------------------------------------
  // ESC
  { position: { x: 0, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Red },

  // F1 - F12
  { position: { x: 0.19, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.19 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.19 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.19 + offsetKeyX * 3, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  { position: { x: 0.619, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 0.619 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 0.619 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 0.619 + offsetKeyX * 3, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  { position: { x: 1.036, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 1.036 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 1.036 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 1.036 + offsetKeyX * 3, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // Print Screen | Microphone | Highlight
  { position: { x: 1.44, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 1.44 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 1.44 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Red },

  // ------------------------------------------------
  // Row 2
  // ------------------------------------------------
  // ~
  { position: { x: 0, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  // 1 - 0
  { position: { x: offsetKeyX, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: offsetKeyX * 2, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: offsetKeyX * 3, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: offsetKeyX * 4, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: offsetKeyX * 5, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: offsetKeyX * 6, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: offsetKeyX * 7, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: offsetKeyX * 8, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: offsetKeyX * 9, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: offsetKeyX * 10, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // - | =
  { position: { x: offsetKeyX * 11, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: offsetKeyX * 12, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // Backspace
  { position: { x: offsetKeyX * 13 + 0.05, y: offsetRowY, z: -offsetTildeZ }, scaleX: 2.2, colorType: KEY_COLOR_TYPE.Gray },

  // Delete | Home | Page Up
  { position: { x: 1.44, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 1.44 + offsetKeyX, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 1.44 + offsetKeyX * 2, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  // ------------------------------------------------
  // Row 3
  // ------------------------------------------------
  // Tab
  { position: { x: 0.03, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1.68, colorType: KEY_COLOR_TYPE.Gray },

  // Q - P
  { position: { x: 0.146, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX * 2, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX * 3, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX * 4, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX * 5, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX * 6, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX * 7, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX * 8, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX * 9, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // [ | ] | \
  { position: { x: 0.146 + offsetKeyX * 10, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX * 11, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.146 + offsetKeyX * 12 + 0.02, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1.6, colorType: KEY_COLOR_TYPE.Gray },

  // Insert | End | Page Down
  { position: { x: 1.44, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 1.44 + offsetKeyX, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 1.44 + offsetKeyX * 2, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  // ------------------------------------------------
  // Row 4
  // ------------------------------------------------
  // Caps Lock
  { position: { x: 0.04, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1.95, colorType: KEY_COLOR_TYPE.Gray },

  // A - L
  { position: { x: 0.169, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.169 + offsetKeyX, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.169 + offsetKeyX * 2, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.169 + offsetKeyX * 3, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.169 + offsetKeyX * 4, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.169 + offsetKeyX * 5, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.169 + offsetKeyX * 6, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.169 + offsetKeyX * 7, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.169 + offsetKeyX * 8, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // ; | ' | Enter
  { position: { x: 0.169 + offsetKeyX * 9, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.169 + offsetKeyX * 10, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.169 + offsetKeyX * 11 + 0.055, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 2.5, colorType: KEY_COLOR_TYPE.Gray },

  // ------------------------------------------------
  // Row 5
  // ------------------------------------------------
  // Left Shift
  { position: { x: 0.065, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 2.55, colorType: KEY_COLOR_TYPE.Gray },

  // Z - M
  { position: { x: 0.216, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.216 + offsetKeyX, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.216 + offsetKeyX * 2, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.216 + offsetKeyX * 3, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.216 + offsetKeyX * 4, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.216 + offsetKeyX * 5, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.216 + offsetKeyX * 6, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // , | . | /
  { position: { x: 0.216 + offsetKeyX * 7, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.216 + offsetKeyX * 8, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 0.216 + offsetKeyX * 9, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // Right Shift
  { position: { x: 0.216 + offsetKeyX * 10 + 0.077, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 3, colorType: KEY_COLOR_TYPE.Gray },

  // Arrow Up
  { position: { x: 1.44 + offsetKeyX, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // ------------------------------------------------
  // Row 6
  // ------------------------------------------------
  // Left Ctrl | Left Option | Left Command
  { position: { x: 0.018, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 0.14, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 0.257, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },

  // Space
  { position: { x: 0.6, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 7.0, colorType: KEY_COLOR_TYPE.Black },

  // Right Command | Right Option | Fn | Right Ctrl
  { position: { x: 0.947, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 1.064, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 1.181, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { position: { x: 1.3, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },

  // Arrow Left | Arrow Down | Arrow Right
  { position: { x: 1.44, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 1.44 + offsetKeyX, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { position: { x: 1.44 + offsetKeyX * 2, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
];

export { KEYS_CONFIG };
