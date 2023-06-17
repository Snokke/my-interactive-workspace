// Coffee steam shaders by Bruno Simon

import * as THREE from 'three';
import vertexShader from './coffee-steam-shaders/coffee-steam-vertex.glsl';
import fragmentShader from './coffee-steam-shaders/coffee-steam-fragment.glsl';
import { COFFEE_STEAM_CONFIG } from './coffee-steam-config';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';

export default class CoffeeSteam extends THREE.Group {
  constructor() {
    super();

    this._mesh = null;
    this._windPowerTween = null;
    this._windAngleTween = null;
    this._time = 0;

    this._windPower = { value: 0 };
    this._windAngle = { value: 0 };
    this._isWindowOpen = false;
    this._isAirConditionerOn = false;

    this._init();
  }

  update(dt) { // eslint-disable-line
    this._mesh.material.uniforms.uTime.value = this._time;
    this._time += dt * 1000;
  }

  onStartSnowing() {
    this._isAirConditionerOn = true;

    if (!this._isWindowOpen) {
      this._setWindAngle(COFFEE_STEAM_CONFIG.wind.airConditionerAngle);
      this._windPowerChange(COFFEE_STEAM_CONFIG.wind.power);
    }
  }

  onStopSnowing() {
    this._isAirConditionerOn = false;

    if (!this._isWindowOpen) {
      this._windPowerChange(0);
    }
  }

  onWindowOpened() {
    this._isWindowOpen = true;

    if (this._isAirConditionerOn) {
      this._windAngleChange(COFFEE_STEAM_CONFIG.wind.windowAngle);
    } else {
      this._setWindAngle(COFFEE_STEAM_CONFIG.wind.windowAngle);
      this._windPowerChange(COFFEE_STEAM_CONFIG.wind.power);
    }
  }

  onWindowClosed() {
    this._isWindowOpen = false;

    if (this._isAirConditionerOn) {
      this._windAngleChange(COFFEE_STEAM_CONFIG.wind.airConditionerAngle);
    } else {
      this._windPowerChange(0);
    }

  }

  onWindowOpen() {
    this._onWindChange(COFFEE_STEAM_CONFIG.wind.power, COFFEE_STEAM_CONFIG.wind.windowAngle);
  }

  onWindStop() {
    this._onWindChange(0, COFFEE_STEAM_CONFIG.wind.airConditionerAngle);
  }

  _windAngleChange(endAngle) {
    if (this._windAngleTween) {
      this._windAngleTween.stop();
    }

    this._windAngleTween = new TWEEN.Tween(this._windAngle)
      .to({ value: endAngle }, COFFEE_STEAM_CONFIG.wind.transitionDuration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .onUpdate(() => {
        this._setWindAngle(this._windAngle.value);
      })
      .start();
  }

  _windPowerChange(endPower) {
    if (this._windPowerTween) {
      this._windPowerTween.stop();
    }

    this._windPowerTween = new TWEEN.Tween(this._windPower)
      .to({ value: endPower }, COFFEE_STEAM_CONFIG.wind.transitionDuration)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .onUpdate(() => {
        this._mesh.material.uniforms.uWindPower.value = this._windPower.value;
      })
      .start();
  }

  _setWindAngle(angle) {
    this._windAngle.value = angle;
    const startAngle = COFFEE_STEAM_CONFIG.startRotatingAngle * THREE.MathUtils.DEG2RAD;
    this._mesh.material.uniforms.uWindAngle.value = angle * THREE.MathUtils.DEG2RAD + startAngle;
  }

  _init() {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uTimeFrequency: { value: 0.00001 * COFFEE_STEAM_CONFIG.speed },
        uUvFrequency: { value: new THREE.Vector2(4, 5) },
        uColor: { value: new THREE.Color('#aaaaaa') },
        uWindAngle: { value: 0 },
        uWindPower: { value: 0 },
      },
    });

    const geometry = new THREE.PlaneGeometry(0.3, 1.2, 8, 30);
    geometry.translate(0, 0.6, 0);

    const mesh = this._mesh = new THREE.Mesh(geometry, material);
    this.add(mesh);

    mesh.rotation.y = -COFFEE_STEAM_CONFIG.startRotatingAngle * THREE.MathUtils.DEG2RAD;
    mesh.position.y += 0.1;
  }
}
