import * as THREE from 'three';
import { AssetManager, GameObject, MessageDispatcher } from 'black-engine';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

const textures = [
  'environment.jpg',

  // window
  'glass-top-texture.png',

  // baked textures
  'baked-big-objects.jpg',
  'baked-small-objects.jpg',
  'keyboard-key-texture.jpg',
  'keyboard-space-key-texture.jpg',
  'speakers-indicator.jpg',

  // air conditioner
  'snowflake-01.png',
  'snowflake-02.png',
  'snowflake-03.png',

  // monitor
  'monitor-screen.jpg',
  'cursor.png',
  'showreel-icon.jpg',
  'game-transfer-it-icon.jpg',
  'cv-icon.jpg',
  'close-icon.png',
  'volume.png',
  'volume-muted.png',

  // laptop
  'laptop-screen.jpg',
  'laptop-music-01-playing.jpg',
  'laptop-music-01-pause.jpg',
  'laptop-music-02-playing.jpg',
  'laptop-music-02-pause.jpg',
  'laptop-music-03-playing.jpg',
  'laptop-music-03-pause.jpg',

  // keyboard
  'keyboard-keys-atlas.png',

  // locker
  'workplace-photo.jpg',

  // calendar
  // 'baked-calendar.jpg',

  // Transfer it Game
  'transfer-it/bg.jpg',
  'transfer-it/carpet-texture.png',
  'transfer-it/cat.jpg',
  'transfer-it/drone.png',
  'transfer-it/floor-texture.jpg',
  'transfer-it/star.png',
  'transfer-it/target-big.png',
  'transfer-it/target-small.png',
  'transfer-it/target.png',
  'transfer-it/tomato.jpg',
  'transfer-it/button-next.png',
  'transfer-it/button-restart.png',
];

const models = [
  'room.glb',
  'keyboard-key.glb',
  'keyboard-key-space.glb',

  // Transfer it Game
  'transfer-it/bottom_floor.glb',
  'transfer-it/carpet.glb',
  'transfer-it/chair.glb',
  'transfer-it/cloud.glb',
  'transfer-it/cup.glb',
  'transfer-it/drone-01.glb',
  'transfer-it/drone-02.glb',
  'transfer-it/floor.glb',
  'transfer-it/gas-stove.glb',
  'transfer-it/left-wall.glb',
  'transfer-it/nightstand.glb',
  'transfer-it/picture.glb',
  'transfer-it/refrigerator.glb',
  'transfer-it/right-wall.glb',
  'transfer-it/robot-cleaner.glb',
  'transfer-it/table-1.glb',
  'transfer-it/table-2.glb',
  'transfer-it/table-big.glb',
  'transfer-it/washing-machine.glb',
];

const images = [
  'overlay.png',
  'sound-icon.png',
  'sound-icon-mute.png',
];

const sounds = [
  // Music
  'music/giorgio.mp3',
  'music/the-stomp.mp3',
  'music/september.mp3',
  'music/come-and-get-your-love.mp3',

  // Sounds
  'keyboard-key-press.mp3',
  'air-conditioner.mp3',
  'window-open.mp3',
  'window-close.mp3',
  'mouse-click.mp3',
  'lamp-switch.mp3',
  'chair-rolling.mp3',
  'open-case.mp3',
  'close-case.mp3',
  'table-handle.mp3',

  // Transfer it Game
  'transfer-it/furniture-fall.mp3',
  'transfer-it/whoosh.mp3',
  'transfer-it/win.mp3',
  'transfer-it/lose.mp3',
];

const loadingPercentElement = document.querySelector('.loading-percent');
let progressRatio = 0;
const blackAssetsProgressPart = 0;
let isSoundsLoaded = false;

export default class Loader extends GameObject {
  constructor() {
    super();

    Loader.assets = {};
    Loader.events = new MessageDispatcher();

    this._threeJSManager = new THREE.LoadingManager(this._onThreeJSAssetsLoaded, this._onThreeJSAssetsProgress);
    this._blackManager = new AssetManager();

    this._soundsCountLoaded = 0;

    this._loadBlackAssets();
    this._initFont();
  }

