import * as THREE from 'three';
import Loader from '../../../../../core/loader';
import { LAPTOP_POSITION_STATE, LAPTOP_SCREEN_MUSIC_PARTS } from '../../laptop/data/laptop-data';
import ClickCircle from './click-circle';
import MonitorButtonsDebug from './monitor-buttons-debug';
import { MessageDispatcher } from 'black-engine';
import { MONITOR_BUTTONS_CONFIG } from '../../monitor/data/monitor-config';
import { MONITOR_SCREEN_BUTTONS } from '../../monitor/data/monitor-data';
import { CURSOR_CONFIG } from './data/cursor-config';
import { MONITOR_TYPE } from '../../../data/room-config';
import { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG, LAPTOP_SCREEN_MUSIC_CONFIG } from '../../laptop/data/laptop-config';
import Delayed from '../../../../../core/helpers/delayed-call';

export default class Cursor extends THREE.Group {
  constructor(mouse, monitorScreen, laptopScreen) {
    super();

    this.events = new MessageDispatcher();

    this._mouse = mouse;
    this._monitorScreen = monitorScreen;
    this._laptopScreen = laptopScreen;

    this._view = null;
    this._clickCircle = null;
    this._monitorSize = null;
    this._laptopSize = null;
    this._mousePosition = null;
    this._currentMonitorData = null;
    this._previousMousePosition = new THREE.Vector2();

    this._cursorPosition = new THREE.Vector2();
    this._monitorType = MONITOR_TYPE.Monitor;
    this._currentButtonType = null;
    this._previousButtonType = null;

    this._init();
  }

  update(dt) {
    this._mousePosition = this._mouse.getCurrentPosition();
    const delta = this._mousePosition.clone().sub(this._previousMousePosition);

    const changeScreen = this._updateCursorPosition(delta);

    if (changeScreen) {
      this._updateCursorPosition(delta);
    }

    this._updateViewPosition();

    this._previousMousePosition = this._mousePosition.clone();
  }

  show(delay) {
    this._view.visible = false;

    Delayed.call(delay, () => {
      this._view.visible = true;
    });
  }


  onLaptopClosed() {
    if (this._monitorType === MONITOR_TYPE.Laptop) {
      this._monitorType = MONITOR_TYPE.Monitor;

      const { cursorHalfWidth, sensitivity } = this._getCursorData();
      const screenSize = this._currentMonitorData[this._monitorType].size;

      this._cursorPosition.x = (-screenSize.x * 0.5 + cursorHalfWidth) / sensitivity;
      this._cursorPosition.y += 0.05;

      this._mousePosition = this._mouse.getCurrentPosition();
      this._previousMousePosition = this._mousePosition.clone();

      this.update();
    }
  }

  onCursorScaleChanged() {
    this._view.scale.set(CURSOR_CONFIG.view.scale, CURSOR_CONFIG.view.scale, 1);
  }

  onMouseLeftKeyClicked() {
    this._clickCircle.show();
    this.events.post('onLeftKeyClick', this._currentButtonType);
  }

  _updateCursorPosition(delta) {
    this._setCursorStartScreenPosition();
    this._cursorPosition.add(delta);
    const changeScreen = this._currentMonitorData[this._monitorType].checkPositionFunction();

    return changeScreen;
  }

  _checkPositionForMonitor() {
    const { cursorHalfWidth, cursorHalfHeight, sensitivity } = this._getCursorData();
    let changeScreen = false;

    const screenSize = this._currentMonitorData[this._monitorType].size;

    const topEdge = (screenSize.y * 0.5 - cursorHalfHeight) / sensitivity;
    const bottomEdge = (-screenSize.y * 0.5 + cursorHalfHeight) / sensitivity;
    const leftEdge = (-screenSize.x * 0.5 + cursorHalfWidth) / sensitivity;
    const rightEdge = (screenSize.x * 0.5 - cursorHalfWidth) / sensitivity;

    this._cursorPosition.y = THREE.MathUtils.clamp(this._cursorPosition.y, bottomEdge, topEdge);

    if (this._cursorPosition.x > rightEdge) {
      this._cursorPosition.x = rightEdge;
    }

    if (this._cursorPosition.x < leftEdge) {
      if (LAPTOP_CONFIG.positionType === LAPTOP_POSITION_STATE.Opened && this._cursorPosition.y < CURSOR_CONFIG.monitorBottomOffsetToNotTransferCursor) {
        this._monitorType = MONITOR_TYPE.Laptop;
        changeScreen = true;

        const laptopRightEdge = (this._currentMonitorData[this._monitorType].size.x * 0.5 - cursorHalfWidth) / sensitivity;
        this._cursorPosition.x = laptopRightEdge;
        this._cursorPosition.y -= 0.1;
      } else {
        this._cursorPosition.x = leftEdge;
      }
    }

    this._checkMonitorButtons();

    return changeScreen;
  }

