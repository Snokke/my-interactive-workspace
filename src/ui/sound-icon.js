import { Black, DisplayObject, Sprite } from "black-engine";
import { SOUNDS_CONFIG } from "../scene/room/data/sounds-config";

export default class SoundIcon extends DisplayObject {
  constructor() {
    super();

    this._view = null;

    this.touchable = true;
  }

  updateTexture() {
    this._view.textureName = this._getTexture();
  }

  onAdded() {
    this._initView();
    this._initSignals();
  }

  _initView() {
    const view = this._view = new Sprite(this._getTexture());
    this.add(view);

    view.alignAnchor();
    view.touchable = true;

    view.scale = 0.4;
  }

  _getTexture() {
    return SOUNDS_CONFIG.enabled ? 'sound-icon' : 'sound-icon-mute';
  }

  _initSignals() {
    this._view.on('pointerDown', () => {
      SOUNDS_CONFIG.enabled = !SOUNDS_CONFIG.enabled;
      this.updateTexture();
      this.post('onSoundChanged');
    });
  }
}
