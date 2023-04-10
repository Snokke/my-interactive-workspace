import * as THREE from 'three';
import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { WINDOW_OPEN_TYPE, WINDOW_OPEN_TYPE_BOTH } from './walls-data';
import { WINDOW_CONFIG } from "./window-config";

export default class WindowDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._windowState = { value: '' };
    this._windowOpenType = { value: '' };

    this._stateController = null;
    this._openTypeController = null;
    this._activeOpenType = null;

    this._init();
    this._checkToDisableFolder();
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

  initDebugRotateAxis(window) {
    if (!WINDOW_CONFIG.rotateAxisDebug) {
      return;
    }

    const horizontalOpenPivot = window.position.clone()
      .add(WINDOW_CONFIG.openTypes[WINDOW_OPEN_TYPE.Horizontally].pivotOffset);

    const verticalOpenPivot = window.position.clone()
      .add(WINDOW_CONFIG.openTypes[WINDOW_OPEN_TYPE.Vertically].pivotOffset);

    const geometry = new THREE.CylinderGeometry(0.05, 0.05, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
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

  _init() {
    this._openTypeController = this._debugFolder.addInput(this._windowOpenType, 'value', {
      label: 'Open type',
      disabled: true,
    });
    this._openTypeController.customDisabled = true;

    this._activeOpenType = this._debugFolder.addBlade({
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

    this._debugFolder.addSeparator();

    this._stateController = this._debugFolder.addInput(this._windowState, 'value', {
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

    this._debugFolder.addInput(WINDOW_CONFIG, 'handleRotationSpeed', {
      label: 'Handle speed',
      min: 1,
      max: 15,
    });

    this._debugFolder.addInput(WINDOW_CONFIG, 'windowRotationSpeed', {
      label: 'Window speed',
      min: 5,
      max: 100,
    });

    this._debugFolder.addInput(WINDOW_CONFIG.openTypes[WINDOW_OPEN_TYPE.Horizontally], 'openAngle', {
      label: 'Horizontal open angle',
      min: 1,
      max: 90,
    });

    this._debugFolder.addInput(WINDOW_CONFIG.openTypes[WINDOW_OPEN_TYPE.Vertically], 'openAngle', {
      label: 'Vertical open angle',
      min: 1,
      max: 90,
    });
  }
}