  _loadBlackAssets() {
    const imagesBasePath = '/ui_assets/';

    images.forEach((textureFilename) => {
      const imageFullPath = `${imagesBasePath}${textureFilename}`;
      const imageName = textureFilename.replace(/\.[^/.]+$/, "");
      this._blackManager.enqueueImage(imageName, imageFullPath);
    });

    this._blackManager.on('complete', this._onBlackAssetsLoaded, this);
    this._blackManager.on('progress', this._onBlackAssetsProgress, this);

    this._blackManager.loadQueue();
  }

  _onBlackAssetsProgress(item, progress) {
    progressRatio = progress;

    const percent = Math.floor(progressRatio * 100);
    loadingPercentElement.innerHTML = `${percent}%`;
  }

  _onBlackAssetsLoaded() {
    this.removeFromParent();
    this._loadThreeJSAssets();
  }

  _initFont() {
    const div = document.createElement('div');
    div.style.fontFamily = 'AlarmClock';
    div.style.visibility = 'hidden';
    div.style.position = 'absolute';
    div.style.top = '-1000px';
    div.innerText = '0123456789';
  }

  _loadThreeJSAssets() {
    this._loadTextures();
    this._loadModels();
    this._loadAudio();

    if (textures.length === 0 && models.length === 0 && sounds.length === 0) {
      this._onThreeJSAssetsLoaded();
    }
  }

  _onThreeJSAssetsLoaded() {
    setTimeout(() => {
      loadingPercentElement.classList.add('ended');

      setTimeout(() => {
        loadingPercentElement.style.display = 'none';
      }, 300);
    }, 300);


    setTimeout(() => {
      const customEvent = new Event('onLoad');
      document.dispatchEvent(customEvent);

      if (isSoundsLoaded) {
        Loader.events.post('onAudioLoaded');
      }
    }, 100);
  }

  _onThreeJSAssetsProgress(itemUrl, itemsLoaded, itemsTotal) {
    progressRatio = Math.max(blackAssetsProgressPart + (itemsLoaded / itemsTotal) * 0.5, progressRatio);

    const percent = Math.floor(progressRatio * 100);
    loadingPercentElement.innerHTML = `${percent}%`;
  }

  _loadTextures() {
    const textureLoader = new THREE.TextureLoader(this._threeJSManager);

    const texturesBasePath = '/textures/';

    textures.forEach((textureFilename) => {
      const textureFullPath = `${texturesBasePath}${textureFilename}`;
      const textureName = textureFilename.replace(/\.[^/.]+$/, "");
      Loader.assets[textureName] = textureLoader.load(textureFullPath);
    });
  }

  _loadModels() {
    const gltfLoader = new GLTFLoader(this._threeJSManager);

    const modelsBasePath = '/models/';

    models.forEach((modelFilename) => {
      const modelFullPath = `${modelsBasePath}${modelFilename}`;
      const modelName = modelFilename.replace(/\.[^/.]+$/, "");
      gltfLoader.load(modelFullPath, (gltfModel) => this._onAssetLoad(gltfModel, modelName));
    });
  }

  _loadAudio() {
    const audioLoader = new THREE.AudioLoader(this._threeJSManager);

    const audioBasePath = '/audio/';

    sounds.forEach((audioFilename) => {
      const audioFullPath = `${audioBasePath}${audioFilename}`;
      const audioName = audioFilename.replace(/\.[^/.]+$/, "");
      audioLoader.load(audioFullPath, (audioBuffer) => {
        this._onAssetLoad(audioBuffer, audioName);

        this._soundsCountLoaded += 1;

        if (this._soundsCountLoaded === sounds.length) {
          isSoundsLoaded = true;
          Loader.events.post('onAudioLoaded');
        }
      });
    });
  }

  _onAssetLoad(asset, name) {
    Loader.assets[name] = asset;
  }
}
