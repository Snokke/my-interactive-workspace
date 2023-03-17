import { DisplayObject, Message, Sprite } from "black-engine";
import Overlay from "./overlay";

export default class UI extends DisplayObject {
  constructor() {
    super();

    this._button = null;

    this.touchable = true;
  }

  onAdded() {
    this._initOverlay();

    this.stage.on(Message.RESIZE, this._handleResize, this);
    this._handleResize();
  }

  _initOverlay() {
    const overlay = this._overlay = new Overlay();
    this.add(overlay);

    this._overlay.on('onPointerMove', (msg, x, y) => this.post('onPointerMove', x, y));
    this._overlay.on('onPointerDown', (msg, x, y) => this.post('onPointerDown', x, y));
    this._overlay.on('onPointerUp', () => this.post('onPointerUp'));
  }

  _handleResize() {
    // const bounds = this.stage.bounds;
  }
}
