import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { SPEAKERS_CONFIG } from "./speakers-config";
import { SPEAKERS_POWER_STATUS } from "./speakers-data";

export default class SpeakersDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._powerButton = null;
    this._powerStatusController = null;

    this._powerStatus = { value: SPEAKERS_POWER_STATUS.Off };

    this._init();
    this._checkToDisableFolder();
  }

  updatePowerStatus(powerStatus) {
    this._powerStatus.value = powerStatus;
    this._powerButton.title = this._powerStatus.value === SPEAKERS_POWER_STATUS.On ? 'Turn off' : 'Turn on';
    this._powerStatusController.refresh();
  }

  _init() {
    this._powerStatusController = this._debugFolder.addInput(this._powerStatus, 'value', {
      label: 'Power',
      disabled: true,
    });
    this._powerStatusController.customDisabled = true;

    this._powerButton = this._debugFolder.addButton({
      title: 'Turn on',
    }).on('click', () => this.events.post('switch'));

    this._debugFolder.addInput(SPEAKERS_CONFIG, 'helpersEnabled', {
      label: 'Helpers',
    }).on('change', () => this.events.post('onHelpersChanged'));

    this.updatePowerStatus(this._powerStatus.value);
  }
}
