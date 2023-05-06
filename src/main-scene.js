import { Black, MessageDispatcher } from "black-engine";
import UI from "./ui/ui";
import Scene3D from "./scene/scene3d";

export default class MainScene {
  constructor(data) {
    this.events = new MessageDispatcher();

    this._data = data;
    this._scene = data.scene;
    this._camera = data.camera;

    this._init();
  }

  afterAssetsLoad() {
    Black.stage.addChild(this._ui);
    this._scene.add(this._scene3D);
  }

  update(dt) {
    this._scene3D.update(dt);
  }

  _init() {
    this._scene3D = new Scene3D(this._data);
    this._ui = new UI();

    this._initSignals();
  }

  _initSignals() {
    this._ui.on('onPointerMove', (msg, x, y) => this._scene3D.onPointerMove(x, y));
    this._ui.on('onPointerDown', (msg, x, y) => this._scene3D.onPointerDown(x, y));
    this._ui.on('onPointerUp', (msg, x, y) => this._scene3D.onPointerUp(x, y));
    this._ui.on('onPointerLeave', () => this._scene3D.onPointerLeave());
    this._ui.on('onWheelScroll', (msg, delta) => this._scene3D.onWheelScroll(delta));
    this._scene3D.events.on('fpsMeterChanged', () => this.events.post('fpsMeterChanged'));
  }
}
