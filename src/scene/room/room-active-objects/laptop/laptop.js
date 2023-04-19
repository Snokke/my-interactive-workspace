import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { MONITOR_TYPE, ROOM_CONFIG } from '../../data/room-config';
import { LAPTOP_MOUNT_PARTS, LAPTOP_PARTS, LAPTOP_PART_TYPE, LAPTOP_POSITION_STATE, LAPTOP_SCREEN_MUSIC_PARTS, LAPTOP_STATE, MUSIC_ORDER } from './laptop-data';
import { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG, LAPTOP_SCREEN_MUSIC_CONFIG } from './laptop-config';
import { HELP_ARROW_TYPE } from '../../shared-objects/help-arrows/help-arrows-config';
import HelpArrows from '../../shared-objects/help-arrows/help-arrows';
import Loader from '../../../../core/loader';
import vertexShader from '../../shared-objects/sparkle-shaders/sparkle-vertex.glsl';
import fragmentShader from '../../shared-objects/sparkle-shaders/sparkle-fragment.glsl';
import LaptopParts from './laptop-parts';
import { SPARKLE_CONFIG } from '../../shared-objects/sparkle-shaders/sparkle-config';

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

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const laptopStand = this._parts[LAPTOP_PART_TYPE.LaptopStand];
      const laptopMount = this._parts[LAPTOP_PART_TYPE.LaptopMount];
      const laptopArmMountBase = this._parts[LAPTOP_PART_TYPE.LaptopArmMountBase];
      const laptopArmMountArm01 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm01];
      const laptopArmMountArm02 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm02];
      const armMountParts = [laptopStand, laptopMount, laptopArmMountBase, laptopArmMountArm01, laptopArmMountArm02]

      const laptopKeyboard = this._parts[LAPTOP_PART_TYPE.LaptopKeyboard];
      const laptopMonitor = this._parts[LAPTOP_PART_TYPE.LaptopMonitor];
      const laptopScreen = this._parts[LAPTOP_PART_TYPE.LaptopScreen];
      const laptopParts = [laptopKeyboard, laptopMonitor, laptopScreen]

      armMountParts.forEach((part) => {
        new TWEEN.Tween(part.position)
          .to({ y: part.userData.startPosition.y }, fallDownTime)
          .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
          .start();
      });

      laptopParts.forEach((part) => {
        new TWEEN.Tween(part.position)
          .to({ y: part.userData.startPosition.y }, fallDownTime)
          .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
          .delay(fallDownTime * 0.5)
          .start();
      });

      Delayed.call(fallDownTime * 0.5 + fallDownTime, () => {
        this._debugMenu.enable();
        this._onShowAnimationComplete();
      });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (LAPTOP_PARTS.includes(partType)) {
      this._laptopInteract();
    }

    if (LAPTOP_MOUNT_PARTS.includes(partType)) {
      this._standInteract(intersect);
    }

    if (LAPTOP_SCREEN_MUSIC_PARTS.includes(partType)) {
      this._switchMusic(partType);
    }
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

  onPointerOver(mesh) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const partType = mesh.userData.partType;

    if (LAPTOP_MOUNT_PARTS.includes(partType)) {
      this._helpArrows.show();
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
  }

  getScreen() {
    return this._parts[LAPTOP_PART_TYPE.LaptopScreen];
  }

  onSongEnded() {
    const nextMusicType = this._getNextMusicType();
    const partType = this._getPartTypeByMusicType(nextMusicType);
    this._switchMusic(partType);
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
    }

    this._debugMenu.updateLaptopButtonTitle();

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

        if (LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Closed) {
          this.events.post('onLaptopClosed');
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

    const signalName = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[partType].signalName;
    this.events.post(signalName);
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

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initScreenTexture();
    this._initButtonsWithSparkles();
    this._initHelpArrows();
    this._initDebugMenu();
    this._initSignals();
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
      return LAPTOP_SCREEN_MUSIC_CONFIG[key].musicType === musicType;
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
}
