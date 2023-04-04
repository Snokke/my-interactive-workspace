import { DEBUG_MENU_START_STATE } from "../../../../core/configs/debug-menu-start-state";
import GUIHelper from "../../../../core/helpers/gui-helper/gui-helper";
import RoomObjectDebugAbstract from "../room-object-debug.abstract";

export default class SpeakersDebugMenu extends RoomObjectDebugAbstract {
  constructor() {
    super();

    this._init();
  }

  _init() {
    const roomObjectsFolder = GUIHelper.getFolder('Active room objects');

    const debugFolder = this._debugFolder = roomObjectsFolder.addFolder({
      title: 'Speakers',
      expanded: DEBUG_MENU_START_STATE.AirConditioner,
    });

    debugFolder.addButton({
      title: 'Switch on',
    }).on('click', () => this.events.post('switchOn'));
  }
}
