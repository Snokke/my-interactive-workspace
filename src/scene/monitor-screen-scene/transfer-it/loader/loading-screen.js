import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { MessageDispatcher } from 'black-engine';
import { UI_CONFIG } from '../game-screen/ui/ui-config';

export default class LoadingScreen extends THREE.Group {
  constructor() {
    super();

    this.events = new MessageDispatcher();

    this._bitmap = null;

    this._loadingScreenTween = null;

    this._init();
  }

  show() {
    this.visible = true;

    this._drawLoadingScreen();
    this._stopTweens();
  }

  showFake() {
    this.visible = true;

    this._drawLoadingScreen();
    this._stopTweens();

    const object = { value: 0 };

    this._loadingScreenTween = new TWEEN.Tween(object)
      .to({ value: 1.25 }, 400)
      .easing(TWEEN.Easing.Quadratic.In)
      .start()
      .onUpdate(() => {
        const progress = Math.min(object.value, 1);
        this.updateProgressBar(progress);
      })
      .onComplete(() => {
        this.events.post('onLoadingScreenHidden');
      });
  }

  hide() {
    this._stopTweens();
    this.visible = false;
  }

  updateProgressBar(progress) {
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

  _stopTweens() {
    if (this._loadingScreenTween) {
      this._loadingScreenTween.stop();
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

  _init() {
    this._initBitmap();
    this._initView();
    this._initText();

    this.visible = false;
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
