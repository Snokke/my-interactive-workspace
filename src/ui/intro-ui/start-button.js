import { Black, DisplayObject, Ease, Sprite, TextField, Tween } from "black-engine";

export default class StartButton extends DisplayObject {
  constructor() {
    super();

    this._view = null;

    this.touchable = true;
  }

  show() {
    const tween = new Tween({ scale: 1 }, 0.3, { ease: Ease.backOut });
    this.add(tween);
  }

  hide(delay = 0) {
    const tween = new Tween({ scale: 0 }, 0.3, { ease: Ease.backIn, delay });
    this.add(tween);
  }

  onAdded() {
    this._initView();
    this._initText();
    this._initSignals();
  }

  _initView() {
    const view = this._view = new Sprite('button-green');
    this.add(view);

    view.alignAnchor();
    view.touchable = true;

    view.scale = 0.6;
  }

  _initText() {
    const textField = new TextField('SHOW INTRO', 'Arial', 0xffffff, 31);
    this.add(textField);

    textField.alignPivotOffset();
    // textField.y = -2;
  }

  _initSignals() {
    this._view.on('pointerDown', () => {
      this.post('onClick');
      // this.touchable = false;
    });

    this._view.on('pointerMove', () => {
      Black.engine.containerElement.style.cursor = 'pointer';
    });
  }
}
