import * as THREE from 'three';
import vertexShader from './sound-particles-shaders/sound-particles-vertex.glsl';
import fragmentShader from './sound-particles-shaders/sound-particles-fragment.glsl';
import { SOUND_PARTICLES_CONFIG } from './speakers-config';

export default class SoundParticles extends THREE.Group {
  constructor(analyser) {
    super();

    this._analyser = analyser;

    this._particles = null;
    this._particlesMaterial = null;

    this._time = 0;
    this._frequencyDataCount = 55; // standard 64

    this._init();
  }

  update(dt) {
    this._time += dt;

    this._analyser.getFrequencyData();
    const data = [...this._analyser.data];
    const positions = this._particles.geometry.attributes.position;
    // const colors = this._particles.geometry.attributes.color;
    const dataCountForParticles = Math.round(this._frequencyDataCount / SOUND_PARTICLES_CONFIG.circles.circlesCount);

    // const normalizedData = data.map(item => item / 255);

    const dataForPosition = data.map((item) => {
      if (item < 127) {
        return -item;
      }

      return item - 127;
    });

    let particlesInCurrentCircle = SOUND_PARTICLES_CONFIG.circles.startParticlesCount;
    let currentParticlesCount = 0;

    for (let i = 0; i < SOUND_PARTICLES_CONFIG.circles.circlesCount; i += 1) {
      for (let j = 0; j < particlesInCurrentCircle; j += 1) {
        let dataPositionZ = 0;
        let color = 0;

        for (let k = 0; k < dataCountForParticles; k += 1) {
          if (i * dataCountForParticles + k < this._frequencyDataCount) {
            dataPositionZ -= dataForPosition[i * dataCountForParticles + k];
            // color = normalizedData[i * dataCountForParticles + k];
          }
        }

        dataPositionZ /= dataCountForParticles;
        dataPositionZ *= SOUND_PARTICLES_CONFIG.amplitudeCoefficient;

        positions.setZ(j + currentParticlesCount, SOUND_PARTICLES_CONFIG.positionOffset.z + dataPositionZ);
        // colors.setXYZ(j + currentParticlesCount, color, color, color);
      }

      currentParticlesCount += particlesInCurrentCircle;
      particlesInCurrentCircle += SOUND_PARTICLES_CONFIG.circles.particlesIncrement;
    }

    // colors.needsUpdate = true;
    positions.needsUpdate = true;
  }

  _init() {
    this._initParticles();
    this._initSignals();
  }

  _initParticles() {
    const geometry = new THREE.BufferGeometry();
    const { positionArray, colorArray } = this._getPositionAndColorArray();

    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    // geometry.attributes.color.setUsage(THREE.DynamicDrawUsage);

    const material = this._particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: SOUND_PARTICLES_CONFIG.size },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      vertexColors: true,
    });

    const particles = this._particles = new THREE.Points(geometry, material);
    this.add(particles);
  }

  _getPositionAndColorArray() {
    const particlesCount = this._getParticlesCount();
    const positionArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    let currentRadius = SOUND_PARTICLES_CONFIG.circles.startRadius;
    let particlesInCurrentCircle = SOUND_PARTICLES_CONFIG.circles.startParticlesCount;
    let currentParticlesCount = 0;

    for (let i = 0; i < SOUND_PARTICLES_CONFIG.circles.circlesCount; i += 1) {
      for (let j = 0; j < particlesInCurrentCircle; j += 1) {
        const angle = j / particlesInCurrentCircle * Math.PI * 2;

        positionArray[(j * 3 + 0) + currentParticlesCount * 3] = Math.cos(angle) * currentRadius + SOUND_PARTICLES_CONFIG.positionOffset.x;
        positionArray[(j * 3 + 1) + currentParticlesCount * 3] = Math.sin(angle) * currentRadius + SOUND_PARTICLES_CONFIG.positionOffset.y;
        positionArray[(j * 3 + 2) + currentParticlesCount * 3] = SOUND_PARTICLES_CONFIG.positionOffset.z;

        colorArray[(j * 3 + 0) + currentParticlesCount * 3] = 255;
        colorArray[(j * 3 + 1) + currentParticlesCount * 3] = 255;
        colorArray[(j * 3 + 2) + currentParticlesCount * 3] = 255;
      }

      currentRadius += SOUND_PARTICLES_CONFIG.circles.radiusIncrement;
      currentParticlesCount += particlesInCurrentCircle;
      particlesInCurrentCircle += SOUND_PARTICLES_CONFIG.circles.particlesIncrement;
    }

    return { positionArray, colorArray };
  }

  _getParticlesCount() {
    let particlesCount = 0;

    for (let i = 0; i < SOUND_PARTICLES_CONFIG.circles.circlesCount; i += 1) {
      particlesCount += SOUND_PARTICLES_CONFIG.circles.startParticlesCount + i * SOUND_PARTICLES_CONFIG.circles.particlesIncrement;
    }

    return particlesCount;
  }

  _initSignals() {
    window.addEventListener('resize', () => {
      this._particlesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    });
  }
}
