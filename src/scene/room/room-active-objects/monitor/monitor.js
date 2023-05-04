import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { MONITOR_TYPE, ROOM_CONFIG } from '../../data/room-config';
import { MONITOR_PARTS_WITHOUT_BUTTONS, MONITOR_PART_TYPE, MONITOR_SCREEN_BUTTONS } from './data/monitor-data';
import  { MONITOR_ARM_MOUNT_CONFIG, MONITOR_BUTTONS_CONFIG, MONITOR_CONFIG } from './data/monitor-config';
import { HELP_ARROW_TYPE } from '../../shared-objects/help-arrows/help-arrows-config';
import HelpArrows from '../../shared-objects/help-arrows/help-arrows';
import Loader from '../../../../core/loader';
import { SPARKLE_CONFIG } from '../../shared-objects/sparkle-shaders/sparkle-config';
import sparkleVertexShader from '../../shared-objects/sparkle-shaders/sparkle-vertex.glsl';
import sparkleFragmentShader from '../../shared-objects/sparkle-shaders/sparkle-fragment.glsl';
import VolumeIcon from './volume-icon/volume-icon';
import { CAMERA_CONFIG } from '../../camera-controller/data/camera-config';
import { CAMERA_STATE } from '../../camera-controller/data/camera-data';
import { Black } from 'black-engine';

