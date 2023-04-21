import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { KEYBOARD_CONFIG } from "./keyboard-config";

export default class KeyboardDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._init();
    this._checkToDisableFolder();
  }

  _init() {
    this._debugFolder.addInput(KEYBOARD_CONFIG.keys, 'highlightColor', {
      label: 'Pointer over color',
      view: 'color',
    });
  }
}
