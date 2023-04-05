import RoomObjectDebugAbstract from "../room-object-debug.abstract";

export default class ChairDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._init();
    this._checkToDisableFolder();
  }

  _init() {
    this._debugFolder.addButton({
      title: 'Rotate',
    }).on('click', () => this.events.post('rotate'));
  }
}
