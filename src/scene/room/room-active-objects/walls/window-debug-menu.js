import * as THREE from 'three';
import { DEBUG_MENU_START_STATE } from '../../../../core/configs/debug-menu-start-state';
import GUIHelper from "../../../../core/helpers/gui-helper/gui-helper";
import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { WINDOW_OPEN_TYPE, WINDOW_OPEN_TYPE_BOTH } from './walls-data';
import { WINDOW_CONFIG } from "./window-config";

export default class WindowDebugMenu extends RoomObjectDebugAbstract {
  constructor(window) {
    super();

    this._window = window;
    this._windowState = { value: '' };
    this._windowOpenType = { value: '' };

    this._stateController = null;
    this._openTypeController = null;
    this._activeOpenType = null;

    this._init();
  }

  updateWindowState(windowState) {
    this._windowState.value = windowState;
    this._stateController.refresh();
  }

  updateWindowOpenType(windowOpenType) {
    this._windowOpenType.value = windowOpenType;
    this._openTypeController.refresh();
  }

  enableActiveOpenType() {
    this._activeOpenType.disabled = false;
  }

  disableActiveOpenType() {
    this._activeOpenType.disabled = true;
  }

  openFolder() {
    this._debugFolder.expanded = true;
  }

  closeFolder() {
    this._debugFolder.expanded = false;
  }

  _init() {
    this._initDebugMenu();
    this._initDebugRotateAxis();
  }

  _initDebugMenu() {
    const roomObjectsFolder = GUIHelper.getFolder('Active room objects');

    const debugFolder = this._debugFolder = roomObjectsFolder.addFolder({
      title: 'Window',
      expanded: DEBUG_MENU_START_STATE.Window,
    });

    this._openTypeController = debugFolder.addInput(this._windowOpenType, 'value', {
      label: 'Open type',
      disabled: true,
    });

    this._activeOpenType = debugFolder.addBlade({
      view: 'list',
      label: 'Active type',
      options: [
        { text: 'Both', value: WINDOW_OPEN_TYPE_BOTH },
        { text: 'Horizontally', value: WINDOW_OPEN_TYPE.Horizontally },
        { text: 'Vertically', value: WINDOW_OPEN_TYPE.Vertically },
      ],
      value: WINDOW_OPEN_TYPE_BOTH,
    }).on('change', (openType) => {
      this.events.post('changeOpenType', openType.value);
    });

    debugFolder.addSeparator();

    this._stateController = debugFolder.addInput(this._windowState, 'value', {
      label: 'State',
      disabled: true,
    });

    debugFolder.addButton({
      title: 'Change state',
    }).on('click', () => {
      this.events.post('changeState');
    });

    debugFolder.addSeparator();

    debugFolder.addInput(WINDOW_CONFIG, 'handleRotationSpeed', {
      label: 'Handle speed',
      min: 1,
      max: 15,
    });

    debugFolder.addInput(WINDOW_CONFIG, 'windowRotationSpeed', {
      label: 'Window speed',
      min: 5,
      max: 100,
    });

    debugFolder.addInput(WINDOW_CONFIG[WINDOW_OPEN_TYPE.Horizontally], 'openAngle', {
      label: 'Horizontal open angle',
      min: 1,
      max: 90,
    });

    debugFolder.addInput(WINDOW_CONFIG[WINDOW_OPEN_TYPE.Vertically], 'openAngle', {
      label: 'Vertical open angle',
      min: 1,
      max: 90,
    });
  }

  _initDebugRotateAxis() {
    if (!WINDOW_CONFIG.rotateAxisDebug) {
      return;
    }

    const horizontalOpenPivot = this._window.position.clone()
      .add(WINDOW_CONFIG[WINDOW_OPEN_TYPE.Horizontally].pivotOffset);

    const verticalOpenPivot = this._window.position.clone()
      .add(WINDOW_CONFIG[WINDOW_OPEN_TYPE.Vertically].pivotOffset);

    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    });

    const horizontalCylinder = new THREE.Mesh(geometry, material);
    this.add(horizontalCylinder);

    horizontalCylinder.position.copy(horizontalOpenPivot);

    const verticalCylinder = new THREE.Mesh(geometry, material);
    this.add(verticalCylinder);

    verticalCylinder.position.copy(verticalOpenPivot);
    verticalCylinder.rotation.z = Math.PI * 0.5;
  }
}
