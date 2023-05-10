import * as THREE from 'three';
import Button from './button/button';
import { BUTTON_TYPE } from './button/button-config';
import Overlay from './overlay';
import { MessageDispatcher } from 'black-engine';

export default class UI extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._button = null;
    this._overlay = null;

    this._init();
  }

  showLoadingScreen() {
    this._overlay.showLoadingScreen();
  }

  stopLoadingScreen() {
    this._overlay.stopLoadingScreen();
  }

  showLoseScreen() {
    this._button.setType(BUTTON_TYPE.Restart);
    this._button.show();
    this._overlay.showLoseScreen();
  }

  hideLoseScreen() {
    this._button.hide();
    this._overlay.hideLoseScreen();
  }

  showWinScreen() {
    this._button.setType(BUTTON_TYPE.Next);
    this._button.show();
    this._overlay.showWinScreen();
  }

  hideWinScreen() {
    this._button.hide();
    this._overlay.hideWinScreen();
  }

  showTutorial() {
    this._overlay.showTutorial();
  }

  hideTutorial() {
    this._overlay.hideTutorial();
  }

  showLevel() {
    this._overlay.showLevel();
  }

  hideLevel() {
    this._overlay.hideLevel();
  }

  setLevel(level) {
    this._overlay.setLevel(level);
  }

  _init() {
    this._initButton();
    this._initOverlay();
    this._initSignals();
  }

  _initButton() {
    const button = this._button = new Button();
    this.add(button);

    button.position.set(0, -0.27, 0);
  }

  _initOverlay() {
    const overlay = this._overlay = new Overlay();
    this.add(overlay);
  }

  _initSignals() {
    this._overlay.events.on('onLoadingScreenHidden', () => {
      this.events.post('onLoadingScreenHidden');
    });
  }
}
