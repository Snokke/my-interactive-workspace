import * as THREE from 'three';
import { MessageDispatcher } from "black-engine";
import FurnitureItem from './furniture-item';
import { LEVELS_CONFIG, APPEAR_DIRECTION } from '../configs/levels-config';
import { FURNITURE_CONFIG, FURNITURE_SIZE } from './furniture-config';
import Stars from './effects/stars';
import { ROOM_CONFIG, ROOM_TYPE } from '../room/room-config';
import Clouds from './effects/clouds';
import Delayed from '../../../../../core/helpers/delayed-call';

export default class FurnitureController extends THREE.Group {
  constructor(room) {
    super();

    this.events = new MessageDispatcher();

    this._room = room;

    this._furniture = [];
    this._initialFurniture = [];
    this._clouds = null;
    this._stars = null;

    this._currentModelIndex = 0;
    this._straightDirection = true;
    this._furnitureFlySpeed = 2.8;

    this._currentLevel = 0;
    this._cellSize = this._room.getCellSize();
    this._gridSize = ROOM_CONFIG[ROOM_TYPE.SMALL];

    this._init();
  }

  setLevel(level) {
    this._currentLevel = level;
  }

  reset() {
    this._straightDirection = true;
    this._currentModelIndex = 0;
  }

  killFurniture() {
    this._furniture.forEach((furniture) => {
      furniture.kill();
      this.remove(furniture);
    });

    this._furniture = [];
  }

  killInitFurniture() {
    this._initialFurniture.forEach((furniture) => {
      furniture.kill();
      this.remove(furniture);
    });

    this._initialFurniture = [];
  }

  getFurniturePosition() {
    const furniture = this._furniture[this._currentModelIndex];

    return furniture.position;
  }

  showFurniture() {
    const furniture = this._furniture[this._currentModelIndex];
    furniture.isActive = true;
    furniture.show();
  }

  showStars(furniture) {
    this._stars.position.x = furniture.position.x;
    this._stars.position.z = furniture.position.z;
    this._stars.position.y = furniture.position.y - furniture.size.y / 2;
    this._stars.show();
  }

  isStandVertically(furniture) {
    const { quaternion } = furniture;

    return Math.abs(quaternion.x) < 0.05 && Math.abs(quaternion.z) < 0.05;
  }

  createFurniture() {
    const levelConfig = LEVELS_CONFIG[this._currentLevel];

    for (let i = 0; i < levelConfig.furniture.length; i += 1) {
      const config = levelConfig.furniture[i];
      const modelConfig = FURNITURE_CONFIG[config.type];

      const furnitureItem = new FurnitureItem(modelConfig, this._cellSize, this._material);
      this.add(furnitureItem);

      this._initFurnitureSignals(furnitureItem);
      this._furniture.push(furnitureItem);
    }

    this._setFurnitureStartPositions();
  }

  createInitFurniture() {
    const levelConfig = LEVELS_CONFIG[this._currentLevel];

    for (let i = 0; i < levelConfig.initialFurniture.length; i += 1) {
      const config = levelConfig.initialFurniture[i];
      const modelConfig = FURNITURE_CONFIG[config.type];

      const furnitureItem = new FurnitureItem(modelConfig, this._cellSize, this._material);
      this.add(furnitureItem);

      this._initialFurniture.push(furnitureItem);
    }

    this._setInitFurnitureStartPositions();
  }

  getAllFurniture() {
    return this._furniture.concat(this._initialFurniture);
  }

  getFurniture() {
    return this._furniture;
  }

  getCurrentFurniture() {
    return this._furniture[this._currentModelIndex];
  }

  showInitFurniture() {
    const isAnimated = true;
    const delayDelta = 150;
    let delay = 0;

    this._initialFurniture.forEach((furniture) => {
      Delayed.call(delay, () => {
        furniture.show(isAnimated);
        furniture.wakeUp();
      });

      delay += delayDelta;
    });
  }

