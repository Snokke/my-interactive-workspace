import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { AIR_CONDITIONER_CONFIG } from "./data/air-conditioner-config";
import { AIR_CONDITIONER_STATE } from "./data/air-conditioner-data";

export default class AirConditionerDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._powerStateController = null;
    this._increaseTemperatureButton = null;
    this._decreaseTemperatureButton = null;
    this._targetTemperatureController = null;
    this._targetTemperature = null;
    this._powerButton = null;

    this._init();
    this._checkToDisableFolder();
  }

  updatePowerStateController() {
    this._powerStateController.refresh();

    if (AIR_CONDITIONER_CONFIG.powerState === AIR_CONDITIONER_STATE.PowerOn) {
      this._powerButton.title = 'Turn off';
    } else {
      this._powerButton.title = 'Turn on';
    }
  }

  updateTemperature() {
    this._targetTemperature.value = `${AIR_CONDITIONER_CONFIG.temperature.current} °C`;
    this._targetTemperatureController.refresh();

    if (AIR_CONDITIONER_CONFIG.temperature.current === AIR_CONDITIONER_CONFIG.temperature.max) {
      this._disableIncreaseTemperatureButton();
    } else {
      this._enableIncreaseTemperatureButton();
    }

    if (AIR_CONDITIONER_CONFIG.temperature.current === AIR_CONDITIONER_CONFIG.temperature.min) {
      this._disableDecreaseTemperatureButton();
    } else {
      this._enableDecreaseTemperatureButton();
    }
  }

  _disableIncreaseTemperatureButton() {
    this._increaseTemperatureButton.disabled = true;
    this._increaseTemperatureButton.customDisabled = true;
  }

  _enableIncreaseTemperatureButton() {
    this._increaseTemperatureButton.disabled = false;
    this._increaseTemperatureButton.customDisabled = false;
  }

  _disableDecreaseTemperatureButton() {
    this._decreaseTemperatureButton.disabled = true;
    this._decreaseTemperatureButton.customDisabled = true;
  }

  _enableDecreaseTemperatureButton() {
    this._decreaseTemperatureButton.disabled = false;
    this._decreaseTemperatureButton.customDisabled = false;
  }

  _init() {
    this._powerStateController = this._debugFolder.addInput(AIR_CONDITIONER_CONFIG, 'powerState', {
      label: 'Power state',
      disabled: true,
    });
    this._powerStateController.customDisabled = true;

    this._powerButton = this._debugFolder.addButton({
      title: 'Turn on',
    }).on('click', () => this.events.post('turnOnOff'));

    this._debugFolder.addSeparator();

    const roomTemperature = { value: `${AIR_CONDITIONER_CONFIG.temperature.room} °C` };
    const roomTemperatureController = this._debugFolder.addInput(roomTemperature, 'value', {
      label: 'Room',
      disabled: true,
    });
    roomTemperatureController.customDisabled = true;

    this._targetTemperature = { value: `${AIR_CONDITIONER_CONFIG.temperature.current} °C` };
    this._targetTemperatureController = this._debugFolder.addInput(this._targetTemperature, 'value', {
      label: 'Target',
      disabled: true,
    });
    this._targetTemperatureController.customDisabled = true;

    this._increaseTemperatureButton = this._debugFolder.addButton({
      title: 'Increase temperature',
    }).on('click', () => this.events.post('increaseTemperature'));

    this._decreaseTemperatureButton = this._debugFolder.addButton({
      title: 'Decrease temperature',
    }).on('click', () => this.events.post('decreaseTemperature'));
  }
}