  _checkPositionForLaptop() {
    const { cursorHalfWidth, cursorHalfHeight, sensitivity } = this._getCursorData();
    let changeScreen = false;

    const screenSize = this._currentMonitorData[this._monitorType].size;
    const bottomOffset = CURSOR_CONFIG.laptopScreenBottomOffset;

    const topEdge = (-bottomOffset - cursorHalfHeight) / sensitivity;
    const bottomEdge = (-bottomOffset - screenSize.y + cursorHalfHeight) / sensitivity;
    const leftEdge = (-screenSize.x * 0.5 + cursorHalfWidth) / sensitivity;
    const rightEdge = (screenSize.x * 0.5 - cursorHalfWidth) / sensitivity;

    this._cursorPosition.y = THREE.MathUtils.clamp(this._cursorPosition.y, bottomEdge, topEdge);

    if (this._cursorPosition.x < leftEdge) {
      this._cursorPosition.x = leftEdge;
    }

    if (this._cursorPosition.x > rightEdge) {
      this._monitorType = MONITOR_TYPE.Monitor;
      changeScreen = true;

      const monitorLeftEdge = (-this._currentMonitorData[this._monitorType].size.x * 0.5 + cursorHalfWidth) / sensitivity;
      this._cursorPosition.x = monitorLeftEdge;
      this._cursorPosition.y += 0.05;
    }

    this._checkLaptopButtons();

    return changeScreen;
  }

  _checkLaptopButtons() {
    const { cursorHalfWidth, cursorHalfHeight, sensitivity } = this._getCursorData();

    const cursorPointX = this._cursorPosition.x * sensitivity - cursorHalfWidth;
    const cursorPointY = this._cursorPosition.y * sensitivity - cursorHalfHeight;
    const bottomOffset = CURSOR_CONFIG.laptopScreenBottomOffset;
    let isIntersection = false;

    LAPTOP_SCREEN_MUSIC_PARTS.forEach((part) => {
      const areaConfig = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[part].area;
      const bottom = -(areaConfig.position.y + bottomOffset) - areaConfig.size.y * 0.5;
      const top = -(areaConfig.position.y + bottomOffset) + areaConfig.size.y * 0.5;
      const left = areaConfig.position.x - areaConfig.size.x * 0.5;
      const right = areaConfig.position.x + areaConfig.size.x * 0.5;

      if ((cursorPointX > left && cursorPointX < right) && (cursorPointY > bottom && cursorPointY < top)) {
        this._currentButtonType = part;
        isIntersection = true;

        this._foundIntersection('onLaptopButtonOver');
      }
    });

    if (!isIntersection) {
      this._noIntersection('onLaptopButtonOut');
    }
  }

  _checkMonitorButtons() {
    const { cursorHalfWidth, cursorHalfHeight, sensitivity } = this._getCursorData();

    const cursorPointX = this._cursorPosition.x * sensitivity - cursorHalfWidth;
    const cursorPointY = this._cursorPosition.y * sensitivity - cursorHalfHeight;
    let isIntersection = false;

    MONITOR_SCREEN_BUTTONS.forEach((part) => {
      const areaConfig = MONITOR_BUTTONS_CONFIG.buttons[part].area;
      const bottom = -areaConfig.position.y - areaConfig.size.y * 0.5;
      const top = -areaConfig.position.y + areaConfig.size.y * 0.5;
      const left = areaConfig.position.x - areaConfig.size.x * 0.5;
      const right = areaConfig.position.x + areaConfig.size.x * 0.5;

      if ((cursorPointX > left && cursorPointX < right) && (cursorPointY > bottom && cursorPointY < top)) {
        this._currentButtonType = part;
        isIntersection = true;

        this._foundIntersection('onMonitorButtonOver');
      }
    });

    if (!isIntersection) {
      this._noIntersection('onMonitorButtonOut');
    }
  }

  _foundIntersection(signalName) {
    if (this._currentButtonType !== this._previousButtonType) {
      this._previousButtonType = this._currentButtonType;
      this.events.post(signalName, this._currentButtonType);
    }
  }

  _noIntersection(signalName) {
    this._currentButtonType = null;

    if (this._currentButtonType !== this._previousButtonType) {
      this._previousButtonType = this._currentButtonType;
      this.events.post(signalName);
    }
  }

