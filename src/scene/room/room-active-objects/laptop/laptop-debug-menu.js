import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG } from "./laptop-config";
import { LAPTOP_POSITION_STATE } from "./laptop-data";

export default class LaptopDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._topPanelStateController = null;
    this._topPanelPositionController = null;
    this._mountAngleController = null;

    this._init();
    this._checkToDisableFolder();
  }

  updateLaptopButtonTitle() {
    this._openLaptopButton.title = LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Opened ? 'Open laptop' : 'Close laptop';
  }

  updateTopPanelState() {
    this._topPanelStateController.refresh();
  }

  updateMountAngle() {
    this._mountAngleController.refresh();
  }

  _init() {
    this._topPanelStateController = this._debugFolder.addInput(LAPTOP_CONFIG, 'state', {
      label: 'Panel state',
      disabled: true,
    });
    this._topPanelStateController.customDisabled = true;

    this._openLaptopButton = this._debugFolder.addButton({
      title: 'Close laptop',
    }).on('click', () => this.events.post('openLaptop'));

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(LAPTOP_CONFIG, 'rotationSpeed', {
      label: 'Open speed',
      min: 1,
      max: 100,
    });

    this._debugFolder.addInput(LAPTOP_CONFIG, 'maxOpenAngle', {
      label: 'Open angle',
      min: 1,
      max: 180,
    });

    this._debugFolder.addSeparator();

    this._mountAngleController = this._debugFolder.addInput(LAPTOP_MOUNT_CONFIG, 'angle', {
      label: 'Mount angle',
      min: 0,
      max: 35,
    }).on('change', () => this.events.post('mountAngleChanged'));
  }
}
