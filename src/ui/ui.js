import { Black, DisplayObject, Message } from "black-engine";
import Overlay from "./overlay";
import SoundIcon from "./sound-icon";
import IntroUI from "./intro-ui/intro-ui";

export default class UI extends DisplayObject {
  constructor() {
    super();

    this._overlay = null;
    this._soundIcon = null;
    this._introUI = null;

    this.touchable = true;
  }

  updateSoundIcon() {
    this._soundIcon.updateTexture();
  }

  onIntroStop() {
    this._introUI.onIntroStop();
  }

  onAdded() {
    this._initOverlay();
    this._initSoundIcon();
    this._initIntroUI();
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

  _initIntroUI() {
    const introUI = this._introUI = new IntroUI();
    this.add(introUI);
  }

  _initSignals() {
    this._overlay.on('onPointerMove', (msg, x, y) => this.post('onPointerMove', x, y));
    this._overlay.on('onPointerDown', (msg, x, y) => this.post('onPointerDown', x, y));
    this._overlay.on('onPointerUp', (msg, x, y) => this.post('onPointerUp', x, y));
    this._overlay.on('onPointerLeave', () => this.post('onPointerLeave'));
    this._overlay.on('onWheelScroll', (msg, delta) => this.post('onWheelScroll', delta));
    this._soundIcon.on('onSoundChanged', () => this.post('onSoundChanged'));
    this._introUI.on('onStartClick', () => this.post('onIntroStart'));
    this._introUI.on('onSkipClick', () => this.post('onIntroSkip'));
  }

  _handleResize() {
    const bounds = Black.stage.bounds;

    this._soundIcon.x = bounds.left + 50;
    this._soundIcon.y = bounds.top + 50;
  }
}