  update(dt) {
    const furniture = this._furniture[this._currentModelIndex];

    if (furniture.isActive && furniture.isFly) {
      const { appearDirection } = LEVELS_CONFIG[this._currentLevel].furniture[this._currentModelIndex];
      if (appearDirection === APPEAR_DIRECTION.right) {
        this._moveX(dt, furniture);
      } else {
        this._moveZ(dt, furniture);
      }
    }

    this._checkFall(furniture);

    this._updateFurniture();
    this._updateInitFurniture();
    this._clouds.update(dt);
  }

  _checkFall(furniture) {
    if (furniture.position.y < -0.1) {
      this.events.post('fall');

      if (furniture.position.y < -25 && furniture.visible) {
        furniture.kill();
      }
    }
  }

  _updateFurniture() {
    this._furniture.forEach((object) => {
      if (object.isActive && !object.isFly) {
        object.update();
      }
    });
  }

  _updateInitFurniture() {
    this._initialFurniture.forEach((object) => {
      object.update();
    });
  }

  _moveX(dt, furniture) {
    if (this._straightDirection) {
      furniture.body.position.x -= this._furnitureFlySpeed * dt;
    } else {
      furniture.body.position.x += this._furnitureFlySpeed * dt;
    }

    let minX = this._room.getPositionByGrid(0, 0).x;
    let maxX = this._room.getPositionByGrid(this._gridSize.depth - 1, 0).x;

    if (!furniture.modelConfig.isOneTile) {
      const config = LEVELS_CONFIG[this._currentLevel].furniture[this._currentModelIndex];
      const isRotated = (config.angle / 90) % 2 !== 0;

      if (isRotated) {
        minX += this._cellSize.depth / 2;
        maxX -= this._cellSize.depth / 2;
      }
    }

    if (furniture.body.position.x <= maxX) {
      furniture.canFall = true;

      this.events.post('canFall', this._currentModelIndex);
    }

    if (furniture.canFall) {
      if (furniture.body.position.x >= maxX) {
        furniture.body.position.x = maxX;
        this._straightDirection = !this._straightDirection;
      }

      if (furniture.body.position.x <= minX) {
        furniture.body.position.x = minX;
        this._straightDirection = !this._straightDirection;
      }
    }
  }

  _moveZ(dt, furniture) {
    if (this._straightDirection) {
      furniture.body.position.z += this._furnitureFlySpeed * dt;
    } else {
      furniture.body.position.z -= this._furnitureFlySpeed * dt;
    }

    let minZ = this._room.getPositionByGrid(0, this._gridSize.width - 1).z;
    let maxZ = this._room.getPositionByGrid(0, 0).z;

    if (!furniture.modelConfig.isOneTile) {
      const config = LEVELS_CONFIG[this._currentLevel].furniture[this._currentModelIndex];
      const isRotated = (config.angle / 90) % 2 !== 0;

      if (!isRotated) {
        minZ -= this._cellSize.width / 2;
        maxZ += this._cellSize.width / 2;
      }
    }

    if (furniture.body.position.z >= maxZ) {
      furniture.canFall = true;

      this.events.post('canFall', this._currentModelIndex);
    }

    if (furniture.canFall) {
      if (furniture.body.position.z <= maxZ) {
        furniture.body.position.z = maxZ;
        this._straightDirection = !this._straightDirection;
      }

      if (furniture.body.position.z >= minZ) {
        furniture.body.position.z = minZ;
        this._straightDirection = !this._straightDirection;
      }
    }
  }