  _setCursorStartScreenPosition() {
    const screen = this._currentMonitorData[this._monitorType].screen;
    this._view.position.copy(screen.getWorldPosition(new THREE.Vector3()));

    if (this._monitorType === MONITOR_TYPE.Laptop) {
      const mountAngle = LAPTOP_MOUNT_CONFIG.angle * THREE.MathUtils.DEG2RAD;
      const angleX = (LAPTOP_CONFIG.defaultAngle - LAPTOP_CONFIG.angle) * THREE.MathUtils.DEG2RAD;

      const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, mountAngle, 0))
        .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(angleX, 0, 0)));

      this._view.setRotationFromQuaternion(quaternion);
      this._view.translateOnAxis(new THREE.Vector3(0, 0, 1), CURSOR_CONFIG.offsetZFromScreen - 0.005);
    } else {
      this._view.rotation.copy(new THREE.Euler(0, 0, 0));
      this._view.translateOnAxis(new THREE.Vector3(0, 0, 1), CURSOR_CONFIG.offsetZFromScreen);
    }

    this._clickCircle.rotation.copy(this._view.rotation);
  }

  _updateViewPosition() {
    const sensitivity = CURSOR_CONFIG.sensitivity;
    this._view.translateOnAxis(new THREE.Vector3(1, 0, 0), this._cursorPosition.x * sensitivity);
    this._view.translateOnAxis(new THREE.Vector3(0, -1, 0), this._cursorPosition.y * sensitivity);

    const pointerPosition = new THREE.Vector3(
      this._view.position.x - this._getCursorData().cursorHalfWidth + 0.01,
      this._view.position.y + this._getCursorData().cursorHalfHeight,
      this._view.position.z - CURSOR_CONFIG.clickCircleOffsetZFromScreen,
    );

    this._clickCircle.position.copy(pointerPosition);
  }

  _getCursorData() {
    const cursorScale = CURSOR_CONFIG.view.scale;
    const sensitivity = CURSOR_CONFIG.sensitivity;

    const cursorHalfWidth = CURSOR_CONFIG.view.width * 0.5 * cursorScale;
    const cursorHalfHeight = CURSOR_CONFIG.view.height * 0.5 * cursorScale;

    return { cursorHalfWidth, cursorHalfHeight, sensitivity };
  }

  _init() {
    this._initCursorView();
    this._initClickCircle();
    this._calculateSizes();
    this._initCurrentMonitorData();
    this._initMonitorButtonsDebug();
    this._initSignals();
  }

  _initCursorView() {
    const texture = Loader.assets['cursor'];

    const geometry = new THREE.PlaneGeometry(CURSOR_CONFIG.view.width, CURSOR_CONFIG.view.height);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    const view = this._view = new THREE.Mesh(geometry, material);
    this.add(view);

    view.scale.set(CURSOR_CONFIG.view.scale, CURSOR_CONFIG.view.scale, 1);
  }

  _initClickCircle() {
    const clickCircle = this._clickCircle = new ClickCircle();
    this.add(clickCircle);
  }

  _calculateSizes() {
    const monitorBoundingBox = new THREE.Box3().setFromObject(this._monitorScreen);
    this._monitorSize = monitorBoundingBox.getSize(new THREE.Vector3());

    const laptopBoundingBox = new THREE.Box3().setFromObject(this._laptopScreen);
    this._laptopSize = laptopBoundingBox.getSize(new THREE.Vector3());
    this._laptopSize.y = CURSOR_CONFIG.laptopScreenSizeY;
  }

  _initCurrentMonitorData() {
    this._currentMonitorData = {
      [MONITOR_TYPE.Monitor]: {
        screen: this._monitorScreen,
        size: this._monitorSize,
        checkPositionFunction: () => this._checkPositionForMonitor(),
      },
      [MONITOR_TYPE.Laptop]: {
        screen: this._laptopScreen,
        size: this._laptopSize,
        checkPositionFunction: () => this._checkPositionForLaptop(),
      },
    }
  }

  _initSignals() {
    this._mouse.events.on('onAreaChanged', () => this._resetCursor());
  }

  _initMonitorButtonsDebug() {
    const monitorDebugButtons = new MonitorButtonsDebug(this._monitorScreen, this._laptopScreen);
    this.add(monitorDebugButtons);
  }

  _resetCursor() {
    this._monitorType = MONITOR_TYPE.Monitor;

    this._cursorPosition.x = 0;
    this._cursorPosition.y = 0;

    this._mousePosition = this._mouse.getCurrentPosition();
    this._previousMousePosition = this._mousePosition.clone();

    this.update();
  }
}
