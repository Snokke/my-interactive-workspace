import * as THREE from 'three';
import GUIHelper from "../../../../core/helpers/gui-helper/gui-helper";
import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { WINDOW_OPEN_TYPE } from './walls-data';
import { WINDOW_CONFIG } from "./window-config";

export default class WindowDebug extends RoomObjectDebugAbstract {
  constructor(window) {
    super();

    this._window = window;

    this._init();
  }

  _init() {
    this._initDebugMenu();
    this._initDebugRotateAxis();
  }

  _initDebugMenu() {
    const roomObjectsFolder = GUIHelper.getFolder('Active room objects');

    const tableFolder = this._debugFolder = roomObjectsFolder.addFolder({
      title: 'Window',
      expanded: true,
    });

    // this._stateController = tableFolder.addInput(this._currentTableState, 'value', {
    //   label: 'State',
    //   disabled: true,
    // });

    tableFolder.addButton({
      title: 'Change state',
    }).on('click', () => {
      this.events.post('changeState');
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
