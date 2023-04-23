import * as THREE from 'three';

const SPEAKERS_CONFIG = {
  turnOnColor: 0x00ff00,
  turnOffColor: 0xff0000,
  volume: 1,
}

const SOUND_PARTICLES_CONFIG = {
  size: 60,
  amplitudeCoefficient: 6,
  positionOffset: new THREE.Vector3(0, 0.13, 0.8),
  circles: {
    circlesCount: 16,
    startParticlesCount: 15,
    particlesIncrement: 8,
    startRadius: 0.1,
    radiusIncrement: 0.04,
  },
  idleAnimation: {
    amplitude: 0.02,
    frequency: 0.8,
    speed: 2
  },
}

export { SPEAKERS_CONFIG, SOUND_PARTICLES_CONFIG };
