import { DisplayObject, Ease, Sprite, Tween } from "black-engine";

export default class ZoomInFrame extends DisplayObject {
  constructor() {
    super();

    this._view = null;
  }

  show() {
    this.visible = true;
    this.scale = 0;

    this.removeComponent(this.getComponent(Tween));

    const tween = new Tween({ scale: 1 }, 0.5, { ease: Ease.backOut });
    this.add(tween);
  }

  hide() {
    this.removeComponent(this.getComponent(Tween));

    const tween = new Tween({ scale: 0 }, 0.3, { ease: Ease.sinusoidalIn });
    tween.on('complete', () => this.visible = false);

    this.add(tween);
  }

  onAdded() {
    this._initView();
  }

  _initView() {
    const view = this._view = new Sprite('zoom-in-frame');
    this.add(view);

    view.alignAnchor(0.5);
  }
}
