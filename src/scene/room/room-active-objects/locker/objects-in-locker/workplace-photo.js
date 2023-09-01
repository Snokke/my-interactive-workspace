import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Loader from '../../../../../core/loader';
import workplacePhotoVertexShader from '../../../shared/mix-three-textures-shaders/mix-three-textures-vertex.glsl';
import workplacePhotoFragmentShader from '../../../shared/mix-three-textures-shaders/mix-three-textures-fragment.glsl';
import ObjectInLockerAbstract from './object-in-locker.abstract';

export default class WorkplacePhoto extends ObjectInLockerAbstract {
  constructor(view, caseType) {
    super(view, caseType);

    this._initMaterial();
  }

  onLightPercentChange(lightPercent) {
    this._view.material.uniforms.uMixTextures0102Percent.value = lightPercent;
  }

  _updateMaterialOnFocus() {
    let endMixTexturesValue;

    if (this._isShown) {
      endMixTexturesValue = 1;
    } else {
      endMixTexturesValue = 0;
    }

    const mixTexturesObject = { value: this._view.material.uniforms.uMixTexture03Percent.value };

    new TWEEN.Tween(mixTexturesObject)
      .to({ value: endMixTexturesValue }, this._objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .onUpdate(() => {
        this._view.material.uniforms.uMixTexture03Percent.value = mixTexturesObject.value;
      })
      .start();
  }

  _initMaterial() {
    const bakedTextureLightOn = Loader.assets['baked-textures/baked-workplace-photo'];
    bakedTextureLightOn.flipY = false;

    const bakedTextureLightOff = Loader.assets['baked-textures/baked-workplace-photo-light-off'];
    bakedTextureLightOff.flipY = false;

    const bakedTextureFocus = Loader.assets['baked-textures/baked-workplace-photo-focus'];
    bakedTextureFocus.flipY = false;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture01: { value: bakedTextureLightOff },
        uTexture02: { value: bakedTextureLightOn },
        uTexture03: { value: bakedTextureFocus },
        uMixTextures0102Percent: { value: 1 },
        uMixTexture03Percent: { value: 0 },
      },
      vertexShader: workplacePhotoVertexShader,
      fragmentShader: workplacePhotoFragmentShader,
    });

    this._view.material = material;
  }
}
