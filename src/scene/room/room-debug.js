import { MessageDispatcher } from "black-engine";
import GUIHelper from "../../core/helpers/gui-helper/gui-helper";
import { ROOM_CONFIG, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from "./room-config";
import isMobile from 'ismobilejs';

export default class RoomDebug {
  constructor() {
    this.events = new MessageDispatcher();

    this._listShowAnimation = null;
    this._buttonShowAnimation = null;
    this._roomFolder = null;

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
    this._initRoomDebug();
    this._initShowAnimationFolder();
    this._initVisibilityFolder();
    this._initActiveRoomObjectsFolder();
  }

  _initRoomDebug() {
    const roomFolder = this._roomFolder = GUIHelper.getGui().addFolder({
      title: 'Room',
    })

    const isMobileDevice = isMobile(window.navigator).any;
    ROOM_CONFIG.outlineEnabled = !isMobileDevice;

    roomFolder.addInput(ROOM_CONFIG, 'outlineEnabled', {
      label: 'Outline',
      disabled: isMobileDevice,
    }).on('change', (outlineState) => {
        ROOM_CONFIG.outlineEnabled = outlineState.value;
      });
  }

  _initShowAnimationFolder() {
    const showAnimationFolder = this._roomFolder.addFolder({
      title: 'Objects show animation',
      expanded: true,
    })

    // let selectedObjectType = ROOM_OBJECT_TYPE.Walls;
    let selectedObjectType = START_ANIMATION_ALL_OBJECTS;

    this._listShowAnimation = showAnimationFolder.addBlade({
      view: 'list',
      label: 'Show animation',
      options: [
        { text: 'All scene', value: START_ANIMATION_ALL_OBJECTS },
        { text: 'Walls', value: ROOM_OBJECT_TYPE.Walls },
        { text: 'Table', value: ROOM_OBJECT_TYPE.Table },
        { text: 'Locker', value: ROOM_OBJECT_TYPE.Locker },
        { text: 'Floor lamp', value: ROOM_OBJECT_TYPE.FloorLamp },
      ],
      value: selectedObjectType,
    }).on('change', (objectType) => {
      selectedObjectType = objectType.value;
    });

    this._buttonShowAnimation = showAnimationFolder.addButton({
      title: 'Start show animation',
    }).on('click', () => {
      this.events.post('startShowAnimation', selectedObjectType);
    });
  }

  _initVisibilityFolder() {
    const visibilityFolder = this._roomFolder.addFolder({
      title: 'Objects visibility',
      expanded: false,
    });

    const visibilityObjectControllers = {};

    const buttonShowAllObjects = visibilityFolder.addButton({
      title: 'Show all objects',
      disabled: true,
    }).on('click', () => {
      for (const objectType in ROOM_OBJECT_TYPE) {
        const config = ROOM_OBJECT_CONFIG[ROOM_OBJECT_TYPE[objectType]];
        config.visible = true;
        visibilityObjectControllers[ROOM_OBJECT_TYPE[objectType]].refresh();
        buttonShowAllObjects.disabled = true;
      }
    });

    for (const objectType in ROOM_OBJECT_TYPE) {
      const config = ROOM_OBJECT_CONFIG[ROOM_OBJECT_TYPE[objectType]];

      if (!config.visible) {
        buttonShowAllObjects.disabled = false;
      }

      visibilityObjectControllers[ROOM_OBJECT_TYPE[objectType]] = visibilityFolder.addInput(ROOM_OBJECT_CONFIG[ROOM_OBJECT_TYPE[objectType]], 'visible', {
        label: config.label,
      }).on('change', (objectVisibleState) => {
          if (!objectVisibleState.value) {
            buttonShowAllObjects.disabled = false;
          }

          if (this._checkAllObjectsVisibility()) {
            buttonShowAllObjects.disabled = true;
          }

          this.events.post('changeObjectVisibility');
        });
    }
  }

  _checkAllObjectsVisibility() {
    for (const objectType in ROOM_OBJECT_TYPE) {
      const config = ROOM_OBJECT_CONFIG[ROOM_OBJECT_TYPE[objectType]];
      if (!config.visible) {
        return false;
      }
    }

    return true;
  }

  _initActiveRoomObjectsFolder() {
    GUIHelper.getGui().addFolder({
      title: 'Active room objects',
    });
  }
}
