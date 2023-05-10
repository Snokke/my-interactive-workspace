import TransferItGame from './transfer-it/transfer-it-game';

export default class MonitorScreenScene {
  constructor(data) {

    this._scene = data.scene;
    this._camera = data.camera;

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

  _init() {
    const transferItGame = this._transferItGame = new TransferItGame(this._scene, this._camera);
    this._scene.add(transferItGame);
  }
}
