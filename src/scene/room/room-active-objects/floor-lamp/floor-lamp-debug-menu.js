import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { FLOOR_LAMP_CONFIG } from "./data/floor-lamp-config";
import { LIGHT_STATE } from "./data/floor-lamp-data";

export default class FloorLampDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._lightPercentController = null;
    this._lightStateController = null;
    this._switchButton = null;

    this._init();
    this._checkToDisableFolder();
  }

  updateLightPercent(lightPercent) {
    FLOOR_LAMP_CONFIG.lightPercent = lightPercent;
    this._lightPercentController.refresh();
  }

  updateLightState() {
    this._lightStateController.refresh();
  }

  disableLightPercent() {
    this._lightPercentController.disabled = true;
  }

  enableLightPercent() {
    this._lightPercentController.disabled = false;
  }

  updateSwitchButtonName() {
    if (FLOOR_LAMP_CONFIG.lightState === LIGHT_STATE.On) {
      this._switchButton.title = 'Switch light off';
    }

    if (FLOOR_LAMP_CONFIG.lightState === LIGHT_STATE.Off) {
      this._switchButton.title = 'Switch light on';
    }
  }

  _init() {
    this._lightStateController = this._debugFolder.addInput(FLOOR_LAMP_CONFIG, 'debugLightState', {
      label: 'Lamp state',
      disabled: true,
    });
    this._lightStateController.customDisabled = true;

    this._lightPercentController = this._debugFolder.addInput(FLOOR_LAMP_CONFIG, 'lightPercent', {
      label: 'Mix percent',
      min: 0,
      max: 1,
    }).on('change', () => {
      this.events.post('onLightPercentChange');
    });

    this._switchButton = this._debugFolder.addButton({
      title: 'Switch light off',
    }).on('click', () => this.events.post('switchLight'));

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(FLOOR_LAMP_CONFIG, 'switchDuration', {
      label: 'Switch duration',
      min: 0,
      max: 1000,
      format: (value) => `${Math.floor(value)}`,
    });

    this._debugFolder.addInput(FLOOR_LAMP_CONFIG, 'helpers', {
      label: 'Light helpers',
    }).on('change', () => {
      this.events.post('onHelpersChange');
    });
  }
}
