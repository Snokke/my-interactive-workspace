import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { HELP_ARROWS_CONFIG } from './help-arrows-config';

export default class HelpArrows extends THREE.Group {
  constructor(helpArrowsTypes) {
    super();

    this._helpArrowsTypes = helpArrowsTypes;

    this._init();
  }

  show() {
    this.visible = true;

    if (this._arrowsTween) {
      this._arrowsTween.stop();
    }

    this.scale.set(0, 0, 0);
    this._arrowsTween = new TWEEN.Tween(this.scale)
      .to({ x: 1, y: 1, z: 1 }, 200)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }

  hide() {
    if (this._arrowsTween) {
      this._arrowsTween.stop();
    }

    this._arrowsTween = new TWEEN.Tween(this.scale)
      .to({ x: 0, y: 0, z: 0 }, 200)
      .easing(TWEEN.Easing.Back.In)
      .start()
      .onComplete(() => {
        this.visible = false;
      });
  }

  _init() {
    this._helpArrowsTypes.forEach((type) => {
      const arrow = this._createArrow(type);
      this.add(arrow);
    });

    this.visible = false;
  }

  _createArrow(type) {
    const arrow = new THREE.ArrowHelper(
      HELP_ARROWS_CONFIG[type].direction,
      HELP_ARROWS_CONFIG[type].offset,
      HELP_ARROWS_CONFIG[type].length,
      HELP_ARROWS_CONFIG[type].color,
    );

    return arrow;
  }
}
