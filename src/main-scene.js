import { Black } from "black-engine";
import UI from "./ui/ui";
import Scene3D from "./scene/scene3d";

export default class MainScene {
  constructor(data) {

    this._scene = data.scene;
    this._camera = data.camera;
    this._outlinePass = data.outlinePass;

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
    this._scene3D = new Scene3D(this._camera, this._outlinePass);
    this._ui = new UI();

    this._initSignals();
  }

  _initSignals() {
    this._ui.on('onClick', () => {
      this._scene3D.onClick();
    });

    this._ui.on('onPointerMove', (msg, x, y) => this._scene3D.onPointerMove(x, y));
    this._ui.on('onPointerDown', (msg, x, y) => this._scene3D.onPointerDown(x, y));
    // this._ui.on('onPointerUp', () => this._scene3D.onPointerUp());
  }
}
