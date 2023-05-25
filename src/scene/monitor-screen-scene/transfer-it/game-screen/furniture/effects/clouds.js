import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import Loader from '../../../../../../core/loader';

export default class Clouds extends THREE.Group {
  constructor() {
    super();

    this.visible = false;

    this._clouds = null;
    this._cloudsCount = 16;
    this._dummyPosition = [];
    this._dummyScale = [];

    this._init();
  }

  update() {
    if (this.visible) {
      for (let i = 0; i < this._cloudsCount; i += 1) {
        const dummy = new THREE.Object3D();
        dummy.position.copy(this._dummyPosition[i].position);
        dummy.scale.copy(this._dummyScale[i].scale);
        dummy.updateMatrix();

        this._clouds.setMatrixAt(i, dummy.matrix);
      }

      this._clouds.instanceMatrix.needsUpdate = true;
    }
  }

  show() {
    this.visible = true;

    const distance = 1.1;
    const showTime = 450;

    for (let i = 0; i < this._cloudsCount; i += 1) {
      new TWEEN.Tween(this._dummyPosition[i].position)
        .to({
          x: Math.cos((i / this._cloudsCount) * Math.PI * 2) * distance,
          z: Math.sin((i / this._cloudsCount)* Math.PI * 2) * distance,
          y: 0.2,
          }, showTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start()
        .onUpdate(() => {
          this._dummyPosition[i].updateMatrix();
        })
        .onComplete(() => {
          this.visible = false;
          this._resetClouds();
        });

      new TWEEN.Tween(this._dummyScale[i].scale)
        .to({ x: 0.4, z: 0.4, y: 0.4 }, showTime * 0.1)
        .easing(TWEEN.Easing.Sinusoidal.In)
        .start()
        .onUpdate(() => {
          this._dummyScale[i].updateMatrix();
        })
        .onComplete(() => {
          new TWEEN.Tween(this._dummyScale[i].scale)
            .to({ x: 0.001, z: 0.001, y: 0.001 }, showTime * 0.9)
            .easing(TWEEN.Easing.Sinusoidal.In)
            .start()
            .onUpdate(() => {
              this._dummyScale[i].updateMatrix();
            });
        });
    }
  }

  _resetClouds() {
    const dummy = new THREE.Object3D();

    for (let i = 0; i < this._cloudsCount; i += 1) {
      dummy.position.set(0, 0, 0);
      dummy.scale.set(0.001, 0.001, 0.001);

      dummy.updateMatrix();
      this._clouds.setMatrixAt(i, dummy.matrix);

      this._dummyPosition[i] = dummy.clone();
      this._dummyScale[i] = dummy.clone();
    }

    this._clouds.instanceMatrix.needsUpdate = true;
  }

  _init() {
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });

    const cloudModel = Loader.assets['transfer-it/cloud'];
    const cloudMesh = cloudModel.scene.children[0];
    const geometry = cloudMesh.geometry;

    const clouds = this._clouds = new THREE.InstancedMesh(geometry, material, this._cloudsCount);
    this.add(clouds);

    clouds.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    this._initDummy();
    this._resetClouds();
  }

  _initDummy() {
    for (let i = 0; i < this._cloudsCount; i += 1) {
      const dummy = new THREE.Object3D();
      this._dummyPosition.push(dummy.clone());
      this._dummyScale.push(dummy.clone());
    }
  }
}
