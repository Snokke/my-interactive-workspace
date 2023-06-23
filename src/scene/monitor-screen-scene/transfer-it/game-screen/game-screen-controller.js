import * as THREE from "three";
import { MessageDispatcher } from "black-engine";
import { LEVELS_CONFIG, APPEAR_DIRECTION } from './configs/levels-config';
import { TARGET_TYPE } from './target/target-config';
import { RATING_TYPE, RATING_DISTANCE, BIG_FURNITURE_COEFF } from './configs/rating-config';
import { ROOM_TYPE, ROOM_CONFIG } from './room/room-config';
import HeightMeter from "../helpers/height-meter";
import Delayed from "../../../../core/helpers/delayed-call";
import Loader from "../../../../core/loader";
import { SOUNDS_CONFIG } from '../../../room/data/sounds-config';
import { SPEAKERS_POWER_STATUS } from "../../../room/room-active-objects/speakers/data/speakers-data";

export default class GameScreenController extends THREE.Group{
  constructor(data) {
    super();

    this.events = new MessageDispatcher();

    this._room = data.room;
    this._furnitureController = data.furnitureController;
    this._ghostController = data.ghostController;
    this._target = data.target;
    this._drone = data.drone;
    this._robotCleaner = data.robotCleaner;
    this._ui = data.ui;
    this._audioListener = data.audioListener;

    this._isGameplayActive = true;
    this._isEndScreenShown = false;
    this._isTutorialShown = false;
    this._isWin = false;
    this._score = 0;
    this._currentLevel = 0;
    this._currentUILevel = 0;
    this._currentModelIndex = 0;
    this._cellSize = this._room.getCellSize();
    this._gridSize = ROOM_CONFIG[ROOM_TYPE.SMALL];

    this._isGameGlobalActive = false;

    this._soundsAnalyzer = [];
    this._isGlobalSoundsEnabled = SOUNDS_CONFIG.enabled;
    this._isSpeakersPowerOn = SPEAKERS_POWER_STATUS.On;
    this._currentVolume = SOUNDS_CONFIG.volume * SOUNDS_CONFIG.transferItGameVolume;

    this._init();
  }

  startGame() {
    this._isGameGlobalActive = true;
    this._resetLevel();

    this._ui.setLevel(this._currentUILevel + 1);
    this._ui.showLevel();
    this._room.show();
    this._createGhosts();
    this._updateFurnitureForRobotCleaner();
  }

  stopGame() {
    this._isGameGlobalActive = false;
    this._resetScene();
    this._room.reset();
    this._room.hide();
    this._ui.hideTutorial();
    this._ui.stopLoadingScreen();
  }

  showLoadingScreen() {
    this._ui.showLoadingScreen();
  }

  defeat() {
    this._playSound(this._loseSound);
    this._isWin = false;
    this.onEndScreenShown();
    this._ui.hideLevel();
    this._ui.showLoseScreen();
  }

  victory() {
    this._playSound(this._winSound);
    this._isWin = true;
    this.onEndScreenShown();
    this._ui.hideLevel();
    this._ui.showWinScreen();
  }

  onEndScreenShown() {
    this._isGameplayActive = false;
    this._isEndScreenShown = true;
  }

  update(dt) {
    if (!this._isGameGlobalActive) {
      return;
    }

    this._robotCleaner.update(dt);

    if (!this._isGameplayActive) {
      return;
    }

    this._furnitureController.update(dt);

    this._drone.update(dt);
    this._drone.position.x = this._furnitureController.getFurniturePosition().x;
    this._drone.position.z = this._furnitureController.getFurniturePosition().z;

    this._ghostController.update(dt, this._currentModelIndex);
  }

  onInputDown() {
    if (!this._isGameGlobalActive) {
      return;
    }

    this._ui.hideTutorial();

    if (this._isGameplayActive) {
      const currentFurniture = this._furnitureController.getCurrentFurniture();
      if (currentFurniture.canFall) {
        currentFurniture.wakeUp();

        this._target.hide();
        this._ghostController.hideGhost(this._currentModelIndex);
        this._drone.hide();
      }
    } else {
      if (this._isEndScreenShown) {
        if (this._isWin) {
          this._onNextLevel();
        } else {
          this._onRestartLevel();
        }
      }
    }
  }

  getSoundsAnalyzer() {
    return this._soundsAnalyzer;
  }

  onSoundsEnabledChanged() {
    this._isGlobalSoundsEnabled = SOUNDS_CONFIG.enabled;
    this.onVolumeChanged();
  }

  onVolumeChanged() {
    if (this._isGlobalSoundsEnabled && this._isSpeakersPowerOn === SPEAKERS_POWER_STATUS.On) {
      this._currentVolume = SOUNDS_CONFIG.volume * SOUNDS_CONFIG.transferItGameVolume;
    } else {
      this._currentVolume = 0;
    }

    this._updateCurrentSoundsVolume();
    this._furnitureController.onVolumeChanged(this._currentVolume);
    this._room.onVolumeChanged(this._currentVolume);
  }

