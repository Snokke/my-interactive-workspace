import { MessageDispatcher } from "black-engine";
import GUIHelper from "../../core/helpers/gui-helper/gui-helper";
import { ROOM_CONFIG } from "./data/room-config";
import { DEBUG_MENU_START_STATE } from "../../core/configs/debug-menu-start-state";
import { SOUNDS_CONFIG } from './data/sounds-config';
import { CAMERA_CONFIG } from './camera-controller/data/camera-config';
import { CAMERA_MODE } from './camera-controller/data/camera-data';
import DEBUG_CONFIG from '../../core/configs/debug-config';
import SCENE_CONFIG from "../../core/configs/scene-config";
import { THEATRE_JS_CONFIG } from "./intro/theatre-js/data/theatre-js-config";
import { INTRO_CONFIG } from "./intro/intro-config";

export default class RoomDebug {
  constructor(scene) {
    this.events = new MessageDispatcher();

    this._scene = scene;

    this._listShowAnimation = null;
    this._buttonShowAnimation = null;
    this._roomFolder = null;
    this._soundsEnabledController = null;
    this._soundsVolumeController = null;
    this._cameraModeController = null;
    this._exitFocusModeButton = null;
    this._monitorFocusButton = null;
    this._keyboardFocusButton = null;
    this._startCameraPositionButton = null;
    this._highlightActiveObjectsButton = null;
    this._introButton = null;
    this._introTimeController = null;
    this._interactWithAllObjectsButton = null;

    this._isActiveObjectsHighlighted = false;

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

  updateCameraStateController() {
    this._cameraModeController.refresh();

    if (CAMERA_CONFIG.mode === CAMERA_MODE.Focused) {
      this.enableExitFocusModeButton();
    } else {
      this.disableExitFocusModeButton();
    }
  }

  enableExitFocusModeButton() {
    this._exitFocusModeButton.disabled = false;
  }

  disableExitFocusModeButton() {
    this._exitFocusModeButton.disabled = true;
  }

  enableMonitorFocusButton() {
    this._monitorFocusButton.disabled = false;
  }

  disableMonitorFocusButton() {
    this._monitorFocusButton.disabled = true;
  }

  enableKeyboardFocusButton() {
    this._keyboardFocusButton.disabled = false;
  }

  disableKeyboardFocusButton() {
    this._keyboardFocusButton.disabled = true;
  }

  enableStartCameraPositionButton() {
    this._startCameraPositionButton.disabled = false;
  }

  disableStartCameraPositionButton() {
    this._startCameraPositionButton.disabled = true;
  }

  updateHighlightActiveObjectsButton() {
    const title = this._isActiveObjectsHighlighted ? 'Hide highlight of active objects' : 'Highlight active objects';
    this._highlightActiveObjectsButton.title = title;
  }

  setActiveObjectsHighlightState(state) {
    this._isActiveObjectsHighlighted = state;
    this.updateHighlightActiveObjectsButton();
  }

  updateIntroButton() {
    const title = INTRO_CONFIG.active ? 'Stop intro' : 'Show intro';
    this._introButton.title = title;
  }

  enableIntroButton() {
    this._introButton.disabled = false;
  }

  disableIntroButton() {
    this._introButton.disabled = true;
  }

  updateIntroTime() {
    this._introTimeController.refresh();
  }

  highlightAllActiveObjects() {
    this.events.post('highlightAllActiveObjects');
  }

  onHighlightAllActiveObjects() {
    this._isActiveObjectsHighlighted = !this._isActiveObjectsHighlighted;
    this.updateHighlightActiveObjectsButton();
  }

  enableInteractWithAllObjectsButton() {
    this._interactWithAllObjectsButton.disabled = false;
  }

  disableInteractWithAllObjectsButton() {
    this._interactWithAllObjectsButton.disabled = true;
  }

  _init() {
    this._initTheatreJsDebug();
    this._initSettingsFolder();
    this._initGeneralDebug();
    this._initSoundsDebug();
    this._initCameraDebug();
    this._initIntroDebug();
    this._initActiveObjectsShowFolder();
    this._initActiveRoomObjectsFolder();
  }

  _initTheatreJsDebug() {
    if (THEATRE_JS_CONFIG.studioEnabled) {
      this._reserveCameraButton = GUIHelper.getGui().addButton({
        title: 'Switch to reserve camera',
      }).on('click', () => {
        this.events.post('onSwitchToReserveCamera');
      });
    }
  }

  _initSettingsFolder() {
    this._roomFolder = GUIHelper.getGui().addFolder({
      title: 'Settings',
      expanded: DEBUG_MENU_START_STATE.Settings,
    });
  }

  _initGeneralDebug() {
    const generalFolder = this._roomFolder.addFolder({
      title: 'General',
      expanded: DEBUG_MENU_START_STATE.General,
    });

    // generalFolder.addInput(DEBUG_CONFIG, 'wireframe', { label: 'Wireframe' })
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

    generalFolder.addInput(DEBUG_CONFIG, 'fpsMeter', {
      label: 'FPS Meter',
    }).on('change', () => {
      this.events.post('fpsMeterChanged');
    });

    SCENE_CONFIG.outlinePass.enabled = !SCENE_CONFIG.isMobile;

    generalFolder.addInput(SCENE_CONFIG.outlinePass, 'enabled', {
      label: 'Outline',
      disabled: SCENE_CONFIG.isMobile,
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

    this._cameraModeController = cameraFolder.addInput(CAMERA_CONFIG, 'mode', {
      label: 'Mode',
      disabled: true,
    });
    this._cameraModeController.customDisabled = true;

    this._monitorFocusButton = cameraFolder.addButton({
      title: 'Focus monitor',
    }).on('click', () => {
      this.events.post('onMonitorFocus');
    });

    this._keyboardFocusButton = cameraFolder.addButton({
      title: 'Focus keyboard',
    }).on('click', () => {
      this.events.post('onKeyboardFocus');
    });

    this._exitFocusModeButton = cameraFolder.addButton({
      title: 'Exit focus mode',
      disabled: true,
    }).on('click', () => {
      this.events.post('onExitFocusMode');
    });

    cameraFolder.addSeparator();

    this._startCameraPositionButton = cameraFolder.addButton({
      title: 'Set start position',
    }).on('click', () => {
      this.events.post('onRoomFocus');
    });
  }

  _initIntroDebug() {
    const introFolder = this._roomFolder.addFolder({
      title: 'Intro',
      expanded: DEBUG_MENU_START_STATE.Intro,
    });

    this._introTimeController = introFolder.addInput(THEATRE_JS_CONFIG, 'sequencePosition', {
      label: 'Time',
      min: 0,
      max: 30,
      disabled: true,
    });
    this._introTimeController.customDisabled = true;

    this._introButton = introFolder.addButton({
      title: 'Show intro',
    }).on('click', () => {
      this.events.post('onShowIntro');
    });

    introFolder.addSeparator();

    introFolder.addInput(THEATRE_JS_CONFIG, 'rate', {
      label: 'Rate',
      min: 0.3,
      max: 3,
    });
  }

  _initActiveObjectsShowFolder() {
    // const activeObjectsInteractionFolder = this._roomFolder.addFolder({
    //   title: 'Active objects',
    //   expanded: DEBUG_MENU_START_STATE.ActiveObjects,
    // });

    this._highlightActiveObjectsButton = this._roomFolder.addButton({
      title: 'Highlight active objects',
    }).on('click', () => {
      this.highlightAllActiveObjects();
    });

    this._interactWithAllObjectsButton = this._roomFolder.addButton({
      title: 'Interact with all objects',
    }).on('click', () => {
      this.events.post('allObjectsInteraction');
    });
  }

  _initActiveRoomObjectsFolder() {
    const roomObjectsFolder = GUIHelper.getGui().addFolder({
      title: 'Active objects',
      expanded: DEBUG_MENU_START_STATE.ActiveRoomObjects,
    });

    roomObjectsFolder.addInput(ROOM_CONFIG, 'autoOpenActiveDebugFolder', {
      label: 'Auto open ↓',
    });
  }
}
