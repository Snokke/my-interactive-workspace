import { MessageDispatcher } from "black-engine";
import GUIHelper from "../../core/helpers/gui-helper/gui-helper";
import { ROOM_CONFIG, ROOM_OBJECT_TYPE } from "./room-config";

export default class RoomDebug {
  constructor() {
    this.events = new MessageDispatcher();

    this._init();
  }

  _init() {
    const roomFolder = GUIHelper.getGui().addFolder({
      title: 'Room',
    })

    roomFolder.addInput(ROOM_CONFIG, 'outlineEnabled', { label: 'Outline' })
      .on('change', (outlineState) => {
        ROOM_CONFIG.outlineEnabled = outlineState.value;
      });

    roomFolder.addSeparator();

    let selectedObjectType = ROOM_OBJECT_TYPE.Locker;

    roomFolder.addBlade({
      view: 'list',
      label: 'Show animation',
      options: [
        { text: 'Table', value: ROOM_OBJECT_TYPE.Table },
        { text: 'Locker', value: ROOM_OBJECT_TYPE.Locker },
      ],
      value: selectedObjectType,
    }).on('change', (objectType) => {
      selectedObjectType = objectType.value;
    });

    roomFolder.addButton({
      title: 'Start show animation',
    }).on('click', () => {
      this.events.post('startShowAnimation', selectedObjectType)
    });


    const lockerFolder = GUIHelper.getGui().addFolder({
      title: 'Room objects',
    });
  }
}
