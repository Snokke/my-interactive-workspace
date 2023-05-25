import * as THREE from 'three';
import { BUTTON_CONFIG } from './button-config';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Loader from '../../../../../../core/loader';

export default class Button extends THREE.Group {
  constructor() {
    super();

    this._view = null;
    this._showTween = null;

    this._init();
  }

  show() {
    this.visible = true;

    if (this._showTween) {
      this._showTween.stop();
    }

    this._view.scale.set(0.001, 0.001, 0.001);

    this._showTween = new TWEEN.Tween(this._view.scale)
      .to({ x: 0.8, y: 0.8, z: 0.8 }, 300)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }

  hide() {
    if (this._showTween) {
      this._showTween.stop();
    }

    this._showTween = new TWEEN.Tween(this._view.scale)
      .to({ x: 0.001, y: 0.001, z: 0.001 }, 300)
      .easing(TWEEN.Easing.Back.In)
      .start()
      .onComplete(() => {
        this.visible = false;
      });
  }

  setType(type) {
    const textureFrameName = BUTTON_CONFIG[type].textureFrameName;
    const texture = Loader.assets[textureFrameName];

    this._view.material.map = texture;
  }

  _init() {
    const geometry = new THREE.PlaneGeometry(0.5, 0.2);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
    });

    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    this.visible = false;
  }
}
