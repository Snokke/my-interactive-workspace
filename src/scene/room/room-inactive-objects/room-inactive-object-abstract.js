import * as THREE from 'three';
import { ROOM_OBJECT_CONFIG } from '../data/room-config';

export default class RoomInactiveObjectAbstract extends THREE.Group {
  constructor(roomScene, roomObjectType) {
    super();

    this._roomScene = roomScene;
    this._roomObjectType = roomObjectType;

    this._mesh = null;

    this._initMesh();
  }

  update(dt) { } // eslint-disable-line

  getMesh() {
    return this._mesh;
  }

  _initMesh() {
    const config = ROOM_OBJECT_CONFIG[this._roomObjectType];

    const mesh = this._mesh = this._roomScene.getObjectByName(config.meshName);
    this.add(mesh);

    mesh.userData['objectType'] = this._roomObjectType;
    mesh.userData['startPosition'] = mesh.position.clone();
  }
}
