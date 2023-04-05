import RoomObjectDebugAbstract from "../room-object-debug.abstract";

export default class AirConditionerDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._init();
    this._checkToDisableFolder();
  }

  _init() {
    this._debugFolder.addButton({
      title: 'Switch on',
    }).on('click', () => this.events.post('switchOn'));
  }
}
