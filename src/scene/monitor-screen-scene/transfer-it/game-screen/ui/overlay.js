import * as THREE from 'three';
import { UI_CONFIG } from './ui-config';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { MessageDispatcher } from 'black-engine';

export default class Overlay extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._bitmap = null;
    this._isLevelVisible = false;
    this._currentLevel = 0;
    this._isTutorialVisible = false;
    this._isLoseScreenVisible = false;
    this._isWinScreenVisible = false;
    this._isLoadingScreenVisible = false;

    this._loadingScreenTween = null;

    this._init();
  }

  showLoadingScreen() {
    this._isLoadingScreenVisible = true;
    this._drawLoadingScreen();
    this.stopLoadingScreen();

    const object = { value: 0 };

    this._loadingScreenTween = new TWEEN.Tween(object)
      .to({ value: 1.25 }, 1000)
      .easing(TWEEN.Easing.Quadratic.In)
      .start()
      .onUpdate(() => {
        const progress = Math.min(object.value, 1);
        this._updateProgressBar(progress);
      })
      .onComplete(() => {
        this._isLoadingScreenVisible = false;
        this.events.post('onLoadingScreenHidden');
      });
  }

  stopLoadingScreen() {
    if (this._loadingScreenTween) {
      this._loadingScreenTween.stop();
    }
  }

  showWinScreen() {
    this._isWinScreenVisible = true;
    this._updateOverlay();
  }

  hideWinScreen() {
    this._isWinScreenVisible = false;
    this._updateOverlay();
  }

  showLoseScreen() {
    this._isLoseScreenVisible = true;
    this._updateOverlay();
  }

  hideLoseScreen() {
    this._isLoseScreenVisible = false;
    this._updateOverlay();
  }

  showLevel() {
    this._isLevelVisible = true;
    this._updateOverlay();
  }

  hideLevel() {
    this._isLevelVisible = false;
    this._updateOverlay();
  }

  setLevel(level) {
    this._currentLevel = level;
    this._updateOverlay();
  }

  showTutorial() {
    this._isTutorialVisible = true;
    this._updateOverlay();
  }

  hideTutorial() {
    this._isTutorialVisible = false;
    this._updateOverlay();
  }

  _updateOverlay() {
    if (this._isLoadingScreenVisible) {
      return;
    }

    const context = this._bitmap.getContext('2d');
    context.clearRect(0, 0, this._bitmap.width, this._bitmap.height);

    this._drawLoseScreen(context);
    this._drawWinScreen(context);
    this._drawLevel(context);
    this._drawTutorial(context);

    this._view.material.map.needsUpdate = true;
  }

  _drawLoseScreen(context) {
    if (this._isLoseScreenVisible) {
      const x = this._bitmap.width * 0.5;
      const y = this._bitmap.height * 0.2;
      const width = 1400;
      const height = 320;

      context.fillStyle = '#ffffff';
      context.beginPath();
      context.rect(x - width * 0.5, y - height * 0.5, width, height + 15);
      context.fill();

      context.fillStyle = '#ff0000';
      context.beginPath();
      context.rect(x - width * 0.5, y - height * 0.5, width, height);
      context.fill();

      context.font = '70px Arial';
      context.fillStyle = '#ffffff';
      context.fillText('FAILED', this._bitmap.width * 0.5, this._bitmap.height * 0.21);
    }
  }

  _drawWinScreen(context) {
    if (this._isWinScreenVisible) {
      const x = this._bitmap.width * 0.5;
      const y = this._bitmap.height * 0.2;
      const width = 1400;
      const height = 320;

      context.fillStyle = '#ffffff';
      context.beginPath();
      context.rect(x - width * 0.5, y - height * 0.5, width, height + 15);
      context.fill();

      context.fillStyle = '#0000ff';
      context.beginPath();
      context.rect(x - width * 0.5, y - height * 0.5, width, height);
      context.fill();

      context.font = '70px Arial';
      context.fillStyle = '#ffffff';
      context.fillText('PASSED', this._bitmap.width * 0.5, this._bitmap.height * 0.21);
    }
  }

  _drawLevel(context) {
    if (this._isLevelVisible) {
      const x = this._bitmap.width * 0.5;
      const y = this._bitmap.height * 0.1;
      const width = 300;
      const height = 70;

      context.fillStyle = '#ffffff';
      context.beginPath();
      context.roundRect(x - width * 0.5, y - height * 0.5, width, height, 40);
      context.fill();

      context.font = '45px Arial';
      context.fillStyle = '#000000';
      context.fillText(`Level ${this._currentLevel}`, x, y + 3);
    }
  }

  _drawTutorial(context) {
    if (this._isTutorialVisible) {
      context.font = '60px Arial';
      context.fillStyle = '#000000';
      context.fillText('Press any key to drop', this._bitmap.width * 0.5, this._bitmap.height * 0.85);
    }
  }

  _drawLoadingScreen() {
    const context = this._bitmap.getContext('2d');
    context.clearRect(0, 0, this._bitmap.width, this._bitmap.height);

    const fullWidth = 1400;
    const fullHeight = 900;

    context.fillStyle = '#000000';
    context.beginPath();
    context.rect(0, 0, fullWidth, fullHeight);
    context.fill();

    const width = 400;
    const height = 30;
    const centerX = this._bitmap.width * 0.5;
    const centerY = this._bitmap.height * 0.5;
    const border = 3;

    context.fillStyle = '#ffffff';
    context.beginPath();
    context.rect(centerX - width * 0.5, centerY - height * 0.5, width, height);
    context.fill();

    context.fillStyle = '#000000';
    context.beginPath();
    context.rect(centerX - width * 0.5 + border, centerY - height * 0.5 + border, width - border * 2, height - border * 2);
    context.fill();

    context.font = '40px Arial';
    context.fillStyle = '#ffffff';
    context.fillText('Loading...', this._bitmap.width * 0.5 + 15, this._bitmap.height * 0.5 - 50);

    this._view.material.map.needsUpdate = true;
  }

  _updateProgressBar(progress) {
    const context = this._bitmap.getContext('2d');

    const width = 400;
    const height = 30;
    const centerX = this._bitmap.width * 0.5;
    const centerY = this._bitmap.height * 0.5;
    const border = 3;
    const innerBorder = 4;

    const leftX = centerX - width * 0.5 + border;
    const topY = centerY - height * 0.5 + border;

    context.clearRect(leftX, topY, width - border * 2, height - border * 2);

    context.fillStyle = '#000000';
    context.beginPath();
    context.rect(leftX, topY, width - border * 2, height - border * 2);
    context.fill();

    const progressBarWidth = (width - border * 2 - innerBorder * 2);

    context.fillStyle = '#ffffff';
    context.beginPath();
    context.rect(leftX + innerBorder, topY + innerBorder, progressBarWidth * progress, height - border * 2 - innerBorder * 2);
    context.fill();

    this._view.material.map.needsUpdate = true;
  }

  _init() {
    this._initBitmap();
    this._initView();
    this._initText();
  }

  _initView() {
    const geometry = new THREE.PlaneGeometry(1.48, 0.84);
    const material = new THREE.MeshBasicMaterial({
      map: this._texture,
      transparent: true,
    });

    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);
  }

  _initBitmap() {
    const bitmap = this._bitmap = document.createElement('canvas');
    bitmap.width = UI_CONFIG.size.x * UI_CONFIG.overlayResolution;
    bitmap.height = UI_CONFIG.size.y * UI_CONFIG.overlayResolution;

    this._texture = new THREE.Texture(bitmap);
  }

  _initText() {
    const context = this._bitmap.getContext('2d');
    context.textAlign = 'center';
    context.textBaseline = 'middle';
  }
}
