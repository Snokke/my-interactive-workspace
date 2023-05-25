import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';

export default class ClickCircle extends THREE.Group {
  constructor() {
    super();

    this._view = null;
    this._animationTween = null;

    this._init();
  }

  show() {
    this.visible = true;

    if (this._animationTween) {
      this._animationTween.stop();
    }

    this.scale.set(0, 0, 0);

    this._animationTween = new TWEEN.Tween(this.scale)
      .to({ x: 1, y: 1, z: 1 }, 170)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        this.visible = false;
      });
  }

  _init() {
    const segmentsCount = 16;
    const radius = 0.1;

    const points = [];

    for (var i = 0; i <= segmentsCount; i++) {
      const angle = (i / segmentsCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      points.push(new THREE.Vector3(x, y, 0));
    }

    const material = new THREE.LineBasicMaterial();
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const view = this._view = new THREE.Line(geometry, material);
    this.add(view);

    this.visible = false;
  }
}
