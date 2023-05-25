import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import Loader from '../../../../../core/loader';
import { randomBetween } from '../../../shared-objects/helpers';
import { SNOWFLAKE_PARTICLES_CONFIG, SNOWFLAKE_PARTICLES_CONFIG_BY_TYPE } from './data/snowflake-particles-config';
import { AIR_CONDITIONER_CONFIG } from '../data/air-conditioner-config';
import { TABLE_STATE } from '../../table/data/table-data';

export default class SnowflakeParticles extends THREE.Group {
  constructor(type) {
    super();

    this._type = type;
    this._config = SNOWFLAKE_PARTICLES_CONFIG_BY_TYPE[type];

    this._isShowActive = false;
    this._isHiding = false;
    this._particles = null;
    this._particleData = [];
    this._currentActiveCount = 0;
    this._currentVisibleParticlesCount = 0;
    this._tableState = TABLE_STATE.SittingMode;
    this._windowCoefficient = { value: 0 };
    this._defaultTemperature = AIR_CONDITIONER_CONFIG.temperature.current

    this._init();
  }

  update(dt) {
    if (!this.visible) {
      return;
    }

    this._updateParticlesPosition(dt);
    this._checkWhenHiding();
  }

  show() {
    this._isShowActive = true;

    if (this._isHiding) {
      this._hideAllParticles();

      return;
    }

    this.visible = true;
    this._isHiding = false;
    this._currentActiveCount = 0;

    this._resetAllParticles();
  }

  hide() {
    this._isHiding = true;
    this._isShowActive = false;
  }

  setTableState(tableState) {
    this._tableState = tableState;
  }

  onWindowOpened() {
    if (this._windowTween) {
      this._windowTween.stop();
    }

    this._windowTween = new TWEEN.Tween(this._windowCoefficient)
      .to({ value: 6 }, 1000)
      .easing(TWEEN.Easing.Linear.None)
      .start();
  }

  onWindowClosed() {
    if (this._windowTween) {
      this._windowTween.stop();
    }

    this._windowTween = new TWEEN.Tween(this._windowCoefficient)
      .to({ value: 0 }, 1000)
      .easing(TWEEN.Easing.Linear.None)
      .start();
  }

  onChangeTemperature() {
    this._updateParticlesSize();
  }

  _updateParticlesSize() {
    const temperatureCoeff = ((AIR_CONDITIONER_CONFIG.temperature.current / this._defaultTemperature) - 1) * SNOWFLAKE_PARTICLES_CONFIG.sizeByTemperatureCoeff;
    this._particles.material.size = this._config.size - temperatureCoeff * this._config.size;
  }

  _hideAllParticles() {
    if (this._hidingTween) {
      this._hidingTween.stop();
    }

    const alphaObject = { value: 1 };
    let previousAlpha = 1;

    this._hidingTween = new TWEEN.Tween(alphaObject)
      .to({ value: 0 }, 300)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        this._decreaseParticlesAlpha(previousAlpha - alphaObject.value);
        previousAlpha = alphaObject.value;
      })
      .onComplete(() => {
        if (this._isShowActive) {
          this._isHiding = false;
          this.visible = true;
          this._resetAllParticles();
        }
      });
  }

  _updateParticlesPosition(dt) {
    const delta = dt / 60;

    const positions = this._particles.geometry.attributes.position;
    const colors = this._particles.geometry.attributes.color;

    if (this._currentActiveCount < this._config.count && !this._isHiding) {
      this._currentActiveCount += this._config.countIncrement;
    }

    for (let i = 0; i < this._currentActiveCount; i++) {
      const particleConfig = this._particleData[i];

      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const deltaX = -y * particleConfig.yCoeff * particleConfig.speed * delta;
      const deltaY = particleConfig.yDelta * particleConfig.speed * delta;
      const deltaZ = y * particleConfig.zCoeff * particleConfig.speed * delta;

      const newX = x + deltaX;
      const newY = y - deltaY;
      const newZ = z - deltaZ;

      positions.setX(i, newX);
      positions.setY(i, newY);
      positions.setZ(i, newZ);

      this._checkToFadeOutParticlePosition(i);
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;
  }

  _checkToFadeOutParticlePosition(index) {
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
        colors.setW(index, 0);

        if (!this._isHiding) {
          this._resetParticle(index);
        }
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

    this._currentActiveCount = 0;
  }

  _setParticleStartPosition(index) {
    const positions = this._particles.geometry.attributes.position;
    const halfDoorWidth = AIR_CONDITIONER_CONFIG.doorWidth * 0.5;
    const randomZ = randomBetween(-halfDoorWidth, halfDoorWidth);

    positions.setX(index, SNOWFLAKE_PARTICLES_CONFIG.startOffset.x);
    positions.setY(index, SNOWFLAKE_PARTICLES_CONFIG.startOffset.y);
    positions.setZ(index, randomZ);
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

  _checkWhenHiding() {
    if (this._isHiding) {
      this._currentVisibleParticlesCount = this._getVisibleParticlesCount();

      if (this._currentVisibleParticlesCount === 0) {
        this.visible = false;
        this._isHiding = false;
      }
    }
  }

  _getVisibleParticlesCount() {
    const colors = this._particles.geometry.attributes.color;
    let count = 0;

    for (let i = 0; i < this._currentActiveCount; i++) {
      let alpha = colors.getW(i);

      if (alpha > 0) {
        count += 1;
      }
    }

    return count;
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

    this._updateParticlesSize();

    particles.frustumCulled = false;
  }

  _getPositionArray() {
    const positionArray = new Float32Array(this._config.count * 3);
    const halfDoorWidth = AIR_CONDITIONER_CONFIG.doorWidth * 0.5;

    for (let i = 0; i < this._config.count; i += 1) {
      const randomZ = randomBetween(-halfDoorWidth, halfDoorWidth);

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
    const dataByTableState = SNOWFLAKE_PARTICLES_CONFIG.dataByTableState[this._tableState];
    const speedCoeff = ((AIR_CONDITIONER_CONFIG.temperature.current / this._defaultTemperature) - 1) * SNOWFLAKE_PARTICLES_CONFIG.speedByTemperatureCoeff;
    const defaultSpeed = randomBetween(2, 3) * this._config.speed;

    const speed = defaultSpeed - defaultSpeed * speedCoeff;
    const yCoeff = randomBetween(15, 20) * dataByTableState.tableYCoeff;
    const yDelta = randomBetween(25, 40) * dataByTableState.tableYDelta;
    const zCoeff = randomBetween(-2, 2) + this._windowCoefficient.value;
    const alpha = randomBetween(0.4, 0.6);
    const alphaDecrement = randomBetween(0.015, 0.025);

    return { speed, yCoeff, yDelta, zCoeff, alpha, alphaDecrement };
  }
}
