import { Black, DisplayObject, Sprite } from "black-engine";

export default class Overlay extends DisplayObject {
  constructor() {
    super();

    this._view = null;

    this.touchable = true;
  }

  onAdded() {
    this._initView();
    this._initSignals();

    Black.stage.on('resize', () => this._onResize());
    this._onResize();
  }

  _initView() {
    const view = this._view = new Sprite('overlay');
    this.add(view);

    view.alpha = 0;
    view.touchable = true;
  }

  _initSignals() {
    this._view.on('pointerDown', (msg, pointer) => {
      this.post('onPointerDown', pointer.x, pointer.y);
    });

    this._view.on('pointerUp', () => {
      this.post('onPointerUp');
    });

    this._view.on('pointerMove', (msg, pointer) => {
      this.post('onPointerMove', pointer.x, pointer.y);
    });

    Black.engine.containerElement.addEventListener("mouseleave", () => {
      this.post('onPointerLeave');
    });
  }

  _onResize() {
    const bounds = Black.stage.bounds;

    this._view.x = bounds.left;
    this._view.y = bounds.top;

    const overlaySize = 10;
    this._view.scaleX = bounds.width / overlaySize;
    this._view.scaleY = bounds.height / overlaySize;
  }
}


      // const deltaX = percentX - this._previousPointerPosition.x;
      // const deltaY = percentY - this._previousPointerPosition.y;

      // this._camera.rotateY(deltaX * 0.000005);
      // this._camera.rotateX(deltaY * 0.000005);

      // this._camera.rotation.y = -percentX * 0.05;
      // this._camera.rotation.x = -percentY * 0.05;

      // const motion = new THREE.Vector3();

      // motion.y += -percentX * 0.05;
      // motion.x += -percentY * 0.05;


      // const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      // euler.x = motion.x;
      // euler.y = motion.y;
      // this._camera.quaternion.setFromEuler(euler);
