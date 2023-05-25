import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import volumeVertexShader from './volume-icon-shaders/volume-icon-vertex.glsl';
import volumeFragmentShader from './volume-icon-shaders/volume-icon-fragment.glsl';
import Loader from '../../../../../core/loader';
import { MONITOR_CONFIG } from '../data/monitor-config';

export default class VolumeIcon {
  constructor(view) {

    this._view = view;

    this._volumeTween = null;
    this._currentVolume = 10;
    this._isSoundEnabled = true;

    this._init();
  }

  onVolumeChanged(volume) {
    this._currentVolume = (volume * 10).toFixed(0);
    const currentVolume = this._isSoundEnabled ? this._currentVolume : 0;

    this._show(currentVolume);
  }

  enableSound() {
    this._isSoundEnabled = true;
    const texture = Loader.assets['volume'];
    this._view.material.uniforms.uTexture.value = texture;

    this._show(this._currentVolume);
  }

  disableSound() {
    this._isSoundEnabled = false;
    const texture = Loader.assets['volume-muted'];
    this._view.material.uniforms.uTexture.value = texture;

    this._show(0);
  }

  _show(currentVolume) {
    if (!this._view.visible) {
      this._view.position.z += MONITOR_CONFIG.hideOffset;
    }

    this._view.visible = true;

    this._view.material.uniforms.uAlpha.value = 1;
    this._view.material.uniforms.uRectsCount.value = currentVolume;

    if (this._volumeTween) {
      this._volumeTween.stop();
    }

    this._volumeTween = new TWEEN.Tween(this._view.material.uniforms.uAlpha)
      .to({ value: 0 }, 600)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(1000)
      .start()
      .onComplete(() => {
        this._view.position.z -= MONITOR_CONFIG.hideOffset;
        this._view.visible = false;
      });
  }

  _init() {
    const texture = Loader.assets['volume'];

    const uniforms = {
      uTexture: { value: texture },
      uRectsCount: { value: this._currentVolume },
      uAlpha: { value: 1 },
    };

    this._view.material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: volumeVertexShader,
      fragmentShader: volumeFragmentShader,
      transparent: true,
    });

    this._view.visible = false;
    this._view.position.z -= MONITOR_CONFIG.hideOffset;
  }
}
