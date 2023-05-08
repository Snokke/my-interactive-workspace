import * as THREE from 'three';

export default class MonitorScreenScene {
  constructor(data) {

    this._scene = data.scene;
    this._camera = data.camera;

    this._init();
  }

  update(dt) {
    this._boxObject.rotation.x += 0.01;
    this._boxObject.rotation.y += 0.01;

  }

  _init() {
    const redMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
    const boxGeometry = new THREE.BoxGeometry( 5, 5, 5 );
    const boxObject = this._boxObject = new THREE.Mesh( boxGeometry, redMaterial );
    boxObject.position.z = -10;
    this._scene.add(boxObject);
  }
}
