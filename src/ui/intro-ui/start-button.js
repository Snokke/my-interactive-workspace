import { Black, DisplayObject, Ease, Sprite, TextField, Tween } from "black-engine";
import Delayed from "../../core/helpers/delayed-call";

export default class StartButton extends DisplayObject {
  constructor() {
    super();

    this._view = null;
    this._isHided = false;

    this.touchable = true;
  }

  show() {
    const tween = new Tween({ scale: 1 }, 0.3, { ease: Ease.backOut });
    this.add(tween);
  }

  hide(delay = 0) {
    this._isHided = true;

    const previousTween = this.getComponent(Tween);
    if (previousTween) {
      previousTween.removeFromParent();
    }

    const tween = new Tween({ scale: 0 }, 0.3, { ease: Ease.backIn, delay });
    this.add(tween);
  }

  onAdded() {
    this._initView();
    this._initText();
    this._initSignals();

    this.visible = false;

    this._pulse();
  }

  _initView() {
    const view = this._view = new Sprite('button-green');
    this.add(view);

    view.alignAnchor();
    view.touchable = true;

    // view.scale = 0.6;
  }

  _initText() {
    const textField = new TextField('SHOW INTRO', 'Arial', 0xffffff, 31);
    this.add(textField);

    // textField.highQuality = true;

    textField.alignPivotOffset();
  }

  _initSignals() {
    this._view.on('pointerDown', () => {
      this.post('onClick');
    });

    this._view.on('pointerMove', () => {
      Black.engine.containerElement.style.cursor = 'pointer';
    });
  }

  _pulse() {
    Delayed.call(4000, () => {
      if (this._isHided) {
        return;
      }

      this._pulseOnce();
      this._pulse();

      Delayed.call(810, () => {
        if (this._isHided) {
          return;
        }

        this._pulseOnce();
      })
    })
  }

  _pulseOnce() {
    const tween = new Tween({ scale: [1.025, 1] }, 0.8, { ease: Ease.sinusoidalInOut });
    this.add(tween);
  }
}
