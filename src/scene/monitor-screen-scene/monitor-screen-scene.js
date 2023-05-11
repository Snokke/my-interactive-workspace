import TransferItGame from './transfer-it/transfer-it-game';

export default class MonitorScreenScene {
  constructor(data) {

    this._scene = data.scene;
    this._camera = data.camera;
    this._audioListener = data.audioListener;

    this._init();
  }

  onKeyPressed() {
    this._transferItGame.onInputDown();
  }

  startGame() {
    this._transferItGame.startGame();
  }

  stopGame() {
    this._transferItGame.stopGame();
  }

  update(dt) {
    this._transferItGame.update(dt);
  }

  getSoundsAnalyzer() {
    return this._transferItGame.getSoundsAnalyzer();
  }

  onSoundsEnabledChanged() {
    this._transferItGame.onSoundsEnabledChanged();
  }

  onVolumeChanged() {
    this._transferItGame.onVolumeChanged();
  }

  onSpeakersPowerChanged(powerStatus) {
    this._transferItGame.onSpeakersPowerChanged(powerStatus);
  }

  _init() {
    const transferItGame = this._transferItGame = new TransferItGame(this._scene, this._camera, this._audioListener);
    this._scene.add(transferItGame);
  }
}
