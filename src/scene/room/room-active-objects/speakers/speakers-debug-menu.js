import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { SPEAKERS_CONFIG } from "./speakers-config";
import { MUSIC_CONFIG, MUSIC_TYPE, SPEAKERS_POWER_STATUS } from "./speakers-data";

export default class SpeakersDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._powerButton = null;
    this._powerStatusController = null;
    this._musicTimeController = null;
    this._musicTypeController = null;

    this._powerStatus = { value: SPEAKERS_POWER_STATUS.Off };
    this._musicCurrentTime = { value: 0 };
    this._currentMusicDuration = 0;
    this._currentMusic = null;
    this._currentMusicName = { value: '' };

    this._time = 0;
    this._stepTime = 0.25;
    this._maxMusicNameLength = 23;
    this._currentMusicNameOffset = 0;
    this._currentSong = '';
    this._songNameDirection = 1;
    this._longSongName = false;

    this._init();
    this._checkToDisableFolder();
  }

  update(dt) {
    this._updateMusicName(dt);
  }

  setCurrentMusic(musicType) {
    this._currentMusic = musicType;

    const artist = MUSIC_CONFIG[this._currentMusic].artist;
    const song = MUSIC_CONFIG[this._currentMusic].song;
    this._currentSong = ` ${artist} - ${song} `;

    this._longSongName = false;

    if (this._currentSong.length - 2 > this._maxMusicNameLength) {
      this._longSongName = true;
      this._time = 0;
      this._currentMusicNameOffset = 0;
      this._songNameDirection = 1;
    } else {
      this._currentMusicName.value = this._currentSong.slice(1, this._maxMusicNameLength - 1);
      this._musicTypeController.refresh();
    }
  }

  updateCurrentSongTime(currentTime) {
    this._musicCurrentTime.value = currentTime;
    this._musicTimeController.refresh();
  }

  updateDuration(duration) {
    const stc = this._musicTimeController.controller_.valueController;
    const sc = stc.sliderController;
    sc.props.set("maxValue", duration);

    this._musicTimeController.refresh();
  }

  updatePowerStatus(powerStatus) {
    this._powerStatus.value = powerStatus;
    this._powerButton.title = this._powerStatus.value === SPEAKERS_POWER_STATUS.On ? 'Turn off' : 'Turn on';
    this._powerStatusController.refresh();
  }

  _init() {
    this._powerStatusController = this._debugFolder.addInput(this._powerStatus, 'value', {
      label: 'Power',
      disabled: true,
    });
    this._powerStatusController.customDisabled = true;

    this._powerButton = this._debugFolder.addButton({
      title: 'Turn on',
    }).on('click', () => this.events.post('switch'));

    this._debugFolder.addSeparator();

    this._musicTypeController = this._debugFolder.addInput(this._currentMusicName, 'value', {
      label: 'Music name',
      disabled: true,
    });
    this._musicTypeController.customDisabled = true;

    this._musicTimeController = this._debugFolder.addInput(this._musicCurrentTime, 'value', {
      label: 'Time',
      min: 0,
      max: this._currentMusicDuration,
      disabled: true,
      format: (v) => this._formatTime(v),
    });
    this._musicTimeController.customDisabled = true;

    this._debugFolder.addSeparator();

    const songComeAndGetYourLove = MUSIC_TYPE.ComeAndGetYourLove;
    const songGiorgio = MUSIC_TYPE.Giorgio;
    let selectedMusicType = songGiorgio;

    const songsName = {
      [songComeAndGetYourLove]: `${MUSIC_CONFIG[songComeAndGetYourLove].artist} - ${MUSIC_CONFIG[songComeAndGetYourLove].song}`,
      [songGiorgio]: `${MUSIC_CONFIG[songGiorgio].artist} - ${MUSIC_CONFIG[songGiorgio].song}`,
    }

    this._debugFolder.addBlade({
      view: 'list',
      label: 'Music',
      options: [
        { text: songsName[songComeAndGetYourLove], value: songComeAndGetYourLove },
        { text: songsName[songGiorgio], value: songGiorgio },
      ],
      value: songGiorgio,
    }).on('change', (musicType) => {
      selectedMusicType = musicType.value;
    });

    this._debugFolder.addButton({
      title: 'Set selected music',
    }).on('click', () => this.events.post('switchMusic', selectedMusicType));

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(SPEAKERS_CONFIG, 'helpersEnabled', {
      label: 'Helpers',
    }).on('change', () => this.events.post('onHelpersChanged'));

    this.updatePowerStatus(this._powerStatus.value);
  }

  _updateMusicName(dt) {
    if (!this._longSongName) {
      return;
    }

    this._time += dt;

    if (this._time >= this._stepTime) {
      this._time = 0;

      const fittedSongName = this._currentSong.slice(this._currentMusicNameOffset, this._maxMusicNameLength + this._currentMusicNameOffset)
      this._currentMusicName.value = fittedSongName;
      this._musicTypeController.refresh();

      this._currentMusicNameOffset += this._songNameDirection;

      if (this._currentMusicNameOffset >= this._currentSong.length - this._maxMusicNameLength) {
        this._songNameDirection = -1;
      }

      if (this._currentMusicNameOffset <= 0) {
        this._songNameDirection = 1;
      }
    }
  }

  _formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor(time - minutes * 60);

    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }
}
