import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import RoomObjectAbstract from '../room-object.abstract';
import { MONITOR_TYPE } from '../../data/room-config';
import { LAPTOP_MOUNT_PARTS, LAPTOP_PARTS, LAPTOP_PART_TYPE, LAPTOP_POSITION_STATE, LAPTOP_SCREEN_MUSIC_PARTS, LAPTOP_STATE, MUSIC_ORDER } from './data/laptop-data';
import { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG, LAPTOP_SCREEN_MUSIC_CONFIG } from './data/laptop-config';
import { HELP_ARROW_TYPE } from '../../shared/help-arrows/help-arrows-config';
import HelpArrows from '../../shared/help-arrows/help-arrows';
import Loader from '../../../../core/loader';
import sparkleVertexShader from '../../shared/sparkle-shaders/sparkle-vertex.glsl';
import sparkleFragmentShader from '../../shared/sparkle-shaders/sparkle-fragment.glsl';
import LaptopParts from './laptop-parts';
import { SPARKLE_CONFIG } from '../../shared/sparkle-shaders/sparkle-config';
import { Black } from 'black-engine';
import Materials from '../../../../core/materials';
import SCENE_CONFIG from '../../../../core/configs/scene-config';
import mixTexturesVertexShader from '../../shared/mix-three-textures-shaders/mix-three-textures-vertex.glsl';
import mixTexturesFragmentShader from '../../shared/mix-three-textures-shaders/mix-three-textures-fragment.glsl';

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
    this._isAllObjectsInteractionEnabled = false;

    this._init();
  }
  update(dt) {
    this._debugMenu.update(dt);

    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType) => {
      const part = this._parts[partType];
      part.material.uniforms.uTime.value += dt;
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
      Black.engine.containerElement.style.cursor = 'grabbing';

      if (SCENE_CONFIG.isMobile) {
        this._helpArrows.show();
      }
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

  onAllObjectsInteraction() {
    if (this._isAllObjectsInteractionEnabled) {
      if (LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Closed) {
        this._laptopInteract();
      }

      if (LAPTOP_CONFIG.currentMusicType) {
        const partType = this._getPartTypeByMusicType(LAPTOP_CONFIG.currentMusicType);
        this._switchMusic(partType);
      } else {
        this.playNextSong();
      }
    } else {
      this._laptopInteract();
    }
  }


  onPointerMove(raycaster) {
    if (!this._isMountSelected) {
      return;
    }

    const laptopArmMountArm02 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm02];
    const planeIntersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(this._plane, planeIntersect);

    const angle = Math.atan2(planeIntersect.z - laptopArmMountArm02.position.z, planeIntersect.x - laptopArmMountArm02.position.x);
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
    if (this._isPointerOver || SCENE_CONFIG.isMobile) {
      return;
    }

    super.onPointerOver();

    const partType = intersect.object.userData.partType;

    if (LAPTOP_MOUNT_PARTS.includes(partType)) {
      this._helpArrows.show();
      Black.engine.containerElement.style.cursor = 'grab';
    }

    if (partType === LAPTOP_PART_TYPE.LaptopScreen) {
      Black.engine.containerElement.style.cursor = 'zoom-in';
    }
  }

  onPointerUp() {
    Black.engine.containerElement.style.cursor = 'grab';

    if (SCENE_CONFIG.isMobile) {
      this._helpArrows.hide();
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

  getMeshesForOutlinePreview() {
    const laptopKeyboard = this._parts[LAPTOP_PART_TYPE.LaptopKeyboard];
    const laptopMonitor = this._parts[LAPTOP_PART_TYPE.LaptopMonitor];
    const laptopArmMountArm01 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm01];
    const laptopArmMountArm02 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm02];

    return [laptopKeyboard, laptopMonitor, laptopArmMountArm01, laptopArmMountArm02];
  }

  getScreen() {
    return this._parts[LAPTOP_PART_TYPE.LaptopScreen];
  }

  onSongEnded() {
    const nextMusicType = this._getNextMusicType();
    const partType = this._getPartTypeByMusicType(nextMusicType);
    this._switchMusic(partType);
  }

  playSong(musicType) {
    const partType = this._getPartTypeByMusicType(musicType);
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

  enableAllObjectsInteraction() {
    this._isAllObjectsInteractionEnabled = true;
  }

  disableAllObjectsInteraction() {
    this._isAllObjectsInteractionEnabled = false;
  }

  onLightPercentChange(lightPercent) {
    const monitor = this._parts[LAPTOP_PART_TYPE.LaptopMonitor];
    monitor.material.uniforms.uMixTextures0102Percent.value = lightPercent;
  }

  resetToInitState() {
    this._onDebugStopMusic();
    this._currentMusicIndex = 0;

    if ((LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Closed && LAPTOP_CONFIG.state === LAPTOP_STATE.Idle)
      || (LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Opened && LAPTOP_CONFIG.state === LAPTOP_STATE.Moving)) {
      this._laptopInteract();
    }

    LAPTOP_MOUNT_CONFIG.angle = LAPTOP_MOUNT_CONFIG.startAngle;
    this._onMountAngleChanged();
  }

  _clearButtonsColor() {
    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType) => {
      const button = this._parts[partType];
      button.material.uniforms.uColor.value = new THREE.Color(0xffffff);
    });
  }

  _laptopInteract() {
    this._isMountSelected = false;
    this.events.post('onLaptopMoving');

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

    const monitor = this._parts[LAPTOP_PART_TYPE.LaptopMonitor];
    const maxAngle = LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Opened ? 0 : LAPTOP_CONFIG.maxOpenAngle;

    const remainingRotationAngle = maxAngle - (-this._laptopTopGroup.rotation.x * THREE.MathUtils.RAD2DEG);
    const time = Math.abs(remainingRotationAngle) / LAPTOP_CONFIG.rotationSpeed * 100;

    this._laptopTween = new TWEEN.Tween(this._laptopTopGroup.rotation)
      .to({ x: -maxAngle * THREE.MathUtils.DEG2RAD }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        LAPTOP_CONFIG.angle = -this._laptopTopGroup.rotation.x * THREE.MathUtils.RAD2DEG;
        const openPercent = THREE.MathUtils.clamp(LAPTOP_CONFIG.angle / LAPTOP_CONFIG.maxOpenAngle, 0, 1);
        monitor.material.uniforms.uMixTexture03Percent.value = 1 - openPercent;
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

        this.events.post('onLaptopStopMoving');
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
    const texture = Loader.assets[texturePause];
    // texture.colorSpace = THREE.SRGBColorSpace;
    part.material.uniforms.uTexture.value = texture;
  }

  _setPartTexturePlaying(partType) {
    const part = this._parts[partType];
    const texturePlaying = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[partType].texturePlaying;
    const texture = Loader.assets[texturePlaying];
    // texture.colorSpace = THREE.SRGBColorSpace;
    part.material.uniforms.uTexture.value = texture;
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

    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType) => {
      const button = this._parts[partType];
      button.visible = true;
    });
  }

  _hideScreen() {
    this._isScreenHided = true;

    const screen = this._parts[LAPTOP_PART_TYPE.LaptopScreen];
    screen.visible = false;

    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType) => {
      const button = this._parts[partType];
      button.visible = false;
    });
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addMonitorMaterials();
    this._addPartsToScene();
    this._initScreenTexture();
    this._initButtonsWithSparkles();
    this._initHelpArrows();
    this._initDebugMenu();
    this._initSignals();
  }

  _addMaterials() {
    const bigObjectsMaterial = Materials.getMaterial(Materials.type.bakedBigObjects);
    const smallObjectsMaterial = Materials.getMaterial(Materials.type.bakedSmallObjects);

    const armMount01 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm01];
    const armMount02 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm02];
    armMount01.material = bigObjectsMaterial;
    armMount02.material = bigObjectsMaterial;

    const keyboard = this._parts[LAPTOP_PART_TYPE.LaptopKeyboard];
    keyboard.material = smallObjectsMaterial;
  }

  _addMonitorMaterials() {
    const bakedTextureLightOn = Loader.assets['baked-textures/baked-laptop-monitor'];
    bakedTextureLightOn.flipY = false;

    const bakedTextureLightOff = Loader.assets['baked-textures/baked-laptop-monitor-light-off'];
    bakedTextureLightOff.flipY = false;

    const bakedTextureClosed = Loader.assets['baked-textures/baked-laptop-monitor-closed-light-off'];
    bakedTextureClosed.flipY = false;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture01: { value: bakedTextureLightOff },
        uTexture02: { value: bakedTextureLightOn },
        uTexture03: { value: bakedTextureClosed },
        uMixTextures0102Percent: { value: 1 },
        uMixTexture03Percent: { value: 0 },
      },
      vertexShader: mixTexturesVertexShader,
      fragmentShader: mixTexturesFragmentShader,
    });

    const monitor = this._parts[LAPTOP_PART_TYPE.LaptopMonitor];
    monitor.material = material;
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
    const texture = Loader.assets['screens/laptop/laptop-screen'];
    // texture.colorSpace = THREE.SRGBColorSpace;

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
        vertexShader: sparkleVertexShader,
        fragmentShader: sparkleFragmentShader,
      });

      this._setPartTexturePause(partType);
    });
  }

  _initHelpArrows() {
    const helpArrowsTypes = [HELP_ARROW_TYPE.LaptopMountLeft, HELP_ARROW_TYPE.LaptopMountRight];
    const helpArrows = this._helpArrows = new HelpArrows(helpArrowsTypes);
    this._armWithLaptopGroup.add(helpArrows);

    const stand = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm02];
    helpArrows.position.copy(stand.position.clone());
    helpArrows.position.x += 0.2;
    helpArrows.position.y -= 0.27;
    helpArrows.position.z += 2.4;
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
        const previousIndex = index - 1;
        const previousMusicType = MUSIC_ORDER[previousIndex];

        if (previousMusicType) {
          resultMusicType = previousMusicType;
        } else {
          resultMusicType = MUSIC_ORDER[MUSIC_ORDER.length - 1];
        }
      }
    });

    return resultMusicType;
  }
}
