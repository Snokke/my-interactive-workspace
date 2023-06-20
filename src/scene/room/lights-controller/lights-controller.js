import * as THREE from 'three';

export default class LightsController {
  constructor(scene) {

    this._scene = scene;

    this._spotlightLightOn = null;
    this._spotlightLightOff = null;

    this._init();
  }

  _init() {
    this._initSpotlightLightOn();
  }

  _initSpotlightLightOn() {
    const spotLight = new THREE.SpotLight(0xffffff);
    this._scene.add(spotLight);

    spotLight.position.set(-5, 12, -5);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 3;
    spotLight.shadow.camera.far = 20;
    spotLight.shadow.camera.fov = 80;

    // const lightHelper = new THREE.SpotLightHelper(spotLight);
    // this._scene.add(lightHelper);
  }
}
