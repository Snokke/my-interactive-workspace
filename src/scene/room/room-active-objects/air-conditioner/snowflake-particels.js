import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import vertexShader from './snowflake-particles-shaders/snowflake-particles-vertex.glsl';
import fragmentShader from './snowflake-particles-shaders/snowflake-particles-fragment.glsl';
import { SNOWFLAKE_PARTICLES_CONFIG } from './air-conditioner-config';

export default class SnowflakeParticles extends THREE.Group {
  constructor() {
    super();

    this._particles = null;
    this._particlesMaterial = null;
    this._showTween = null;

    this._startPositionsY = [];

    this._time = 0;

    this._init();
  }

  update(dt) {
    if (!this.visible) {
      return;
    }

    this._time += dt;
    this._updateParticlesPosition(dt);
  }

  show() {
    this.visible = true;

    if (this._showTween) {
      this._showTween.stop();
    }

    this._showTween = new TWEEN.Tween(this._particlesMaterial.uniforms.uAlpha)
      .to({ value: 1 }, 300)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  hide() {
    if (this._showTween) {
      this._showTween.stop();
    }

    this._showTween = new TWEEN.Tween(this._particlesMaterial.uniforms.uAlpha)
      .to({ value: 0 }, 300)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        this.visible = false;
        this._setStartPositions();
      });
  }

  updateSize() {
    this._particlesMaterial.uniforms.uSize.value = SNOWFLAKE_PARTICLES_CONFIG.size;
  }

  recreate() {
    // this._particlesMaterial.dispose();
    // this._particles.geometry.dispose();
    // this.remove(this._particles);

    // this._initParticles();
  }

  _updateParticlesPosition(dt) {
    const positions = this._particles.geometry.attributes.position;

    for (let i = 0; i < SNOWFLAKE_PARTICLES_CONFIG.count; i++) {
      const startPosition = positions.getY(i);
      positions.setY(i, startPosition - SNOWFLAKE_PARTICLES_CONFIG.speed * dt);

      if (positions.getY(i) < -2) {
        positions.setY(i, SNOWFLAKE_PARTICLES_CONFIG.startOffset.y + Math.random() * 0.5);
      }
    }

    positions.needsUpdate = true;
  }

  _setStartPositions() {
    const positions = this._particles.geometry.attributes.position;

    for (let i = 0; i < SNOWFLAKE_PARTICLES_CONFIG.count; i++) {
      positions.setY(i, SNOWFLAKE_PARTICLES_CONFIG.startOffset.y + Math.random() * 0.5);
    }

    positions.needsUpdate = true;
  }

  _init() {
    this._initParticles();
    this._initSignals();

    this.visible = false;
  }

  _initParticles() {
    const geometry = new THREE.BufferGeometry();
    const positionArray = this._getPositionArray();

    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

    const material = this._particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: SNOWFLAKE_PARTICLES_CONFIG.size },
        uColor: { value: new THREE.Color(0xffffff) },
        uAlpha: { value: 1 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = this._particles = new THREE.Points(geometry, material);
    this.add(particles);
  }

  _getPositionArray() {
    const particlesCount = SNOWFLAKE_PARTICLES_CONFIG.count;
    const positionArray = new Float32Array(particlesCount * 3);
    const offsetZ = SNOWFLAKE_PARTICLES_CONFIG.doorWidth / particlesCount;

    for (let i = 0; i < particlesCount; i += 1) {
      const y = SNOWFLAKE_PARTICLES_CONFIG.startOffset.y + Math.random() * 0.5;
      this._startPositionsY.push(y);

      positionArray[(i * 3 + 0)] = SNOWFLAKE_PARTICLES_CONFIG.startOffset.x;
      positionArray[(i * 3 + 1)] = y;
      positionArray[(i * 3 + 2)] = -SNOWFLAKE_PARTICLES_CONFIG.doorWidth * 0.5 + i * offsetZ;
    }

    return positionArray;
  }

  _initSignals() {
    window.addEventListener('resize', () => {
      this._particlesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    });
  }
}
