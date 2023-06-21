import * as THREE from 'three';

export default class LightsController {
  constructor(scene) {

    this._scene = scene;

    this._lampSpotlight = null;

    this._init();
  }

  _init() {
    this._initLampSpotlight();
    // this._initMonitorSpotlight();
  }

  _initLampSpotlight() {
    const spotLight = new THREE.SpotLight(0xffffff);
    this._scene.add(spotLight);

    spotLight.position.set(-4.5, 12, -4.5);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.angle = Math.PI * 0.15;

    spotLight.shadow.camera.near = 3;
    spotLight.shadow.camera.far = 20;
    spotLight.shadow.camera.fov = 80;

    // spotLight.visible = false;


    // const lightHelper = new THREE.SpotLightHelper(spotLight);
    // this._scene.add(lightHelper);
  }

  _initMonitorSpotlight() {
    const spotLight = new THREE.SpotLight(0xffffff);
    this._scene.add(spotLight);

    spotLight.position.set(0, 6, -1.7);

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 20;
    spotLight.shadow.camera.fov = 80;

    const targetObject = new THREE.Object3D();
    this._scene.add(targetObject);

    targetObject.position.set(0, 4, 0);

    spotLight.target = targetObject;

    // spotLight.angle = Math.PI * 0.1;

    // spotLight.visible = false;

    const lightHelper = new THREE.SpotLightHelper(spotLight);
    this._scene.add(lightHelper);
  }
}
