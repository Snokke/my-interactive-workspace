import * as THREE from 'three';
import { TARGET_TYPE, TARGET_TEXTURE } from './target-config';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import TransferItLoader from '../../loader/transfer-it-loader';

export default class Target extends THREE.Group {
  constructor(cellSize) {
    super();

    this._cellSize = cellSize;

    this._targets = {};
    this.visible = false;

    this._init();
  }

  show(targetType, rotation) {
    this.visible = true;

    switch (targetType) {
      case TARGET_TYPE.standard:
        this._showTarget(this._targets[TARGET_TYPE.standard]);
        break;

      case TARGET_TYPE.big:
        this._showBigTarget(this._targets[TARGET_TYPE.big], rotation);
        break;

      case TARGET_TYPE.small:
        this._showTargetWithBlink(this._targets[TARGET_TYPE.small]);
        break;

      default:
        break;
    }
  }

  hide() {
    const targetsTypes = Object.keys(this._targets);

    targetsTypes.forEach((type) => {
      new TWEEN.Tween(this._targets[type].material)
        .to({ opacity: 0 }, 150)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start()
        .onComplete(() => {
          this._targets[type].visible = false;
        });
    });
  }

  _showTarget(object) {
    object.visible = true;
    object.material.opacity = 0;

    new TWEEN.Tween(object.material)
      .to({ opacity: 1 }, 150)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();
  }

  _showBigTarget(object, rotation) {
    object.visible = true;
    object.material.opacity = 0;
    object.rotation.z = rotation + Math.PI / 2;

    new TWEEN.Tween(object.material)
      .to({ opacity: 1 }, 150)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();
  }

  _showTargetWithBlink(object) {
    object.visible = true;
    object.material.opacity = 0.3;

    new TWEEN.Tween(object.material)
      .to({ opacity: 1 }, 300)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .yoyo(true)
      .repeat(Infinity)
      .start();
  }

  _init() {
    const allTargetsTypes = Object.keys(TARGET_TYPE);

    allTargetsTypes.forEach((typeKey) => {
      const type = TARGET_TYPE[typeKey];

      const texture = TARGET_TEXTURE[type];
      const target = this._createTarget(type, texture);
      this.add(target);

      this._targets[type] = target;
    });
  }

  _createTarget(type, textureFileName) {
    const bigTargetCoeff = type === TARGET_TYPE.big ? 2 : 1;

    const texture = TransferItLoader.assets[textureFileName];
    const geometry = new THREE.PlaneGeometry(this._cellSize.width * bigTargetCoeff, this._cellSize.depth);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const target = new THREE.Mesh(geometry, material);

    target.rotation.x = -Math.PI / 2;
    target.visible = false;

    return target;
  }
}
