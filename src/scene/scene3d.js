import * as THREE from 'three';
import RaycasterController from './raycaster-controller';
import Room from './room/room';
import { MessageDispatcher } from 'black-engine';

export default class Scene3D extends THREE.Group {
  constructor(data) {
    super();

    this.events = new MessageDispatcher();

    this._data = data,
    this._scene = data.scene,
    this._camera = data.camera,

    this._raycasterController = null;
    this._room = null;

    this._init();
  }

  update(dt) {
    this._room.update(dt);
  }

  onPointerMove(x, y) {
    this._room.onPointerMove(x, y);
  }

  onPointerDown(x, y) {
    this._room.onPointerDown(x, y);
  }

  onPointerUp(x, y) {
    this._room.onPointerUp(x, y);
  }

  onPointerLeave() {
    this._room.onPointerLeave();
  }

  onWheelScroll(delta) {
    this._room.onWheelScroll(delta);
  }

  onSoundChanged() {
    this._room.onSoundChanged();
  }

  setGameSoundsAnalyzer(soundAnalyser) {
    this._room.setGameSoundsAnalyzer(soundAnalyser);
  }

  onIntroStart() {
    this._room.onIntroStart();
  }

  onIntroSkip() {
    this._room.onIntroSkip();
  }

  _init() {
    this._initRaycaster();
    this._initRoom();
    this._initSignals();
  }

  _initRaycaster() {
    this._raycasterController = new RaycasterController(this._camera);
  }

  _initRoom() {
    const room = this._room = new Room(this._data, this._raycasterController);
    this.add(room);
  }

  _initSignals() {
    this._room.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
    this._room.events.on('onSoundsEnabledChanged', () => this.events.post('onSoundsEnabledChanged'));
    this._room.events.on('onVolumeChanged', () => this.events.post('onVolumeChanged'));
    this._room.events.on('onShowGame', () => this.events.post('onShowGame'));
    this._room.events.on('onHideGame', () => this.events.post('onHideGame'));
    this._room.events.on('onGameKeyPressed', () => this.events.post('onGameKeyPressed'));
    this._room.events.on('onSpeakersPowerChanged', (msg, powerStatus) => this.events.post('onSpeakersPowerChanged', powerStatus));
    this._room.events.on('onSwitchToReserveCamera', () => this.events.post('onSwitchToReserveCamera'));
    this._room.events.on('onIntroStop', () => this.events.post('onIntroStop'));
  }
}
