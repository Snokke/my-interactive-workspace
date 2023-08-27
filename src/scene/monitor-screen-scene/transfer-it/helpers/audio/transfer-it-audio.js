import * as THREE from 'three';
import { GAME_BOY_SOUND_TYPE } from './game-boy-audio-data';
import { GAME_BOY_SOUNDS_CONFIG } from './game-boy-audio-config';
import { SOUNDS_CONFIG } from '../../../../core/configs/sounds-config';
import Loader from '../../../../../core/loader';
import { TRANSFER_IT_SOUNDS } from './transfer-it-sounds';

export default class TransferItAudio {
  constructor(audioListener, audioGroup) {

    this._audioListener = audioListener;
    this._audioGroup = audioGroup;

    this._globalVolume = SOUNDS_CONFIG.masterVolume;
    this._gameBoyVolume = SOUNDS_CONFIG.gameBoyVolume;
    this._isSoundsEnabled = true;
    this._isGameBoyEnabled = false;
    this.sounds = {};

    this._initSounds();

    TransferItAudio.instance = this;
  }

  _initSounds() {
    for (const value in TRANSFER_IT_SOUNDS) {
      const soundType = GAME_BOY_SOUND_TYPE[value];
      this._initSound(soundType);
    }
  }

  _initSound(soundType) {
    const config = GAME_BOY_SOUNDS_CONFIG[soundType];

    const sound = new THREE.PositionalAudio(this._audioListener);
    this._audioGroup.add(sound);

    this.sounds[soundType] = sound;

    sound.setRefDistance(10);
    sound.setVolume(this._globalVolume * this._gameBoyVolume);

    Loader.events.on('onAudioLoaded', () => {
      sound.setBuffer(Loader.assets[config.fileName]);
    });
  }

  _updateVolume() {
    if (this._isSoundsEnabled && this._isGameBoyEnabled) {
      for (const value in GAME_BOY_SOUND_TYPE) {
        const soundType = GAME_BOY_SOUND_TYPE[value];
        const sound = this.sounds[soundType];
        sound.setVolume(this._globalVolume * this._gameBoyVolume);
      }
    }
  }

  _setVolumeZero() {
    for (const value in GAME_BOY_SOUND_TYPE) {
      const soundType = GAME_BOY_SOUND_TYPE[value];
      const sound = this.sounds[soundType];
      sound.setVolume(0);
    }
  }

  _stopAllSounds() {
    for (const value in GAME_BOY_SOUND_TYPE) {
      const soundType = GAME_BOY_SOUND_TYPE[value];
      const sound = this.sounds[soundType];

      if (sound.isPlaying) {
        sound.stop();
      }
    }
  }

  static playSound(type) {
    const sound = TransferItAudio.instance.sounds[type];

    if (sound.isPlaying) {
      sound.stop();
    }

    sound.play();
  }

  static switchSound(type) {
    const sound = TransferItAudio.instance.sounds[type];

    if (sound.isPlaying) {
      sound.stop();
    } else {
      sound.play();
    }
  }

  static stopSound(type) {
    const sound = TransferItAudio.instance.sounds[type];

    if (sound.isPlaying) {
      sound.stop();
    }
  }

  static changeGlobalVolume(volume) {
    TransferItAudio.instance._globalVolume = volume;
    TransferItAudio.instance._updateVolume();
  }

  static changeGameBoyVolume(volume) {
    TransferItAudio.instance._gameBoyVolume = volume;
    TransferItAudio.instance._updateVolume();
  }

  static enableSound() {
    TransferItAudio.instance._isSoundsEnabled = true;
    TransferItAudio.instance._updateVolume();
  }

  static disableSound() {
    TransferItAudio.instance._isSoundsEnabled = false;
    TransferItAudio.instance._setVolumeZero();
  }

  static onTurnOnGameBoy() {
    TransferItAudio.instance._isGameBoyEnabled = true;
    TransferItAudio.instance._updateVolume();
  }

  static onTurnOffGameBoy() {
    TransferItAudio.instance._isGameBoyEnabled = false;
    TransferItAudio.instance._setVolumeZero();
    TransferItAudio.instance._stopAllSounds();
  }
}

TransferItAudio.instance = null;