  _setFurnitureStartPositions() {
    const levelConfig = LEVELS_CONFIG[this._currentLevel];

    this._furniture.forEach((furniture, i) => {
      const config = levelConfig.furniture[i];

      const angle = (Math.PI / 180) * config.angle;
      furniture.body.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);

      const startOffsetX = this._room.getPositionByGrid(this._gridSize.depth - 1, 0).x + 2;
      const startOffsetZ = this._room.getPositionByGrid(0, 0).z - 2;

      const { x, z } = this._room.getPositionByGrid(config.targetGridPosition.x, config.targetGridPosition.z);
      furniture.body.position.x = config.appearDirection === APPEAR_DIRECTION.right ? startOffsetX : x;
      furniture.body.position.y = furniture.size.y / 2 + this._room.getWallHeight() + 0.2;
      furniture.body.position.z = config.appearDirection === APPEAR_DIRECTION.left ? startOffsetZ : z;

      if (!furniture.modelConfig.isOneTile) {
        const isRotated = (config.angle / 90) % 2 !== 0;

        if (config.appearDirection === APPEAR_DIRECTION.right && !isRotated) {
          furniture.body.position.z += this._cellSize.width / 2;
        }

        if (config.appearDirection === APPEAR_DIRECTION.left && isRotated) {
          furniture.body.position.x += this._cellSize.depth / 2;
        }
      }
    });
  }

  _setInitFurnitureStartPositions() {
    const levelConfig = LEVELS_CONFIG[this._currentLevel];

    this._initialFurniture.forEach((furniture, i) => {
      const config = levelConfig.initialFurniture[i];

      const angle = (Math.PI / 180) * config.angle;
      furniture.body.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);

      const { x, z } = this._room.getPositionByGrid(config.gridPosition.x, config.gridPosition.z);
      furniture.body.position.x = x;
      furniture.body.position.y = furniture.size.y / 2;
      furniture.body.position.z = z;

      if (!furniture.modelConfig.isOneTile) {
        const isRotated = (config.angle / 90) % 2 !== 0;

        if (!isRotated) {
          furniture.body.position.z += this._cellSize.width / 2;
        } else {
          furniture.body.position.x += this._cellSize.depth / 2;
        }
      }
    });
  }

  _init() {
    this._material = new THREE.MeshLambertMaterial({
      vertexColors: true,
    });

    this.createInitFurniture();
    this.createFurniture();

    const clouds = this._clouds = new Clouds();
    const stars = this._stars = new Stars();

    this.add(stars, clouds);
  }

  _onFurnitureCollision(collisionEvent) {
    const furniture = this._furniture[this._currentModelIndex];

    if (!furniture.isFirstCollision) {
      furniture.isFirstCollision = true;
      this._showClouds(furniture);

      if (furniture.modelConfig.size !== FURNITURE_SIZE.small) {
        this.events.post('furnitureFall');
      }

      if (collisionEvent.body.tag === 'floor') {
        furniture.squeezeEffect();
      }

      this.events.post('furnitureCollision');
    }
  }

  _showClouds(furniture) {
    this._clouds.position.x = furniture.position.x;
    this._clouds.position.z = furniture.position.z;
    this._clouds.position.y = furniture.position.y - furniture.size.y / 2;
    this._clouds.show();
  }

  _showNextFurniture() {
    this._currentModelIndex += 1;
    this._straightDirection = true;

    if (this._currentModelIndex >= this._furniture.length) {
      this._currentModelIndex = this._furniture.length - 1;

      this._scaleFurniture();

      this.events.post('onLevelEnd');
    } else {
      this.events.post('showNextFurniture');
    }
  }

  _scaleFurniture() {
    const delayDelta = 100;
    let delay = 0;

    for (let i = 0; i < this._furniture.length; i += 1) {
      const furniture = this._furniture[i];

      Delayed.call(delay, () => {
        furniture.scaleEffect();
      });

      delay += delayDelta;
    }
  }

  _initFurnitureSignals(furnitureItem) {
    furnitureItem.events.on('sleep', (msg, furniture) => this._onSleep(furniture));
    furnitureItem.events.on('collide', (msg, event) => this._onFurnitureCollision(event));
  }

  _onSleep(furniture) {
    this.events.post('sleep', furniture);
    this._showNextFurniture();
  }
}
