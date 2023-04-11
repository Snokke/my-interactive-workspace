import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { EffectComposer } from '/node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import { OutlinePass } from '/node_modules/three/examples/jsm/postprocessing/OutlinePass.js';
import { SMAAPass } from '/node_modules/three/examples/jsm/postprocessing/SMAAPass.js';
import { RenderPass } from '/node_modules/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '/node_modules/three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from '/node_modules/three/examples/jsm/shaders/GammaCorrectionShader.js';
import SCENE_CONFIG from './configs/scene-config';
import MainScene from '../main-scene';
import LoadingOverlay from './loading-overlay';
import { Black, CanvasDriver, Engine, Input, MasterAudio, StageScaleMode } from 'black-engine';
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
    this._effectComposer = null;
    this._outlinePass = null;
    this._orbitControls = null;
    this._audioListener = null;

    this._windowSizes = {};
    this._isAssetsLoaded = false;

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
    };

    this._mainScene = new MainScene(data);
  }

  afterAssetsLoaded() {
    this._isAssetsLoaded = true;

    this._loadingOverlay.hide();
    this._scene3DDebugMenu.showAfterAssetsLoad();
    this._mainScene.afterAssetsLoad();
  }

  getOutlinePass() {
    return this._outlinePass;
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
    this._initPostProcessing();
    this._initAudioListener();

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

    // renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.useLegacyLights = false;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 1;

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

    // directionalLight.castShadow = true;
    // directionalLight.shadow.camera.left = -10;
    // directionalLight.shadow.camera.right = 10;
    // directionalLight.shadow.camera.top = 9;
    // directionalLight.shadow.camera.bottom = -9;
    // directionalLight.shadow.camera.far = 18;
    // directionalLight.shadow.mapSize.set(1024, 1024);

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

      this._effectComposer.setSize(this._windowSizes.width, this._windowSizes.height);
      this._effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  _setupBackgroundColor() {
    this._scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);
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

    const renderPass = new RenderPass(this._scene, this._camera);
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
    const smaaPass = new SMAAPass();
    this._effectComposer.addPass(smaaPass);
  }

  _initGammaCorrectionPass() {
    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
    this._effectComposer.addPass(gammaCorrectionPass);
  }

  _initAudioListener() {
    const audioListener = this._audioListener = new THREE.AudioListener();
    this._camera.add(audioListener);
  }

  _initScene3DDebugMenu() {
    this._scene3DDebugMenu = new Scene3DDebugMenu(this._scene, this._camera, this._renderer);
    this._orbitControls = this._scene3DDebugMenu.getOrbitControls();
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

        this._effectComposer.render();
        // this._renderer.render(this._scene, this._camera);
      }

      this._scene3DDebugMenu.postUpdate();
      window.requestAnimationFrame(update);
    }

    update();
  }
}
