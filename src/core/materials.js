import * as THREE from 'three';
import Loader from './loader';

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
    const texture = Loader.assets['baked-big-objects'];
    texture.flipY = false;
    // texture.colorSpace = THREE.SRGBColorSpace;

    this.bakedBigObjects = new THREE.MeshBasicMaterial({
      map: texture,
    });
  }

  _initBakedSmallObjectsMaterial() {
    const texture = Loader.assets['baked-small-objects'];
    texture.flipY = false;
    // texture.colorSpace = THREE.SRGBColorSpace;

    this.bakedSmallObjects = new THREE.MeshBasicMaterial({
      map: texture,
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
}

Materials.instance = null;

Materials.type = {
  bakedBigObjects: 'BAKED_BIG_OBJECTS',
  bakedSmallObjects: 'BAKED_SMALL_OBJECTS',
};
