import RoomObjectDebugAbstract from "../room-object-debug.abstract";

export default class FloorLampDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._init();
    this._checkToDisableFolder();
  }

  _init() {
    this._debugFolder.addButton({
      title: 'Switch light',
    }).on('click', () => this.events.post('switchLight'));
  }
}
