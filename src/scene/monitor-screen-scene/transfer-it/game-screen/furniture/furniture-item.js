import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import Utils from '../../helpers/utils';
import { MessageDispatcher } from "black-engine";
import SimplePhysics from '../../helpers/simple-physics';
import { FURNITURE_SIZE, MIN_VECTOR } from './furniture-config';
import TWEEN from 'three/addons/libs/tween.module.js';

export default class FurnitureItem extends THREE.Group {
  constructor(modelConfig, cellSize, material) {
    super();

    this.events = new MessageDispatcher();

    this.visible = false;
    this.modelConfig = modelConfig;
    this.size = null;
    this.isFirstCollision = false;

    this._material = material;
    this._cellSize = cellSize;
    this._view = null;
    this._canFall = false;
    this._isFly = true;
    this._isSleep = false;
    this._isActive = false;
    this._isSleepAfterFall = false;
    this._sleepFrames = 0;

    this._init();
  }

  kill() {
    SimplePhysics.removeBody(this.body);
  }

  show(isAnimated = false) {
    this.visible = true;

    if (isAnimated) {
      this._view.scale.set(0.01, 0.01, 0.00001);

      new TWEEN.Tween(this._view.scale)
        .to({ z: 0.01 }, 300)
        .easing(TWEEN.Easing.Back.Out)
        .start();
    }
  }

  wakeUp() {
    this.body.wakeUp();
    this._isFly = false;
  }

  kill() {
    SimplePhysics.removeBody(this.body);
    this.visible = false;
  }

  update() {
    const minVector = MIN_VECTOR[this.modelConfig.size];
    const framesForSleep = 4;

    if (this._isSleep && (this.body.velocity.length() > minVector)) {
      this._isSleep = false;
      this._sleepFrames = 0;
    }

    if (!this._isFly && !this._isSleep && (this.body.velocity.length() < minVector)) {
      this._sleepFrames += 1;
    } else {
      this._sleepFrames = 0;
    }

    if (this._sleepFrames >= framesForSleep) {
      this._sleepFrames = 0;
      this._isSleep = true;
      this.body.sleep();

      if (!this._isSleepAfterFall) {
        this._isSleepAfterFall = true;
        this.events.post('sleep', this);
      }
    }
  }

  squeezeEffect() {
    new TWEEN.Tween(this._view.scale)
      .to({ z: 0.0085, x: 0.0115, y: 0.0115 }, 180)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .repeat(1)
      .start();
  }

  scaleEffect() {
    new TWEEN.Tween(this._view.scale)
      .to({ z: 0.016, x: 0.016, y: 0.016 }, 180)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .repeat(1)
      .start();
  }

  _init() {
    this._createView();
    this._createBody();
    this._createBoundingBox();
  }

  _createView() {
    const view = this._view = Utils.createObject(this.modelConfig.modelName, this._material);
    const mesh = view.getObjectByProperty('isMesh', true);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.add(view);

    this.size = Utils.getBoundingBox(this);
    view.position.y = -(this.size.y / 2);
  }

  _createBody() {
    const sizeScale = 0.5;
    const bigSizeCoeff = this.modelConfig.size === FURNITURE_SIZE.big ? 2 : 1;

    const x = this.size.x >= this._cellSize.depth ? this._cellSize.depth - 0.08 : this.size.x;
    const z = this.size.z >= this._cellSize.width * bigSizeCoeff ? this._cellSize.width * bigSizeCoeff - 0.08 : this.size.z;
    const { y } = this.size;

    const body = this.body = new CANNON.Body({ mass: 1});

    if (this.modelConfig.modelName === 'transfer-it/chair') {
      const baseShape = new CANNON.Box(new CANNON.Vec3(x * sizeScale, y * sizeScale * 0.55, z * sizeScale));
      const backShape = new CANNON.Box(new CANNON.Vec3(x * sizeScale * 0.3, y * sizeScale * 0.45, z * sizeScale));
      body.addShape(baseShape, new CANNON.Vec3(0, -y * sizeScale * 0.45, 0));
      body.addShape(backShape, new CANNON.Vec3(-x * sizeScale * 0.7, y * sizeScale * 0.55, 0));
    } else {
      const shape = new CANNON.Box(new CANNON.Vec3(x * sizeScale, y * sizeScale, z * sizeScale));
      body.addShape(shape);
    }

    body.addEventListener('collide', (event) => {
      this.events.post('collide', event);
    });

    SimplePhysics.addBody(body, this, 'furniture');

    body.sleep();
  }

  _createBoundingBox() {
    const boxGeometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
    const boxMaterial = new THREE.MeshBasicMaterial();
    const box = this.box = new THREE.Mesh(boxGeometry, boxMaterial);
    this.add(box);

    box.visible = false;
  }

  get canFall() {
    return this._canFall;
  }

  set canFall(value) {
    this._canFall = value;
  }

  get isActive() {
    return this._isActive;
  }

  set isActive(value) {
    this._isActive = value;
  }

  get isFly() {
    return this._isFly;
  }
}
