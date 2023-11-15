import * as THREE from 'three';
import { AssetManager, GameObject, MessageDispatcher } from 'black-engine';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import * as pdfjs from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?worker';

const textures = [
  'environment.jpg',

  // window
  'glass-top-texture.png',

  // baked textures
  'baked-textures/baked-big-objects.jpg',
  'baked-textures/baked-small-objects.jpg',
  'baked-textures/baked-big-objects-light-off.jpg',
  'baked-textures/baked-small-objects-light-off.jpg',

  // air conditioner
  'air-conditioner-particles/snowflake-01.png',
  'air-conditioner-particles/snowflake-02.png',
  'air-conditioner-particles/snowflake-03.png',

  // floor lamp
  'baked-textures/baked-lamp-off.jpg',

  // monitor
  'screens/monitor/monitor-screen.jpg',
  'screens/monitor/showreel-icon.jpg',
  'screens/monitor/game-transfer-it-icon.jpg',
  'screens/monitor/game-boy-icon.jpg',
  'screens/monitor/crazy-pumpkin-icon.jpg',
  'screens/monitor/cv-icon.jpg',
  'screens/monitor/volume.png',
  'screens/monitor/volume-muted.png',
  'screens/monitor/youtube-logo.jpg',
  'screens/cursor.png',
  'close-icon.png',

  // laptop
  'screens/laptop/laptop-screen.jpg',
  'screens/laptop/laptop-music-01-playing.jpg',
  'screens/laptop/laptop-music-01-pause.jpg',
  'screens/laptop/laptop-music-02-playing.jpg',
  'screens/laptop/laptop-music-02-pause.jpg',
  'screens/laptop/laptop-music-03-playing.jpg',
  'screens/laptop/laptop-music-03-pause.jpg',
  'baked-textures/baked-laptop-monitor.jpg',
  'baked-textures/baked-laptop-monitor-light-off.jpg',
  'baked-textures/baked-laptop-monitor-closed-light-off.jpg',

  // keyboard
  'keyboard/keyboard-keys-atlas.png',
  'keyboard/keyboard-key-texture.jpg',
  'keyboard/keyboard-space-key-texture.jpg',

  // locker
  'baked-textures/baked-locker-closed.jpg',
  'baked-textures/baked-locker-closed-light-off.jpg',
  'baked-textures/baked-locker-opened.jpg',
  'baked-textures/baked-locker-opened-light-off.jpg',
  'baked-textures/baked-workplace-photo.jpg',
  'baked-textures/baked-workplace-photo-light-off.jpg',
  'baked-textures/baked-workplace-photo-focus.jpg',
  'baked-textures/baked-cv-light-off.jpg',
  'baked-textures/baked-cv-light-on.jpg',

  // book
  'baked-textures/baked-opened-book.jpg',
  'baked-textures/baked-page.jpg',

  // air conditioner remote
  'baked-textures/baked-air-conditioner-remote.jpg',
  'baked-textures/baked-air-conditioner-remote-light-off.jpg',
  'baked-textures/baked-air-conditioner-remote-focus.jpg',

  // calendar
  'baked-textures/baked-calendar.jpg',
  'baked-textures/baked-calendar-light-off.jpg',

  // speakers
  'speakers-indicator.jpg',

  // mouse
  'mouse-shadow.png',

  // mousepad
  'baked-textures/baked-mousepad-black-light-on.jpg',
  'baked-textures/baked-mousepad-black-light-off.jpg',
  'baked-textures/baked-mousepad-color-light-on.jpg',
  'baked-textures/baked-mousepad-color-light-off.jpg',

  // cv
  'open-pdf-button.jpg',
];

const models = [
  'room.glb',
  'keyboard-key.glb',
  'keyboard-key-space.glb',
];

const images = [
  'overlay.png',
  'sound-icon.png',
  'sound-icon-mute.png',
  'button-green.png',
  'checkbox_checked.png',
  'checkbox_unchecked.png',
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
  'page-flip.mp3',
  'secret.mp3',
];

const loadingPercentElement = document.querySelector('.loading-percent');
let progressRatio = 0;
const blackAssetsProgressPart = 0;
let isSoundsLoaded = false; // eslint-disable-line no-unused-vars

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
    this._initPDFJS();
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

  _onBlackAssetsProgress(item, progress) { // eslint-disable-line no-unused-vars
    // progressRatio = progress;

    // const percent = Math.floor(progressRatio * 100);
    // loadingPercentElement.innerHTML = `${percent}%`;
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

  _initPDFJS() {
    window.pdfjsWorker = pdfjsWorker;
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
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
      loadingPercentElement.innerHTML = `100%`;
      loadingPercentElement.classList.add('ended');

      setTimeout(() => {
        loadingPercentElement.style.display = 'none';
      }, 300);
    }, 450);


    setTimeout(() => {
      const customEvent = new Event('onLoad');
      document.dispatchEvent(customEvent);

      if (isSoundsLoaded) {
        Loader.events.post('onAudioLoaded');
      }
    }, 100);
  }

  _onThreeJSAssetsProgress(itemUrl, itemsLoaded, itemsTotal) {
    progressRatio = Math.min(blackAssetsProgressPart + (itemsLoaded / itemsTotal), 0.98);

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
