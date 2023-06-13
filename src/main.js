import './style.css';
import BaseScene from './core/base-scene';
import { inject } from '@vercel/analytics';

inject();

const baseScene = new BaseScene();

document.addEventListener('onLoad', () => {
  baseScene.createGameScene();

  setTimeout(() => baseScene.afterAssetsLoaded(), 300);
});
