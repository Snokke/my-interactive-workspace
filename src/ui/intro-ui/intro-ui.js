import { Black, DisplayObject } from "black-engine";
import StartButton from "./start-button";
import SkipButton from "./skip-button";
import Delayed from "../../core/helpers/delayed-call";

export default class IntroUI extends DisplayObject {
  constructor() {
    super();

    this._buttonStart = null;
    this._buttonSkip = null;

    this.touchable = true;
  }

  onAdded() {
    this._init();
    this._initSignals();

    Black.stage.on('resize', () => this._onResize());
    this._onResize();
  }

  show() {
    this._buttonStart.show();
    this._buttonSkip.show();
  }

  onIntroStop() {
    this._buttonSkip.hide();
  }

  _hide() {
    this._buttonStart.hide(0.1);
    this._buttonSkip.hide();
  }

  _hideForIntro() {
    this._buttonStart.hide();
    this._buttonSkip.hide(0.1);

    Delayed.call(500, () => {
      this._showSkipButtonForIntro();
    });
  }

  _showSkipButtonForIntro() {
    this._buttonSkip.setState(SkipButton.State.DuringIntro);

    const bounds = Black.stage.bounds;
    this._buttonSkip.y = bounds.bottom - 60;

    this._buttonSkip.show();
  }

  _init() {
    this._initButtonStart();
    this._initButtonSkip();
  }

  _initButtonStart() {
    const buttonStart = this._buttonStart = new StartButton();
    this.add(buttonStart);
  }

  _initButtonSkip() {
    const buttonSkip = this._buttonSkip = new SkipButton();
    this.add(buttonSkip);
  }

  _initSignals() {
    this._buttonStart.on('onClick', () => this._onStartClick());
    this._buttonSkip.on('onClick', () => this._onSkipClick());
  }

  _onStartClick() {
    this._hideForIntro();
    this.post('onStartClick');
  }

  _onSkipClick() {
    this._hide();
    this.post('onSkipClick');
  }

  _onResize() {
    const bounds = Black.stage.bounds;

    this._buttonStart.x = bounds.left + bounds.width * 0.5;
    this._buttonStart.y = bounds.top + bounds.height * 0.5;

    if (this._buttonSkip.getState() === SkipButton.State.DuringIntro) {
      this._buttonSkip.x = bounds.left + bounds.width * 0.5;
      this._buttonSkip.y = bounds.bottom - 60;
    } else {
      this._buttonSkip.x = bounds.left + bounds.width * 0.5;
      this._buttonSkip.y = bounds.top + bounds.height * 0.5 + 80;
    }
  }
}
