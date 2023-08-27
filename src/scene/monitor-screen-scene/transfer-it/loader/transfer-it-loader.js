import * as THREE from 'three';
import { MessageDispatcher } from 'black-engine';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

const textures = [
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
  'transfer-it/bottom_floor.glb',
  'transfer-it/carpet.glb',
  'transfer-it/chair.glb',
  'transfer-it/cloud.glb',
  'transfer-it/cup.glb',
  'transfer-it/drone-01.glb',
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

const sounds = [
  'transfer-it/furniture-fall.mp3',
  'transfer-it/whoosh.mp3',
  'transfer-it/win.mp3',
  'transfer-it/lose.mp3',
];

let isSoundsLoaded = false; // eslint-disable-line no-unused-vars

export default class TransferItLoader {
  constructor() {

    TransferItLoader.assets = {};
    TransferItLoader.events = new MessageDispatcher();

    this._threeJSManager = new THREE.LoadingManager(this._onThreeJSAssetsLoaded, this._onThreeJSAssetsProgress);

    TransferItLoader.loadingScreen = null;
    this._soundsCountLoaded = 0;

    this._loadAssets();
  }

  _loadAssets() {
    this._loadTextures();
    this._loadModels();
    this._loadAudio();

    if (textures.length === 0 && models.length === 0 && sounds.length === 0) {
      this._onThreeJSAssetsLoaded();
    }
  }

  _onThreeJSAssetsLoaded() {
    setTimeout(() => {
      TransferItLoader.events.post('onAssetsLoaded');

      if (isSoundsLoaded) {
        TransferItLoader.events.post('onAudioLoaded');
      }
    }, 200);
  }

  _onThreeJSAssetsProgress(itemUrl, itemsLoaded, itemsTotal) {
    const percent = Math.floor(itemsLoaded / itemsTotal * 100) * 0.01;
    TransferItLoader.events.post('onAssetsLoading', percent);
  }

  _loadTextures() {
    const textureLoader = new THREE.TextureLoader(this._threeJSManager);

    const texturesBasePath = '/textures/';

    textures.forEach((textureFilename) => {
      const textureFullPath = `${texturesBasePath}${textureFilename}`;
      const textureName = textureFilename.replace(/\.[^/.]+$/, "");
      TransferItLoader.assets[textureName] = textureLoader.load(textureFullPath);
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
          TransferItLoader.events.post('onAudioLoaded');
        }
      });
    });
  }

  _onAssetLoad(asset, name) {
    TransferItLoader.assets[name] = asset;
  }
}
