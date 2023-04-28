import * as THREE from 'three';
import { MessageDispatcher } from "black-engine";
import GUIHelper from "../../core/helpers/gui-helper/gui-helper";
import { ROOM_CONFIG, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE, START_ANIMATION_ALL_OBJECTS } from "./data/room-config";
import isMobile from 'ismobilejs';
import { DEBUG_MENU_START_STATE } from "../../core/configs/debug-menu-start-state";
import { SOUNDS_CONFIG } from './data/sounds-config';
import { CAMERA_CONFIG } from './camera-controller/data/camera-config';

export default class RoomDebug {
  constructor(scene) {
    this.events = new MessageDispatcher();

    this._scene = scene;

    this._listShowAnimation = null;
    this._buttonShowAnimation = null;
    this._roomFolder = null;
    this._soundsEnabledController = null;
    this._soundsVolumeController = null;

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

  updateSoundsEnabledController() {
    this._soundsEnabledController.refresh();
  }

  updateSoundsVolumeController() {
    this._soundsVolumeController.refresh();
  }

  _init() {
    this._initRoomDebug();
    this._initSoundsDebug();
    this._initCameraDebug();
    this._initShowAnimationFolder();
    this._initAllObjectsShowFolder();
    this._initActiveRoomObjectsFolder();
  }

  _initRoomDebug() {
    const roomFolder = this._roomFolder = GUIHelper.getGui().addFolder({
      title: 'Settings',
      expanded: DEBUG_MENU_START_STATE.Room,
    });

    // roomFolder.addInput(DEBUG_CONFIG, 'wireframe', { label: 'Wireframe' })
    //   .on('change', (wireframeState) => {
    //     if (wireframeState.value) {
    //       this._scene.overrideMaterial = new THREE.MeshBasicMaterial({
    //         color: 0x000000,
    //         wireframe: true,
    //       });
    //     } else {
    //       this._scene.overrideMaterial = null;
    //     }
    //   });

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
    const soundFolder = this._roomFolder.addFolder({
      title: 'Sound',
      expanded: DEBUG_MENU_START_STATE.Sound,
    });

    this._soundsEnabledController = soundFolder.addInput(SOUNDS_CONFIG, 'enabled', {
      label: 'Sound',
    }).on('change', () => {
      this.events.post('soundsEnabledChanged');
    });

    this._soundsVolumeController = soundFolder.addInput(SOUNDS_CONFIG, 'volume', {
      label: 'Volume',
      min: 0,
      max: 1,
      step: 0.1,
      format: (v) => (v * 100).toFixed(0),
    }).on('change', () => {
      this.events.post('volumeChanged');
    });

    soundFolder.addInput(SOUNDS_CONFIG, 'debugHelpers', {
      label: 'Helpers',
    }).on('change', () => {
      this.events.post('debugHelpersChanged');
    });
  }

  _initCameraDebug() {
    const cameraFolder = this._roomFolder.addFolder({
      title: 'Camera',
      expanded: DEBUG_MENU_START_STATE.Camera,
    });

    cameraFolder.addInput(CAMERA_CONFIG, 'fov', {
      label: 'FOV',
      min: 20,
      max: 120,
    }).on('change', () => {
      this.events.post('onChangeCameraFOV');
    });

    cameraFolder.addButton({
      title: 'Monitor focus',
    }).on('click', () => {
      this.events.post('onMonitorFocus');
    });

    cameraFolder.addButton({
      title: 'Keyboard focus',
    }).on('click', () => {
      this.events.post('onKeyboardFocus');
    });

    cameraFolder.addButton({
      title: 'Room focus',
    }).on('click', () => {
      this.events.post('onRoomFocus');
    });
  }

  _initShowAnimationFolder() {
    const showAnimationFolder = this._roomFolder.addFolder({
      title: 'Start appearance animation',
      expanded: DEBUG_MENU_START_STATE.ShowAnimation,
    });

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

    this._listShowAnimation = showAnimationFolder.addBlade({
      view: 'list',
      label: 'Object',
      options,
      value: selectedObjectType,
    }).on('change', (objectType) => {
      selectedObjectType = objectType.value;
    });

    this._buttonShowAnimation = showAnimationFolder.addButton({
      title: 'Start animation',
    }).on('click', () => {
      this.events.post('startShowAnimation', selectedObjectType);
    });
  }

  _initAllObjectsShowFolder() {
    const allObjectsInteractionFolder = this._roomFolder.addFolder({
      title: 'All objects interaction',
      expanded: DEBUG_MENU_START_STATE.AllObjectsInteraction,
    });

    allObjectsInteractionFolder.addButton({
      title: 'Show all objects interaction',
    }).on('click', () => {
      this.events.post('allObjectsInteraction');
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
