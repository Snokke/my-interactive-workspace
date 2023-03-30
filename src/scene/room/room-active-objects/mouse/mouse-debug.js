import * as THREE from 'three';
import { DEBUG_MENU_START_STATE } from "../../../../core/configs/debug-menu-start-state";
import GUIHelper from "../../../../core/helpers/gui-helper/gui-helper";
import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import MOUSE_CONFIG from "./mouse-config";

export default class MouseDebug extends RoomObjectDebugAbstract {
  constructor(body) {
    super();

    this._body = body;

    this._areaPlane = null;
    this._positionController = null;

    this._init();
  }

  updatePosition() {
    this._positionController.refresh();
  }

  _init() {
    this._initMenu();
    this._initMovingAreaDebugPlane();
  }

  _initMenu() {
    const roomObjectsFolder = GUIHelper.getFolder('Active room objects');

    const mouseFolder = this._debugFolder = roomObjectsFolder.addFolder({
      title: 'Mouse',
      expanded: DEBUG_MENU_START_STATE.Mouse,
    });

    mouseFolder.addInput(MOUSE_CONFIG.movingArea, 'showDebugPlane', {
      label: 'Show area',
    }).on('change', (showDebugPlane) => {
      this._areaPlane.visible = showDebugPlane.value;
    });

    mouseFolder.addInput(MOUSE_CONFIG.movingArea, 'width', {
      label: 'Area width',
      min: 0.1,
      max: 5,
    }).on('change', () => {
      this._onAreaChanged();
    });

    mouseFolder.addInput(MOUSE_CONFIG.movingArea, 'height', {
      label: 'Area height',
      min: 0.1,
      max: 5,
    }).on('change', () => {
      this._onAreaChanged();
    });

    this._positionController = mouseFolder.addInput(MOUSE_CONFIG, 'position', {
      label: 'Current position',
      picker: 'inline',
      expanded: true,
      x: { min: -1, max: 1 },
      y: { min: -1, max: 1 },
    }).on('change', (position) => {
      this.events.post('onPositionChanged', position.value);
    });
  }

  _initMovingAreaDebugPlane() {
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      opacity: 0.5,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(1, 1);
    const areaPlane = this._areaPlane = new THREE.Mesh(geometry, material);
    this.add(areaPlane);

    areaPlane.rotateX(-Math.PI * 0.5);
    areaPlane.position.copy(this._body.position.clone());

    areaPlane.scale.set(MOUSE_CONFIG.movingArea.width, MOUSE_CONFIG.movingArea.height, 1);

    areaPlane.visible = false;

    if (MOUSE_CONFIG.movingArea.showDebugPlane) {
      areaPlane.visible = true;
    }
  }

  _onAreaChanged() {
    this._areaPlane.scale.set(MOUSE_CONFIG.movingArea.width, MOUSE_CONFIG.movingArea.height, 1);
    this.events.post('onAreaChanged');
  }
}
