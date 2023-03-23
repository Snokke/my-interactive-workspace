import GUIHelper from "../../../../core/helpers/gui-helper/gui-helper";
import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import TABLE_CONFIG from "./table-config";

export default class TableDebug extends RoomObjectDebugAbstract {
  constructor(currentTableState) {
    super();

    this._currentTableState = currentTableState;

    this._stateController = null;

    this._init();
  }

  updateTableState(tableState) {
    this._currentTableState.value = tableState;
    this._stateController.refresh();
  }

  _init() {
    const roomObjectsFolder = GUIHelper.getFolder('Room objects');

    const tableFolder = this._debugFolder = roomObjectsFolder.addFolder({
      title: 'Table',
    });

    this._stateController = tableFolder.addInput(this._currentTableState, 'value', {
      label: 'State',
      disabled: true,
    });

    tableFolder.addButton({
      title: 'Change state',
    }).on('click', () => {
      this.events.post('changeState');
    });

    tableFolder.addSeparator();

    tableFolder.addInput(TABLE_CONFIG, 'handleMoveOutSpeed', {
      label: 'Move in/out speed',
      min: 0.1,
      max: 10,
    });

    tableFolder.addInput(TABLE_CONFIG, 'handleRotationSpeed', {
      label: 'Rotation speed',
      min: 1,
      max: 50,
    });

    tableFolder.addInput(TABLE_CONFIG, 'handleMaxRotations', {
      label: 'Rotations',
      min: 1,
      max: 20,
      step: 1,
    });

    tableFolder.addInput(TABLE_CONFIG, 'handle360RotationDeltaY', {
      label: 'Uplift',
      min: 0.01,
      max: 1,
    });
  }
}
