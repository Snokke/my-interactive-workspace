import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import TABLE_CONFIG from "./table-config";
import { TABLE_STATE } from "./table-data";

export default class TableDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._currentTableState = { value: TABLE_STATE.SittingMode };

    this._stateController = null;

    this._init();
    this._checkToDisableFolder();
  }

  updateTableState(tableState) {
    this._currentTableState.value = tableState;
    this._stateController.refresh();
  }

  _init() {
    this._stateController = this._debugFolder.addInput(this._currentTableState, 'value', {
      label: 'State',
      disabled: true,
    });
    this._stateController.customDisabled = true;

    this._debugFolder.addButton({
      title: 'Change state',
    }).on('click', () => {
      this.events.post('changeState');
    });

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(TABLE_CONFIG, 'handleMoveOutSpeed', {
      label: 'Move in/out speed',
      min: 0.1,
      max: 10,
    });

    this._debugFolder.addInput(TABLE_CONFIG, 'handleRotationSpeed', {
      label: 'Rotation speed',
      min: 1,
      max: 50,
    });

    this._debugFolder.addInput(TABLE_CONFIG, 'handleMaxRotations', {
      label: 'Rotations',
      min: 1,
      max: 20,
      step: 1,
    });

    this._debugFolder.addInput(TABLE_CONFIG, 'handle360RotationDeltaY', {
      label: 'Uplift',
      min: 0.01,
      max: 1,
    });
  }
}
