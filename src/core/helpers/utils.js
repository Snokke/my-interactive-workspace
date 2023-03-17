import * as THREE from 'three';
import Loader from "../loader";

const boundingBox = new THREE.Box3();

export default class Utils {
  static createObject(name) {
    const object = Loader.assets[name];

    if (!object) {
      throw new Error(`Object ${name} is not found.`);
    }

    const group = new THREE.Group();
    const children = [...object.scene.children];

    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      group.add(child);
    }

    return group;
  }

  static getBoundingBox(target) {
    boundingBox.setFromObject(target);
    const size = boundingBox.getSize(new THREE.Vector3());

    return size;
  }
}
