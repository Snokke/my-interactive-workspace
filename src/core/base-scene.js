import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';
import SCENE_CONFIG from './configs/scene-config';
import MainScene from '../main-scene';
import LoadingOverlay from './loading-overlay';
import { Black, CanvasDriver, Engine, Input, MasterAudio, StageScaleMode } from 'black-engine';
import Loader from './loader';
import Scene3DDebugMenu from './helpers/gui-helper/scene-3d-debug-menu';
import { CAMERA_CONFIG } from '../scene/room/camera-controller/data/camera-config';
import MONITOR_SCREEN_SCENE_CONFIG from './configs/monitor-screen-scene-config';
import DEBUG_CONFIG from './configs/debug-config';
import Materials from './materials';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { GLOBAL_LIGHT_CONFIG } from './configs/global-light-config';
import isMobile from 'ismobilejs';
import { THEATRE_JS_CONFIG } from '../scene/room/intro/theatre-js/data/theatre-js-config';

if (THEATRE_JS_CONFIG.studioEnabled) {
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

    SCENE_CONFIG.isMobile = isMobile(window.navigator).any;

    this._init();
  }

  createGameScene() {
    this._initMaterials();

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
    if (THEATRE_JS_CONFIG.studioEnabled) {
      DEBUG_CONFIG.fpsMeter = false;
      SCENE_CONFIG.outlinePass.enabled = false;
      SCENE_CONFIG.fxaaPass = false;
      CAMERA_CONFIG.far = 500;

      if (THEATRE_JS_CONFIG.studioEnabled) {
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio));

    renderer.useLegacyLights = false;
    // renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  _initCamera() {
    const camera = this._camera = new THREE.PerspectiveCamera(CAMERA_CONFIG.fov, this._windowSizes.width / this._windowSizes.height, CAMERA_CONFIG.near, CAMERA_CONFIG.far);
    this._scene.add(camera);

    if (THEATRE_JS_CONFIG.studioEnabled) {
      const helper = new THREE.CameraHelper(camera);
      this._scene.add(helper);

      const reserveCamera = this._reserveCamera = new THREE.PerspectiveCamera(CAMERA_CONFIG.fov, this._windowSizes.width / this._windowSizes.height, CAMERA_CONFIG.near, CAMERA_CONFIG.far);
      this._scene.add(reserveCamera);
    }
  }

  _initLights() {
    if (GLOBAL_LIGHT_CONFIG.ambient.enabled) {
      const ambientLight = new THREE.AmbientLight(GLOBAL_LIGHT_CONFIG.ambient.color, GLOBAL_LIGHT_CONFIG.ambient.intensity);
      this._scene.add(ambientLight);
    }
  }

  _initMaterials() {
    new Materials();
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
    const pixelRatio = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio);

    this._camera.aspect = this._windowSizes.width / this._windowSizes.height;
    this._camera.updateProjectionMatrix();

    if (THEATRE_JS_CONFIG.studioEnabled) {
      this._reserveCamera.aspect = this._windowSizes.width / this._windowSizes.height;
      this._reserveCamera.updateProjectionMatrix();
    }

    this._renderer.setSize(this._windowSizes.width, this._windowSizes.height);
    this._renderer.setPixelRatio(pixelRatio);

    if (this._effectComposer) {
      this._effectComposer.setSize(this._windowSizes.width, this._windowSizes.height);
      this._effectComposer.setPixelRatio(pixelRatio);
    }

    if (SCENE_CONFIG.fxaaPass) {
      this._fxaaPass.material.uniforms['resolution'].value.x = 1 / (this._windowSizes.width * pixelRatio);
      this._fxaaPass.material.uniforms['resolution'].value.y = 1 / (this._windowSizes.height * pixelRatio);
    }
  }

  _setupBackgroundColor() {
    // this._scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);

    const texture = Loader.assets['environment'];
    const renderTarget = new THREE.WebGLCubeRenderTarget(texture.image.height);
    renderTarget.fromEquirectangularTexture(this._renderer, texture);
    this._scene.background = renderTarget.texture;
  }

  _initPostProcessing() {
    if (SCENE_CONFIG.isMobile) {
      return;
    }

    this._initEffectsComposer();
    this._initOutlinePass();
    this._initAntiAliasingPass();
    this._initGammaCorrectionPass();
  }

  _initEffectsComposer() {
    const pixelRatio = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio);

    if (WebGL.isWebGL2Available() && pixelRatio === 1) {
      const size = this._renderer.getDrawingBufferSize(new THREE.Vector2());
      const target = new THREE.WebGLRenderTarget(size.width, size.height, { samples: 3 });
      this._effectComposer = new EffectComposer(this._renderer, target);
    } else {
      SCENE_CONFIG.fxaaPass = true;
      this._effectComposer = new EffectComposer(this._renderer);
    }

    const camera = THEATRE_JS_CONFIG.studioEnabled ? this._reserveCamera : this._camera;
    const renderPass = this._renderPass = new RenderPass(this._scene, camera);
    this._effectComposer.addPass(renderPass);
  }

  _initOutlinePass() {
    const bounds = Black.stage.bounds;

    const outlinePass = this._outlinePass = new OutlinePass(new THREE.Vector2(bounds.width, bounds.height), this._scene, this._camera);
    this._effectComposer.addPass(outlinePass);

    const outlinePassConfig = SCENE_CONFIG.outlinePass;

    outlinePass.visibleEdgeColor.set(outlinePassConfig.color);
    outlinePass.edgeGlow = outlinePassConfig.edgeGlow;
    outlinePass.edgeStrength = outlinePassConfig.edgeStrength;
    outlinePass.edgeThickness = outlinePassConfig.edgeThickness;
    outlinePass.pulsePeriod = outlinePassConfig.pulsePeriod;
  }

  _initAntiAliasingPass() {
    if (SCENE_CONFIG.fxaaPass) {
      const fxaaPass = this._fxaaPass = new ShaderPass(FXAAShader);
      this._effectComposer.addPass(fxaaPass);

      const pixelRatio = Math.min(window.devicePixelRatio, SCENE_CONFIG.maxPixelRatio);
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (this._windowSizes.width * pixelRatio);
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (this._windowSizes.height * pixelRatio);
    }
  }

  _initGammaCorrectionPass() {
    if (SCENE_CONFIG.gammaCorrectionPass) {
      const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
      this._effectComposer.addPass(gammaCorrectionPass);
    }
  }

  _initAudioListener() {
    const camera = THEATRE_JS_CONFIG.studioEnabled ? this._reserveCamera : this._camera;
    const audioListener = this._audioListener = new THREE.AudioListener();
    camera.add(audioListener);
  }

  _initScene3DDebugMenu() {
    const camera = THEATRE_JS_CONFIG.studioEnabled ? this._reserveCamera : this._camera;
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

        if (SCENE_CONFIG.isMobile || DEBUG_CONFIG.rendererStats) {
          this._renderer.setRenderTarget(null);
          this._renderer.clear();
          this._renderer.render(this._scene, this._camera);
        } else {
          this._effectComposer.render();
        }
      }

      this._scene3DDebugMenu.postUpdate();
      window.requestAnimationFrame(update);
    }

    update();
  }
}
