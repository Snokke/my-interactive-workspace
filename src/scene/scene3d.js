import * as THREE from 'three';
import Raycaster from './raycaster';
import Room from './room/room';

export default class Scene3D extends THREE.Group {
  constructor(camera, outlinePass) {
    super();

    this._camera = camera;
    this._outlinePass = outlinePass;

    this._raycaster = null;
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

  _init() {
    this._initRaycaster();
    this._initRoom();
  }

  _initRaycaster() {
    this._raycaster = new Raycaster(this._camera);
  }

  _initRoom() {
    const room = this._room = new Room(this._raycaster, this._outlinePass);
    this.add(room);
  }
}
