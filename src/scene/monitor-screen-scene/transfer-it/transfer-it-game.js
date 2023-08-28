import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import GameScreen from './game-screen/game-screen';
import SimplePhysics from './helpers/simple-physics';
import ShakeEffect from './helpers/shake/shake-effect';
import { Black, MessageDispatcher } from 'black-engine';
import TRANSFER_IT_DEBUG_CONFIG from './configs/transfer-it-debug-config';
import { OrbitControls } from '../../../core/OrbitControls';
import LoadingScreen from './loader/loading-screen';
import TransferItLoader from './loader/transfer-it-loader';

export default class TransferItGame extends THREE.Group {
  constructor(scene, camera, audioListener) {
    super();

    this.events = new MessageDispatcher();

    this._scene = scene;
    this._camera = camera;
    this._audioListener = audioListener;

    this._loadingScreen = null;

    this._isGameLoaded = false;
    this._isGameLoading = false;
    this._isGameActive = false;

    this._configureCamera();
    this._initLoadingScreen();
  }

  update(dt) {
    if (!this._isGameLoaded) {
      return;
    }

    this._physics.update(dt);
    this._gameScreen.update(dt);
    this._shake.update(dt);

    if (TRANSFER_IT_DEBUG_CONFIG.orbitControls) {
      this._orbitControls.update();
    }
  }

  onInputDown() {
    if (this._isGameLoaded) {
      this._gameScreen.onInputDown();
    }
  }

  startGame() {
    this._isGameActive = true;

    if (this._isGameLoaded) {
      this._loadingScreen.showFake();
    } else {
      if (this._isGameLoading) {
        this._loadingScreen.show();
      } else {
        this._isGameLoading = true;
        this._initTransferItLoader();
        this._loadingScreen.show();
      }
    }
  }

  stopGame() {
    this._isGameActive = false;

    if (this._isGameLoaded) {
      this._gameScreen.stopGame();
    }
  }

  getSoundsAnalyzer() {
    if (this._isGameLoaded) {
      return this._gameScreen.getSoundsAnalyzer();
    }

    return null;
  }

  onSoundsEnabledChanged() {
    if (this._isGameLoaded) {
      this._gameScreen.onSoundsEnabledChanged();
    }
  }

  onVolumeChanged() {
    if (this._isGameLoaded) {
      this._gameScreen.onVolumeChanged();
    }
  }

  onSpeakersPowerChanged(powerStatus) {
    if (this._isGameLoaded) {
      this._gameScreen.onSpeakersPowerChanged(powerStatus);
    }
  }

  _initLoadingScreen() {
    const loadingScreen = this._loadingScreen = new LoadingScreen();
    this.add(loadingScreen);

    loadingScreen.quaternion.copy(this._camera.quaternion);
    loadingScreen.position.copy(this._camera.position);
    loadingScreen.translateZ(-1);

    loadingScreen.events.on('onLoadingScreenHidden', () => this._onLoadingScreenHidden());
  }

  _initTransferItLoader() {
    new TransferItLoader();

    TransferItLoader.events.on('onAssetsLoaded', () => this._onAssetsLoaded());
    TransferItLoader.events.on('onAssetsLoading', (msg, percent) => this._loadingScreen.updateProgressBar(percent));
  }

  _onLoadingScreenHidden() {
    this._loadingScreen.hide();
    this._gameScreen.startGame();
  }

  _onAssetsLoaded() {
    this._isGameLoading = false;
    this._isGameLoaded = true;

    this._loadingScreen.hide();
    this._initGame();

    this.events.post('onAssetsLoaded');

    if (this._isGameActive) {
      this._gameScreen.startGame();
    }
  }

  _initGame() {
    this._initLights();
    this._initBg();
    this._initPhysics();
    this._initGameScreen();
    this._initShake();
    this._initOrbitControls();
    this._initSignals();
  }

  _initGameScreen() {
    const gameScreen = this._gameScreen = new GameScreen(this._camera, this._audioListener);
    this.add(gameScreen);
  }

  _initPhysics() {
    const gravity = new CANNON.Vec3(0, -9.82, 0);
    const timeStep = 1 / 60;
    const maxSubSteps = 3;

    this._physics = new SimplePhysics(this._scene, gravity, timeStep, maxSubSteps);
  }

  _initShake() {
    this._shake = new ShakeEffect(this._camera, 0.1, 300, 4);
    this._shake.setStartPosition(this._camera.position);
  }

  _initOrbitControls() {
    if (TRANSFER_IT_DEBUG_CONFIG.orbitControls) {
      const orbitControls = this._orbitControls = new OrbitControls(this._camera, Black.engine.containerElement);
      orbitControls.target.set(0, 1, 0);
    }
  }

  _initBg() {
    const background = TransferItLoader.assets['transfer-it/bg'];
    this._scene.background = background;
  }

  _initLights() {
    const ambientLight = new THREE.AmbientLight(0xFFEFE4, 2.2);
    this._scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFEFE4, 2);
    directionalLight.position.set(-2, 7, -7);
    this._scene.add(directionalLight);

    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 6;
    directionalLight.shadow.camera.bottom = -6;
    directionalLight.shadow.camera.far = 14;
    directionalLight.shadow.mapSize.set(1024, 1024);

    // const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 1);
    // this._scene.add(directionalLightHelper);

    // const shadowCameraHelper = this._shadowCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
    // this._scene.add(shadowCameraHelper);
  }

  _configureCamera() {
    this._camera.position.set(-7, 9, 7);
    this._camera.lookAt(0, 1, 0);
  }

  _initSignals() {
    this._gameScreen.events.on('furnitureCollision', () => {
      if (!TRANSFER_IT_DEBUG_CONFIG.orbitControls) {
        this._shake.show();
      }
    });

    // Black.input.on('pointerDown', () => this._gameScreen.onInputDown());
  }
}
