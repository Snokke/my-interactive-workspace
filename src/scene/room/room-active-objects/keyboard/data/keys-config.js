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
  { id: 0, code: 'Escape', position: { x: 0, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Red },

  // F1 - F12
  { id: 1, code: 'F1', position: { x: 0.19, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 2, code: 'F2', position: { x: 0.19 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 3, code: 'F3', position: { x: 0.19 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 4, code: 'F4', position: { x: 0.19 + offsetKeyX * 3, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  { id: 5, code: 'F5', position: { x: 0.619, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 6, code: 'F6', position: { x: 0.619 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 7, code: 'F7', position: { x: 0.619 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 8, code: 'F8', position: { x: 0.619 + offsetKeyX * 3, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  { id: 9, code: 'F9', position: { x: 1.036, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 10, code: 'F10', position: { x: 1.036 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 11, code: 'F11', position: { x: 1.036 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 12, code: 'F12', position: { x: 1.036 + offsetKeyX * 3, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // Print Screen | Microphone | Backlight
  { id: 13, code: '', position: { x: 1.44, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 14, code: '', position: { x: 1.44 + offsetKeyX, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 15, code: '', position: { x: 1.44 + offsetKeyX * 2, y: 0, z: 0 }, scaleX: 1, colorType: KEY_COLOR_TYPE.Red },

  // ------------------------------------------------
  // Row 2
  // ------------------------------------------------
  // ~
  { id: 16, code: 'Backquote', position: { x: 0, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  // 1 - 0
  { id: 17, code: 'Digit1', position: { x: offsetKeyX, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 18, code: 'Digit2', position: { x: offsetKeyX * 2, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 19, code: 'Digit3', position: { x: offsetKeyX * 3, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 20, code: 'Digit4', position: { x: offsetKeyX * 4, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 21, code: 'Digit5', position: { x: offsetKeyX * 5, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 22, code: 'Digit6', position: { x: offsetKeyX * 6, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 23, code: 'Digit7', position: { x: offsetKeyX * 7, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 24, code: 'Digit8', position: { x: offsetKeyX * 8, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 25, code: 'Digit9', position: { x: offsetKeyX * 9, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 26, code: 'Digit0', position: { x: offsetKeyX * 10, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // - | =
  { id: 27, code: 'Minus', position: { x: offsetKeyX * 11, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 28, code: 'Equal', position: { x: offsetKeyX * 12, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // Backspace
  { id: 29, code: 'Backspace', position: { x: offsetKeyX * 13 + 0.05, y: offsetRowY, z: -offsetTildeZ }, scaleX: 2.2, colorType: KEY_COLOR_TYPE.Gray },

  // Delete | Home | Page Up
  { id: 30, code: 'Insert', position: { x: 1.44, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 31, code: 'Home', position: { x: 1.44 + offsetKeyX, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 32, code: 'PageUp', position: { x: 1.44 + offsetKeyX * 2, y: offsetRowY, z: -offsetTildeZ }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  // ------------------------------------------------
  // Row 3
  // ------------------------------------------------
  // Tab
  { id: 33, code: 'Tab', position: { x: 0.03, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1.68, colorType: KEY_COLOR_TYPE.Gray },

  // Q - P
  { id: 34, code: 'KeyQ', position: { x: 0.146, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 35, code: 'KeyW', position: { x: 0.146 + offsetKeyX, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 36, code: 'KeyE', position: { x: 0.146 + offsetKeyX * 2, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 37, code: 'KeyR', position: { x: 0.146 + offsetKeyX * 3, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 38, code: 'KeyT', position: { x: 0.146 + offsetKeyX * 4, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 39, code: 'KeyY', position: { x: 0.146 + offsetKeyX * 5, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 40, code: 'KeyU', position: { x: 0.146 + offsetKeyX * 6, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 41, code: 'KeyI', position: { x: 0.146 + offsetKeyX * 7, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 42, code: 'KeyO', position: { x: 0.146 + offsetKeyX * 8, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 43, code: 'KeyP', position: { x: 0.146 + offsetKeyX * 9, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // [ | ] | \
  { id: 44, code: 'BracketLeft', position: { x: 0.146 + offsetKeyX * 10, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 45, code: 'BracketRight', position: { x: 0.146 + offsetKeyX * 11, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 46, code: 'Backslash', position: { x: 0.146 + offsetKeyX * 12 + 0.02, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1.6, colorType: KEY_COLOR_TYPE.Gray },

  // Insert | End | Page Down
  { id: 47, code: 'Delete', position: { x: 1.44, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 48, code: 'End', position: { x: 1.44 + offsetKeyX, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },
  { id: 49, code: 'PageDown', position: { x: 1.44 + offsetKeyX * 2, y: offsetRowY * 2, z: -(offsetTildeZ + offsetRowZ) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Gray },

  // ------------------------------------------------
  // Row 4
  // ------------------------------------------------
  // Caps Lock
  { id: 50, code: 'CapsLock', position: { x: 0.04, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1.95, colorType: KEY_COLOR_TYPE.Gray },

  // A - L
  { id: 51, code: 'KeyA', position: { x: 0.169, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 52, code: 'KeyS', position: { x: 0.169 + offsetKeyX, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 53, code: 'KeyD', position: { x: 0.169 + offsetKeyX * 2, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 54, code: 'KeyF', position: { x: 0.169 + offsetKeyX * 3, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 55, code: 'KeyG', position: { x: 0.169 + offsetKeyX * 4, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 56, code: 'KeyH', position: { x: 0.169 + offsetKeyX * 5, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 57, code: 'KeyJ', position: { x: 0.169 + offsetKeyX * 6, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 58, code: 'KeyK', position: { x: 0.169 + offsetKeyX * 7, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 59, code: 'KeyL', position: { x: 0.169 + offsetKeyX * 8, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // ; | ' | Enter
  { id: 60, code: 'Semicolon', position: { x: 0.169 + offsetKeyX * 9, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 61, code: 'Quote', position: { x: 0.169 + offsetKeyX * 10, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 62, code: 'Enter', position: { x: 0.169 + offsetKeyX * 11 + 0.055, y: offsetRowY * 3, z: -(offsetTildeZ + offsetRowZ * 2) }, scaleX: 2.5, colorType: KEY_COLOR_TYPE.Gray },

  // ------------------------------------------------
  // Row 5
  // ------------------------------------------------
  // Left Shift
  { id: 63, code: 'ShiftLeft', position: { x: 0.065, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 2.55, colorType: KEY_COLOR_TYPE.Gray },

  // Z - M
  { id: 64, code: 'KeyZ', position: { x: 0.216, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 65, code: 'KeyX', position: { x: 0.216 + offsetKeyX, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 66, code: 'KeyC', position: { x: 0.216 + offsetKeyX * 2, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 67, code: 'KeyV', position: { x: 0.216 + offsetKeyX * 3, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 68, code: 'KeyB', position: { x: 0.216 + offsetKeyX * 4, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 69, code: 'KeyN', position: { x: 0.216 + offsetKeyX * 5, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 70, code: 'KeyM', position: { x: 0.216 + offsetKeyX * 6, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // , | . | /
  { id: 71, code: 'Comma', position: { x: 0.216 + offsetKeyX * 7, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 72, code: 'Period', position: { x: 0.216 + offsetKeyX * 8, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 73, code: 'Slash', position: { x: 0.216 + offsetKeyX * 9, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // Right Shift
  { id: 74, code: 'ShiftRight', position: { x: 0.216 + offsetKeyX * 10 + 0.077, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 3, colorType: KEY_COLOR_TYPE.Gray },

  // Arrow Up
  { id: 75, code: 'ArrowUp', position: { x: 1.44 + offsetKeyX, y: offsetRowY * 4, z: -(offsetTildeZ + offsetRowZ * 3) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },

  // ------------------------------------------------
  // Row 6
  // ------------------------------------------------
  // Left Ctrl | Left Option | Left Command
  { id: 76, code: 'ControlLeft', position: { x: 0.018, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { id: 77, code: 'AltLeft', position: { x: 0.14, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { id: 78, code: 'MetaLeft', position: { x: 0.257, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },

  // Space
  { id: 79, code: 'Space', position: { x: 0.6, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 7.0, colorType: KEY_COLOR_TYPE.Black },

  // Right Command | Right Option | Fn | Right Ctrl
  { id: 80, code: 'MetaRight', position: { x: 0.947, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { id: 81, code: 'AltRight', position: { x: 1.064, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { id: 82, code: '', position: { x: 1.181, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },
  { id: 83, code: 'ControlRight', position: { x: 1.3, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1.35, colorType: KEY_COLOR_TYPE.Gray },

  // Arrow Left | Arrow Down | Arrow Right
  { id: 84, code: 'ArrowLeft', position: { x: 1.44, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 85, code: 'ArrowDown', position: { x: 1.44 + offsetKeyX, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
  { id: 86, code: 'ArrowRight',  position: { x: 1.44 + offsetKeyX * 2, y: offsetRowY * 5, z: -(offsetTildeZ + offsetRowZ * 4) }, scaleX: 1, colorType: KEY_COLOR_TYPE.Black },
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
