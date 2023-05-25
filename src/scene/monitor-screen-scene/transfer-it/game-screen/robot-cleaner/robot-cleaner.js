import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import Utils from '../../helpers/utils';
import SimplePhysics from '../../helpers/simple-physics';
import { MathEx, MessageDispatcher } from "black-engine";
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../../core/helpers/delayed-call';

export default class RobotCleaner extends THREE.Group {
  constructor(floorSize) {
    super();

    this.events = new MessageDispatcher();

    this.visible = false;
    this.size = null;

    this._floorSize = floorSize;
    this._allFurniture = null;
    this._view = null;
    this._rotationTween = null;
    this._moveTimer = null;
    this._robotParts = [];
    this._robotPartsStartPosition = [];

    this._isMoving = false;
    this._isActive = false;
    this._angle = 0;
    this._velocity = 1.2;
    this._rotationVelocity = 7;

    this._init();
  }

  update(dt) {
    if (!this._isMoving || !this._isActive) {
      return;
    }

    const maxDt = 0.5;
    const deltaTime = dt > maxDt ? maxDt : dt;

    const x = Math.cos(MathEx.DEG2RAD * this._angle);
    const z = Math.sin(MathEx.DEG2RAD * this._angle);

    const deltaX = this._velocity * x * deltaTime;
    const deltaZ = this._velocity * z * deltaTime;

    const newPositionX = this.body.position.x + deltaX;
    const newPositionZ = this.body.position.z + deltaZ;

    const furnitureCollision = this._checkFurnitureCollision(newPositionX, newPositionZ);
    if (furnitureCollision) {
      return;
    }

    const wallsCollision = this._checkWallsCollision(newPositionX, newPositionZ);
    if (wallsCollision) {
      return;
    }

    this.body.position.x += deltaX;
    this.body.position.z += deltaZ;
  }

  reset() {
    this.visible = false;
    this._isActive = false;
    this._isMoving = false;
    this._angle = 0;
    this.body.position.y = -2;
    this.body.sleep();

    this._robotParts.forEach((part, i) => {
      const position = this._robotPartsStartPosition[i];
      part.position.x = position.x;
      part.position.y = position.y;
      part.position.z = position.z;
    });

    if (this._rotationTween) {
      this._rotationTween.stop();
    }

    this._allFurniture = [];
  }

  setFurniture(allFurniture) {
    this._allFurniture = allFurniture;
  }

  show() {
    this._isActive = true;
    this.visible = true;
    this._view.scale.set(0.02, 0.00001, 0.02);

    new TWEEN.Tween(this._view.scale)
      .to({ y: 0.02 }, 300)
      .easing(TWEEN.Easing.Back.Out)
      .start()
      .onComplete(() => {
        this.body.wakeUp();
      });
  }

  startMove() {
    this._isMoving = true;

    const moveTime = MathEx.randomBetween(100, 300) / 100 * 1000;

    this._moveTimer = Delayed.call(moveTime, () => {
      this._rotate();
    });
  }

  stopMove() {
    this._isMoving = false;
  }

  setAngle(angle) {
    this._angle = angle;
    this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -MathEx.DEG2RAD * angle);
  }

  _destroy() {
    this.body.sleep();
    this._isActive = false;

    if (this._moveTimer) {
      this._moveTimer.stop();
    }

    if (this._rotationTween) {
      this._rotationTween.stop();
    }

    this._destroyAnimation();
  }

  _destroyAnimation() {
    this._robotParts.forEach((part) => {
      const x = MathEx.randomBetween(-200, 200) / 10;
      const z = MathEx.randomBetween(-200, 200) / 10;

      new TWEEN.Tween(part.position)
        .to({ x, z, }, 250)
        .easing(TWEEN.Easing.Sinusoidal.In)
        .start();
    });
  }

  _checkFurnitureCollision(newPositionX, newPositionZ) {
    const center = new THREE.Vector3(newPositionX, this.position.y, newPositionZ);
    const sizeScale = 2.8;
    const size = this.size.clone().multiplyScalar(sizeScale);
    const viewBox = new THREE.Box3().setFromCenterAndSize(center, size);

    for (let i = 0; i < this._allFurniture.length; i += 1) {
      const furniture = this._allFurniture[i];

      const furnitureBox = new THREE.Box3().setFromObject(furniture);
      const isIntersects = viewBox.intersectsBox(furnitureBox);

      if (isIntersects) {
        this._rotate();

        return true;
      }
    }

    return false;
  }

  _checkWallsCollision(newPositionX, newPositionZ) {
    const wallOffset = 0.12;

    if ((newPositionX > this._floorSize.x / 2 - this.size.x - wallOffset)
      || (newPositionX < -this._floorSize.x / 2 + this.size.x + wallOffset)
      || (newPositionZ > this._floorSize.z / 2 - this.size.z - wallOffset)
      || (newPositionZ < -this._floorSize.z / 2 + this.size.z + wallOffset)) {
      this._rotate();

      return true;
    }

    return false;
  }

  _rotate() {
    if (!this._isMoving) {
      return;
    }

    this.stopMove();

    if (this._moveTimer) {
      this._moveTimer.stop();
    }

    const startAngle = 30;
    const randomAngle = Math.random() < 0.5
      ? MathEx.randomBetween(-startAngle, -179)
      : MathEx.randomBetween(startAngle, 180);

    const tweenObject = {
      angle: this._angle,
    };

    const rotationTween = this._rotationTween = new TWEEN.Tween(tweenObject)
      .to({ angle: this._angle + randomAngle }, Math.abs(randomAngle) * this._rotationVelocity)
      .easing(TWEEN.Easing.Linear.None)
      .start();

    rotationTween.onUpdate(() => {
      this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -MathEx.DEG2RAD * tweenObject.angle);
    });

    rotationTween.onComplete(() => {
      this._angle += randomAngle;
      this.startMove();
    });
  }

  _init() {
    this._createView();
    this._createBody();
    this._createBoundingBox();
  }

  _createView() {
    const view = this._view = Utils.createObject('transfer-it/robot-cleaner');

    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
    });

    view.traverse((child) => {
      if (child.isMesh) {
        Utils.setObjectMaterial(child, material);

        child.castShadow = true;
        // child.receiveShadow = true;

        this._robotParts.push(child);
      }
    });

    this._robotParts.forEach((part) => {
      const { x, y, z } = part.position;
      this._robotPartsStartPosition.push({ x, y, z });
    });

    this.add(view);

    this.size = Utils.getBoundingBox(this);
    view.position.y = this.size.y / 2;
  }

  _createBody() {
    const sizeScale = 0.87;

    const body = this.body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(this.size.x * sizeScale, this.size.y * sizeScale, this.size.z * sizeScale)),
    });

    SimplePhysics.addBody(body, this, 'robot-cleaner');

    body.addEventListener('collide', (event) => {
      if (event.body.tag === 'furniture' && this._isActive) {
        this._destroy();
        this.events.post('collide');
      }
    });

    this.body.position.y = -2;
    body.sleep();
  }

  _createBoundingBox() {
    const boxGeometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
    const boxMaterial = new THREE.MeshBasicMaterial();
    const box = this.box = new THREE.Mesh(boxGeometry, boxMaterial);
    this.add(box);

    box.visible = false;
  }
}
