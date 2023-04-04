import { DEBUG_MENU_START_STATE } from "../../../../core/configs/debug-menu-start-state";
import GUIHelper from "../../../../core/helpers/gui-helper/gui-helper";
import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import MONITOR_CONFIG from "./monitor-config";

export default class MonitorDebugMenu extends RoomObjectDebugAbstract {
  constructor() {
    super();

    this._positionController = null;
    this._arm01AngleController = null;
    this._arm02AngleController = null;

    this._init();
  }

  updatePosition() {
    this._positionController.refresh();
  }

  updateArmRotation() {
    this._arm01AngleController.refresh();
    this._arm02AngleController.refresh();
  }

  _init() {
    const roomObjectsFolder = GUIHelper.getFolder('Active room objects');

    const debugFolder = this._debugFolder = roomObjectsFolder.addFolder({
      title: 'Monitor',
      expanded: DEBUG_MENU_START_STATE.Monitor,
    });

    this._positionController = debugFolder.addInput(MONITOR_CONFIG.monitor, 'positionZ', {
      label: 'Position z',
      min: MONITOR_CONFIG.monitor.minZ,
      max: MONITOR_CONFIG.monitor.maxZ,
    }).on('change', (position) => {
      this.events.post('onPositionChanged', position.value);
    });

    this._arm01AngleController = debugFolder.addInput(MONITOR_CONFIG.armMount.arm01, 'angle', {
      label: 'Bottom arm angle',
      min: 0,
      max: 180,
      disabled: true,
    });

    this._arm02AngleController = debugFolder.addInput(MONITOR_CONFIG.armMount.arm02, 'angle', {
      label: 'Top arm angle',
      min: -180,
      max: 0,
      disabled: true,
    });
  }
}
