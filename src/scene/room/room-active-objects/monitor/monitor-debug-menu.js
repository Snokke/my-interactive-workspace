import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { MONITOR_ARM_MOUNT_CONFIG, MONITOR_CONFIG } from "./data/monitor-config";

export default class MonitorDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._positionController = null;
    this._arm01AngleController = null;
    this._arm02AngleController = null;
    this._playShowreelButton = null;
    this._showGameButton = null;

    this._init();
    this._checkToDisableFolder();
  }

  updatePosition() {
    this._positionController.refresh();
  }

  updateArmRotation() {
    this._arm01AngleController.refresh();
    this._arm02AngleController.refresh();
  }

  updateShowreelButton(videoPlaying) {
    if (videoPlaying) {
      this._playShowreelButton.title = 'Stop Showreel video';
    } else {
      this._playShowreelButton.title = 'Play Showreel video';
    }
  }

  updateGameButton(gameActive) {
    if (gameActive) {
      this._showGameButton.title = 'Stop game: «Transfer It»';
    } else {
      this._showGameButton.title = 'Start game: «Transfer It»';
    }
  }

  disableShowreelButton() {
    this._playShowreelButton.disabled = true;
  }

  enableShowreelButton() {
    this._playShowreelButton.disabled = false;
  }

  disableGameButton() {
    this._showGameButton.disabled = true;
  }

  enableGameButton() {
    this._showGameButton.disabled = false;
  }

  _init() {
    this._playShowreelButton = this._debugFolder.addButton({
      title: 'Play Showreel video',
    }).on('click', () => this.events.post('onPlayShowreelVideo'));

    this._showGameButton = this._debugFolder.addButton({
      title: 'Start game: «Transfer It»',
    }).on('click', () => this.events.post('onShowGame'));

    this._debugFolder.addButton({
      title: 'Open CV',
    }).on('click', () => this.events.post('onOpenCV'));

    this._debugFolder.addSeparator();

    this._positionController = this._debugFolder.addInput(MONITOR_CONFIG, 'positionZ', {
      label: 'Position z',
      min: MONITOR_CONFIG.minZ,
      max: MONITOR_CONFIG.maxZ,
    }).on('change', (position) => {
      this.events.post('onPositionChanged', position.value);
    });

    this._arm01AngleController = this._debugFolder.addInput(MONITOR_ARM_MOUNT_CONFIG.arm01, 'angle', {
      label: 'Bottom arm angle',
      min: 0,
      max: 180,
      disabled: true,
    });
    this._arm01AngleController.customDisabled = true;

    this._arm02AngleController = this._debugFolder.addInput(MONITOR_ARM_MOUNT_CONFIG.arm02, 'angle', {
      label: 'Top arm angle',
      min: -180,
      max: 0,
      disabled: true,
    });
    this._arm02AngleController.customDisabled = true;
  }
}
