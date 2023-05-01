import { DisplayObject, Message, Sprite } from "black-engine";
import Overlay from "./overlay";
import ZoomInFrame from "./zoom-in-frame";

export default class UI extends DisplayObject {
  constructor() {
    super();

    this._overlay = null;
    this._zoomInFrame = null;

    this.touchable = true;
  }

  setZoomInFramePosition(position) {
    this._zoomInFrame.x = position.x;
    this._zoomInFrame.y = position.y;
  }

  onAdded() {
    this._initOverlay();
    this._initZoomInFrame();

    this.stage.on(Message.RESIZE, this._handleResize, this);
    this._handleResize();
  }

  _initOverlay() {
    const overlay = this._overlay = new Overlay();
    this.add(overlay);

    this._overlay.on('onPointerMove', (msg, x, y) => this.post('onPointerMove', x, y));
    this._overlay.on('onPointerDown', (msg, x, y) => this.post('onPointerDown', x, y));
    this._overlay.on('onPointerUp', (msg, x, y) => this.post('onPointerUp', x, y));
    this._overlay.on('onPointerLeave', () => this.post('onPointerLeave'));
  }

  _initZoomInFrame() {
    const zoomInFrame = this._zoomInFrame = new ZoomInFrame();
    // this.add(zoomInFrame);
  }

  _handleResize() {
    // const bounds = this.stage.bounds;
  }
}
