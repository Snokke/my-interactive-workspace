import * as THREE from 'three';
import Delayed from '../../../../core/helpers/delayed-call';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import RoomObjectAbstract from '../room-object.abstract';
import { WALLS_PART_CONFIG, WALLS_PART_TYPE, WINDOW_HANDLE_STATE, WINDOW_OPEN_TYPE, WINDOW_STATE } from './walls-data';
import WindowDebug from './window-debug';
import { WINDOW_CONFIG } from './window-config';

export default class Walls extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._floorLampDebug = null;
    this._windowGroup = null;

    this._handleTween = null;
    this._windowTween = null;

    this._windowHandleState = WINDOW_HANDLE_STATE.Idle;
    this._windowState = WINDOW_STATE.Closed;
    this._previousWindowState = this._windowState;
    this._currentWindowOpenType = WINDOW_OPEN_TYPE.Horizontally;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = 600;

      const floor = this._parts[WALLS_PART_TYPE.Floor];
      const leftWall = this._parts[WALLS_PART_TYPE.WallLeft];
      const rightWall = this._parts[WALLS_PART_TYPE.WallRight];

      new TWEEN.Tween(floor.position)
        .to({ y: floor.userData.startPosition.y }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start();

      new TWEEN.Tween(leftWall.position)
        .to({ y: leftWall.userData.startPosition.y }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .delay(250)
        .start();

      new TWEEN.Tween(this._windowGroup.position)
        .to({ y: 0 }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .delay(500)
        .start();

      new TWEEN.Tween(rightWall.position)
        .to({ y: rightWall.userData.startPosition.y }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .delay(500)
        .start()
        .onComplete(() => {
          this._onShowAnimationComplete();
        });
    });
  }

  onClick(roomObject) {
    if (!this._isInputEnabled) {
      return;
    }

    this._stopTweens();

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
    this._windowState = WINDOW_STATE.Opening;

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
    this._windowState = WINDOW_STATE.Opening;

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

    const maxAngle = WINDOW_CONFIG[this._currentWindowOpenType].handleAngle * (Math.PI / 180);
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

    const windowRotationAxis = WINDOW_CONFIG[this._currentWindowOpenType].windowRotationAxis;
    const startAngle = this._windowGroup.rotation[windowRotationAxis];

    const currentAngle = { value: startAngle * (180 / Math.PI) };
    let previousAngle = currentAngle.value;

    const maxAngle = WINDOW_CONFIG[this._currentWindowOpenType].openAngle;
    const rotationAngle = this._previousWindowState === WINDOW_STATE.Closed ? -maxAngle : 0;
    const remainingRotationAngle = this._previousWindowState === WINDOW_STATE.Closed ? maxAngle + currentAngle.value : currentAngle.value;
    const time = Math.abs(remainingRotationAngle) / WINDOW_CONFIG.windowRotationSpeed * 1000;

    const pivot = window.position.clone()
      .add(WINDOW_CONFIG[this._currentWindowOpenType].pivotOffset);

    const rotateAxis = WINDOW_CONFIG[this._currentWindowOpenType].rotateAxis;
    const rotationSign = WINDOW_CONFIG[this._currentWindowOpenType].rotationSign;

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
    this._windowState = this._previousWindowState === WINDOW_STATE.Closed ? WINDOW_STATE.Opened : WINDOW_STATE.Closed;
    this._previousWindowState = this._windowState;
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
      this._currentWindowOpenType = this._currentWindowOpenType === WINDOW_OPEN_TYPE.Horizontally ? WINDOW_OPEN_TYPE.Vertically : WINDOW_OPEN_TYPE.Horizontally;
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
    const startPositionY = 20;

    this._parts[WALLS_PART_TYPE.WallLeft].position.y = startPositionY;
    this._parts[WALLS_PART_TYPE.WallRight].position.y = startPositionY;
    this._windowGroup.position.y = startPositionY;

    this._parts[WALLS_PART_TYPE.Floor].position.y = -35;
  }

  _init() {
    this._initParts(WALLS_PART_TYPE, WALLS_PART_CONFIG);
    this._addMaterials();
    this._addPartsToScene();
    this._initGlass();
    this._initWindowGroup();
    this._initWindowDebug();
  }

  _addPartsToScene() {
    for (let key in this._parts) {
      const part = this._parts[key];

      this.add(part);
    }
  }

  _initGlass() {
    this._parts[WALLS_PART_TYPE.GlassTop].material.transparent = true;
    this._parts[WALLS_PART_TYPE.GlassTop].material.opacity = 0.5;

    this._parts[WALLS_PART_TYPE.GlassBottom].material.transparent = true;
    this._parts[WALLS_PART_TYPE.GlassBottom].material.opacity = 0.5;
  }

  _initWindowGroup() {
    const windowGroup = this._windowGroup = new THREE.Group();
    this.add(windowGroup);

    windowGroup.add(this._parts[WALLS_PART_TYPE.Window]);
    windowGroup.add(this._parts[WALLS_PART_TYPE.WindowHandle]);
    windowGroup.add(this._parts[WALLS_PART_TYPE.GlassTop]);
  }

  _initWindowDebug() {
    const window = this._parts[WALLS_PART_TYPE.Window];
    const windowDebug = new WindowDebug(window);
    this.add(windowDebug);

    windowDebug.events.on('changeState', () => {
      this.onClick();
    });
  }
}