export default class Monitor extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._screenGroup = null;
    this._arrowsTween = null;
    this._helpArrows = null;
    this._screenTexture = null;
    this._showreelTexture = null;
    this._showreelVideoElement = null;
    this._volumeIcon = null;
    this._focusObject = null;

    this._plane = new THREE.Plane();
    this._pNormal = new THREE.Vector3(0, 1, 0);
    this._shift = new THREE.Vector3();
    this._currentPositionZ = 0;
    this._previousPositionZ = 0;

    this._isMountSelected = false;
    this._isShowreelPlaying = false;
    this._isShowreelPaused = false;

    this._init();
  }

  update(dt) {
    MONITOR_SCREEN_BUTTONS.forEach((partType) => {
      const part = this._parts[partType];
      part.material.uniforms.uTime.value += dt;
    });

    if (this._currentPositionZ === this._previousPositionZ) {
      return;
    }

    const monitor = this._parts[MONITOR_PART_TYPE.Monitor];
    const deltaZ = this._currentPositionZ - monitor.userData.startPosition.z;
    monitor.position.z = this._currentPositionZ;

    this._updateMonitorPosition(deltaZ);
    this._updateArmMount(deltaZ);
    this._updateHelpArrows(deltaZ);

    this._previousPositionZ = this._currentPositionZ;
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      this.visible = true;

      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      new TWEEN.Tween(this.position)
        .to({ y: 0 }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      Delayed.call(fallDownTime, () => {
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

    if (MONITOR_PARTS_WITHOUT_BUTTONS.includes(partType)) {
      isObjectDraggable = true;
      this._onMonitorClick(intersect);
      Black.engine.containerElement.style.cursor = 'grabbing';
    }

    if (onPointerDownClick === false && MONITOR_SCREEN_BUTTONS.includes(partType)) {
      this._onButtonsClick(partType);
    }

    if (onPointerDownClick === false && partType === MONITOR_PART_TYPE.MonitorScreen) {
      this.events.post('onMonitorScreenClick');
    }

    return isObjectDraggable;
  }

  onPointerMove(raycaster) {
    if (!this._isMountSelected) {
      return;
    }

    const planeIntersect = new THREE.Vector3();

    raycaster.ray.intersectPlane(this._plane, planeIntersect);
    const monitor = this._parts[MONITOR_PART_TYPE.Monitor];
    const startPositionZ = monitor.userData.startPosition.z;

    this._currentPositionZ = planeIntersect.z + this._shift.z;
    this._currentPositionZ = THREE.MathUtils.clamp(this._currentPositionZ, MONITOR_CONFIG.minZ + startPositionZ, MONITOR_CONFIG.maxZ + startPositionZ);

    this._updatePosition();
  }

  onPointerOver(intersect) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const partType = intersect.object.userData.partType;

    if (MONITOR_PARTS_WITHOUT_BUTTONS.includes(partType) && CAMERA_CONFIG.state === CAMERA_STATE.OrbitControls) {
      this._helpArrows.show();
      Black.engine.containerElement.style.cursor = 'grab';
    }

    if (partType === MONITOR_PART_TYPE.MonitorScreen) {
      Black.engine.containerElement.style.cursor = 'zoom-in';
    }
  }

  onPointerUp() {
    Black.engine.containerElement.style.cursor = 'grab';
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    this._helpArrows.hide();
  }

  onLeftKeyClick(buttonType) {
    if (buttonType !== null && MONITOR_SCREEN_BUTTONS.includes(buttonType)) {
      this._onButtonsClick(buttonType);
    }
  }

  onButtonOver(buttonType) {
    this._clearButtonsColor();

    const button = this._parts[buttonType];
    button.material.uniforms.uColor.value = MONITOR_BUTTONS_CONFIG.mouseOverColor;
  }

  onButtonOut() {
    this._clearButtonsColor();
  }

  stopShowreelVideo() {
    if (this._isShowreelPlaying) {
      this._stopShowreel();
    }
  }

  pauseShowreelVideo() {
    if (this._isShowreelPlaying) {
      if (this._isShowreelPaused) {
        this._resumeShowreel();
      } else {
        this._pauseShowreel();
      }
    }
  }

  getMeshesForOutline(mesh) {
    const partType = mesh.userData.partType;

    if (MONITOR_PARTS_WITHOUT_BUTTONS.includes(partType)) {
      return this._getPartsWithoutButtons();
    }

    if (MONITOR_SCREEN_BUTTONS.includes(partType)) {
      return [mesh];
    }

    if (partType === MONITOR_PART_TYPE.MonitorScreen) {
      return [mesh];
    }
  }

  getScreen() {
    return this._parts[MONITOR_PART_TYPE.MonitorScreen];
  }

  getZoomInFramePosition() {
    const worldPosition = new THREE.Vector3();
    const monitor = this._parts[MONITOR_PART_TYPE.Monitor];
    monitor.getWorldPosition(worldPosition);
    worldPosition.y += 1.3;

    return worldPosition;
  }

  setScreenActive() {
    this._parts[MONITOR_PART_TYPE.MonitorScreen].userData.isActive = true;
  }

  setScreenInactive() {
    this._parts[MONITOR_PART_TYPE.MonitorScreen].userData.isActive = false;
  }

  onVolumeChanged(volume) {
    this._volumeIcon.onVolumeChanged(volume);
  }

  enableSound() {
    this._volumeIcon.enableSound();
  }

  disableSound() {
    this._volumeIcon.disableSound();
  }

  getFocusPosition() {
    const monitorGlobalPosition = new THREE.Vector3();
    this._focusObject.getWorldPosition(monitorGlobalPosition);

    return monitorGlobalPosition;
  }

  _clearButtonsColor() {
    MONITOR_SCREEN_BUTTONS.forEach((partType) => {
      const button = this._parts[partType];
      button.material.uniforms.uColor.value = new THREE.Color(0xffffff);
    });
  }

  _onMonitorClick(intersect) {
    this._isMountSelected = true;
    const pIntersect = new THREE.Vector3().copy(intersect.point);
    this._plane.setFromNormalAndCoplanarPoint(this._pNormal, pIntersect);
    this._shift.subVectors(this._parts[MONITOR_PART_TYPE.Monitor].position, intersect.point);
  }

  _onButtonsClick(partType) {
    this._isMountSelected = false;

    if (!this._isShowreelPlaying) {
      if (partType === MONITOR_PART_TYPE.MonitorScreenShowreelIcon) {
        this._playShowreel();
      }

      if (partType === MONITOR_PART_TYPE.MonitorScreenCVIcon) {
        console.log('CV');
      }
    }

    if (partType === MONITOR_PART_TYPE.MonitorScreenCloseIcon && this._isShowreelPlaying) {
      this._stopShowreel();
    }
  }

  _playShowreel() {
    this._isShowreelPlaying = true;

    const showreelIcon = this._parts[MONITOR_PART_TYPE.MonitorScreenShowreelIcon];
    const CVIcon = this._parts[MONITOR_PART_TYPE.MonitorScreenCVIcon];
    const closeIcon = this._parts[MONITOR_PART_TYPE.MonitorScreenCloseIcon];

    closeIcon.visible = true;
    closeIcon.position.z += MONITOR_CONFIG.hideOffset;
    showreelIcon.visible = false;
    showreelIcon.position.z -= MONITOR_CONFIG.hideOffset;
    CVIcon.visible = false;
    CVIcon.position.z -= MONITOR_CONFIG.hideOffset;

    this._parts[MONITOR_PART_TYPE.MonitorScreen].material.map = this._showreelTexture;

    this._showreelVideoElement.play();

    this.events.post('onShowreelStart');
  }

  _stopShowreel() {
    this._isShowreelPlaying = false;
    this._isShowreelPaused = false;

    const showreelIcon = this._parts[MONITOR_PART_TYPE.MonitorScreenShowreelIcon];
    const CVIcon = this._parts[MONITOR_PART_TYPE.MonitorScreenCVIcon];
    const closeIcon = this._parts[MONITOR_PART_TYPE.MonitorScreenCloseIcon];

    closeIcon.visible = false;
    closeIcon.position.z -= MONITOR_CONFIG.hideOffset;
    showreelIcon.visible = true;
    showreelIcon.position.z += MONITOR_CONFIG.hideOffset;
    CVIcon.visible = true;
    CVIcon.position.z += MONITOR_CONFIG.hideOffset;

    this._parts[MONITOR_PART_TYPE.MonitorScreen].material.map = this._screenTexture;

    this._showreelVideoElement.pause();
    this._showreelVideoElement.currentTime = 0;

    this.events.post('onShowreelStop');
  }

  _pauseShowreel() {
    this._isShowreelPaused = true;

    this._showreelVideoElement.pause();
    this.events.post('onShowreelPause');
  }

  _resumeShowreel() {
    this._isShowreelPaused = false;

    this._showreelVideoElement.play();
    this.events.post('onShowreelPause');
  }

  _updatePosition() {
    MONITOR_CONFIG.positionZ = this._currentPositionZ - this._parts[MONITOR_PART_TYPE.Monitor].userData.startPosition.z;
    this._debugMenu.updatePosition();
  }

  _updateMonitorPosition(deltaZ) {
    const screen = this._parts[MONITOR_PART_TYPE.MonitorScreen];
    const monitorMount = this._parts[MONITOR_PART_TYPE.MonitorMount];

    this._screenGroup.position.z = screen.userData.startPosition.z + deltaZ;
    monitorMount.position.z = monitorMount.userData.startPosition.z + deltaZ;
  }

  _updateArmMount(deltaZ) {
    const monitor = this._parts[MONITOR_PART_TYPE.Monitor];
    const monitorMount = this._parts[MONITOR_PART_TYPE.MonitorMount];
    const arm01 = this._parts[MONITOR_PART_TYPE.MonitorArmMountArm01];
    const arm02 = this._parts[MONITOR_PART_TYPE.MonitorArmMountArm02];

    arm01.rotation.y = arm01.userData.startAngle.y - deltaZ * MONITOR_ARM_MOUNT_CONFIG.arm01.angleCoeff;
    arm02.rotation.y = arm02.userData.startAngle.y - deltaZ * MONITOR_ARM_MOUNT_CONFIG.arm02.angleCoeff;

    arm02.position.x = arm01.position.x + Math.cos(arm01.rotation.y + Math.PI * 0.5) * MONITOR_ARM_MOUNT_CONFIG.arm01.shoulderCoeff;
    arm02.position.z = arm01.position.z + Math.sin(arm01.rotation.y + Math.PI * 0.5) * MONITOR_ARM_MOUNT_CONFIG.arm01.shoulderCoeff;

    const bonusAngle = MONITOR_ARM_MOUNT_CONFIG.arm02.bonusAngle * THREE.MathUtils.DEG2RAD;
    const positionX = arm02.position.x + Math.cos(-arm02.rotation.y - bonusAngle + Math.PI * 0.5) * MONITOR_ARM_MOUNT_CONFIG.arm02.shoulderCoeff;
    monitor.position.x = monitorMount.position.x = this._screenGroup.position.x = positionX;

    this._updateArmRotation();
    this._debugMenu.updateArmRotation();
  }

  _updateArmRotation() {
    const arm01 = this._parts[MONITOR_PART_TYPE.MonitorArmMountArm01];
    const arm02 = this._parts[MONITOR_PART_TYPE.MonitorArmMountArm02];

    MONITOR_ARM_MOUNT_CONFIG.arm01.angle = Math.round(arm01.rotation.y * THREE.MathUtils.RAD2DEG * 100) / 100;
    MONITOR_ARM_MOUNT_CONFIG.arm02.angle = -Math.round(arm02.rotation.y * THREE.MathUtils.RAD2DEG * 100) / 100;
  }

  _updateHelpArrows(deltaZ) {
    this._helpArrows.position.z = this._parts[MONITOR_PART_TYPE.Monitor].userData.startPosition.z + deltaZ;
    this._helpArrows.position.x = this._parts[MONITOR_PART_TYPE.Monitor].position.x;
  }

  _setPositionForShowAnimation() {
    this.position.y = ROOM_CONFIG.startAnimation.startPositionY;
  }

  _showVolume(currentVolume) {
    const volumePart = this._parts[MONITOR_PART_TYPE.MonitorScreenVolume];
    volumePart.visible = true;

    volumePart.material.uniforms.uAlpha.value = 1;
    volumePart.material.uniforms.uRectsCount.value = currentVolume;

    if (this._volumeTween) {
      this._volumeTween.stop();
    }

    this._volumeTween = new TWEEN.Tween(volumePart.material.uniforms.uAlpha)
      .to({ value: 0 }, 600)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(1000)
      .start()
      .onComplete(() => {
        volumePart.visible = false;
      });
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initGroups();
    this._initFocusObject();
    this._initScreenTextures();
    this._updateArmRotation();
    this._initArrows();
    this._initDebugMenu();
    this._initSignals();
  }

  _initGroups() {
    const screenGroup = this._screenGroup = new THREE.Group();
    this.add(screenGroup);

    const monitorScreen = this._parts[MONITOR_PART_TYPE.MonitorScreen];
    const monitorScreenShowreelIcon = this._parts[MONITOR_PART_TYPE.MonitorScreenShowreelIcon];
    const monitorScreenCVIcon = this._parts[MONITOR_PART_TYPE.MonitorScreenCVIcon];
    const monitorScreenCloseIcon = this._parts[MONITOR_PART_TYPE.MonitorScreenCloseIcon];
    const monitorScreenVolume = this._parts[MONITOR_PART_TYPE.MonitorScreenVolume];
    screenGroup.add(monitorScreen, monitorScreenShowreelIcon, monitorScreenCVIcon, monitorScreenCloseIcon, monitorScreenVolume);

    screenGroup.position.copy(monitorScreen.position);

    const showreelIconOffset = monitorScreenShowreelIcon.position.clone().sub(monitorScreen.position.clone());
    const CVIconOffset = monitorScreenCVIcon.position.clone().sub(monitorScreen.position.clone());
    const closeIconOffset = monitorScreenCloseIcon.position.clone().sub(monitorScreen.position.clone());
    const volumeOffset = monitorScreenVolume.position.clone().sub(monitorScreen.position.clone());

    monitorScreen.position.set(0, 0, 0);
    monitorScreenShowreelIcon.position.copy(showreelIconOffset);
    monitorScreenCVIcon.position.copy(CVIconOffset);
    monitorScreenCloseIcon.position.copy(closeIconOffset);
    monitorScreenCloseIcon.position.z -= MONITOR_CONFIG.hideOffset;
    monitorScreenVolume.position.copy(volumeOffset);
  }

  _initFocusObject() {
    const focusObject = this._focusObject = new THREE.Object3D();
    this.add(focusObject);

    const monitor = this._parts[MONITOR_PART_TYPE.Monitor];
    focusObject.position.copy(monitor.position);
  }

  _initScreenTextures() {
    this._initScreenTexture();
    this._initButtonsTextures();
    this._initVolumeTexture();
    this._initShowreelVideo();
  }

  _initScreenTexture() {
    const texture = this._screenTexture = Loader.assets['monitor-screen'];

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    const monitorScreen = this._parts[MONITOR_PART_TYPE.MonitorScreen];
    monitorScreen.material = material;
  }

  _initButtonsTextures() {
    const sparkleConfig = SPARKLE_CONFIG[MONITOR_TYPE.Monitor];

    MONITOR_SCREEN_BUTTONS.forEach((partType, i) => {
      const part = this._parts[partType];
      const textureName = MONITOR_BUTTONS_CONFIG.buttons[partType].textureName;
      const texture = Loader.assets[textureName];

      const uniforms = {
        uTime: { value: 0 },
        uStartOffset: { value: i / MONITOR_SCREEN_BUTTONS.length },
        uTexture: { value: texture },
        uColor: { value: new THREE.Color(0xffffff) },
        uSparkleColor: { value: sparkleConfig.color },
        uLineThickness: { value: sparkleConfig.thickness },
        uBlurAmount: { value: sparkleConfig.blur },
        uLineAngle: { value: sparkleConfig.angle * THREE.MathUtils.DEG2RAD },
        uSpeed: { value: sparkleConfig.speed },
        uLineMovingWidth: { value: sparkleConfig.movingWidth },
      };

      part.material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: sparkleVertexShader,
        fragmentShader: sparkleFragmentShader,
      });
    });

    this._parts[MONITOR_PART_TYPE.MonitorScreenCloseIcon].visible = false;
  }

  _initVolumeTexture() {
    const volumePart = this._parts[MONITOR_PART_TYPE.MonitorScreenVolume];
    this._volumeIcon = new VolumeIcon(volumePart);
  }

  _initShowreelVideo() {
    const videoElement = this._showreelVideoElement = document.createElement('video');
    videoElement.muted = true;
    videoElement.controls = true;
    videoElement.playsInline = true;
    videoElement.src = '/video/games_showreel_360.mp4';

    videoElement.addEventListener('ended', () => {
      this._stopShowreel();
    });

    const texture = this._showreelTexture = new THREE.VideoTexture(videoElement);
    texture.encoding = THREE.sRGBEncoding;
  }

  _initArrows() {
    const helpArrowsTypes = [HELP_ARROW_TYPE.MonitorBack, HELP_ARROW_TYPE.MonitorFront];
    const helpArrows = this._helpArrows = new HelpArrows(helpArrowsTypes);
    this.add(helpArrows);

    helpArrows.position.copy(this._parts[MONITOR_PART_TYPE.Monitor].position.clone());
  }

  _initSignals() {
    this._debugMenu.events.on('onPositionChanged', (msg, position) => {
      this._currentPositionZ = position + this._parts[MONITOR_PART_TYPE.Monitor].userData.startPosition.z;
    });

    this._debugMenu.events.on('onPlayShowreelVideo', () => this._onDebugPlayShowreelVideo());
  }

  _onDebugPlayShowreelVideo() {
    if (this._isShowreelPlaying) {
      this._stopShowreel();
    } else {
      this._playShowreel();
    }

    this._debugMenu.updateShowreelButton(this._isShowreelPlaying);
  }

  _getPartsWithoutButtons() {
    const parts = [];

    MONITOR_PARTS_WITHOUT_BUTTONS.forEach((partName) => {
      parts.push(this._parts[partName]);
    });

    return parts;
  }
}
