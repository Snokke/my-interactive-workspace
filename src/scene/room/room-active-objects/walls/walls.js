import * as THREE from 'three';
import Delayed from '../../../../core/helpers/delayed-call';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import RoomObjectAbstract from '../room-object.abstract';
import { WALLS_PART_TYPE, WINDOW_HANDLE_STATE, WINDOW_OPEN_TYPE, WINDOW_OPEN_TYPE_BOTH, WINDOW_STATE } from './walls-data';
import { WINDOW_CONFIG } from './window-config';
import { ROOM_CONFIG } from '../../data/room-config';

export default class Walls extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._floorLampDebug = null;
    this._windowGroup = null;
    this._rightWallGroup = null;

    this._handleTween = null;
    this._windowTween = null;
    this._debugMenu = null;

    this._windowHandleState = WINDOW_HANDLE_STATE.Idle;
    this._windowState = WINDOW_STATE.Closed;
    this._previousWindowState = this._windowState;
    this._windowOpenType = WINDOW_OPEN_TYPE.Horizontally;
    this._isBothOpenTypeSelected = true;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();

    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const floor = this._parts[WALLS_PART_TYPE.Floor];
      const leftWall = this._parts[WALLS_PART_TYPE.WallLeft];

      new TWEEN.Tween(floor.position)
        .to({ y: floor.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(leftWall.position)
        .to({ y: leftWall.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5)
        .start();

      new TWEEN.Tween(this._windowGroup.position)
        .to({ y: 0 }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5 * 2)
        .start();

      new TWEEN.Tween(this._rightWallGroup.position)
        .to({ y: 0 }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5 * 2)
        .start()
        .onComplete(() => {
          this._debugMenu.enable();
          this._onShowAnimationComplete();
        });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    this._stopTweens();
    this._debugMenu.disableActiveOpenType();

    if (this._windowState === WINDOW_STATE.Opening) {
      this._updateWindowState();

      if (this._windowHandleState === WINDOW_HANDLE_STATE.Rotating) {
        this._startFromHandle();
      } else {
        this._startFromWindow();
      }

      return;
    }

    if (this._windowState === WINDOW_STATE.Opened) {
      this._startFromWindow();
    } else {
      this._startFromHandle();
    }
  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  _startFromHandle() {
    this._setWindowState(WINDOW_STATE.Opening);

    this._rotateHandle();

    this._handleTween.onComplete(() => {
      this._windowHandleState = WINDOW_HANDLE_STATE.Idle;
      this._moveWindow();

      this._windowTween.onComplete(() => {
        this._updateWindowState();
        this._checkToChangeWindowOpenType();
      });
    });
  }

  _startFromWindow() {
    this._setWindowState(WINDOW_STATE.Opening);

    this._moveWindow();

    this._windowTween.onComplete(() => {
      this._rotateHandle();

      this._handleTween.onComplete(() => {
        this._windowHandleState = WINDOW_HANDLE_STATE.Idle;
        this._updateWindowState();
        this._checkToChangeWindowOpenType();
      });
    });
  }

  _rotateHandle() {
    this._windowHandleState = WINDOW_HANDLE_STATE.Rotating;

    const windowHandle = this._parts[WALLS_PART_TYPE.WindowHandle];

    const maxAngle = WINDOW_CONFIG[this._windowOpenType].handleAngle * (Math.PI / 180);
    const rotationAngle = this._previousWindowState === WINDOW_STATE.Closed ? maxAngle : 0;
    const remainingRotationAngle = this._previousWindowState === WINDOW_STATE.Closed ? maxAngle + windowHandle.rotation.z : windowHandle.rotation.z;
    const time = Math.abs(remainingRotationAngle) / WINDOW_CONFIG.handleRotationSpeed * 1000;

    this._handleTween = new TWEEN.Tween(windowHandle.rotation)
      .to({ z: -rotationAngle }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  _moveWindow() {
    const window = this._parts[WALLS_PART_TYPE.Window];

    const windowRotationAxis = WINDOW_CONFIG[this._windowOpenType].windowRotationAxis;
    const startAngle = this._windowGroup.rotation[windowRotationAxis];

    const currentAngle = { value: startAngle * (180 / Math.PI) };
    let previousAngle = currentAngle.value;

    const maxAngle = WINDOW_CONFIG[this._windowOpenType].openAngle;
    const rotationAngle = this._previousWindowState === WINDOW_STATE.Closed ? -maxAngle : 0;
    const remainingRotationAngle = this._previousWindowState === WINDOW_STATE.Closed ? maxAngle + currentAngle.value : currentAngle.value;
    const time = Math.abs(remainingRotationAngle) / WINDOW_CONFIG.windowRotationSpeed * 1000;

    const pivot = window.position.clone()
      .add(WINDOW_CONFIG[this._windowOpenType].pivotOffset);

    const rotateAxis = WINDOW_CONFIG[this._windowOpenType].rotateAxis;
    const rotationSign = WINDOW_CONFIG[this._windowOpenType].rotationSign;

    this._windowTween = new TWEEN.Tween(currentAngle)
      .to({ value: rotationSign * rotationAngle }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();

    this._windowTween.onUpdate(() => {
      const angle = (currentAngle.value - previousAngle) * (Math.PI / 180);
      this._rotateAroundPoint(this._windowGroup, pivot, rotateAxis, angle);
      previousAngle = currentAngle.value;
    });
  }

  _updateWindowState() {
    const newState = this._previousWindowState === WINDOW_STATE.Closed ? WINDOW_STATE.Opened : WINDOW_STATE.Closed;
    this._setWindowState(newState);
    this._previousWindowState = this._windowState;
  }

  _setWindowState(state) {
    this._windowState = state;
    this._debugMenu.updateWindowState(state);
  }

  _rotateAroundPoint(obj, point, axis, theta) {
    obj.parent.localToWorld(obj.position);

    obj.position.sub(point);
    obj.position.applyAxisAngle(axis, theta);
    obj.position.add(point);

    obj.parent.worldToLocal(obj.position);

    obj.rotateOnAxis(axis, theta);
  }

  _checkToChangeWindowOpenType() {
    if (this._windowState === WINDOW_STATE.Closed) {
      this._debugMenu.enableActiveOpenType();

      if (this._isBothOpenTypeSelected) {
        this._windowOpenType = this._windowOpenType === WINDOW_OPEN_TYPE.Horizontally ? WINDOW_OPEN_TYPE.Vertically : WINDOW_OPEN_TYPE.Horizontally;
        this._debugMenu.updateWindowOpenType(this._windowOpenType);
      }
    }
  }

  _stopTweens() {
    if (this._handleTween) {
      this._handleTween.stop();
    }

    if (this._windowTween) {
      this._windowTween.stop();
    }
  }

  _setPositionForShowAnimation() {
    const startPositionY = ROOM_CONFIG.startAnimation.startPositionY;

    const leftWall = this._parts[WALLS_PART_TYPE.WallLeft];

    leftWall.position.y = leftWall.userData.startPosition.y + startPositionY;
    this._rightWallGroup.position.y = startPositionY;
    this._windowGroup.position.y = startPositionY;

    this._parts[WALLS_PART_TYPE.Floor].position.y = -30;
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initGlass();
    this._initWindowGroup();
    this._initRightWallGroup();
    this._initDebugMenu();
    this._initSignals();
  }

  _initGlass() {
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });

    this._parts[WALLS_PART_TYPE.GlassTop].material = glassMaterial;
    this._parts[WALLS_PART_TYPE.GlassBottom].material = glassMaterial;
  }

  _initWindowGroup() {
    const windowGroup = this._windowGroup = new THREE.Group();
    this.add(windowGroup);

    windowGroup.add(this._parts[WALLS_PART_TYPE.Window]);
    windowGroup.add(this._parts[WALLS_PART_TYPE.WindowHandle]);
    windowGroup.add(this._parts[WALLS_PART_TYPE.GlassTop]);
  }

  _initRightWallGroup() {
    const rightWallGroup = this._rightWallGroup = new THREE.Group();
    this.add(rightWallGroup);

    rightWallGroup.add(this._parts[WALLS_PART_TYPE.WallRight]);
    rightWallGroup.add(this._parts[WALLS_PART_TYPE.WindowFrame]);
    rightWallGroup.add(this._parts[WALLS_PART_TYPE.Windowsill]);
    rightWallGroup.add(this._parts[WALLS_PART_TYPE.GlassBottom]);
  }

  _initDebugMenu() {
    super._initDebugMenu();

    const window = this._parts[WALLS_PART_TYPE.Window];
    this._debugMenu.initDebugRotateAxis(window);

    this._debugMenu.updateWindowState(this._windowState);
    this._debugMenu.updateWindowOpenType(this._windowOpenType);
  }

  _initSignals() {
    this._debugMenu.events.on('changeState', () => this.onClick());
    this._debugMenu.events.on('changeOpenType', (msg, openType) => this._onDebugChangeOpenType(openType));
  }

  _onDebugChangeOpenType(openType) {
    if (openType === WINDOW_OPEN_TYPE_BOTH) {
      this._isBothOpenTypeSelected = true;
    } else {
      this._isBothOpenTypeSelected = false;
      this._windowOpenType = openType;
    }

    debugMenu.updateWindowOpenType(this._windowOpenType);
  }
}
