import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { EffectComposer } from '/node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from '/node_modules/three/examples/jsm/postprocessing/OutlinePass.js';
import { RenderPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '/node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from '/node_modules/three/examples/jsm/shaders/FXAAShader.js';
import { GammaCorrectionShader } from '/node_modules/three/examples/jsm/shaders/GammaCorrectionShader.js';
import SCENE_CONFIG from './configs/scene-config';
import MainScene from '../main-scene';
import LoadingOverlay from './loading-overlay';
import { Black, CanvasDriver, Engine, Input, MasterAudio, StageScaleMode } from 'black-engine';
import Loader from './loader';
import Scene3DDebugMenu from './helpers/gui-helper/scene-3d-debug-menu';
import { CAMERA_CONFIG } from '../scene/room/camera-controller/data/camera-config';
import MONITOR_SCREEN_SCENE_CONFIG from './configs/monitor-screen-scene-config';
import { DEPLOYMENT_CONFIG } from './configs/deployment-config';
import DEBUG_CONFIG from './configs/debug-config';
import { ROOM_CONFIG } from '../scene/room/data/room-config';

if (CAMERA_CONFIG.theatreJs.studioEnabled) {
  import('@theatre/studio').then((module) => {
    module.default.initialize();
  });
}

export default class BaseScene {
  constructor() {
    this._scene = null;
    this._renderer = null;
    this._camera = null;
    this._loadingOverlay = null;
    this._mainScene = null;
    this._scene3DDebugMenu = null;
    this._effectComposer = null;
    this._outlinePass = null;
    this._orbitControls = null;
    this._audioListener = null;
    this._monitorScreenSceneData = null;
    this._renderPass = null;

    this._windowSizes = {};
    this._isAssetsLoaded = false;
    this._isGameActive = false;

    this._isSecondaryCameraActive = false;

    this._init();
  }

  createGameScene() {
    const data = {
      scene: this._scene,
      camera: this._camera,
      renderer: this._renderer,
      orbitControls: this._orbitControls,
      outlinePass: this._outlinePass,
      audioListener: this._audioListener,
      monitorScreenData: this._monitorScreenSceneData,
    };

    this._mainScene = new MainScene(data);

    this._initMainSceneSignals();
  }

  afterAssetsLoaded() {
    this._isAssetsLoaded = true;

    this._loadingOverlay.hide();
    this._scene3DDebugMenu.showAfterAssetsLoad();
    this._mainScene.afterAssetsLoad();
    this._setupBackgroundColor();
  }

  getOutlinePass() {
    return this._outlinePass;
  }

  _initMainSceneSignals() {
    this._mainScene.events.on('fpsMeterChanged', () => this._scene3DDebugMenu.onFpsMeterClick());
    this._mainScene.events.on('onShowGame', () => this._onShowGame());
    this._mainScene.events.on('onHideGame', () => this._onHideGame());
    this._mainScene.events.on('onSwitchToReserveCamera', () => this._onSwitchToReserveCamera());
  }

  _onShowGame() {
    this._isGameActive = true;
  }

  _onHideGame() {
    this._isGameActive = false;
  }

  _onSwitchToReserveCamera() {
    if (this._isSecondaryCameraActive) {
      this._isSecondaryCameraActive = false;
      this._renderPass.camera = this._camera;
    } else {
      this._isSecondaryCameraActive = true;
      this._renderPass.camera = this._reserveCamera;
    }

    this._onResize();
  }

  _init() {
    this._checkDeploymentConfig();
    this._initBlack();
    this._initThreeJS();
    this._initUpdate();
  }

  _checkDeploymentConfig() {
    if (DEPLOYMENT_CONFIG.production) {
      DEBUG_CONFIG.fpsMeter = false;
      ROOM_CONFIG.outlineEnabled = true;
      ROOM_CONFIG.startAnimation.showOnStart = true;
    }

    if (CAMERA_CONFIG.theatreJs.studioEnabled) {
      DEBUG_CONFIG.fpsMeter = false;
      ROOM_CONFIG.outlineEnabled = false;
      SCENE_CONFIG.fxaaPass = false;
      CAMERA_CONFIG.far = 500;

      if (CAMERA_CONFIG.theatreJs.useReserveCamera) {
        this._isSecondaryCameraActive = true;
      }
    }
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
    this._initPostProcessing();
    this._initAudioListener();
    this._initMonitorScreenScene();

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

    // THREE.ColorManagement.enabled = true;
    // renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    // renderer.gammaFactor = 2.2;

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.useLegacyLights = false;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  _initCamera() {
    const camera = this._camera = new THREE.PerspectiveCamera(CAMERA_CONFIG.fov, this._windowSizes.width / this._windowSizes.height, CAMERA_CONFIG.near, CAMERA_CONFIG.far);
    this._scene.add(camera);

    if (CAMERA_CONFIG.theatreJs.useReserveCamera) {
      const helper = new THREE.CameraHelper(camera);
      this._scene.add(helper);

      const reserveCamera = this._reserveCamera = new THREE.PerspectiveCamera(CAMERA_CONFIG.fov, this._windowSizes.width / this._windowSizes.height, CAMERA_CONFIG.near, CAMERA_CONFIG.far);
      this._scene.add(reserveCamera);
    }
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
    directionalLight.shadow.camera.left = -9;
    directionalLight.shadow.camera.right = 9;
    directionalLight.shadow.camera.top = 12;
    directionalLight.shadow.camera.bottom = -9;
    directionalLight.shadow.camera.far = 18;
    directionalLight.shadow.mapSize.set(2048, 2048);

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
    window.addEventListener('resize', () => this._onResize());
  }

  _onResize() {
    this._windowSizes.width = window.innerWidth;
    this._windowSizes.height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    this._camera.aspect = this._windowSizes.width / this._windowSizes.height;
    this._camera.updateProjectionMatrix();

    if (CAMERA_CONFIG.theatreJs.useReserveCamera) {
      this._reserveCamera.aspect = this._windowSizes.width / this._windowSizes.height;
      this._reserveCamera.updateProjectionMatrix();
    }

    this._renderer.setSize(this._windowSizes.width, this._windowSizes.height);
    this._renderer.setPixelRatio(pixelRatio);

    this._effectComposer.setSize(this._windowSizes.width, this._windowSizes.height);
    this._effectComposer.setPixelRatio(pixelRatio);

    if (SCENE_CONFIG.fxaaPass) {
      this._fxaaPass.material.uniforms['resolution'].value.x = 1 / (this._windowSizes.width * pixelRatio);
      this._fxaaPass.material.uniforms['resolution'].value.y = 1 / (this._windowSizes.height * pixelRatio);
    }
  }

  _setupBackgroundColor() {
    // this._scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);
    // const backgroundTexture = Loader.assets['transfer-it/bg'];
    // const backgroundTexture = Loader.assets['background'];
    // this._scene.background = backgroundTexture;

    const texture = Loader.assets['environment'];

    const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(this._renderer, texture);
    this._scene.background = rt.texture;

  }

  _initPostProcessing() {
    this._initEffectsComposer();
    this._initOutlinePass();
    this._initGammaCorrectionPass();
    this._initAntiAliasingPass();
  }

  _initEffectsComposer() {
    // const size = this._renderer.getSize(new Vector2());
    // const pixelRatio = this._renderer.getPixelRatio();
    // const width = size.width;
    // const height = size.height;

    // const target = new THREE.WebGLRenderTarget(width * pixelRatio, height * pixelRatio, {
    //   minFilter: THREE.LinearFilter,
    //   magFilter: THREE.LinearFilter,
    //   format: THREE.RGBAFormat,
    //   encoding: THREE.sRGBEncoding
    // });

    const effectComposer = this._effectComposer = new EffectComposer(this._renderer);
    // effectComposer.renderTarget1.texture.encoding = THREE.sRGBEncoding;
    // effectComposer.renderTarget2.texture.encoding = THREE.sRGBEncoding;

    const camera = CAMERA_CONFIG.theatreJs.useReserveCamera ? this._reserveCamera : this._camera;
    const renderPass = this._renderPass = new RenderPass(this._scene, camera);
    effectComposer.addPass(renderPass);
  }

  _initOutlinePass() {
    const bounds = Black.stage.bounds;

    const outlinePass = this._outlinePass = new OutlinePass(new THREE.Vector2(bounds.width, bounds.height), this._scene, this._camera);
    this._effectComposer.addPass(outlinePass);

    // outlinePass.visibleEdgeColor.set('#00ff00');
    outlinePass.edgeGlow = 1;
    outlinePass.edgeStrength = 4;
    outlinePass.edgeThickness = 2;
    outlinePass.pulsePeriod = 2.5;
  }

  _initAntiAliasingPass() {
    if (SCENE_CONFIG.fxaaPass) {
      const fxaaPass = this._fxaaPass = new ShaderPass(FXAAShader);
      this._effectComposer.addPass(fxaaPass);

      const pixelRatio = Math.min(window.devicePixelRatio, 2);
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (this._windowSizes.width * pixelRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (this._windowSizes.height * pixelRatio);
    }
  }

  _initGammaCorrectionPass() {
    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
    this._effectComposer.addPass(gammaCorrectionPass);
  }

  _initAudioListener() {
    const camera = CAMERA_CONFIG.theatreJs.useReserveCamera ? this._reserveCamera : this._camera;
    const audioListener = this._audioListener = new THREE.AudioListener();
    camera.add(audioListener);
  }

  _initScene3DDebugMenu() {
    const camera = CAMERA_CONFIG.theatreJs.useReserveCamera ? this._reserveCamera : this._camera;
    this._scene3DDebugMenu = new Scene3DDebugMenu(this._scene, camera, this._renderer);
    this._orbitControls = this._scene3DDebugMenu.getOrbitControls();
  }

  _initMonitorScreenScene() {
    this._monitorScreenScene = new THREE.Scene();

    const near = MONITOR_SCREEN_SCENE_CONFIG.camera.near;
    const far = MONITOR_SCREEN_SCENE_CONFIG.camera.far;
    this._monitorScreenCamera = new THREE.PerspectiveCamera(MONITOR_SCREEN_SCENE_CONFIG.camera.fov, MONITOR_SCREEN_SCENE_CONFIG.camera.aspect, near, far);
    this._monitorScreenRenderTarget = new THREE.WebGLRenderTarget(MONITOR_SCREEN_SCENE_CONFIG.renderTarget.width, MONITOR_SCREEN_SCENE_CONFIG.renderTarget.height);

    this._monitorScreenSceneData = {
      scene: this._monitorScreenScene,
      camera: this._monitorScreenCamera,
      renderTarget: this._monitorScreenRenderTarget,
      audioListener: this._audioListener,
    };
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

        if (this._isGameActive) {
          this._renderer.setRenderTarget(this._monitorScreenRenderTarget);
          this._renderer.clear();
          this._renderer.render(this._monitorScreenScene, this._monitorScreenCamera);
        }

        // this._renderer.setRenderTarget( null );
        // this._renderer.clear();
        // this._renderer.render(this._scene, this._camera);

        this._effectComposer.render();
      }

      this._scene3DDebugMenu.postUpdate();
      window.requestAnimationFrame(update);
    }

    update();
  }
}
