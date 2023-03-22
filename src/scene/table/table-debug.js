import { MessageDispatcher } from "black-engine";
import GUIHelper from "../../core/helpers/gui-helper/gui-helper";
import TABLE_CONFIG from "./table-config";

export default class TableDebug {
  constructor(currentTableState) {
    this.events = new MessageDispatcher();

    this._currentTableState = currentTableState;
    this._tableFolder = null;

    this._init();
  }

  updateTableState(tableState) {
    this._currentTableState.value = tableState;
    GUIHelper.getControllerFromFolder('Table', 'State').refresh();
  }

  enable() {
    this._tableFolder.children.forEach((child) => {
      child.disabled = false;
    });
  }

  disable() {
    this._tableFolder.children.forEach((child) => {
      child.disabled = true;
    });
  }

  _init() {
    const tableFolder = this._tableFolder = GUIHelper.getGui().addFolder({
      title: 'Table',
    });

    tableFolder.addInput(this._currentTableState, 'value', {
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
