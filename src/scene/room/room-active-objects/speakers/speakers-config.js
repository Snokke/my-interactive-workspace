import * as THREE from 'three';

const SPEAKERS_CONFIG = {
  turnOnColor: 0x00ff00,
  turnOffColor: 0xff0000,
  helpersEnabled: false,
}

const SOUND_PARTICLES_CONFIG = {
  size: 15,
  amplitudeCoefficient: 0.004,
  positionOffset: new THREE.Vector3(0, 0.13, 0.8),
  circles: {
    circlesCount: 16,
    startParticlesCount: 15,
    particlesIncrement: 8,
    startRadius: 0.1,
    radiusIncrement: 0.04,
  }
}

export { SPEAKERS_CONFIG, SOUND_PARTICLES_CONFIG };
