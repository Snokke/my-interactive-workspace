import * as THREE from 'three';
import { MessageDispatcher } from 'black-engine';

export default class RoomObjectDebugAbstract extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._debugFolder = null;
  }

  enable() {
    this._debugFolder.children.forEach((child) => {
      child.disabled = false;
    });
  }

  disable() {
    this._debugFolder.children.forEach((child) => {
      child.disabled = true;
    });
  }
}
