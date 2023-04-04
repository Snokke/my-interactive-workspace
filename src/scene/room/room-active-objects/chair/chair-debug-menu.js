import { DEBUG_MENU_START_STATE } from "../../../../core/configs/debug-menu-start-state";
import GUIHelper from "../../../../core/helpers/gui-helper/gui-helper";
import RoomObjectDebugAbstract from "../room-object-debug.abstract";

export default class ChairDebugMenu extends RoomObjectDebugAbstract {
  constructor() {
    super();

    this._init();
  }

  _init() {
    const roomObjectsFolder = GUIHelper.getFolder('Active room objects');

    const debugFolder = this._debugFolder = roomObjectsFolder.addFolder({
      title: 'Chair',
      expanded: DEBUG_MENU_START_STATE.Chair,
    });

    debugFolder.addButton({
      title: 'Rotate',
    }).on('click', () => this.events.post('rotate'));
  }
}
