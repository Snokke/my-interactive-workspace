import GUIHelper from "../../../../core/helpers/gui-helper/gui-helper";
import RoomObjectDebugAbstract from "../room-object-debug.abstract";

export default class FloorLampDebug extends RoomObjectDebugAbstract {
  constructor() {
    super();

    this._init();
  }

  _init() {
    const roomObjectsFolder = GUIHelper.getFolder('Room objects');

    const floorLampFolder = this._debugFolder = roomObjectsFolder.addFolder({
      title: 'Floor lamp',
    });

    floorLampFolder.addButton({
      title: 'Switch light',
    }).on('click', () => this.events.post('switchLight'));
  }
}
