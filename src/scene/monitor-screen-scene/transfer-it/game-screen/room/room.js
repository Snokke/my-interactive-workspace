import * as THREE from 'three';
import Walls from './walls/walls';
import Floor from './floor';
import { MessageDispatcher } from "black-engine";
import { ROOM_TYPE } from './room-config';
import Decorations from './decorations/decorations';

export default class Room extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._walls = null;
    this._floor = null;
    this._decorations = null;
    this._type = ROOM_TYPE.SMALL;

    this._init();
  }

  reset() {
    this._walls.reset();
    this._floor.reset();
    // this._decorations.reset();
  }

  setType(type) {
    this._type = type;
  }

  getCellSize() {
    return this._floor.getCellSize();
  }

  getFloorSize() {
    return this._floor.size;
  }

  getWallHeight() {
    return this._walls.getHeight() - this._floor.size.y;
  }

  show() {
    this._floor.show();
  }

  showDecorations() {
    this._decorations.show();
  }

  hide() {
    this._floor.hide();
    this._walls.hide();
    this._decorations.hide();
  }

  resetDecorations() {
    this._decorations.reset();
  }

  getPositionByGrid(gridX, gridZ) {
    return this._floor.getPositionByGrid(gridX, gridZ);
  }

  bouncePictures() {
    this._decorations.bouncePictures();
  }

  _init() {
    const floor = this._floor = new Floor();
    const walls = this._walls = new Walls(this._floor.size);
    const decorations = this._decorations = new Decorations(this._floor.size);

    this.add(floor, walls, decorations);

    this._initSignals();
  }

  _initSignals() {
    this._floor.events.on('shown', () => this._walls.show());
    this._walls.events.on('shown', () => this._onWallsShown());
    this._decorations.events.on('shown', () => this.events.post('decorationsShown'));
  }

  _onWallsShown() {
    this._decorations.show();
    this.events.post('roomShown');
  }
}
