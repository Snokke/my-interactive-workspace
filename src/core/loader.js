import * as THREE from 'three';
import { AssetManager, GameObject, MessageDispatcher } from 'black-engine';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const textures = [

  // air conditioner
  'temperature.png',
  'snowflake-01.png',
  'snowflake-02.png',

  // monitor
  'monitor-screen.jpg',
  'cursor.png',
  'showreel-icon.jpg',
  'cv-icon.jpg',
  'close-icon.jpg',
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
  'mac-keyboard.png',
  'keyboard-keys-atlas.png',
];

const models = [
  'room.glb',
  'keyboard-key.glb',
];

const images = [
  'button-green.png',
  'overlay.png',
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
