import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import SCENE_CONFIG from './configs/scene-config';
import MainScene from '../main-scene';
import LoadingOverlay from './loading-overlay';
import { CanvasDriver, Engine, Input, MasterAudio, StageScaleMode } from 'black-engine';
import Loader from './loader';
import Scene3DDebugMenu from './helpers/gui-helper/scene-3d-debug-menu';

export default class BaseScene {
  constructor() {
    this._scene = null;
    this._renderer = null;
    this._camera = null;
    this._loadingOverlay = null;
    this._mainScene = null;
    this._scene3DDebugMenu = null;

    this._windowSizes = {};
    this._isAssetsLoaded = false;

    this._init();
  }

  createGameScene() {
    const data = {
      scene: this._scene,
      camera: this._camera,
    };

    this._mainScene = new MainScene(data);
  }

  afterAssetsLoaded() {
    this._isAssetsLoaded = true;

    this._loadingOverlay.hide();
    this._scene3DDebugMenu.showAfterAssetsLoad();
    this._mainScene.afterAssetsLoad();
  }

  _init() {
    this._initBlack();
    this._initThreeJS();
    this._initUpdate();
  }

  _initBlack() {
    const engine = new Engine('container', Loader, CanvasDriver, [Input, MasterAudio]);

    engine.pauseOnBlur = false;
    engine.pauseOnHide = false;
    engine.start();

    engine.stage.setSize(640, 960);
    engine.stage.scaleMode = StageScaleMode.LETTERBOX;
  }

  _initThreeJS() {
    this._initScene();
    this._initRenderer();
    this._initCamera();
    this._initLights();
    this._initLoadingOverlay();
    this._initOnResize();
    this._setupBackgroundColor();
    this._initScene3DDebugMenu();
  }

  _initScene() {
    this._scene = new THREE.Scene();
  }

  _initRenderer() {
    this._windowSizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const canvas = document.querySelector('canvas.webgl');

    const renderer = this._renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: SCENE_CONFIG.antialias,
    });

    renderer.setSize(this._windowSizes.width, this._windowSizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.useLegacyLights = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  _initCamera() {
    const camera = this._camera = new THREE.PerspectiveCamera(SCENE_CONFIG.camera.fov, this._windowSizes.width / this._windowSizes.height, SCENE_CONFIG.camera.near, SCENE_CONFIG.camera.far);
    this._scene.add(camera);

    const startPosition = SCENE_CONFIG.camera.startPosition;
    camera.position.set(startPosition.x, startPosition.y, startPosition.z);
    camera.lookAt(0, 0, 0);
  }

  _initLights() {
    const ambientLightConfig = SCENE_CONFIG.lights.ambient;
    const ambientLight = new THREE.AmbientLight(ambientLightConfig.color, ambientLightConfig.intensity);
    this._scene.add(ambientLight);

    const directionalLightConfig = SCENE_CONFIG.lights.directional;
    const directionalLight = new THREE.DirectionalLight(directionalLightConfig.color, directionalLightConfig.intensity);
    directionalLight.position.set(directionalLightConfig.position.x, directionalLightConfig.position.y, directionalLightConfig.position.z);
    this._scene.add(directionalLight);

    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 9;
    directionalLight.shadow.camera.bottom = -9;
    directionalLight.shadow.camera.far = 18;
    directionalLight.shadow.mapSize.set(1024, 1024);

    // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
    // this._scene.add(directionalLightHelper);

    // const shadowCameraHelper = this._shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // this._scene.add(shadowCameraHelper);
  }

  _initLoadingOverlay() {
    const loadingOverlay = this._loadingOverlay = new LoadingOverlay();
    this._scene.add(loadingOverlay);
  }

  _initOnResize() {
    window.addEventListener('resize', () => {
      this._windowSizes.width = window.innerWidth;
      this._windowSizes.height = window.innerHeight;

      this._camera.aspect = this._windowSizes.width / this._windowSizes.height;
      this._camera.updateProjectionMatrix();

      this._renderer.setSize(this._windowSizes.width, this._windowSizes.height);
      this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  _setupBackgroundColor() {
    this._scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);
  }

  _initScene3DDebugMenu() {
    this._scene3DDebugMenu = new Scene3DDebugMenu(this._scene, this._camera, this._renderer);
  }

  _initUpdate() {
    const clock = new THREE.Clock(true);

    const update = () => {
      this._scene3DDebugMenu.preUpdate();

      const deltaTime = clock.getDelta();

      if (this._isAssetsLoaded) {
        TWEEN.update();
        this._scene3DDebugMenu.update();

        if (this._mainScene) {
          this._mainScene.update(deltaTime);
        }

        this._renderer.render(this._scene, this._camera);
      }

      this._scene3DDebugMenu.postUpdate();
      window.requestAnimationFrame(update);
    }

    update();
  }
}
