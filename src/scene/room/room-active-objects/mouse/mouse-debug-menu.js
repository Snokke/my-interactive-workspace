import * as THREE from 'three';
import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { MOUSE_AREA_BORDER_CONFIG, MOUSE_CONFIG } from "./mouse-config";
import { CURSOR_CONFIG } from './cursor/cursor-config';

export default class MouseDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._areaPlane = null;
    this._positionController = null;

    this._init();
    this._checkToDisableFolder();
  }

  updatePosition() {
    this._positionController.refresh();
  }

  initMovingAreaDebugPlane(startPosition) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      opacity: 0.5,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(1, 1);
    const areaPlane = this._areaPlane = new THREE.Mesh(geometry, material);
    this.add(areaPlane);

    areaPlane.rotateX(-Math.PI * 0.5);
    areaPlane.position.copy(startPosition);

    areaPlane.scale.set(MOUSE_CONFIG.movingArea.width + MOUSE_CONFIG.size.x, MOUSE_CONFIG.movingArea.height + MOUSE_CONFIG.size.z, 1);

    areaPlane.visible = false;

    if (MOUSE_CONFIG.movingArea.showDebugPlane) {
      areaPlane.visible = true;
    }
  }

  _init() {
    this._debugFolder.addButton({
      title: 'Left key click',
    }).on('click', () => this.events.post('onLeftKeyClick'));

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(MOUSE_CONFIG.movingArea, 'showDebugPlane', {
      label: 'Show area',
    }).on('change', (showDebugPlane) => {
      this._areaPlane.visible = showDebugPlane.value;
    });

    this._debugFolder.addInput(MOUSE_CONFIG.movingArea, 'width', {
      label: 'Area width',
      min: 0.1,
      max: 5,
    }).on('change', () => {
      this._onAreaChanged();
    });

    this._debugFolder.addInput(MOUSE_CONFIG.movingArea, 'height', {
      label: 'Area height',
      min: 0.1,
      max: 5,
    }).on('change', () => {
      this._onAreaChanged();
    });

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(MOUSE_AREA_BORDER_CONFIG, 'distanceToShow', {
      label: 'Distance to border',
      min: 0.01,
      max: 1,
    }).on('change', () => {
      this.events.post('onDistanceToShowBorderChanged');
    });

    this._debugFolder.addInput(MOUSE_AREA_BORDER_CONFIG, 'color', {
      label: 'Border color',
      view: 'color',
    }).on('change', () => {
      this.events.post('onBorderColorUpdated');
    });

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(CURSOR_CONFIG, 'sensitivity', {
      label: 'Cursor sensitivity',
      min: 0.1,
      max: 10,
    });

    this._debugFolder.addInput(CURSOR_CONFIG.view, 'scale', {
      label: 'Cursor scale',
      min: 0.5,
      max: 5,
    }).on('change', () => {
      this.events.post('onCursorScaleChanged');
    });

    this._debugFolder.addSeparator();

    this._positionController = this._debugFolder.addInput(MOUSE_CONFIG, 'position', {
      label: 'Current position',
      picker: 'inline',
      expanded: true,
      x: { min: -1, max: 1 },
      y: { min: -1, max: 1 },
    }).on('change', (position) => {
      this.events.post('onPositionChanged', position.value);
    });
  }

  _onAreaChanged() {
    this._areaPlane.scale.set(MOUSE_CONFIG.movingArea.width + MOUSE_CONFIG.size.x, MOUSE_CONFIG.movingArea.height + MOUSE_CONFIG.size.z, 1);
    this.events.post('onAreaChanged');
  }
}
