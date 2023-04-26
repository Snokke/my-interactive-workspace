import * as THREE from "three";
import { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG, LAPTOP_SCREEN_MUSIC_CONFIG } from "../../laptop/data/laptop-config";
import { LAPTOP_SCREEN_MUSIC_PARTS } from "../../laptop/data/laptop-data";
import { MONITOR_BUTTONS_CONFIG, MONITOR_CONFIG } from "../../monitor/data/monitor-config";
import { MONITOR_SCREEN_BUTTONS } from "../../monitor/data/monitor-data";
import { CURSOR_CONFIG } from "./data/cursor-config";

export default class MonitorButtonsDebug extends THREE.Group {
  constructor(monitorScreen, laptopScreen) {
    super();

    this._monitorScreen = monitorScreen;
    this._laptopScreen = laptopScreen;

    this._init();
  }

  _init() {
    this._initLaptopButtonsDebug();
    this._initMonitorButtonsDebug();
  }

  _initLaptopButtonsDebug() {
    if (LAPTOP_CONFIG.showDebugButtons) {
      LAPTOP_SCREEN_MUSIC_PARTS.forEach((button) => {
        const { position, size } = LAPTOP_SCREEN_MUSIC_CONFIG.buttons[button].area;
        this._showDebugButtonsAreaForLaptop(position.x, position.y, size.x, size.y);
      });
    }
  }

  _initMonitorButtonsDebug() {
    if (MONITOR_CONFIG.showDebugButtons) {
      MONITOR_SCREEN_BUTTONS.forEach((button) => {
        const { position, size } = MONITOR_BUTTONS_CONFIG.buttons[button].area;
        this._showDebugButtonsAreaForMonitor(position.x, position.y, size.x, size.y);
      });
    }
  }

  _showDebugButtonsAreaForLaptop(x, y, width, height) {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const debugArea = new THREE.Mesh(geometry, material);
    this.add(debugArea);

    debugArea.scale.set(width, height, 1);
    debugArea.position.copy(this._laptopScreen.getWorldPosition(new THREE.Vector3()));

    const mountAngle = LAPTOP_MOUNT_CONFIG.angle * THREE.MathUtils.DEG2RAD;
    const angleX = (LAPTOP_CONFIG.defaultAngle - LAPTOP_CONFIG.angle) * THREE.MathUtils.DEG2RAD;
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, mountAngle, 0))
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(angleX, 0, 0)));

    debugArea.setRotationFromQuaternion(quaternion);

    debugArea.translateOnAxis(new THREE.Vector3(1, 0, 0), x);
    debugArea.translateOnAxis(new THREE.Vector3(0, 1, 0), y + CURSOR_CONFIG.laptopScreenBottomOffset);
    debugArea.translateOnAxis(new THREE.Vector3(0, 0, 1), CURSOR_CONFIG.offsetZFromScreen);
  }

  _showDebugButtonsAreaForMonitor(x, y, width, height) {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const debugArea = new THREE.Mesh(geometry, material);
    this.add(debugArea);

    debugArea.scale.set(width, height, 1);
    debugArea.position.copy(this._monitorScreen.getWorldPosition(new THREE.Vector3()));

    debugArea.translateOnAxis(new THREE.Vector3(1, 0, 0), x);
    debugArea.translateOnAxis(new THREE.Vector3(0, 1, 0), y);
    debugArea.translateOnAxis(new THREE.Vector3(0, 0, 1), CURSOR_CONFIG.offsetZFromScreen);
  }
}
