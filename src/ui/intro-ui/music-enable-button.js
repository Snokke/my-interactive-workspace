import { Black, DisplayObject, Ease, Sprite, TextField, Tween } from "black-engine";
import { INTRO_CONFIG } from "../../scene/room/intro/intro-config";

export default class MusicEnableButton extends DisplayObject {
  constructor() {
    super();

    this._text = null;
    this._checkbox = null;

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

  onAdded() {
    this._initText();
    this._initCheckbox();
    this._initSignals();
  }

  _initText() {
    const text = this._text = new TextField('ENABLE MUSIC', 'Arial', 0xe5e5e5, 19);
    this.add(text);

    text.touchable = true;
    text.x = -15;

    text.alignPivotOffset();
  }

  _initCheckbox() {
    const checkbox = this._checkbox = new Sprite('checkbox_checked');
    this.add(checkbox);

    checkbox.touchable = true;

    checkbox.alignPivotOffset();
    checkbox.scale = 0.16;
    checkbox.x = this._text.width / 2 + 20 - 15;
    checkbox.y = -2;
  }

  _initSignals() {
    this._text.on('pointerDown', () => {
      this._updateCheckbox();
    });

    this._checkbox.on('pointerDown', () => {
      this._updateCheckbox();
    });

    this._text.on('pointerMove', () => {
      Black.engine.containerElement.style.cursor = 'pointer';
    });
  }

  _updateCheckbox() {
    INTRO_CONFIG.isMusicEnabled = !INTRO_CONFIG.isMusicEnabled;

    if (INTRO_CONFIG.isMusicEnabled) {
      this._checkbox.textureName = 'checkbox_checked';
    } else {
      this._checkbox.textureName = 'checkbox_unchecked';
    }
  }
}
