import { Black, MessageDispatcher } from "black-engine";
import UI from "./ui/ui";
import Scene3D from "./scene/scene3d";
import MonitorScreenScene from "./scene/monitor-screen-scene/monitor-screen-scene";

export default class MainScene {
  constructor(data) {
    this.events = new MessageDispatcher();

    this._data = data;
    this._scene = data.scene;
    this._camera = data.camera;

    this._scene3D = null;
    this._ui = null;
    this._monitorScreenScene = null;
    this._isGameActive = false;

    this._init();
  }

  afterAssetsLoad() {
    Black.stage.addChild(this._ui);
    this._scene.add(this._scene3D);
  }

  update(dt) {
    this._scene3D.update(dt);

    if (this._isGameActive) {
      this._monitorScreenScene.update(dt);
    }
  }

  _init() {
    this._scene3D = new Scene3D(this._data);
    this._ui = new UI();
    this._monitorScreenScene = new MonitorScreenScene(this._data.monitorScreenData);

    this._initSignals();
  }

  _initSignals() {
    this._ui.on('onPointerMove', (msg, x, y) => this._scene3D.onPointerMove(x, y));
    this._ui.on('onPointerDown', (msg, x, y) => this._scene3D.onPointerDown(x, y));
    this._ui.on('onPointerUp', (msg, x, y) => this._scene3D.onPointerUp(x, y));
    this._ui.on('onPointerLeave', () => this._scene3D.onPointerLeave());
    this._ui.on('onWheelScroll', (msg, delta) => this._scene3D.onWheelScroll(delta));
    this._ui.on('onSoundChanged', () => this._scene3D.onSoundChanged());
    this._ui.on('onIntroStart', () => this._scene3D.onIntroStart());
    this._ui.on('onIntroSkip', () => this._scene3D.onIntroSkip());

    this._scene3D.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
    this._scene3D.events.on('onSoundsEnabledChanged', () => this._onSoundsEnabledChanged());
    this._scene3D.events.on('onVolumeChanged', () => this._onVolumeChanged());
    this._scene3D.events.on('onShowGame', () => this._onShowGame());
    this._scene3D.events.on('onHideGame', () => this._onHideGame());
    this._scene3D.events.on('onGameKeyPressed', () => this._monitorScreenScene.onKeyPressed());
    this._scene3D.events.on('onSpeakersPowerChanged', (msg, powerStatus) => this._monitorScreenScene.onSpeakersPowerChanged(powerStatus));
    this._scene3D.events.on('onSwitchToReserveCamera', () => this.events.post('onSwitchToReserveCamera'));
    this._scene3D.events.on('onIntroStop', () => this._ui.onIntroStop());

    this._monitorScreenScene.events.on('onTransferItAssetsLoaded', () => this._onTransferItAssetsLoaded());
  }

  _onSoundsEnabledChanged() {
    this._ui.updateSoundIcon();
    this._monitorScreenScene.onSoundsEnabledChanged();
  }

  _onVolumeChanged() {
    this._monitorScreenScene.onVolumeChanged();
  }

  _onShowGame() {
    this._isGameActive = true;
    this._monitorScreenScene.startGame();
    this.events.post('onShowGame');
  }

  _onHideGame() {
    this._isGameActive = false;
    this._monitorScreenScene.stopGame();
    this.events.post('onHideGame');
  }

  _onTransferItAssetsLoaded() {
    const gameSoundsAnalyzer = this._monitorScreenScene.getSoundsAnalyzer();
    this._scene3D.setGameSoundsAnalyzer(gameSoundsAnalyzer);
  }
}
