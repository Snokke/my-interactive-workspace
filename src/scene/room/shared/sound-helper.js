import * as THREE from 'three';

export default class SoundHelper extends THREE.Group {
  constructor(size) {
    super();

    this._size = size;

    this._init();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  _init() {
    const geometry = new THREE.SphereGeometry(this._size, 4, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
    });

    const view = new THREE.Mesh(geometry, material);
    this.add(view);

    this.hide();
  }
}