  onSpeakersPowerChanged(powerStatus) {
    this._isSpeakersPowerOn = powerStatus;
    this.onVolumeChanged();
  }

  _updateCurrentSoundsVolume() {
    this._winSound.setVolume(this._currentVolume);
    this._loseSound.setVolume(this._currentVolume);
  }

  _resetLevel() {
    this._resetScene();

    this._furnitureController.createInitFurniture();
    this._furnitureController.createFurniture();

    this._updateFurnitureForRobotCleaner();
    this._createGhosts();
  }

  _resetScene() {
    this._isGameplayActive = true;
    this._isEndScreenShown = false;

    this._furnitureController.setLevel(this._currentLevel);
    this._furnitureController.reset();
    this._currentModelIndex = 0;
    this._score = 0;

    this._ui.hideWinScreen();
    this._ui.hideLoseScreen();
    this._ui.showLevel();

    this._drone.reset();
    this._room.resetDecorations();
    this._robotCleaner.reset();

    this._furnitureController.killFurniture();
    this._furnitureController.killInitFurniture();

    this._ghostController.killGhosts();

    this._target.hide();
  }

  _createGhosts() {
    const furniture = this._furnitureController.getFurniture();
    this._ghostController.createGhosts(furniture);

    const allFurniture = this._furnitureController.getAllFurniture();
    const collideObjects = allFurniture.concat(this._robotCleaner);
    this._ghostController.setCollideObjects(collideObjects);
  }

  _showAdditionalRoomElements() {
    this._furnitureController.showInitFurniture();
    this._showRobotCleaner();
  }

  _showRobotCleaner() {
    const robotConfig = LEVELS_CONFIG[this._currentLevel].robotCleaner;
    if (robotConfig.enabled) {
      this._robotCleaner.body.position.x = robotConfig.position.x;
      this._robotCleaner.body.position.z = robotConfig.position.z;
      this._robotCleaner.body.position.y = 0;

      this._robotCleaner.setAngle(robotConfig.angle);
      this._robotCleaner.show();
    }
  }

  _startLevel() {
    if (!this._isGameGlobalActive) {
      return;
    }

    if (!this._isTutorialShown) {
      this._ui.showTutorial();
      this._isTutorialShown = true;
    }

    this._furnitureController.showFurniture();

    const furniture = this._furnitureController.getCurrentFurniture();
    this._showTarget(furniture.modelConfig.targetType, furniture.rotation.y);

    this._startDrone(furniture);
    this._startRobotCleaner();
  }

  _startDrone(furniture) {
    this._drone.show();
    this._drone.position.y = furniture.position.y + furniture.size.y / 2 + this._drone.size.y / 2;
    this._drone.position.x = furniture.position.x;
    this._drone.position.z = furniture.position.z;
  }

  _startRobotCleaner() {
    const robotConfig = LEVELS_CONFIG[this._currentLevel].robotCleaner;
    if (robotConfig.enabled) {
      this._robotCleaner.startMove();
    }
  }

  _onFurnitureSleep(furniture) {
    this._calculateRating(furniture);
  }

  _showTarget(targetType, rotation) {
    const furnitureConfig = LEVELS_CONFIG[this._currentLevel].furniture;
    const { targetGridPosition, angle } = furnitureConfig[this._currentModelIndex];

    const { x, z } = this._room.getPositionByGrid(targetGridPosition.x, targetGridPosition.z);
    this._target.position.x = x;
    this._target.position.z = z;
    let targetHeight = 0.02;

    if (targetType === TARGET_TYPE.small) {
      const allFurniture = this._furnitureController.getAllFurniture();
      const allFurnitureBox = allFurniture.map((furniture) => furniture.box);
      const height = this._heightMeter.getHeight(x, z, allFurnitureBox);

      if (height) {
        targetHeight = height + 0.02;
      }
    }

    this._target.position.y = targetHeight;

    if (targetType === TARGET_TYPE.big) {
      const isRotated = (angle / 90) % 2 !== 0;

      if (!isRotated) {
        this._target.position.z += this._cellSize.width / 2;
      } else {
        this._target.position.x += this._cellSize.depth / 2;
      }
    }

    this._target.show(targetType, rotation);
  }

  _calculateRating(furniture) {
    const distance = this._getDistanceToTarget(furniture);
    const isStandVertically = this._furnitureController.isStandVertically(furniture);

    if (!isStandVertically) {
      return;
    }

    let bigFurnitureCoeff = 1;

    if (!furniture.modelConfig.isOneTile) {
      const config = LEVELS_CONFIG[this._currentLevel].furniture[this._currentModelIndex];
      const isRotated = (config.angle / 90) % 2 !== 0;

      if ((config.appearDirection === APPEAR_DIRECTION.right && isRotated)
        || (config.appearDirection === APPEAR_DIRECTION.left && !isRotated)) {
        bigFurnitureCoeff = BIG_FURNITURE_COEFF;
      }
    }

    // let rating;

    if (distance < (RATING_DISTANCE[RATING_TYPE.perfect] * RATING_DISTANCE[RATING_TYPE.perfect]) * bigFurnitureCoeff) {
      // rating = RATING_TYPE.perfect;

      this._furnitureController.showStars(furniture);

      this._score += 2;
    } else if (distance < (RATING_DISTANCE[RATING_TYPE.good] * RATING_DISTANCE[RATING_TYPE.good]) * bigFurnitureCoeff) {
      // rating = RATING_TYPE.good;

      this._score += 1;
    } else {
      // rating = RATING_TYPE.bad;
    }
  }

