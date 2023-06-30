import * as THREE from 'three';
import Loader from './loader';
import vertexShader from '../scene/room/shared/mix-textures-shaders/mix-textures-vertex.glsl';
import fragmentShader from '../scene/room/shared/mix-textures-shaders/mix-textures-fragment.glsl';

export default class Materials {
  constructor() {

    this.bakedBigObjects = null;
    this.bakedSmallObjects = null;

    this._initMaterials();

    Materials.instance = this;
  }

  _initMaterials() {
    this._initBakedBigObjectsMaterial();
    this._initBakedSmallObjectsMaterial();
  }

  _initBakedBigObjectsMaterial() {
    const textureLightOn = Loader.assets['baked-textures/baked-big-objects'];
    textureLightOn.flipY = false;

    const textureLightOff = Loader.assets['baked-textures/baked-big-objects-light-off'];
    textureLightOff.flipY = false;

    this.bakedBigObjects = new THREE.ShaderMaterial({
      uniforms:
      {
        uTexture01: { value: textureLightOff },
        uTexture02: { value: textureLightOn },
        uMixPercent: { value: 1 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  }

  _initBakedSmallObjectsMaterial() {
    const textureLightOn = Loader.assets['baked-textures/baked-small-objects'];
    textureLightOn.flipY = false;

    const textureLightOff = Loader.assets['baked-textures/baked-small-objects-light-off'];
    textureLightOff.flipY = false;

    this.bakedSmallObjects = new THREE.ShaderMaterial({
      uniforms:
      {
        uTexture01: { value: textureLightOff },
        uTexture02: { value: textureLightOn },
        uMixPercent: { value: 1 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
  }

  static getMaterial(type) {
    let material;

    switch (type) {
      case Materials.type.bakedBigObjects:
        material = Materials.instance.bakedBigObjects;
        break;

      case Materials.type.bakedSmallObjects:
        material = Materials.instance.bakedSmallObjects;
        break;
    }

    return material;
  }

  static setLightPercent(percent) {
    Materials.instance.bakedBigObjects.uniforms.uMixPercent.value = percent;
    Materials.instance.bakedSmallObjects.uniforms.uMixPercent.value = percent;
  }
}

Materials.instance = null;

Materials.type = {
  bakedBigObjects: 'BAKED_BIG_OBJECTS',
  bakedSmallObjects: 'BAKED_SMALL_OBJECTS',
};
