import * as THREE from 'three';
import RaycasterController from './raycaster-controller';
import Room from './room/room';

export default class Scene3D extends THREE.Group {
  constructor(data) {
    super();

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

  onPointerUp() {
    this._room.onPointerUp();
  }

  onPointerLeave() {
    this._room.onPointerLeave();
  }

  _init() {
    this._initRaycaster();
    this._initRoom();
  }

  _initRaycaster() {
    this._raycasterController = new RaycasterController(this._camera);
  }

  _initRoom() {
    const room = this._room = new Room(this._data, this._raycasterController);
    this.add(room);
  }
}
