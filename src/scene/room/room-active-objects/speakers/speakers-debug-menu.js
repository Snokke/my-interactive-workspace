import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { SPEAKERS_CONFIG } from "./speakers-config";
import { SPEAKERS_POWER_STATUS } from "./speakers-data";

export default class SpeakersDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._powerButton = null;
    this._powerStatusController = null;
    this._musicDurationController = null;

    this._powerStatus = { value: SPEAKERS_POWER_STATUS.Off };
    this._musicCurrentTime = { value: 0 };
    this._currentMusicDuration = 0;

    this._init();
    this._checkToDisableFolder();
  }

  updateCurrentTime(currentTime) {
    this._musicCurrentTime.value = currentTime;
    this._musicDurationController.refresh();
  }

  updateDuration(duration) {
    const stc = this._musicDurationController.controller_.valueController;
    const sc = stc.sliderController;
    sc.props.set("maxValue", duration);

    this._musicDurationController.refresh();
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

    this._debugFolder.addSeparator();

    this._musicDurationController = this._debugFolder.addInput(this._musicCurrentTime, 'value', {
      label: 'Music',
      min: 0,
      max: this._currentMusicDuration,
      disabled: true,
      format: (v) => this._formatTime(v),
    });
    this._musicDurationController.customDisabled = true;

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(SPEAKERS_CONFIG, 'helpersEnabled', {
      label: 'Helpers',
    }).on('change', () => this.events.post('onHelpersChanged'));

    this.updatePowerStatus(this._powerStatus.value);
  }

  _formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);

    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }
}
