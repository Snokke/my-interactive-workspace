import * as THREE from 'three';
import RoomObjectAbstract from '../room-object.abstract';
import { SPEAKERS_PART_TYPE, SPEAKERS_POWER_STATUS } from './data/speakers-data';
import { SPEAKERS_CONFIG } from './data/speakers-config';
import Loader from '../../../../core/loader';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import SoundParticles from './sound-particles/sound-particles';
import { MUSIC_TYPE } from '../laptop/data/laptop-data';
import { MUSIC_CONFIG } from '../laptop/data/laptop-config';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import Materials from '../../../../core/materials';

export default class Speakers extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._musicGroup = null;
    this._leftSpeakerGroup = null;
    this._rightSpeakerGroup = null;
    this._music = null;
    this._analyzer = null;
    this._rightSoundParticles = null;
    this._leftSoundParticles = null;
    this._audioHelper = null;

    this._powerStatus = SPEAKERS_POWER_STATUS.Off;
    this._audioCurrentTime = 0;
    this._audioContextCurrentTime = 0;
    this._audioPrevTime = 0;
    this._currentMusicType = MUSIC_TYPE.Giorgio;

    this._speakersVolume = 1;
    this._time = 0;
    this._sendSignalTime = 1;

    this._init();
  }

  update(dt) {
    this._time += dt;
    this._rightSoundParticles.update(dt);
    this._leftSoundParticles.update(dt);
    this._updateSongCurrentTime();
  }

  onClick(intersect) { // eslint-disable-line
    if (!this._isInputEnabled) {
      return;
    }

    if (this._powerStatus === SPEAKERS_POWER_STATUS.Off) {
      this._setPowerOn();
    } else {
      this._setPowerOff();
    }
  }

  playMusic(musicType) {
    if (this._currentMusicType === musicType) {
      if (this._music.isPlaying) {
        this._music.pause();
      } else {
        this._music.play();
      }

      return;
    }

    this.changeMusic(musicType);
    this._music.play();
  }

  changeMusic(musicType) {
    this._music.pause();
    this._audioContextCurrentTime = this._music.context.currentTime;
    this._audioCurrentTime = 0;
    this._audioPrevTime = 0;

    this._setCurrentMusic(musicType);

    this._music.stop();
  }

  onWindowOpened() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];
    this._music.setDirectionalCone(soundConfig.coneInnerAngle, soundConfig.coneOuterAngle, SOUNDS_CONFIG.openedWindowOuterGain);
  }

  onWindowClosed() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];
    this._music.setDirectionalCone(soundConfig.coneInnerAngle, soundConfig.coneOuterAngle, SOUNDS_CONFIG.closedWindowOuterGain);
  }

  onShowreelPause() {
    if (this._currentMusicType === MUSIC_TYPE.TheStomp) {
      this.playMusic(MUSIC_TYPE.TheStomp);
    }
  }

  onShowreelStop() {
    if (this._currentMusicType === MUSIC_TYPE.TheStomp) {
      this.changeMusic(MUSIC_TYPE.TheStomp);
    }
  }

  showSoundHelpers() {
    this._audioHelper.visible = true;
  }

  hideSoundHelpers() {
    this._audioHelper.visible = false;
  }

  onVolumeChanged(volume) {
    this._globalVolume = volume;

    if (this._isSoundsEnabled && this._powerStatus === SPEAKERS_POWER_STATUS.On) {
      this._changeMusicVolume();
    }
  }

  enableSound() {
    this._isSoundsEnabled = true;

    this._changeMusicVolume();
  }

  disableSound() {
    this._isSoundsEnabled = false;

    this._music.setVolume(0);
  }

  setGameSoundsAnalyzer(analyzers) {
    this._rightSoundParticles.setGameSoundsAnalyzer(analyzers);
    this._leftSoundParticles.setGameSoundsAnalyzer(analyzers);
  }

  setGameActive() {
    this._rightSoundParticles.setGameActive();
    this._leftSoundParticles.setGameActive();
  }

  setGameInactive() {
    this._rightSoundParticles.setGameInactive();
    this._leftSoundParticles.setGameInactive();
  }

  _setPowerOn() {
    this._powerStatus = SPEAKERS_POWER_STATUS.On;
    this._debugMenu.updatePowerStatus(this._powerStatus);

    if (this._isSoundsEnabled) {
      this._changeMusicVolume();
    }

    this._rightSoundParticles.show();
    this._leftSoundParticles.show();

    const powerIndicator = this._parts[SPEAKERS_PART_TYPE.PowerIndicator];
    powerIndicator.material.color = new THREE.Color(SPEAKERS_CONFIG.turnOnColor);
    this.events.post('onSpeakersPowerChanged', this._powerStatus);
  }

  _setPowerOff() {
    this._powerStatus = SPEAKERS_POWER_STATUS.Off;
    this._debugMenu.updatePowerStatus(this._powerStatus);

    this._music.setVolume(0);
    this._rightSoundParticles.hide();
    this._leftSoundParticles.hide();

    const powerIndicator = this._parts[SPEAKERS_PART_TYPE.PowerIndicator];
    powerIndicator.material.color = new THREE.Color(SPEAKERS_CONFIG.turnOffColor);
    this.events.post('onSpeakersPowerChanged', this._powerStatus);
  }

  _updateSongCurrentTime() {
    if (this._music.isPlaying) {
      this._audioCurrentTime = this._music.context.currentTime - this._audioContextCurrentTime + this._audioPrevTime;
      if (this._audioCurrentTime >= this._music.buffer.duration - 0.05) {
        this.events.post('onSongEnded', this._currentMusicType);
      }
    } else {
      this._audioPrevTime = this._audioCurrentTime;
      this._audioContextCurrentTime = this._music.context.currentTime;
    }

    if (this._time >= this._sendSignalTime) {
      this._time = 0;

      this.events.post('updateCurrentSongTime', this._audioCurrentTime);
    }
  }

  _updatePowerIndicatorColor() {
    const powerIndicator = this._parts[SPEAKERS_PART_TYPE.PowerIndicator];

    const powerIndicatorColor = this._powerStatus === SPEAKERS_POWER_STATUS.On ? SPEAKERS_CONFIG.turnOnColor : SPEAKERS_CONFIG.turnOffColor;
    powerIndicator.material.color = new THREE.Color(powerIndicatorColor);
  }

  _changeMusicVolume() {
    this._music.setVolume(this._globalVolume * this._speakersVolume * this._objectVolume);
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._initPowerIndicatorMaterial();
    this._addPartsToScene();
    this._initGroups();
    this._initMusic();
    this._initDebugMenu();
    this._initHelpers();
    this._initSignals();

    this._updatePowerIndicatorColor();
    this._music.setVolume(0);

    this._setPowerOn();
  }

  _addMaterials() {
    const material = Materials.getMaterial(Materials.type.bakedBigObjects);
    this._parts[SPEAKERS_PART_TYPE.Speakers].material = material;
  }

  _initPowerIndicatorMaterial() {
    const texture = Loader.assets['speakers-indicator'];
    texture.flipY = false;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      color: new THREE.Color(SPEAKERS_CONFIG.turnOnColor),
    });

    this._parts[SPEAKERS_PART_TYPE.PowerIndicator].material = material;
  }

  _initGroups() {
    const speakers = this._parts[SPEAKERS_PART_TYPE.Speakers];
    const speakersDistance = 7.2;

    const leftSpeakerGroup = this._leftSpeakerGroup = new THREE.Group();
    this.add(leftSpeakerGroup);
    leftSpeakerGroup.position.copy(speakers.position);
    leftSpeakerGroup.position.x -= speakersDistance;

    const rightSpeakerGroup = this._rightSpeakerGroup = new THREE.Group();
    this.add(rightSpeakerGroup);
    rightSpeakerGroup.position.copy(speakers.position);

    const musicGroup = this._musicGroup = new THREE.Group();
    this.add(musicGroup);
    musicGroup.position.copy(speakers.position);
    musicGroup.position.x -= speakersDistance * 0.5;
  }

  _initMusic() {
    this._initPositionalAudio();
    this._initParticles();
    this._initLoaderSignals();
  }

  _initPositionalAudio() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];

    this._music = new THREE.PositionalAudio(this._audioListener);
    this._musicGroup.add(this._music);

    this._music.setRefDistance(soundConfig.refDistance);
    this._music.setDirectionalCone(soundConfig.coneInnerAngle, soundConfig.coneOuterAngle, SOUNDS_CONFIG.closedWindowOuterGain);

    this._music.rotation.y = soundConfig.rotation * THREE.MathUtils.DEG2RAD;

    this._music.setVolume(this._globalVolume * this._speakersVolume * this._objectVolume);

    const fftSize = 128;
    this._analyser = new THREE.AudioAnalyser(this._music, fftSize);
  }

  _initParticles() {
    const rightSoundParticles = this._rightSoundParticles = new SoundParticles(this._analyser);
    this._rightSpeakerGroup.add(rightSoundParticles);

    const leftSoundParticles = this._leftSoundParticles = new SoundParticles(this._analyser);
    this._leftSpeakerGroup.add(leftSoundParticles);
  }

  _initHelpers() {
    const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;
    const audioHelper = this._audioHelper = new PositionalAudioHelper(this._music, helperSize);
    this._musicGroup.add(audioHelper);

    audioHelper.rotation.y = this._music.rotation.y;
    audioHelper.visible = false;
  }

  _initLoaderSignals() {
    Loader.events.on('onAudioLoaded', () => {
      this._setCurrentMusic(this._currentMusicType);
    });
  }

  _initSignals() {
    this._debugMenu.events.on('switch', () => this.onClick());
    this._debugMenu.events.on('onVolumeChanged', () => this._onVolumeChanged());
    this._debugMenu.events.on('onParticlesSizeChanged', () => this._onParticlesSizeChanged());
    this._debugMenu.events.on('onRecreateParticles', () => this._onRecreateParticles());
  }

  _onVolumeChanged() {
    this._speakersVolume = SPEAKERS_CONFIG.volume;

    if (this._isSoundsEnabled && this._powerStatus === SPEAKERS_POWER_STATUS.On) {
      this._changeMusicVolume();
    }
  }

  _onParticlesSizeChanged() {
    this._rightSoundParticles.updateSize();
    this._leftSoundParticles.updateSize();
  }

  _onRecreateParticles() {
    this._rightSoundParticles.recreate();
    this._leftSoundParticles.recreate();

    this._setPowerOn();
  }

  _setCurrentMusic(musicType) {
    this._currentMusicType = musicType;
    const musicName = MUSIC_CONFIG[this._currentMusicType].fileName;
    this._music.setBuffer(Loader.assets[musicName]);

    this.events.post('onMusicChanged', this._currentMusicType, this._music.buffer.duration);
    this.events.post('updateCurrentSongTime', this._audioCurrentTime);
  }
}
