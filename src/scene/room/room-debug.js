import * as THREE from 'three';
import { MessageDispatcher } from "black-engine";
import GUIHelper from "../../core/helpers/gui-helper/gui-helper";
import { ROOM_CONFIG, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from "./data/room-config";
import isMobile from 'ismobilejs';
import { DEBUG_MENU_START_STATE } from "../../core/configs/debug-menu-start-state";
import DEBUG_CONFIG from "../../core/configs/debug-config";
import { SOUNDS_CONFIG } from './data/sounds-config';

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
    this._initSoundsDebug();
    this._initShowAnimationFolder();
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

  _initSoundsDebug() {
    this._roomFolder.addSeparator();

    this._roomFolder.addInput(SOUNDS_CONFIG, 'enabled', {
      label: 'Sound',
    }).on('change', () => {
      this.events.post('soundsEnabledChanged');
    });

    this._roomFolder.addInput(SOUNDS_CONFIG, 'volume', {
      label: 'Volume',
      min: 0,
      max: 1,
    }).on('change', () => {
      this.events.post('volumeChanged');
    });

    this._roomFolder.addInput(SOUNDS_CONFIG, 'debugHelpers', {
      label: 'Helpers',
    }).on('change', () => {
      this.events.post('debugHelpersChanged');
    });
  }

  _initShowAnimationFolder() {
    // let selectedObjectType = ROOM_OBJECT_TYPE.Keyboard;
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

    this._roomFolder.addSeparator();

    this._listShowAnimation = this._roomFolder.addBlade({
      view: 'list',
      label: 'Show animation object',
      options,
      value: selectedObjectType,
    }).on('change', (objectType) => {
      selectedObjectType = objectType.value;
    });

    this._buttonShowAnimation = this._roomFolder.addButton({
      title: 'Start show animation',
    }).on('click', () => {
      this.events.post('startShowAnimation', selectedObjectType);
    });
  }

  _initActiveRoomObjectsFolder() {
    const roomObjectsFolder = GUIHelper.getGui().addFolder({
      title: 'Active room objects',
      expanded: DEBUG_MENU_START_STATE.ActiveRoomObjects,
    });

    roomObjectsFolder.addInput(ROOM_CONFIG, 'autoOpenActiveDebugFolder', {
      label: 'Auto open folders',
    });
  }
}
