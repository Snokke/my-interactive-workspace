import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG, MUSIC_CONFIG } from "./laptop-config";
import { LAPTOP_POSITION_STATE, MUSIC_TYPE } from "./laptop-data";

export default class LaptopDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._topPanelStateController = null;
    this._topPanelPositionController = null;
    this._mountAngleController = null;
    this._musicTimeController = null;
    this._musicTypeController = null;

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

  updateLaptopButtonTitle() {
    this._openLaptopButton.title = LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Opened ? 'Open laptop' : 'Close laptop';
  }

  updateTopPanelState() {
    this._topPanelStateController.refresh();
  }

  updateMountAngle() {
    this._mountAngleController.refresh();
  }

  update(dt) {
    this._updateMusicName(dt);
  }

  setCurrentSong(musicType) {
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

  _init() {
    this._initLaptopDebug();
    this._initMusicDebug();
  }

  _initLaptopDebug() {
    this._topPanelStateController = this._debugFolder.addInput(LAPTOP_CONFIG, 'state', {
      label: 'Panel state',
      disabled: true,
    });
    this._topPanelStateController.customDisabled = true;

    this._openLaptopButton = this._debugFolder.addButton({
      title: 'Close laptop',
    }).on('click', () => this.events.post('openLaptop'));

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(LAPTOP_CONFIG, 'rotationSpeed', {
      label: 'Open speed',
      min: 1,
      max: 100,
    });

    this._debugFolder.addInput(LAPTOP_CONFIG, 'maxOpenAngle', {
      label: 'Open angle',
      min: 1,
      max: 180,
    });

    this._debugFolder.addSeparator();

    this._mountAngleController = this._debugFolder.addInput(LAPTOP_MOUNT_CONFIG, 'angle', {
      label: 'Mount angle',
      min: 0,
      max: 35,
    }).on('change', () => this.events.post('mountAngleChanged'));

    this._debugFolder.addSeparator();
  }

  _initMusicDebug() {
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
    const songSeptember = MUSIC_TYPE.September;
    let selectedMusicType = songGiorgio;

    const songsName = {
      [songGiorgio]: `${MUSIC_CONFIG[songGiorgio].artist} - ${MUSIC_CONFIG[songGiorgio].song}`,
      [songComeAndGetYourLove]: `${MUSIC_CONFIG[songComeAndGetYourLove].artist} - ${MUSIC_CONFIG[songComeAndGetYourLove].song}`,
      [songSeptember]: `${MUSIC_CONFIG[songSeptember].artist} - ${MUSIC_CONFIG[songSeptember].song}`,
    }

    this._debugFolder.addBlade({
      view: 'list',
      label: 'Music',
      options: [
        { text: songsName[songGiorgio], value: songGiorgio },
        { text: songsName[songComeAndGetYourLove], value: songComeAndGetYourLove },
        { text: songsName[songSeptember], value: songSeptember },
      ],
      value: songGiorgio,
    }).on('change', (musicType) => {
      selectedMusicType = musicType.value;
    });

    this._debugFolder.addButton({
      title: 'Play music',
    }).on('click', () => this.events.post('playMusic', selectedMusicType));

    this._debugFolder.addButton({
      title: 'Stop music',
    }).on('click', () => this.events.post('stopMusic'));
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
