import * as THREE from 'three';
import { UI_CONFIG } from './ui-config';
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

    this._init();
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

      this._roundRect(context, x - width * 0.5, y - height * 0.5, width, height, 40, true, false);
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

  _roundRect(ctx, x, y, width, height, radius = 5, fill = false, stroke = true) {
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
      radius = { ...{ tl: 0, tr: 0, br: 0, bl: 0 }, ...radius };
    }

    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();

    if (fill) {
      ctx.fill();
    }

    if (stroke) {
      ctx.stroke();
    }
  }
}
