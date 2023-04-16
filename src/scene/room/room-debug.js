import * as THREE from 'three';
import { MessageDispatcher } from "black-engine";
import GUIHelper from "../../core/helpers/gui-helper/gui-helper";
import { ROOM_CONFIG, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from "./data/room-config";
import isMobile from 'ismobilejs';
import { DEBUG_MENU_START_STATE } from "../../core/configs/debug-menu-start-state";
import DEBUG_CONFIG from "../../core/configs/debug-config";
import { ROOM_OBJECT_VISIBILITY_CONFIG } from './data/room-objects-visibility-config';

export default class RoomDebug {
  constructor(scene) {
    this.events = new MessageDispatcher();

    this._scene = scene;

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
      expanded: DEBUG_MENU_START_STATE.Room,
    });

    roomFolder.addInput(DEBUG_CONFIG, 'wireframe', { label: 'Wireframe' })
      .on('change', (wireframeState) => {
        if (wireframeState.value) {
          this._scene.overrideMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
          });
        } else {
          this._scene.overrideMaterial = null;
        }
      });

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
      expanded: DEBUG_MENU_START_STATE.ObjectsShowAnimation,
    })

    // let selectedObjectType = ROOM_OBJECT_TYPE.Laptop;
    let selectedObjectType = START_ANIMATION_ALL_OBJECTS;

    const options = [
      { text: 'All scene', value: START_ANIMATION_ALL_OBJECTS },
    ];

    for (const objectType in ROOM_OBJECT_TYPE) {
      const config = ROOM_OBJECT_CONFIG[ROOM_OBJECT_TYPE[objectType]];

      if (config.createObject) {
        options.push({
          text: config.label,
          value: ROOM_OBJECT_TYPE[objectType],
        });
      }
    }

    this._listShowAnimation = showAnimationFolder.addBlade({
      view: 'list',
      label: 'Object',
      options,
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
      expanded: DEBUG_MENU_START_STATE.ObjectsVisibility,
    });

    const visibilityObjectControllers = {};

    const buttonShowAllObjects = visibilityFolder.addButton({
      title: 'Show all objects',
      disabled: true,
    }).on('click', () => {
      for (const objectType in ROOM_OBJECT_TYPE) {
        ROOM_OBJECT_VISIBILITY_CONFIG[ROOM_OBJECT_TYPE[objectType]] = true;
        visibilityObjectControllers[ROOM_OBJECT_TYPE[objectType]].refresh();
        buttonShowAllObjects.disabled = true;
      }
    });

    for (const objectType in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[objectType];
      const config = ROOM_OBJECT_CONFIG[type];

      if (config.createObject) {
        if (!ROOM_OBJECT_VISIBILITY_CONFIG[type]) {
          buttonShowAllObjects.disabled = false;
        }

        visibilityObjectControllers[type] = visibilityFolder.addInput(ROOM_OBJECT_VISIBILITY_CONFIG, type, {
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
  }

  _checkAllObjectsVisibility() {
    for (const objectType in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[objectType];

      if (!ROOM_OBJECT_VISIBILITY_CONFIG[type]) {
        return false;
      }
    }

    return true;
  }

  _initActiveRoomObjectsFolder() {
    const roomObjectsFolder = GUIHelper.getGui().addFolder({
      title: 'Active room objects',
      expanded: DEBUG_MENU_START_STATE.ActiveRoomObjects,
    });

    roomObjectsFolder.addInput(ROOM_CONFIG, 'showOnlyActiveDebugFolder', {
      label: 'Show active folder',
    }).on('change', (showOnlyActiveState) => {
      this.events.post('changeShowOnlyActiveState', showOnlyActiveState.value)
    });
  }
}
