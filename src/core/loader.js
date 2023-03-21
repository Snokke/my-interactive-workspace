import * as THREE from 'three';
import { AssetManager, GameObject } from 'black-engine';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const textures = [

];

const models = [
  'room.glb',
];

const images = [
  'button-green.png',
  'overlay.png',
];

const loadingPercentElement = document.querySelector('.loading-percent');
let progressRatio = 0;
const blackAssetsProgressPart = 0.5;

export default class Loader extends GameObject {
  constructor() {
    super();

    Loader.assets = {};

    this._threeJSManager = new THREE.LoadingManager(this._onThreeJSAssetsLoaded, this._onThreeJSAssetsProgress);
    this._blackManager = new AssetManager();

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
    progressRatio = progress * 0.5;

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

    if (textures.length === 0 && models.length === 0) {
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

  _onAssetLoad(asset, name) {
    Loader.assets[name] = asset;
  }
}
