import { DisplayObject } from "black-engine";
import Delayed from "../core/helpers/delayed-call";
import { INTRO_CONFIG } from "../scene/room/intro/intro-config";
import DEBUG_CONFIG from "../core/configs/debug-config";

export default class IntroUI extends DisplayObject {
  constructor() {
    super();

  }

  onIntroStop() {
    const skipButton = document.querySelector('.skip-button');
    skipButton.classList.remove('button-show');
    skipButton.classList.add('button-hide');

    Delayed.call(300, () => {
      skipButton.style.display = 'none';
    });
  }

  _hideOnStartIntro() {
    const developerName = document.querySelector('.developer-name');
    const showIntroButton = document.querySelector('.show-intro-button');
    const skipButton = document.querySelector('.skip-button');
    const enableMusicButton = document.querySelector('.enable-music-button');

    developerName.classList.add('button-hide');
    showIntroButton.classList.add('button-hide');
    skipButton.classList.add('button-hide');
    enableMusicButton.classList.add('button-hide');

    Delayed.call(300, () => {
      developerName.style.display = 'none';
      showIntroButton.style.display = 'none';
      enableMusicButton.style.display = 'none';

      skipButton.style.top = '95%';
      skipButton.classList.remove('button-hide');
      skipButton.classList.add('button-show');

      Delayed.call(300, () => {
        skipButton.classList.remove('button-show');
      });
    });
  }

  _hideOnSkip() {
    const developerName = document.querySelector('.developer-name');
    const showIntroButton = document.querySelector('.show-intro-button');
    const skipButton = document.querySelector('.skip-button');
    const enableMusicButton = document.querySelector('.enable-music-button');

    developerName.classList.add('button-hide');
    showIntroButton.classList.add('button-hide');
    skipButton.classList.remove('button-show');
    skipButton.classList.add('button-hide');
    enableMusicButton.classList.add('button-hide');

    Delayed.call(300, () => {
      developerName.style.display = 'none';
      showIntroButton.style.display = 'none';
      enableMusicButton.style.display = 'none';
      skipButton.style.display = 'none';
    });
  }

  onAdded() {
    this._initName();
    this._initShowIntroButton();
    this._initEnableMusicButton();
    this._initSkipButton();

    if (DEBUG_CONFIG.skipIntro) {
      this._hideOnSkip();
    }
  }

  _initName() {
    const introUI = document.querySelector('.intro-ui');

    const name = document.createElement('div');
    introUI.appendChild(name);

    name.classList.add('intro-ui-element', 'developer-name');
    name.innerHTML = 'ANDRII BABINTSEV.';

    const occupation = document.createElement('div');
    name.appendChild(occupation);

    occupation.classList.add('developer-occupation');
    occupation.innerHTML = 'GAME DEVELOPER';
  }

  _initShowIntroButton() {
    const introUI = document.querySelector('.intro-ui');

    const showIntroButton = document.createElement('div');
    introUI.appendChild(showIntroButton);

    showIntroButton.classList.add('intro-ui-element', 'show-intro-button');

    const buttonImage = document.createElement('img');
    showIntroButton.appendChild(buttonImage);

    buttonImage.classList.add('show-intro-button-image');
    buttonImage.src = '/ui_assets/button-green.png';

    const buttonText = document.createElement('div');
    showIntroButton.appendChild(buttonText);

    buttonText.classList.add('show-intro-button-text');
    buttonText.innerHTML = 'SHOW&nbsp;INTRO';

    showIntroButton.addEventListener('click', () => {
      this.post('onStartClick');
      this._hideOnStartIntro();
    });
  }

  _initEnableMusicButton() {
    const introUI = document.querySelector('.intro-ui');

    const enableMusicButton = document.createElement('div');
    introUI.appendChild(enableMusicButton);

    enableMusicButton.classList.add('intro-ui-element', 'enable-music-button');

    const enableMusicText = document.createElement('div');
    enableMusicButton.appendChild(enableMusicText);

    enableMusicText.classList.add('enable-music-text');
    enableMusicText.innerHTML = 'ENABLE MUSIC';

    const checkbox = document.createElement('img');
    enableMusicButton.appendChild(checkbox);

    checkbox.classList.add('checkbox');
    checkbox.src = '/ui_assets/checkbox_checked.png';

    enableMusicButton.addEventListener('click', () => {
      INTRO_CONFIG.isMusicEnabled = !INTRO_CONFIG.isMusicEnabled;

      if (INTRO_CONFIG.isMusicEnabled) {
        checkbox.src = '/ui_assets/checkbox_checked.png';
      } else {
        checkbox.src = '/ui_assets/checkbox_unchecked.png';
      }
    });
  }

  _initSkipButton() {
    const introUI = document.querySelector('.intro-ui');

    const skipButton = document.createElement('div');
    introUI.appendChild(skipButton);

    skipButton.classList.add('intro-ui-element', 'skip-button');
    skipButton.innerHTML = 'SKIP INTRO';

    skipButton.addEventListener('click', () => {
      this.post('onSkipClick');
      this._hideOnSkip();
    });
  }
}
