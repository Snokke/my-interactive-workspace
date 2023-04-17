import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { SOUND_PARTICLES_CONFIG, SPEAKERS_CONFIG } from "./speakers-config";
import { SPEAKERS_POWER_STATUS } from "./speakers-data";

export default class SpeakersDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._powerButton = null;
    this._powerStatusController = null;

    this._powerStatus = { value: SPEAKERS_POWER_STATUS.On };

    this._init();
    this._checkToDisableFolder();
  }

  updatePowerStatus(powerStatus) {
    this._powerStatus.value = powerStatus;
    this._powerButton.title = this._powerStatus.value === SPEAKERS_POWER_STATUS.On ? 'Turn off' : 'Turn on';
    this._powerStatusController.refresh();
  }

  _init() {
    this._initSpeakersDebug();
    this._initParticlesDebug();
  }

  _initSpeakersDebug() {
    this._powerStatusController = this._debugFolder.addInput(this._powerStatus, 'value', {
      label: 'Power',
      disabled: true,
    });
    this._powerStatusController.customDisabled = true;

    this._powerButton = this._debugFolder.addButton({
      title: 'Turn on',
    }).on('click', () => this.events.post('switch'));

    this.updatePowerStatus(this._powerStatus.value);

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(SPEAKERS_CONFIG, 'volume', {
      label: 'Volume',
      min: 0,
      max: 1,
    }).on('change', () => this.events.post('onVolumeChanged'));

    this._debugFolder.addInput(SPEAKERS_CONFIG, 'helpersEnabled', {
      label: 'Helpers',
    }).on('change', () => this.events.post('onHelpersChanged'));

    this._debugFolder.addSeparator();
  }

  _initParticlesDebug() {
    this._debugFolder.addInput(SOUND_PARTICLES_CONFIG, 'size', {
      label: 'Particles size',
      min: 1,
      max: 200,
    }).on('change', () => this.events.post('onParticlesSizeChanged'));

    this._debugFolder.addInput(SOUND_PARTICLES_CONFIG, 'amplitudeCoefficient', {
      label: 'Amplitude',
      min: 0.1,
      max: 30,
    });

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(SOUND_PARTICLES_CONFIG.circles, 'circlesCount', {
      label: 'Circles',
      min: 1,
      max: 32,
      step: 1,
    });

    this._debugFolder.addInput(SOUND_PARTICLES_CONFIG.circles, 'startParticlesCount', {
      label: 'First circle',
      min: 1,
      max: 30,
      step: 1,
    });

    this._debugFolder.addInput(SOUND_PARTICLES_CONFIG.circles, 'particlesIncrement', {
      label: 'Particles increment',
      min: 1,
      max: 20,
      step: 1,
    });

    this._debugFolder.addInput(SOUND_PARTICLES_CONFIG.circles, 'startRadius', {
      label: 'First radius',
      min: 0.01,
      max: 1,
    });

    this._debugFolder.addInput(SOUND_PARTICLES_CONFIG.circles, 'radiusIncrement', {
      label: 'Radius increment',
      min: 0.01,
      max: 0.5,
    });

    this._debugFolder.addButton({
      title: 'Recreate particles',
    }).on('click', () => this.events.post('onRecreateParticles'));
  }
}
