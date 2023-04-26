import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Loader from '../../../../../core/loader';
import { randomBetween } from '../../../shared-objects/helpers';
import { SNOWFLAKE_PARTICLES_CONFIG, SNOWFLAKE_PARTICLES_CONFIG_BY_TYPE } from './snowflake-particles-config';
import { AIR_CONDITIONER_CONFIG } from '../data/air-conditioner-config';

export default class SnowflakeParticles extends THREE.Group {
  constructor(type) {
    super();

    this._type = type;
    this._config = SNOWFLAKE_PARTICLES_CONFIG_BY_TYPE[type];

    this._isHiding = false;
    this._particles = null;
    this._particleData = [];

    this._init();
  }

  update(dt) {
    if (!this.visible) {
      return;
    }

    this._updateParticlesPosition(dt);
  }

  show() {
    this.visible = true;
    this._isHiding = false;

    if (this._hidingTween) {
      this._hidingTween.stop();
    }

    this._resetAllParticles();
  }

  hide() {
    this._isHiding = true;

    const alphaObject = { value: 1 };
    let previousAlpha = 1;

    this._hidingTween = new TWEEN.Tween(alphaObject)
      .to({ value: 0 }, 500)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        this._decreaseParticlesAlpha(previousAlpha - alphaObject.value);
        previousAlpha = alphaObject.value;
      })
      .onComplete(() => {
        this.visible = false;
      });
  }

  _updateParticlesPosition(dt) {
    const delta = dt / 60;

    const positions = this._particles.geometry.attributes.position;
    const colors = this._particles.geometry.attributes.color;

    for (let i = 0; i < this._config.count; i++) {
      const particleConfig = this._particleData[i];

      const x = positions.getX(i);
      const y = positions.getY(i);

      const deltaX = -y * particleConfig.yCoeff * particleConfig.speed * delta;
      const deltaY = particleConfig.yDelta * particleConfig.speed * delta;

      const newX = x + deltaX;
      const newY = y - deltaY;

      positions.setX(i, newX);
      positions.setY(i, newY);

      this._checkToFadeOutParticlePosition(i);
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;
  }

  _checkToFadeOutParticlePosition(index) {
    if (this._isHiding) {
      return;
    }

    const colors = this._particles.geometry.attributes.color;
    const positions = this._particles.geometry.attributes.position;
    const particleConfig = this._particleData[index];
    const alphaEdge = SNOWFLAKE_PARTICLES_CONFIG.alphaEdge;

    if (positions.getY(index) < -alphaEdge.y || positions.getX(index) > alphaEdge.x) {
      let alpha = colors.getW(index);
      alpha -= particleConfig.alphaDecrement;

      if (alpha > 0) {
        colors.setW(index, alpha);
      } else {
        this._resetParticle(index);
      }
    }
  }

  _resetParticle(index) {
    this._setParticleNewData(index);
    this._setParticleStartPosition(index);
    this._setParticleStartAlpha(index);
  }

  _resetAllParticles() {
    for (let i = 0; i < this._config.count; i++) {
      this._resetParticle(i);
    }

    this._particles.geometry.attributes.position.needsUpdate = true;
    this._particles.geometry.attributes.color.needsUpdate = true;
  }

  _setParticleStartPosition(index) {
    const positions = this._particles.geometry.attributes.position;

    positions.setX(index, SNOWFLAKE_PARTICLES_CONFIG.startOffset.x);
    positions.setY(index, SNOWFLAKE_PARTICLES_CONFIG.startOffset.y);
  }

  _setParticleStartAlpha(index) {
    const particleConfig = this._particleData[index];
    const colors = this._particles.geometry.attributes.color;

    colors.setW(index, particleConfig.alpha);
  }

  _setParticleNewData(index) {
    this._particleData[index] = this._createParticleData();
  }

  _decreaseParticlesAlpha(delta) {
    const colors = this._particles.geometry.attributes.color;

    for (let i = 0; i < this._config.count; i++) {
      let alpha = colors.getW(i);

      if (alpha > 0) {
        alpha -= delta;
        colors.setW(i, Math.max(0, alpha));
      }
    }

    colors.needsUpdate = true;
  }

  _init() {
    this._initParticlesData();
    this._initParticles();

    this.visible = false;
  }

  _initParticles() {
    const geometry = new THREE.BufferGeometry();
    const positionArray = this._getPositionArray();
    const colorArray = this._getColorArray();

    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 4));

    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    geometry.attributes.color.setUsage(THREE.DynamicDrawUsage);

    const sprite = Loader.assets[this._config.texture];

    const material = new THREE.PointsMaterial({
      size: this._config.size,
      map: sprite,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });

    const particles = this._particles = new THREE.Points(geometry, material);
    this.add(particles);
  }

  _getPositionArray() {
    const positionArray = new Float32Array(this._config.count * 3);
    const halfDoorWidth = AIR_CONDITIONER_CONFIG.doorWidth * 0.5;

    for (let i = 0; i < this._config.count; i += 1) {
      const randomZ = randomBetween(-halfDoorWidth, halfDoorWidth)

      positionArray[(i * 3 + 0)] = SNOWFLAKE_PARTICLES_CONFIG.startOffset.x;
      positionArray[(i * 3 + 1)] = SNOWFLAKE_PARTICLES_CONFIG.startOffset.y;
      positionArray[(i * 3 + 2)] = randomZ;
    }

    return positionArray;
  }

  _getColorArray() {
    const colorsArray = new Float32Array(this._config.count * 4);
    const color = new THREE.Color(this._config.color);

    for (let i = 0; i < this._config.count; i += 1) {
      colorsArray[(i * 4 + 0)] = color.r;
      colorsArray[(i * 4 + 1)] = color.g;
      colorsArray[(i * 4 + 2)] = color.b;
      colorsArray[(i * 4 + 3)] = this._particleData[i].alpha;
    }

    return colorsArray;
  }

  _initParticlesData() {
    for (let i = 0; i < this._config.count; i++) {
      const particleData = this._createParticleData();
      this._particleData.push(particleData);
    }
  }

  _createParticleData() {
    const speed = randomBetween(3, 4) * this._config.speed;
    const yCoeff = randomBetween(10, 16);
    const yDelta = randomBetween(28, 32);
    const alpha = randomBetween(0.4, 0.6);
    const alphaDecrement = randomBetween(0.01, 0.02);

    return { speed, yCoeff, yDelta, alpha, alphaDecrement };
  }
}
