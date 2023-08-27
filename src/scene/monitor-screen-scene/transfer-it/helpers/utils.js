import * as THREE from 'three';
import TransferItLoader from '../loader/transfer-it-loader';

const boundingBox = new THREE.Box3();
const defaultMaterial = new THREE.MeshLambertMaterial();

function getFirstClonableChild(root) {
  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i];

    if (typeof child.clone === 'function') {
      return child.clone();
    }
  }
}

export default class Utils {
  static createObject(name, material = defaultMaterial) {
    const object = TransferItLoader.assets[name];
    if (!object) {
      throw new Error(`Object ${name} is not in the cache.`);
    }

    const result = (object.scene) ?
      getFirstClonableChild(object.scene) :
      getFirstClonableChild(object);

    return Utils.setObjectMaterial(result, material);
  }

  static getBoundingBox(target) {
    boundingBox.setFromObject(target);
    const size = boundingBox.getSize(new THREE.Vector3());

    return size;
  }

  static setObjectMaterial(object, newMaterial) {
    object.traverse(child => {
      if (child.isMesh) {
        child.material = newMaterial;
      }
    });

    return object;
  }
}
