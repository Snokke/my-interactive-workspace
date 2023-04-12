import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { NOTEBOOK_CONFIG, NOTEBOOK_MOUNT_CONFIG } from "./notebook-config";
import { NOTEBOOK_POSITION_STATE } from "./notebook-data";

export default class NotebookDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._topPanelStateController = null;
    this._topPanelPositionController = null;
    this._mountAngleController = null;

    this._init();
    this._checkToDisableFolder();
  }

  updateNotebookButtonTitle() {
    this._openNotebookButton.title = NOTEBOOK_CONFIG.positionType === NOTEBOOK_POSITION_STATE.Opened ? 'Open notebook' : 'Close notebook';
  }

  updateTopPanelState() {
    this._topPanelStateController.refresh();
  }

  updateMountAngle() {
    this._mountAngleController.refresh();
  }

  _init() {
    this._topPanelStateController = this._debugFolder.addInput(NOTEBOOK_CONFIG, 'state', {
      label: 'Panel state',
      disabled: true,
    });
    this._topPanelStateController.customDisabled = true;

    this._openNotebookButton = this._debugFolder.addButton({
      title: 'Close notebook',
    }).on('click', () => this.events.post('openNotebook'));

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(NOTEBOOK_CONFIG, 'rotationSpeed', {
      label: 'Open speed',
      min: 1,
      max: 100,
    });

    this._debugFolder.addInput(NOTEBOOK_CONFIG, 'maxOpenAngle', {
      label: 'Open angle',
      min: 1,
      max: 180,
    });

    this._debugFolder.addSeparator();

    this._mountAngleController = this._debugFolder.addInput(NOTEBOOK_MOUNT_CONFIG, 'angle', {
      label: 'Mount angle',
      min: 0,
      max: 35,
    }).on('change', () => this.events.post('mountAngleChanged'));
  }
}
