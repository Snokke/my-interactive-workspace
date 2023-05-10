import * as THREE from 'three';
import HeightMeter from '../../helpers/height-meter';

export default class RaycasterController {
  constructor(wallHeight) {

    this._wallHeight = wallHeight;
    this._ghost = null;
    this._collideObjects = null;

    this._raycasterEnabled = false;
    this._raycasterDelayTime = 0;
    this._raycasterDelay = 0.1;
    this._direction = new THREE.Vector3(0, -1, 0);

    this._init(wallHeight);
  }

  update(currentFurniture, dt) {
    if (!this._raycasterEnabled) {
      return;
    }

    this._raycasterDelayTime += dt;

    if (this._raycasterDelayTime < this._raycasterDelay) {
      return;
    }

    this._raycasterDelayTime = 0;

    const furnitureX = currentFurniture.position.x;
    const furnitureZ = currentFurniture.position.z;
    const widthX = currentFurniture.size.x;
    const widthZ = currentFurniture.size.z;

    const originPositions = [
      { x: furnitureX, z: furnitureZ },
      { x: furnitureX + widthX / 2, z: furnitureZ + widthZ / 2 },
      { x: furnitureX + widthX / 2, z: furnitureZ - widthZ / 2 },
      { x: furnitureX - widthX / 2, z: furnitureZ - widthZ / 2 },
      { x: furnitureX - widthX / 2, z: furnitureZ + widthZ / 2 },
      { x: furnitureX, z: furnitureZ + widthZ / 2 },
      { x: furnitureX, z: furnitureZ - widthZ / 2 },
      { x: furnitureX - widthX / 2, z: furnitureZ },
      { x: furnitureX + widthX / 2, z: furnitureZ },
    ];

    let height = 0;

    for (let i = 0; i < originPositions.length; i += 1) {
      const originPosition = originPositions[i];

      const collideObjects = this._collideObjects.map((object) => object.box);
      height = this._heightMeter.getHeight(originPosition.x, originPosition.z, collideObjects);

      if (height) {
        break;
      }
    }

    this._ghost.position.y = this._ghost.size.y / 2 + height;
  }

  enable() {
    this._raycasterEnabled = true;
  }

  disable() {
    this._raycasterEnabled = false;
  }

  setCollideObjects(collideObjects) {
    this._collideObjects = collideObjects;
  }

  setGhost(ghost) {
    this._ghost = ghost;
  }

  _init(wallHeight) {
    this._heightMeter = new HeightMeter(wallHeight);
  }
}
