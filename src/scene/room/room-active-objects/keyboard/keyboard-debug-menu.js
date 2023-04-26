import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { KEYS_BACKLIGHT_CONFIG } from "./keys-backlight/keys-backlight-config";
import { KEYBOARD_CONFIG } from "./data/keyboard-config";
import { KEYS_BACKLIGHT_TYPE } from "./keys-backlight/keys-backlight-data";

export default class KeyboardDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._currentTypeButton = null;

    this._init();
    this._checkToDisableFolder();
  }

  updateBacklightType() {
    this._currentTypeButton.refresh();
  }

  _init() {
    this._debugFolder.addInput(KEYBOARD_CONFIG.keys, 'highlightColor', {
      label: 'Pointer over color',
      view: 'color',
    });

    this._debugFolder.addSeparator();

    this._currentTypeButton = this._debugFolder.addInput(KEYS_BACKLIGHT_CONFIG, 'currentType', {
      label: 'Current backlight',
      disabled: true,
    });
    this._currentTypeButton.customDisabled = true;

    this._debugFolder.addButton({
      title: 'Change backlight type',
    }).on('click', () => this.events.post('onChangeBacklightType'));

    this._debugFolder.addSeparator();

    let selectedBacklightType = KEYS_BACKLIGHT_TYPE.FromLeftToRight;

    this._debugFolder.addBlade({
      view: 'list',
      label: 'Type',
      options: [
        { text: 'From left to right', value: KEYS_BACKLIGHT_TYPE.FromLeftToRight },
        { text: 'From top to bottom', value: KEYS_BACKLIGHT_TYPE.FromTopToBottom },
        { text: 'Same color', value: KEYS_BACKLIGHT_TYPE.SameColor },
        { text: 'From center to sides', value: KEYS_BACKLIGHT_TYPE.FromCenterToSides },
        { text: 'Random colors', value: KEYS_BACKLIGHT_TYPE.RandomColors },
        { text: 'From first key to last key', value: KEYS_BACKLIGHT_TYPE.FromFirstToLastKey },
        { text: 'Pressed key', value: KEYS_BACKLIGHT_TYPE.PressKey },
        { text: 'From pressed key to sides', value: KEYS_BACKLIGHT_TYPE.PressKeyToSides },
        { text: 'From pressed key to sides single row', value: KEYS_BACKLIGHT_TYPE.PressKeyToSidesRow },
      ],
      value: KEYS_BACKLIGHT_TYPE.FromLeftToRight,
    }).on('change', (backlightType) => {
      selectedBacklightType = backlightType.value;
    });

    this._debugFolder.addButton({
      title: 'Set selected backlight type',
    }).on('click', () => this.events.post('onSetBacklightType', selectedBacklightType));
  }
}
