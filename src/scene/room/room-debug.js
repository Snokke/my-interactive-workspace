import { MessageDispatcher } from "black-engine";
import GUIHelper from "../../core/helpers/gui-helper/gui-helper";
import { ROOM_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from "./room-config";
import isMobile from 'ismobilejs';

export default class RoomDebug {
  constructor() {
    this.events = new MessageDispatcher();

    this._listShowAnimation = null;
    this._buttonShowAnimation = null;

    this._init();
  }

  enableShowAnimationControllers() {
    this._listShowAnimation.disabled = false;
    this._buttonShowAnimation.disabled = false;
  }

  disableShowAnimationControllers() {
    this._listShowAnimation.disabled = true;
    this._buttonShowAnimation.disabled = true;
  }

  _init() {
    const roomFolder = GUIHelper.getGui().addFolder({
      title: 'Room',
    })

    const isMobileDevice = isMobile(window.navigator).any;
    ROOM_CONFIG.outlineEnabled = !isMobileDevice;

    roomFolder.addInput(ROOM_CONFIG, 'outlineEnabled', {
      label: 'Outline',
      disabled: isMobileDevice,
    })
      .on('change', (outlineState) => {
        ROOM_CONFIG.outlineEnabled = outlineState.value;
      });

    roomFolder.addSeparator();

    let selectedObjectType = START_ANIMATION_ALL_OBJECTS;

    this._listShowAnimation = roomFolder.addBlade({
      view: 'list',
      label: 'Show animation',
      options: [
        { text: 'All scene', value: START_ANIMATION_ALL_OBJECTS },
        { text: 'Table', value: ROOM_OBJECT_TYPE.Table },
        { text: 'Locker', value: ROOM_OBJECT_TYPE.Locker },
      ],
      value: selectedObjectType,
    }).on('change', (objectType) => {
      selectedObjectType = objectType.value;
    });

    this._buttonShowAnimation = roomFolder.addButton({
      title: 'Start show animation',
    }).on('click', () => {
      this.events.post('startShowAnimation', selectedObjectType);
    });

    GUIHelper.getGui().addFolder({
      title: 'Active room objects',
    });
  }
}
