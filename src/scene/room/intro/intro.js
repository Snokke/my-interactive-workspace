import * as THREE from 'three';
import TheatreJS from './theatre-js/theatre-js';
import { MessageDispatcher } from 'black-engine';
import { THEATRE_JS_CONFIG } from './theatre-js/data/theatre-js-config';
import { ROOM_OBJECT_ENABLED_CONFIG } from '../data/room-objects-enabled-config';
import { ROOM_OBJECT_TYPE } from '../data/room-config';
import Delayed from '../../../core/helpers/delayed-call';
import { WINDOW_OPEN_TYPE } from '../room-active-objects/walls/data/walls-data';
import { INTRO_CONFIG } from './intro-config';
import { LOCKER_CASES_ANIMATION_TYPE } from '../room-active-objects/locker/data/locker-data';
import { CAMERA_FOCUS_OBJECT_TYPE } from '../camera-controller/data/camera-data';

export default class Intro extends THREE.Group {
  constructor(data) {
    super();

    this.events = new MessageDispatcher();

    this._camera = data.camera;
    this._activeObjects = data.activeObjects;
    this._roomDebug = data.roomDebug;
    this._cameraController = data.cameraController;
    this._orbitControls = data.orbitControls;

    this._theatreJs = null;
    this._activeObjectsTweens = [];

    this._init();
  }

  update(dt) {
    this._theatreJs.update(dt);
  }

  switchIntro() {
    if (INTRO_CONFIG.active) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    INTRO_CONFIG.active = true;

    this._roomDebug.updateIntroButton();
    this._roomDebug.disableMonitorFocusButton();
    this._roomDebug.disableKeyboardFocusButton();
    this._roomDebug.disableStartCameraPositionButton();
    this._roomDebug.disableInteractWithAllObjectsButton();

    this._resetActiveObjects();
    this._disableAllObjects();
    this._cameraController.setNoControlsState();
    this._theatreJs.startAnimation();

    this._showActiveObjectsForIntro();
  }

  stop() {
    INTRO_CONFIG.active = false;

    this._theatreJs.stopAnimation();

    this._cameraController.setOrbitState();
    this._cameraController.focusCamera(CAMERA_FOCUS_OBJECT_TYPE.Room);

    this._roomDebug.updateIntroButton();
    this._roomDebug.disableIntroButton();
    this._roomDebug.enableMonitorFocusButton();
    this._roomDebug.enableKeyboardFocusButton();
    this._roomDebug.enableStartCameraPositionButton();
    this._roomDebug.enableInteractWithAllObjectsButton();

    this._stopActiveObjectsTweens();
    this._enableAllObjects();
    this._resetActiveObjects();
    this.events.post('onIntroStop');
  }

  _showActiveObjectsForIntro() {
    this._activateIntroObject(700, () => this._activeObjects[ROOM_OBJECT_TYPE.Keyboard].keyClick(9));

    this._activateIntroObject(2000, () => this._activeObjects[ROOM_OBJECT_TYPE.Mouse].moveToPosition(0, -0.08, 500 / THEATRE_JS_CONFIG.rate));
    this._activateIntroObject(2600, () => this._activeObjects[ROOM_OBJECT_TYPE.Mouse].onLeftKeyClick());

    this._activateIntroObject(5000, () => this._activeObjects[ROOM_OBJECT_TYPE.Keyboard].keyClick(15));
    this._activateIntroObject(6500, () => this._activeObjects[ROOM_OBJECT_TYPE.Keyboard].keyClick(62));
    this._activateIntroObject(8000, () => this._activeObjects[ROOM_OBJECT_TYPE.Keyboard].keyClick(15));

    this._activateIntroObject(9500, () => this._activeObjects[ROOM_OBJECT_TYPE.Mouse].moveToPosition(-0.46, -0.23, 500 / THEATRE_JS_CONFIG.rate));
    this._activateIntroObject(10100, () => this._activeObjects[ROOM_OBJECT_TYPE.Mouse].onLeftKeyClick());
    this._activateIntroObject(10600, () => this._activeObjects[ROOM_OBJECT_TYPE.Mouse].moveToPosition(0, 0, 500 / THEATRE_JS_CONFIG.rate));

    this._activateIntroObject(10500, () => this._activeObjects[ROOM_OBJECT_TYPE.Walls].openWindow(WINDOW_OPEN_TYPE.Vertically));

    this._activateIntroObject(12500, () => this._activeObjects[ROOM_OBJECT_TYPE.AirConditioner].onClick());
    this._activateIntroObject(17000, () => this._activeObjects[ROOM_OBJECT_TYPE.AirConditioner].onClick());

    this._activateIntroObject(18000, () => this._activeObjects[ROOM_OBJECT_TYPE.Walls].onClick());

    this._activateIntroObject(20500, () => this._activeObjects[ROOM_OBJECT_TYPE.Locker].pushAllCasesByType(LOCKER_CASES_ANIMATION_TYPE.FromTop));
    this._activateIntroObject(22500, () => this._activeObjects[ROOM_OBJECT_TYPE.Locker].pushAllCases());

    this._activateIntroObject(25000, () => this._activeObjects[ROOM_OBJECT_TYPE.Chair].rotateSeat());
    this._activateIntroObject(25215, () => this._activeObjects[ROOM_OBJECT_TYPE.Chair].rotateSeat());

    this._activateIntroObject(26500, () => this._activeObjects[ROOM_OBJECT_TYPE.FloorLamp].onClick());
    this._activateIntroObject(28500, () => this._activeObjects[ROOM_OBJECT_TYPE.FloorLamp].onClick());

    // this._activateIntroObject(29500, () => this._roomDebug.highlightAllActiveObjects());
  }

  _activateIntroObject(delay, showFunction) {
    const delayedTween = Delayed.call(delay / THEATRE_JS_CONFIG.rate, () => {
      if (INTRO_CONFIG.active) {
        showFunction();
      }
    });

    this._activeObjectsTweens.push(delayedTween);
  }

  _stopActiveObjectsTweens() {
    for (let i = 0; i < this._activeObjectsTweens.length; i++) {
      this._activeObjectsTweens[i].stop();
    }

    this._activeObjectsTweens = [];
  }

  _resetActiveObjects() {
    for (const key in this._activeObjects) {
      this._activeObjects[key].resetToInitState();
    }

    this.events.post('onResetActiveObjects');
  }

  _disableAllObjects() {
    for (let key in this._activeObjects) {
      ROOM_OBJECT_ENABLED_CONFIG[key] = false;
      const roomObject = this._activeObjects[key];
      roomObject.disableDebugMenu();
    }
  }

  _enableAllObjects() {
    for (let key in this._activeObjects) {
      ROOM_OBJECT_ENABLED_CONFIG[key] = true;
      const roomObject = this._activeObjects[key];
      roomObject.enableDebugMenu();
    }
  }

  _onSequencePositionChanged() {
    this._roomDebug.updateIntroTime();
  }

  _init() {
    this._initTheatreJS();
    this._intiSignals();
  }

  _initTheatreJS() {
    const theatreJs = this._theatreJs = new TheatreJS(this._camera);
    this.add(theatreJs);
  }

  _intiSignals() {
    this._theatreJs.events.on('onIntroFinished', () => this.stop());
    this._theatreJs.events.on('onSequencePositionChanged', () => this._onSequencePositionChanged());
  }
}
