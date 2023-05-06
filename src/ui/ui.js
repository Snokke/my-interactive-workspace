import { Black, DisplayObject, Message } from "black-engine";
import Overlay from "./overlay";
import SoundIcon from "./sound-icon";

export default class UI extends DisplayObject {
  constructor() {
    super();

    this._overlay = null;
    this._soundIcon = null;

    this.touchable = true;
  }

  updateSoundIcon() {
    this._soundIcon.updateTexture();
  }

  onAdded() {
    this._initOverlay();
    this._initSoundIcon();
    this._initSignals();

    this.stage.on(Message.RESIZE, this._handleResize, this);
    this._handleResize();
  }

  _initOverlay() {
    const overlay = this._overlay = new Overlay();
    this.add(overlay);
  }

  _initSoundIcon() {
    const soundIcon = this._soundIcon = new SoundIcon();
    this.add(soundIcon);
  }

  _initSignals() {
    this._overlay.on('onPointerMove', (msg, x, y) => this.post('onPointerMove', x, y));
    this._overlay.on('onPointerDown', (msg, x, y) => this.post('onPointerDown', x, y));
    this._overlay.on('onPointerUp', (msg, x, y) => this.post('onPointerUp', x, y));
    this._overlay.on('onPointerLeave', () => this.post('onPointerLeave'));
    this._overlay.on('onWheelScroll', (msg, delta) => this.post('onWheelScroll', delta));
    this._soundIcon.on('onSoundChanged', () => this.post('onSoundChanged'));
  }

  _handleResize() {
    const bounds = Black.stage.bounds;

    this._soundIcon.x = bounds.left + 50;
    this._soundIcon.y = bounds.top + 50;
  }
}
