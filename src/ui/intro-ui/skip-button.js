import { Black, DisplayObject, Ease, TextField, Tween } from "black-engine";

export default class SkipButton extends DisplayObject {
  constructor() {
    super();

    this._view = null;
    this._state = SkipButton.State.Default;

    this.touchable = true;
  }

  show() {
    const tween = new Tween({ scale: 1 }, 0.3, { ease: Ease.backOut });
    this.add(tween);
  }

  hide(delay = 0) {
    if (this.scale === 0) {
      return;
    }

    const tween = new Tween({ scale: 0 }, 0.3, { ease: Ease.backIn, delay });
    this.add(tween);
  }

  setState(state) {
    this._state = state;
  }

  getState() {
    return this._state;
  }

  onAdded() {
    this._initView();
    this._initSignals();

    this.visible = false;
  }

  _initView() {
    const view = this._view = new TextField('SKIP INTRO', 'Arial', 0xb3b3b3, 26); // 0xe5e5e5
    this.add(view);

    view.touchable = true;
    view.highQuality = true;

    view.alignPivotOffset();
  }

  _initSignals() {
    this._view.on('pointerDown', () => {
      this.post('onClick');
    });

    this._view.on('pointerMove', () => {
      Black.engine.containerElement.style.cursor = 'pointer';
    });
  }
}

SkipButton.State = {
  Default: 'DEFAULT',
  DuringIntro: 'DURING_INTRO',
}
