import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { MONITOR_TYPE, ROOM_CONFIG } from '../../data/room-config';
import { LAPTOP_MOUNT_PARTS, LAPTOP_PARTS, LAPTOP_PART_TYPE, LAPTOP_POSITION_STATE, LAPTOP_SCREEN_MUSIC_PARTS, LAPTOP_STATE, MUSIC_ORDER } from './data/laptop-data';
import { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG, LAPTOP_SCREEN_MUSIC_CONFIG } from './data/laptop-config';
import { HELP_ARROW_TYPE } from '../../shared-objects/help-arrows/help-arrows-config';
import HelpArrows from '../../shared-objects/help-arrows/help-arrows';
import Loader from '../../../../core/loader';
import vertexShader from '../../shared-objects/sparkle-shaders/sparkle-vertex.glsl';
import fragmentShader from '../../shared-objects/sparkle-shaders/sparkle-fragment.glsl';
import LaptopParts from './laptop-parts';
import { SPARKLE_CONFIG } from '../../shared-objects/sparkle-shaders/sparkle-config';
import { Black } from 'black-engine';

export default class Laptop extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._laptopTopGroup = null;
    this._armWithLaptopGroup = null;
    this._laptopTween = null;
    this._helpArrows = null;

    this._isMountSelected = false;
    this._plane = new THREE.Plane();
    this._pNormal = new THREE.Vector3(0, 1, 0);

    this._previousArmMountAngle = 0;
    this._currentMusicIndex = 0;

    this._isScreenHided = false;

    this._init();
  }
  update(dt) {
    this._debugMenu.update(dt);

    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType) => {
      const part = this._parts[partType];
      part.material.uniforms.uTime.value += dt;
    });
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();
    this._instantCloseLaptop();

    Delayed.call(delay, () => {
      this.visible = true;

      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const laptopArmMountBase = this._parts[LAPTOP_PART_TYPE.LaptopArmMountBase];
      const laptopArmMountArm01 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm01];
      const laptopArmMountArm02 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm02];

      new TWEEN.Tween(laptopArmMountBase.position)
        .to({ y: laptopArmMountBase.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(laptopArmMountArm01.position)
        .to({ y: laptopArmMountArm01.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(this._armWithLaptopGroup.position)
        .to({ y: laptopArmMountArm02.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start()
        .onComplete(() => {
          this._laptopInteract();

          this._debugMenu.enable();
          this._onShowAnimationComplete();
        });
    });
  }

  onClick(intersect, onPointerDownClick) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;
    let isObjectDraggable = false;

    if (LAPTOP_MOUNT_PARTS.includes(partType)) {
      isObjectDraggable = true;
      this._standInteract(intersect);
    }

    if (onPointerDownClick === false) {
      if (LAPTOP_PARTS.includes(partType)) {
        this._laptopInteract();
      }

      if (LAPTOP_SCREEN_MUSIC_PARTS.includes(partType)) {
        this._switchMusic(partType);
      }

      if (partType === LAPTOP_PART_TYPE.LaptopScreen) {
        this.events.post('onLaptopScreenClick');
      }
    }

    return isObjectDraggable;
  }

  onPointerMove(raycaster) {
    if (!this._isMountSelected) {
      return;
    }

    const laptopMount = this._parts[LAPTOP_PART_TYPE.LaptopStand];
    const planeIntersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(this._plane, planeIntersect);

    const angle = Math.atan2(planeIntersect.z - laptopMount.position.z, planeIntersect.x - laptopMount.position.x);
    const angleDelta = angle - this._previousArmMountAngle;

    if (Math.abs(angleDelta) < 0.1) {
      LAPTOP_MOUNT_CONFIG.angle += angleDelta * THREE.MathUtils.RAD2DEG;
    }

    const leftEdge = LAPTOP_MOUNT_CONFIG.leftEdgeAngle;
    const rightEdge = LAPTOP_MOUNT_CONFIG.rightEdgeAngle;

    LAPTOP_MOUNT_CONFIG.angle = THREE.MathUtils.clamp(LAPTOP_MOUNT_CONFIG.angle, leftEdge, rightEdge);
    this._onMountAngleChanged();
    this._debugMenu.updateMountAngle();

    this._previousArmMountAngle = angle;
  }

  onPointerOver(intersect) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const partType = intersect.object.userData.partType;

    if (LAPTOP_MOUNT_PARTS.includes(partType)) {
      this._helpArrows.show();
    }

    if (partType === LAPTOP_PART_TYPE.LaptopScreen) {
      Black.engine.containerElement.style.cursor = 'zoom-in';
    }
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    this._helpArrows.hide();
  }

  getMeshesForOutline(mesh) {
    const partType = mesh.userData.partType;

    if (LAPTOP_MOUNT_PARTS.includes(partType)) {
      return this._getLaptopMountParts();
    }

    if (LAPTOP_PARTS.includes(partType)) {
      return this._getLaptopParts();
    }

    if (LAPTOP_SCREEN_MUSIC_PARTS.includes(partType)) {
      return [mesh];
    }

    if (partType === LAPTOP_PART_TYPE.LaptopScreen) {
      return [mesh];
    }
  }

  getScreen() {
    return this._parts[LAPTOP_PART_TYPE.LaptopScreen];
  }

  onSongEnded() {
    const nextMusicType = this._getNextMusicType();
    const partType = this._getPartTypeByMusicType(nextMusicType);
    this._switchMusic(partType);
  }

  playNextSong() {
    this._currentMusicIndex += 1;

    if (this._currentMusicIndex >= MUSIC_ORDER.length) {
      this._currentMusicIndex = 0;
    }

    const musicType = MUSIC_ORDER[this._currentMusicIndex];
    const partType = this._getPartTypeByMusicType(musicType);
    this._switchMusic(partType);
  }

  playPreviousSong() {
    this._currentMusicIndex -= 1;

    if (this._currentMusicIndex < 0) {
      this._currentMusicIndex = MUSIC_ORDER.length - 1;
    }

    const musicType = MUSIC_ORDER[this._currentMusicIndex];
    const partType = this._getPartTypeByMusicType(musicType);
    this._switchMusic(partType);
  }

  stopCurrentMusic() {
    if (LAPTOP_CONFIG.currentMusicType) {
      const previousPartType = this._getPartTypeByMusicType(LAPTOP_CONFIG.currentMusicType);
      this._setPartTexturePause(previousPartType);

      LAPTOP_CONFIG.currentMusicType = null;
    }
  }

  updateCurrentSongTime(time) {
    this._debugMenu.updateCurrentSongTime(time);
  }

  onDebugMusicChanged(musicType, musicDuration) {
    this._debugMenu.updateDuration(musicDuration);
    this._debugMenu.setCurrentSong(musicType);
  }

  onLeftKeyClick(buttonType) {
    if (buttonType !== null && LAPTOP_SCREEN_MUSIC_PARTS.includes(buttonType)) {
      this._switchMusic(buttonType);
    }
  }

  onButtonOver(buttonType) {
    this._clearButtonsColor();

    const button = this._parts[buttonType];
    button.material.uniforms.uColor.value = LAPTOP_SCREEN_MUSIC_CONFIG.mouseOverColor;
  }

  onButtonOut() {
    this._clearButtonsColor();
  }

  playPauseCurrentMusic() {
    const musicType = MUSIC_ORDER[this._currentMusicIndex];
    const partType = this._getPartTypeByMusicType(musicType);
    this._switchMusic(partType);
  }

  setScreenActive() {
    this._parts[LAPTOP_PART_TYPE.LaptopScreen].userData.isActive = true;
  }

  setScreenInactive() {
    this._parts[LAPTOP_PART_TYPE.LaptopScreen].userData.isActive = false;
  }

  _clearButtonsColor() {
    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType) => {
      const button = this._parts[partType];
      button.material.uniforms.uColor.value = new THREE.Color(0xffffff);
    });
  }

  _laptopInteract() {
    this._isMountSelected = false;

    if (LAPTOP_CONFIG.state === LAPTOP_STATE.Moving) {
      this._updateLaptopPositionType();
      this._debugMenu.updateLaptopButtonTitle();
    }

    if (this._isScreenHided) {
      this._showScreen();
    }

    LAPTOP_CONFIG.state = LAPTOP_STATE.Moving;
    this._debugMenu.updateTopPanelState();
    this._stopLaptopTween();

    const maxAngle = LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Opened ? 0 : LAPTOP_CONFIG.maxOpenAngle;

    const remainingRotationAngle = maxAngle - (-this._laptopTopGroup.rotation.x * THREE.MathUtils.RAD2DEG);
    const time = Math.abs(remainingRotationAngle) / LAPTOP_CONFIG.rotationSpeed * 100;

    this._laptopTween = new TWEEN.Tween(this._laptopTopGroup.rotation)
      .to({ x: -maxAngle * THREE.MathUtils.DEG2RAD }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        LAPTOP_CONFIG.angle = -this._laptopTopGroup.rotation.x * THREE.MathUtils.RAD2DEG;
      })
      .onComplete(() => {
        this._updateLaptopPositionType();
        this._debugMenu.updateLaptopButtonTitle();

        if (LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Closed) {
          this.events.post('onLaptopClosed');
          this._hideScreen();
        }

        LAPTOP_CONFIG.state = LAPTOP_STATE.Idle;
        this._debugMenu.updateTopPanelState();
      });
  }

  _updateLaptopPositionType() {
    LAPTOP_CONFIG.positionType = LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Opened ? LAPTOP_POSITION_STATE.Closed : LAPTOP_POSITION_STATE.Opened;
  }

  _stopLaptopTween() {
    if (this._laptopTween) {
      this._laptopTween.stop();
    }
  }

  _standInteract(intersect) {
    this._isMountSelected = true;

    const pIntersect = new THREE.Vector3().copy(intersect.point);
    this._plane.setFromNormalAndCoplanarPoint(this._pNormal, pIntersect);
  }

  _switchMusic(partType) {
    const musicType = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[partType].musicType;

    if (LAPTOP_CONFIG.currentMusicType === musicType) {
      LAPTOP_CONFIG.currentMusicType = null;
      this._setPartTexturePause(partType);
    } else {
      if (LAPTOP_CONFIG.currentMusicType) {
        const previousPartType = this._getPartTypeByMusicType(LAPTOP_CONFIG.currentMusicType);
        this._setPartTexturePause(previousPartType);
      }

      LAPTOP_CONFIG.currentMusicType = musicType;
      this._setPartTexturePlaying(partType)
    }

    this._currentMusicIndex = this._getCurrentMusicIndex(partType);
    const signalName = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[partType].signalName;
    this.events.post(signalName);
  }

  _getCurrentMusicIndex(partType) {
    const musicType = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[partType].musicType;
    const musicIndex = MUSIC_ORDER.indexOf(musicType);

    return musicIndex;
  }

  _setPartTexturePause(partType) {
    const part = this._parts[partType];
    const texturePause = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[partType].texturePause;
    part.material.uniforms.uTexture.value = Loader.assets[texturePause];
  }

  _setPartTexturePlaying(partType) {
    const part = this._parts[partType];
    const texturePlaying = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[partType].texturePlaying;
    part.material.uniforms.uTexture.value = Loader.assets[texturePlaying];
  }

  _setPositionForShowAnimation() {
    const laptopArmMountBase = this._parts[LAPTOP_PART_TYPE.LaptopArmMountBase];
    const laptopArmMountArm01 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm01];
    const laptopArmMountArm02 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm02];

    this._armWithLaptopGroup.position.y = laptopArmMountArm02.userData.startPosition.y +  ROOM_CONFIG.startAnimation.startPositionY;
    laptopArmMountBase.position.y = laptopArmMountBase.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;
    laptopArmMountArm01.position.y = laptopArmMountArm01.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;
  }

  _instantCloseLaptop() {
    this._laptopTopGroup.rotation.x = 0;

    LAPTOP_CONFIG.positionType = LAPTOP_POSITION_STATE.Closed;
    this._debugMenu.updateLaptopButtonTitle();

    this.events.post('onLaptopClosed');
  }

  _showScreen() {
    this._isScreenHided = false;

    const screen = this._parts[LAPTOP_PART_TYPE.LaptopScreen];
    screen.visible = true;

    const keyboardSymbols = this._parts[LAPTOP_PART_TYPE.LaptopKeyboardSymbols];
    keyboardSymbols.visible = true;

    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType) => {
      const button = this._parts[partType];
      button.visible = true;
    });
  }

  _hideScreen() {
    this._isScreenHided = true;

    const screen = this._parts[LAPTOP_PART_TYPE.LaptopScreen];
    screen.visible = false;

    const keyboardSymbols = this._parts[LAPTOP_PART_TYPE.LaptopKeyboardSymbols];
    keyboardSymbols.visible = false;

    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType) => {
      const button = this._parts[partType];
      button.visible = false;
    });
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initScreenTexture();
    this._initKeyboardTexture();
    this._initButtonsWithSparkles();
    this._initHelpArrows();
    this._initDebugMenu();
    this._initSignals();

    this._instantCloseLaptop();

    if (!ROOM_CONFIG.startAnimation.showOnStart) {
      this._laptopInteract();
    }
  }

  _initSignals() {
    this._debugMenu.events.on('openLaptop', () => this._laptopInteract());
    this._debugMenu.events.on('mountAngleChanged', () => this._onMountAngleChanged());
    this._debugMenu.events.on('playMusic', (msg, musicType) => this._onDebugPlayMusic(musicType));
    this._debugMenu.events.on('stopMusic', () => this._onDebugStopMusic());
  }

  _onMountAngleChanged() {
    this._armWithLaptopGroup.rotation.y = LAPTOP_MOUNT_CONFIG.angle * THREE.MathUtils.DEG2RAD;
  }

  _onDebugPlayMusic(musicType) {
    const partType = this._getPartTypeByMusicType(musicType);
    this._switchMusic(partType);
  }

  _onDebugStopMusic() {
    if (LAPTOP_CONFIG.currentMusicType) {
      const partType = this._getPartTypeByMusicType(LAPTOP_CONFIG.currentMusicType);
      this._switchMusic(partType);
    }
  }

  _addPartsToScene() {
    super._addPartsToScene();

    const laptopParts = new LaptopParts(this._parts);

    this._armWithLaptopGroup = laptopParts.getArmWithLaptopGroup();
    this.add(this._armWithLaptopGroup);

    this._laptopTopGroup = laptopParts.getLaptopTopGroup();
  }

  _initScreenTexture() {
    const screen = this._parts[LAPTOP_PART_TYPE.LaptopScreen];
    const texture = Loader.assets['laptop-screen'];

    screen.material = new THREE.MeshBasicMaterial({
      map: texture,
    });
  }

  _initButtonsWithSparkles() {
    const sparkleConfig = SPARKLE_CONFIG[MONITOR_TYPE.Laptop];

    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType, i) => {
      const part = this._parts[partType];

      const uniforms = {
        uTime: { value: 0 },
        uStartOffset: { value: i / 3 },
        uTexture: { value: null },
        uColor: { value: new THREE.Color(0xffffff) },
        uSparkleColor: { value: sparkleConfig.color },
        uLineThickness: { value: sparkleConfig.thickness },
        uBlurAmount: { value: sparkleConfig.blur },
        uLineAngle: { value: sparkleConfig.angle * THREE.MathUtils.DEG2RAD },
        uSpeed: { value: sparkleConfig.speed },
        uLineMovingWidth: { value: sparkleConfig.movingWidth },
      }

      part.material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
      });

      this._setPartTexturePause(partType);
    });
  }

  _initKeyboardTexture() {
    const keyboardSymbols = this._parts[LAPTOP_PART_TYPE.LaptopKeyboardSymbols];
    const texture = Loader.assets['mac-keyboard'];
    texture.flipY = false;

    keyboardSymbols.material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
  }

  _initHelpArrows() {
    const helpArrowsTypes = [HELP_ARROW_TYPE.LaptopMountLeft, HELP_ARROW_TYPE.LaptopMountRight];
    const helpArrows = this._helpArrows = new HelpArrows(helpArrowsTypes);
    this._armWithLaptopGroup.add(helpArrows);

    const stand = this._parts[LAPTOP_PART_TYPE.LaptopStand];
    helpArrows.position.copy(stand.position.clone());
    helpArrows.position.z += 0.7;
    helpArrows.position.y -= 0.27;
  }

  _getLaptopParts() {
    const parts = [];

    LAPTOP_PARTS.forEach((partName) => {
      parts.push(this._parts[partName]);
    });

    return parts;
  }

  _getLaptopMountParts() {
    const parts = [];

    LAPTOP_MOUNT_PARTS.forEach((partName) => {
      parts.push(this._parts[partName]);
    });

    return parts;
  }

  _getPartTypeByMusicType(musicType) {
    const partType = Object.keys(LAPTOP_SCREEN_MUSIC_CONFIG.buttons).find((key) => {
      return LAPTOP_SCREEN_MUSIC_CONFIG.buttons[key].musicType === musicType;
    });

    return partType;
  }

  _getNextMusicType() {
    let resultMusicType = null;

    MUSIC_ORDER.forEach((musicType, index) => {
      if (musicType === LAPTOP_CONFIG.currentMusicType) {
        const nextIndex = index + 1;
        const nextMusicType = MUSIC_ORDER[nextIndex];

        if (nextMusicType) {
          resultMusicType = nextMusicType;
        } else {
          resultMusicType = MUSIC_ORDER[0];
        }
      }
    });

    return resultMusicType;
  }

  _getPreviousMusicType() {
    let resultMusicType = null;

    MUSIC_ORDER.forEach((musicType, index) => {
      if (musicType === LAPTOP_CONFIG.currentMusicType) {
        const previosIndex = index - 1;
        const previosMusicType = MUSIC_ORDER[previosIndex];

        if (previosMusicType) {
          resultMusicType = previosMusicType;
        } else {
          resultMusicType = MUSIC_ORDER[MUSIC_ORDER.length - 1];
        }
      }
    });

    return resultMusicType;
  }
}