  _getDistanceToTarget(furniture) {
    const furniturePosition = furniture.position;
    const furnitureConfig = LEVELS_CONFIG[this._currentLevel].furniture;
    const target = furnitureConfig[this._currentModelIndex];
    const targetGridPosition = this._room.getPositionByGrid(target.targetGridPosition.x, target.targetGridPosition.z);

    const dx = furniturePosition.x - targetGridPosition.x;
    const dz = furniturePosition.z - targetGridPosition.z;

    const distance = dx * dx + dz * dz;

    return distance;
  }

  _updateFurnitureForRobotCleaner() {
    const allFurniture = this._furnitureController.getAllFurniture();
    this._robotCleaner.setFurniture(allFurniture);
  }

  _init() {
    this._initHeightMeter();
    this._initSignals();
    this._initSounds();
    this.onSoundsEnabledChanged();
  }

  _initHeightMeter() {
    const wallHeight = this._room.getWallHeight();
    this._heightMeter = new HeightMeter(wallHeight);
  }

  _initSignals() {
    this._room.events.on('roomShown', () => this._showAdditionalRoomElements());
    this._room.events.on('decorationsShown', () => this._startLevel());

    this._furnitureController.events.on('canFall', (msg, currentModelIndex) => this._ghostController.showGhost(currentModelIndex));
    this._furnitureController.events.on('showNextFurniture', () => this._onShowNextFurniture());
    this._furnitureController.events.on('sleep', (msg, furniture) => this._onFurnitureSleep(furniture));
    this._furnitureController.events.on('onLevelEnd', () => this._onLevelEnd());
    this._furnitureController.events.on('fall', () => this._onFurnitureFall());
    this._furnitureController.events.on('furnitureFall', () => this._room.bouncePictures());
    this._furnitureController.events.on('furnitureCollision', () => this.events.post('furnitureCollision'));

    this._robotCleaner.events.on('collide', () => this.defeat());

    this._ui.events.on('onLoadingScreenHidden', () => this.startGame());
  }

  _initSounds() {
    const winSound = this._winSound = new THREE.PositionalAudio(this._audioListener);
    this.add(winSound);

    const loseSound = this._loseSound = new THREE.PositionalAudio(this._audioListener);
    this.add(loseSound);

    winSound.setRefDistance(10);
    loseSound.setRefDistance(10);

    this._updateCurrentSoundsVolume();

    const winSoundAnalyser = new THREE.AudioAnalyser(winSound, 128);
    const loseSoundAnalyser = new THREE.AudioAnalyser(loseSound, 128);
    this._soundsAnalyzer.push(winSoundAnalyser);
    this._soundsAnalyzer.push(loseSoundAnalyser);

    const fallSoundAnalyser = this._furnitureController.getFallSoundAnalyser();
    this._soundsAnalyzer.push(fallSoundAnalyser);

    const floorShowSoundAnalyser = this._room.getFloorShowSoundAnalyser();
    this._soundsAnalyzer.push(floorShowSoundAnalyser);

    const wallsShowSoundAnalyser = this._room.getWallsShowSoundAnalyser();
    this._soundsAnalyzer.push(wallsShowSoundAnalyser);

    Loader.events.on('onAudioLoaded', () => {
      this._winSound.setBuffer(Loader.assets['transfer-it/win']);
      this._loseSound.setBuffer(Loader.assets['transfer-it/lose']);
    });
  }

  _playSound(sound) {
    if (sound.isPlaying) {
      sound.stop();
    }

    sound.play();
  }

  _onShowNextFurniture() {
    this._currentModelIndex += 1;
    this._furnitureController.showFurniture();

    const furniture = this._furnitureController.getCurrentFurniture();
    this._showTarget(furniture.modelConfig.targetType, furniture.rotation.y);
    this._startDrone(furniture);
  }

  _onLevelEnd() {
    if (this._score >= LEVELS_CONFIG[this._currentLevel].furniture.length) {
      this.victory();
    } else {
      this.defeat();
    }
  }

  _onRestartLevel() {
    this.events.post('restart-level');

    this._resetLevel();
    this._showAdditionalRoomElements();

    Delayed.call(300, () => {
      this._startLevel();
    });
  }

  _onNextLevel() {
    this._currentLevel += 1;
    this._currentUILevel += 1;

    if (this._currentLevel > LEVELS_CONFIG.length - 1) {
      this._currentLevel = 0;
    }

    this._resetLevel();
    this._room.hide();
    this._ui.setLevel(this._currentUILevel + 1);

    Delayed.call(100, () => {
      this._room.show();
    });
  }

  _onFurnitureFall() {
    if (!this._isEndScreenShown) {
      this.defeat();
    }
  }
}
