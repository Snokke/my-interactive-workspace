import * as THREE from "three";
import vertexShader from './steam-particles-shaders/steam-particles-vertex.glsl';
import fragmentShader from './steam-particles-shaders/steam-particles-fragment.glsl';
import RoomInactiveObjectAbstract from "../room-inactive-object-abstract";

export default class Cup extends RoomInactiveObjectAbstract {
  constructor(roomScene, roomObjectType) {
    super(roomScene, roomObjectType);

    this._initSteamParticles();
  }

  update(dt) {

  }

  _initSteamParticles() {
    // this._initParticles();
    // this._initSignals();
  }

  _initParticles() {
    const geometry = new THREE.BufferGeometry();
    const positionArray = this._getPositionArray();

    geometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

    const material = this._particlesMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 50 },
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
    const particlesCount = 100;
    const positionArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i += 1) {
      positionArray[(i * 3 + 0)] = Math.random();
      positionArray[(i * 3 + 1)] = 0;
      positionArray[(i * 3 + 2)] = Math.random();
    }

    return positionArray;
  }

  _initSignals() {
    window.addEventListener('resize', () => {
      this._particlesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    });
  }
}
