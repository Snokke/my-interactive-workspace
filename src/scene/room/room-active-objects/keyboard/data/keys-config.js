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
  { id: 0, position: { x: 0, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Red },

  // F1 - F12
  { id: 1, position: { x: 0.19, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 2, position: { x: 0.19 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 3, position: { x: 0.19 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 4, position: { x: 0.19 + offsetKeyX * 3, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  { id: 5, position: { x: 0.619, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 6, position: { x: 0.619 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 7, position: { x: 0.619 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 8, position: { x: 0.619 + offsetKeyX * 3, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  { id: 9, position: { x: 1.036, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 10, position: { x: 1.036 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 11, position: { x: 1.036 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 12, position: { x: 1.036 + offsetKeyX * 3, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // Print Screen | Microphone | Backlight
  { id: 13, position: { x: 1.44, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 14, position: { x: 1.44 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 15, position: { x: 1.44 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Red },

  // ------------------------------------------------
  // Row 2
  // ------------------------------------------------
  // ~
  { id: 16, position: { x: 0, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  // 1 - 0
  { id: 17, position: { x: offsetKeyX, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 18, position: { x: offsetKeyX * 2, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 19, position: { x: offsetKeyX * 3, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 20, position: { x: offsetKeyX * 4, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 21, position: { x: offsetKeyX * 5, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 22, position: { x: offsetKeyX * 6, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 23, position: { x: offsetKeyX * 7, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 24, position: { x: offsetKeyX * 8, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 25, position: { x: offsetKeyX * 9, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 26, position: { x: offsetKeyX * 10, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // - | =
  { id: 27, position: { x: offsetKeyX * 11, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 28, position: { x: offsetKeyX * 12, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // Backspace
  { id: 29, position: { x: offsetKeyX * 13 + 0.05, y: offsetRowY, z: -offsetTildeZ }, scaleX: 2.2, colorType: KEY_COLOR_TYPE.Gray },

  // Delete | Home | Page Up
  { id: 30, position: { x: 1.44, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 31, position: { x: 1.44 + offsetKeyX, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 32, position: { x: 1.44 + offsetKeyX * 2, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  // ------------------------------------------------
  // Row 3
  // ------------------------------------------------
  // Tab
  { id: 33, position: { x: 0.03, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1.68, colorType: KEY_COLOR_TYPE.Gray },

  // Q - P
  { id: 34, position: { x: 0.146, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 35, position: { x: 0.146 + offsetKeyX, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 36, position: { x: 0.146 + offsetKeyX * 2, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 37, position: { x: 0.146 + offsetKeyX * 3, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 38, position: { x: 0.146 + offsetKeyX * 4, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 39, position: { x: 0.146 + offsetKeyX * 5, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 40, position: { x: 0.146 + offsetKeyX * 6, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 41, position: { x: 0.146 + offsetKeyX * 7, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 42, position: { x: 0.146 + offsetKeyX * 8, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 43, position: { x: 0.146 + offsetKeyX * 9, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // [ | ] | \
  { id: 44, position: { x: 0.146 + offsetKeyX * 10, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 45, position: { x: 0.146 + offsetKeyX * 11, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 46, position: { x: 0.146 + offsetKeyX * 12 + 0.02, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1.6, colorType: KEY_COLOR_TYPE.Gray },

  // Insert | End | Page Down
  { id: 47, position: { x: 1.44, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 48, position: { x: 1.44 + offsetKeyX, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 49, position: { x: 1.44 + offsetKeyX * 2, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  // ------------------------------------------------
  // Row 4
  // ------------------------------------------------
  // Caps Lock
  { id: 50, position: { x: 0.04, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1.95, colorType: KEY_COLOR_TYPE.Gray },

  // A - L
  { id: 51, position: { x: 0.169, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 52, position: { x: 0.169 + offsetKeyX, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 53, position: { x: 0.169 + offsetKeyX * 2, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 54, position: { x: 0.169 + offsetKeyX * 3, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 55, position: { x: 0.169 + offsetKeyX * 4, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 56, position: { x: 0.169 + offsetKeyX * 5, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 57, position: { x: 0.169 + offsetKeyX * 6, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 58, position: { x: 0.169 + offsetKeyX * 7, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 59, position: { x: 0.169 + offsetKeyX * 8, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // ; | ' | Enter
  { id: 60, position: { x: 0.169 + offsetKeyX * 9, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 61, position: { x: 0.169 + offsetKeyX * 10, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 62, position: { x: 0.169 + offsetKeyX * 11 + 0.055, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 2.5, colorType: KEY_COLOR_TYPE.Gray },

  // ------------------------------------------------
  // Row 5
  // ------------------------------------------------
  // Left Shift
  { id: 63, position: { x: 0.065, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 2.55, colorType: KEY_COLOR_TYPE.Gray },

  // Z - M
  { id: 64, position: { x: 0.216, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 65, position: { x: 0.216 + offsetKeyX, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 66, position: { x: 0.216 + offsetKeyX * 2, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 67, position: { x: 0.216 + offsetKeyX * 3, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 68, position: { x: 0.216 + offsetKeyX * 4, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 69, position: { x: 0.216 + offsetKeyX * 5, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 70, position: { x: 0.216 + offsetKeyX * 6, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // , | . | /
  { id: 71, position: { x: 0.216 + offsetKeyX * 7, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 72, position: { x: 0.216 + offsetKeyX * 8, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 73, position: { x: 0.216 + offsetKeyX * 9, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // Right Shift
  { id: 74, position: { x: 0.216 + offsetKeyX * 10 + 0.077, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 3, colorType: KEY_COLOR_TYPE.Gray },

  // Arrow Up
  { id: 75, position: { x: 1.44 + offsetKeyX, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // ------------------------------------------------
  // Row 6
  // ------------------------------------------------
  // Left Ctrl | Left Option | Left Command
  { id: 76, position: { x: 0.018, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { id: 77, position: { x: 0.14, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { id: 78, position: { x: 0.257, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },

  // Space
  { id: 79, position: { x: 0.6, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 7.0, colorType: KEY_COLOR_TYPE.Black },

  // Right Command | Right Option | Fn | Right Ctrl
  { id: 80, position: { x: 0.947, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { id: 81, position: { x: 1.064, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { id: 82, position: { x: 1.181, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { id: 83, position: { x: 1.3, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },

  // Arrow Left | Arrow Down | Arrow Right
  { id: 84, position: { x: 1.44, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 85, position: { x: 1.44 + offsetKeyX, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 86, position: { x: 1.44 + offsetKeyX * 2, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
];

const KEYS_ID_BY_ROW = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
  [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
  [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62],
  [63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
  [76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
]

export { KEYS_CONFIG, KEYS_ID_BY_ROW };
