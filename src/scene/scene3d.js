import * as THREE from 'three';
import RaycasterController from './raycaster-controller';
import Room from './room/room';
import { MessageDispatcher } from 'black-engine';

export default class Scene3D extends THREE.Group {
  constructor(data) {
    super();

    this.events = new MessageDispatcher();

    this._data = data,
    this._scene = data.scene,
    this._camera = data.camera,

    this._raycasterController = null;
    this._room = null;

    this._init();
  }

  update(dt) {
    this._room.update(dt);
  }

  onPointerMove(x, y) {
    this._room.onPointerMove(x, y);
  }

  onPointerDown(x, y) {
    this._room.onPointerDown(x, y);
  }

  onPointerUp(x, y) {
    this._room.onPointerUp(x, y);
  }

  onPointerLeave() {
    this._room.onPointerLeave();
  }

  onWheelScroll(delta) {
    this._room.onWheelScroll(delta);
  }

  _init() {
    this._initRaycaster();
    this._initRoom();
    this._initSignals();
  }

  _initRaycaster() {
    this._raycasterController = new RaycasterController(this._camera);
  }

  _initRoom() {
    const room = this._room = new Room(this._data, this._raycasterController);
    this.add(room);
  }

  _initSignals() {
    this._room.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
  }
}
