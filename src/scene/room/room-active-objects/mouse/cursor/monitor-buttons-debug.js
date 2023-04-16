import * as THREE from "three";
import { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG, LAPTOP_SCREEN_MUSIC_CONFIG } from "../../laptop/laptop-config";
import { LAPTOP_SCREEN_MUSIC_PARTS } from "../../laptop/laptop-data";
import { CURSOR_CONFIG } from "../mouse-config";
import { MONITOR_CONFIG } from "../../monitor/monitor-config";

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
        const { position, size } = LAPTOP_SCREEN_MUSIC_CONFIG[button].area;
        this._showDebugButtonsArea(this._laptopScreen, position.x, position.y, size.x, size.y);
      });
    }
  }

  _initMonitorButtonsDebug() {
    if (MONITOR_CONFIG.showDebugButtons) {

    }
  }

  _showDebugButtonsArea(screen, x, y, width, height) {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const debugArea = new THREE.Mesh(geometry, material);
    this.add(debugArea);

    debugArea.scale.set(width, height, 1);
    debugArea.position.copy(screen.getWorldPosition(new THREE.Vector3()));

    const mountAngle = LAPTOP_MOUNT_CONFIG.angle * THREE.MathUtils.DEG2RAD;
    const angleX = (LAPTOP_CONFIG.defaultAngle - LAPTOP_CONFIG.angle) * THREE.MathUtils.DEG2RAD;
    const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, mountAngle, 0))
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(angleX, 0, 0)));

    debugArea.setRotationFromQuaternion(quaternion);

    debugArea.translateOnAxis(new THREE.Vector3(1, 0, 0), x);
    debugArea.translateOnAxis(new THREE.Vector3(0, 1, 0), y + CURSOR_CONFIG.laptopScreenBottomOffset);
    debugArea.translateOnAxis(new THREE.Vector3(0, 0, 1), CURSOR_CONFIG.offsetZFromScreen);
  }
}
