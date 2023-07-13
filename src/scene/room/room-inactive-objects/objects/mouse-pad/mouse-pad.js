import * as THREE from "three";
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Loader from "../../../../../core/loader";
import RoomInactiveObjectAbstract from "../../room-inactive-object-abstract";
import vertexShader from './mix-mousepad-textures-shaders/mix-mousepad-textures-vertex.glsl';
import fragmentShader from './mix-mousepad-textures-shaders/mix-mousepad-textures-fragment.glsl';

export default class MousePad extends RoomInactiveObjectAbstract {
  constructor(roomScene, roomObjectType) {
    super(roomScene, roomObjectType);

    this._secretTextureTween = null;
    this._isSecretTextureActive = false;

    this._addMaterials();
  }

  onLightPercentChange(lightPercent) {
    this._mesh.material.uniforms.uMixPercent.value = lightPercent;
  }

  showSecretTexture() {
    this._isSecretTextureActive = !this._isSecretTextureActive;

    if (this._secretTextureTween) {
      this._secretTextureTween.stop();
    }

    const secretTextureObject = { value: this._mesh.material.uniforms.uMixSecret.value };
    const endValue = this._isSecretTextureActive ? 1 : 0;

    this._secretTextureTween = new TWEEN.Tween(secretTextureObject)
      .to({ value: endValue }, 2500)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        this._mesh.material.uniforms.uMixSecret.value = secretTextureObject.value;
      })
  }

  _addMaterials() {
    const bakedStandardTextureLightOn = Loader.assets['baked-textures/baked-mousepad-black-light-on'];
    bakedStandardTextureLightOn.flipY = false;

    const bakedStandardTextureLightOff = Loader.assets['baked-textures/baked-mousepad-black-light-off'];
    bakedStandardTextureLightOff.flipY = false;

    const bakedSecretTextureLightOn = Loader.assets['baked-textures/baked-mousepad-color-light-on'];
    bakedSecretTextureLightOn.flipY = false;

    const bakedSecretTextureLightOff = Loader.assets['baked-textures/baked-mousepad-color-light-off'];
    bakedSecretTextureLightOff.flipY = false;

    const material = new THREE.ShaderMaterial({
      uniforms:
      {
        uTexture01: { value: bakedStandardTextureLightOff },
        uTexture02: { value: bakedStandardTextureLightOn },
        uTexture03: { value: bakedSecretTextureLightOff },
        uTexture04: { value: bakedSecretTextureLightOn },
        uMixPercent: { value: 1 },
        uMixSecret: { value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    this._mesh.material = material;
  }
}
