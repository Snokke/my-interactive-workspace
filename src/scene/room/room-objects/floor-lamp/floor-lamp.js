import * as THREE from 'three';
import RoomObjectAbstract from '../room-object.abstract';
import { FLOOR_LAMP_PART_CONFIG, FLOOR_LAMP_PART_TYPE } from './floor-lamp-data';
import FloorLampDebug from './floor-lamp-debug';

export default class FloorLamp extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._floorLampDebug = null;

    this._init();
  }

  show(delay) {
    super.show();

  }

  onClick(roomObject) {
    if (!this._isInputEnabled) {
      return;
    }

  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  _init() {
    this._initParts(FLOOR_LAMP_PART_TYPE, FLOOR_LAMP_PART_CONFIG);
    this._addMaterials();

    for (let key in this._parts) {
      const part = this._parts[key];

      this.add(part);
    }

    this._initDebug();
  }

  _initDebug() {
    const floorLampDebug = this._floorLampDebug = new FloorLampDebug();

    floorLampDebug.events.on('switchLight', () => {
      console.log('switchLight');
    });
  }
}
