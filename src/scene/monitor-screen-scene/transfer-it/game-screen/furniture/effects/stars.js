import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import Loader from '../../../../../../core/loader';

export default class Stars extends THREE.Group {
  constructor() {
    super();

    this.visible = false;

    this._particles = [];
    this._particleCount = 8;
    this._scale = 0.45;

    this._init();
  }

  show() {
    this.visible = true;

    let angle = 0;

    for (let i = 0; i < this._particles.length; i += 1) {
      const particle = this._particles[i];
      particle.visible = true;
      this._resetParticle(particle);

      const distanceX = 0.5 + 0.7 * Math.random();
      const distanceY = 0.8 + 1.4 * Math.random();
      const showTime = 300 + 0.5 * Math.random() * 1000;

      new TWEEN.Tween(particle.position)
        .to({
          x: Math.cos((Math.PI / 180) * angle) * distanceX,
          z: Math.sin((Math.PI / 180) * angle) * distanceX,
          y: distanceY,
        }, showTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start();

      new TWEEN.Tween(particle.scale)
        .to({ x: this._scale, z: this._scale, y: this._scale }, showTime * 0.1)
        .easing(TWEEN.Easing.Sinusoidal.In)
        .start()
        .onComplete(() => {
          new TWEEN.Tween(particle.scale)
          .to({ x: 0.001, z: 0.001, y: 0.001 }, showTime * 0.4)
          .easing(TWEEN.Easing.Sinusoidal.In)
          .delay(showTime * 0.5)
          .start()
          .onComplete(() => {
            particle.visible = false;
          });
        });

      angle += 360 / this._particles.length;
    }
  }

  _resetParticle(particle) {
    particle.scale.set(0.001, 0.001, 0.001);
    particle.position.set(0, 0, 0);
    particle.material.rotation = Math.random() * (Math.PI * 2);
  }

  _init() {
    const texture = Loader.assets['transfer-it/star'];
    const particleMaterial = new THREE.SpriteMaterial({
      map: texture,
    });

    for (let i = 0; i < this._particleCount; i += 1) {
      const particle = this._createParticle(particleMaterial);
      this.add(particle);

      this._particles.push(particle);
    }
  }

  _createParticle(particleMaterial) {
    const particle = new THREE.Sprite(particleMaterial);

    return particle;
  }
}
