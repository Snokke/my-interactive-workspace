import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../data/room-config';
import { SPEAKERS_PART_TYPE, SPEAKERS_POWER_STATUS } from './speakers-data';
import { SPEAKERS_CONFIG } from './speakers-config';
import Loader from '../../../../core/loader';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';
import SoundParticles from './sound-particels';
import { MUSIC_TYPE } from '../laptop/laptop-data';
import { MUSIC_CONFIG } from '../laptop/laptop-config';
import { SOUNDS_CONFIG } from '../../data/sounds-config';

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

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    this._setPowerOff();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const leftSpeaker = this._parts[SPEAKERS_PART_TYPE.Left];
      const rightSpeaker = this._parts[SPEAKERS_PART_TYPE.Right];

      new TWEEN.Tween(this._leftSpeakerGroup.position)
        .to({ y: leftSpeaker.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(this._rightSpeakerGroup.position)
        .to({ y: rightSpeaker.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5)
        .start()
        .onComplete(() => {
          this._setPowerOn();

          this._debugMenu.enable();
          this._onShowAnimationComplete();
        });
    });
  }

  onClick(intersect) {
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
    this._music.setDirectionalCone(120, 160, SOUNDS_CONFIG.openedWindowOuterGain);
  }

  onWindowClosed() {
    this._music.setDirectionalCone(120, 160, SOUNDS_CONFIG.closedWindowOuterGain);
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
    super.onVolumeChanged(volume);

    if (this._isSoundsEnabled && this._powerStatus === SPEAKERS_POWER_STATUS.On) {
      this._changeMusicVolume();
    }
  }

  enableSound() {
    super.enableSound();

    this._changeMusicVolume();
  }

  disableSound() {
    super.disableSound();

    this._music.setVolume(0);
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
  }

  _setPowerOff() {
    this._powerStatus = SPEAKERS_POWER_STATUS.Off;
    this._debugMenu.updatePowerStatus(this._powerStatus);

    this._music.setVolume(0);
    this._rightSoundParticles.hide();
    this._leftSoundParticles.hide();

    const powerIndicator = this._parts[SPEAKERS_PART_TYPE.PowerIndicator];
    powerIndicator.material.color = new THREE.Color(SPEAKERS_CONFIG.turnOffColor);
  }

  _updateSongCurrentTime() {
    if (this._music.isPlaying) {
      this._audioCurrentTime = this._music.context.currentTime - this._audioContextCurrentTime + this._audioPrevTime;
      if (this._audioCurrentTime >= this._music.buffer.duration - 0.05) {
        this.events.post('onSongEnded');
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

  _setPositionForShowAnimation() {
    this._leftSpeakerGroup.position.y = ROOM_CONFIG.startAnimation.startPositionY;
    this._rightSpeakerGroup.position.y = ROOM_CONFIG.startAnimation.startPositionY;
  }

  _changeMusicVolume() {
    this._music.setVolume(this._volume * this._speakersVolume);
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initMusic();
    this._initDebugMenu();
    this._initHelpers();
    this._initSignals();

    this._updatePowerIndicatorColor();
    this._music.setVolume(0);

    this._setPowerOn();
  }

  _addPartsToScene() {
    const leftSpeakerGroup = this._leftSpeakerGroup = new THREE.Group();
    this.add(leftSpeakerGroup);

    const leftSpeaker = this._parts[SPEAKERS_PART_TYPE.Left];

    leftSpeakerGroup.add(leftSpeaker);
    leftSpeakerGroup.position.copy(leftSpeaker.userData.startPosition);
    leftSpeaker.position.set(0, 0, 0);

    const rightSpeakerGroup = this._rightSpeakerGroup = new THREE.Group();
    this.add(rightSpeakerGroup);

    const rightSpeaker = this._parts[SPEAKERS_PART_TYPE.Right];
    const powerIndicator = this._parts[SPEAKERS_PART_TYPE.PowerIndicator];

    rightSpeakerGroup.add(rightSpeaker);
    rightSpeakerGroup.add(powerIndicator);
    rightSpeakerGroup.position.copy(rightSpeaker.userData.startPosition);
    powerIndicator.position.sub(rightSpeaker.userData.startPosition);
    rightSpeaker.position.set(0, 0, 0);

    this._musicGroup = new THREE.Group();
    this.add(this._musicGroup);

    this._musicGroup.position.copy(rightSpeakerGroup.position);
    this._musicGroup.position.x -= 3.6;
  }

  _initMusic() {
    this._initPositionalAudio();
    this._initParticles();
    this._initLoaderSignals();
  }

  _initPositionalAudio() {
    this._music = new THREE.PositionalAudio(this._audioListener);
    this._music.setRefDistance(10);
    this._music.setDirectionalCone(120, 160, SOUNDS_CONFIG.closedWindowOuterGain);

    this._music.rotation.y = Math.PI * 0.22;

    this._musicGroup.add(this._music);

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
    const audioHelper = this._audioHelper = new PositionalAudioHelper(this._music, 2);
    this._musicGroup.add(audioHelper);

    audioHelper.rotation.y = this._music.rotation.y;
    audioHelper.visible = false;
  }

  _initLoaderSignals() {
    Loader.events.on('onAudioLoaded', () => {
      this._setCurrentMusic(this._currentMusicType)
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
  }

  _setCurrentMusic(musicType) {
    this._currentMusicType = musicType;
    const musicName = MUSIC_CONFIG[this._currentMusicType].fileName;
    this._music.setBuffer(Loader.assets[musicName]);

    this.events.post('onMusicChanged', this._currentMusicType, this._music.buffer.duration);
    this.events.post('updateCurrentSongTime', this._audioCurrentTime);
  }
}
