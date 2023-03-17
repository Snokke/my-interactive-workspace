import './style.css';
import BaseScene from './core/base-scene';

const baseScene = new BaseScene();

document.addEventListener('onLoad', () => {
  baseScene.createGameScene();

  setTimeout(() => baseScene.afterAssetsLoaded(), 300);
});
