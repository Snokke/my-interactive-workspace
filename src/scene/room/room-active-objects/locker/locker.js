import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { CASES, LOCKER_CASES_ANIMATION_SEQUENCE, LOCKER_CASES_ANIMATION_TYPE, LOCKER_CASES_RANDOM_ANIMATIONS, LOCKER_CASE_MOVE_DIRECTION, LOCKER_CASE_OPEN_STATE, LOCKER_CASE_STATE, LOCKER_PART_TYPE,  OBJECTS_IN_LOCKER_CONFIG } from './data/locker-data';
import { LOCKER_CONFIG } from './data/locker-config';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import Loader from '../../../../core/loader';
import SoundHelper from '../../shared/sound-helper';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import { CHAIR_BOUNDING_BOX_TYPE } from '../chair/data/chair-data';
import { STATIC_MODE_CAMERA_CONFIG } from '../../camera-controller/data/camera-config';
import { Black } from 'black-engine';
import lockerVertexShader from './mix-locker-textures-shaders/mix-locker-textures-vertex.glsl';
import lockerFragmentShader from './mix-locker-textures-shaders/mix-locker-textures-fragment.glsl';

export default class Locker extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._currentAnimationType = LOCKER_CASES_RANDOM_ANIMATIONS;

    this._casesState = [];
    this._casesOpenState = [];
    this._casesPreviousState = [];
    this._caseMoveTween = [];
    this._openSounds = [];
    this._closeSounds = [];
    this._soundHelpers = [];

    this._chairIntersect = { [CHAIR_BOUNDING_BOX_TYPE.Main]: false, [CHAIR_BOUNDING_BOX_TYPE.FrontWheel]: false};
    this._caseMoveDistance = {};

    this._objectsInLocker = {};
    this._shownObjectInLocker = null;

    this._init();
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (partType === LOCKER_PART_TYPE.Body && !this._isAnyObjectInLockerShown()) {
      this.pushAllCases();
    }

    if (CASES.includes(partType) && !this._isAnyObjectInLockerShown()) {
      this.pushCase(roomObject.userData.caseId);
    }

    if (this._getAllObjectsInLocker().includes(partType)) {
      this._onObjectInLockerClick(partType);
    }
  }

  onAllObjectsInteraction() {
    const pushAllCasesOrOne = Math.random() > 0.5;

    if (pushAllCasesOrOne) {
      this.pushAllCases();
    } else {
      const randomCaseId = Math.floor(Math.random() * CASES.length);
      this.pushCase(randomCaseId);
    }
  }

  onPointerOver(intersect) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const roomObject = intersect.object;
    const type = roomObject.userData.partType;

    if (this._getAllObjectsInLocker().includes(type)) {
      const objectInLocker = this._objectsInLocker[type];

      if (objectInLocker.isShown()) {
        Black.engine.containerElement.style.cursor = 'zoom-out';
      } else {
        Black.engine.containerElement.style.cursor = 'grab';
      }
    }
  }

  pushAllCases() {
    this.events.post('onCaseMoving');
    const isAllCasesClosed = this._casesState.every(state => state === LOCKER_CASE_STATE.Closed);

    if (isAllCasesClosed) {
      if (this._currentAnimationType === LOCKER_CASES_RANDOM_ANIMATIONS) {
        const animationTypes = Object.values(LOCKER_CASES_ANIMATION_TYPE);
        const animationType = animationTypes[Math.floor(Math.random() * animationTypes.length)];

        this._showCasesAnimation(animationType);
      } else {
        this._showCasesAnimation(this._currentAnimationType);
      }
    } else {
      for (let i = 0; i < LOCKER_CONFIG.casesCount; i += 1) {
        this._moveCase(i, LOCKER_CASE_MOVE_DIRECTION.In, 0, false);
      }

      const time = this._caseMoveDistance[3] / LOCKER_CONFIG.caseMoveSpeed * 1000;
      Delayed.call(time, () => this._playCloseSound(0));
    }
  }

  pushAllCasesByType(animationType) {
    this._setAnimationType(animationType);
    this.pushAllCases();
  }

  pushCase(caseId) {
    this.events.post('onCaseMoving');

    if (this._casesState[caseId] === LOCKER_CASE_STATE.Moving) {
      this._stopCaseMoveTween(caseId);

      if (this._casesPreviousState[caseId] === LOCKER_CASE_STATE.Opened) {
        this._casesPreviousState[caseId] = LOCKER_CASE_STATE.Closed;
        this._moveCase(caseId, LOCKER_CASE_MOVE_DIRECTION.Out);
      } else {
        this._casesPreviousState[caseId] = LOCKER_CASE_STATE.Opened;
        this._moveCase(caseId, LOCKER_CASE_MOVE_DIRECTION.In);
      }

      return;
    }

    if (this._casesState[caseId] === LOCKER_CASE_STATE.Opened) {
      this._moveCase(caseId, LOCKER_CASE_MOVE_DIRECTION.In);
    } else {
      this._moveCase(caseId, LOCKER_CASE_MOVE_DIRECTION.Out);
    }
  }

  getMeshesForOutline(mesh) {
    if (mesh.userData.partType === LOCKER_PART_TYPE.Body) {
      return Object.values(this._parts);
    }

    if (this._getAllObjectsInLocker().includes(mesh.userData.partType)) {
       return [mesh];
    }

    const partName = `case0${mesh.userData.caseId + 1}`;
    const casePart = this._parts[partName];

    return [casePart];
  }

  onVolumeChanged(volume) {
    this._globalVolume = volume;

    if (this._isSoundsEnabled) {
      this._openSounds.forEach((sound) => {
        sound.setVolume(this._globalVolume * this._objectVolume);
      });

      this._closeSounds.forEach((sound) => {
        sound.setVolume(this._globalVolume * this._objectVolume);
      });
    }
  }

  enableSound() {
    this._isSoundsEnabled = true;

    this._openSounds.forEach((sound) => {
      sound.setVolume(this._globalVolume * this._objectVolume);
    });

    this._closeSounds.forEach((sound) => {
      sound.setVolume(this._globalVolume * this._objectVolume);
    });
  }

  disableSound() {
    this._isSoundsEnabled = false;

    this._openSounds.forEach((sound) => {
      sound.setVolume(0);
    });

    this._closeSounds.forEach((sound) => {
      sound.setVolume(0);
    });
  }

  showSoundHelpers() {
    if (this._soundHelpers) {
      this._soundHelpers.forEach((soundHelper) => {
        soundHelper.show();
      });
    }
  }

  hideSoundHelpers() {
    if (this._soundHelpers) {
      this._soundHelpers.forEach((soundHelper) => {
        soundHelper.hide();
      });
    }
  }

  hideObjectInLocker() {
    this.events.post('onObjectMoving');

    this._debugMenu.enableCaseMovement();
    this._enableActivity();

    this._shownObjectInLocker.onFocusHide();
    this._shownObjectInLocker.moveToStartPosition();
  }

  onLightPercentChange(lightPercent) {
    for (const value in this._objectsInLocker) {
      const objectInLocker = this._objectsInLocker[value];
      objectInLocker.onLightPercentChange(lightPercent);
    }

    CASES.forEach((partName) => {
      const caseObject = this._parts[partName];
      caseObject.material.uniforms.uMixLightPercent.value = lightPercent;
    });

    const body = this._parts[LOCKER_PART_TYPE.Body];
    body.material.uniforms.uMixLightPercent.value = lightPercent;
  }

  setTablePercent(percent) {
    const body = this._parts[LOCKER_PART_TYPE.Body];
    body.material.uniforms.uMixOpenedPercent.value = percent;
  }

  resetToInitState() {
    const isAllCasesClosed = this._casesState.every(state => state === LOCKER_CASE_STATE.Closed);

    if (!isAllCasesClosed) {
      for (let i = 0; i < LOCKER_CONFIG.casesCount; i += 1) {
        this._moveCase(i, LOCKER_CASE_MOVE_DIRECTION.In, 0, false);
      }

      const time = this._caseMoveDistance[3] / LOCKER_CONFIG.caseMoveSpeed * 1000;
      Delayed.call(time, () => this._playCloseSound(0));
    }
  }

  _onObjectInLockerClick(partType) {
    this.events.post('onObjectMoving');

    if (!this._isAnyObjectInLockerShown()) {
      this._showObjectInLocker(partType);
    } else {
      this.events.post('onObjectClickToHide');
    }
  }

  _moveCase(caseId, direction, delay = 0, playSound = true) {
    this._stopCaseMoveTween(caseId);
    const endState = direction === LOCKER_CASE_MOVE_DIRECTION.Out ? LOCKER_CASE_STATE.Opened : LOCKER_CASE_STATE.Closed;

    if (this._casesState[caseId] === endState) {
      return;
    }

    const partName = `case0${caseId + 1}`;
    const casePart = this._parts[partName];

    this._showObjectInCase(caseId);

    const startPositionZ = casePart.userData.startPosition.z;
    const endPositionZ = direction === LOCKER_CASE_MOVE_DIRECTION.Out ? startPositionZ + this._caseMoveDistance[caseId] : startPositionZ;
    const time = Math.abs(casePart.position.z - endPositionZ) / LOCKER_CONFIG.caseMoveSpeed * 1000;

    this._caseMoveTween[caseId] = new TWEEN.Tween(casePart.position)
      .to({ z: endPositionZ }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .delay(delay)
      .start();

    this._caseMoveTween[caseId].onUpdate(() => {
      this._openSounds[caseId].position.copy(casePart.position);
      this._openSounds[caseId].position.z += 0.8;
      this._soundHelpers[caseId].position.copy(this._openSounds[caseId].position);

      const percent = Math.abs(casePart.position.z - startPositionZ) / this._caseMoveDistance[caseId];
      casePart.material.uniforms.uMixOpenedPercent.value = percent;

      this._updateObjectInCasePosition(caseId);
    });

    this._caseMoveTween[caseId].onStart(() => {
      this._casesState[caseId] = LOCKER_CASE_STATE.Moving;

      if (playSound) {
        this._playOpenSound(caseId);
      }
    });

    this._caseMoveTween[caseId].onComplete(() => {
      this._casesState[caseId] = direction === LOCKER_CASE_MOVE_DIRECTION.Out ? LOCKER_CASE_STATE.Opened : LOCKER_CASE_STATE.Closed;
      this._casesPreviousState[caseId] = this._casesState[caseId];

      if (this._casesState[caseId] === LOCKER_CASE_STATE.Opened) {
        if (casePart.position.z === startPositionZ + LOCKER_CONFIG.caseMoveDistance) {
          this._casesOpenState[caseId] = LOCKER_CASE_OPEN_STATE.Full;
        } else {
          this._casesOpenState[caseId] = LOCKER_CASE_OPEN_STATE.Part;
        }
      }

      if (playSound && this._casesState[caseId] === LOCKER_CASE_STATE.Closed) {
        this._playCloseSound(caseId);
      }

      this._hideObjectInCase(caseId);
      this.events.post('onCaseStopMoving');
    });
  }

  _showObjectInCase(caseId) {
    for (const value in this._objectsInLocker) {
      const objectInLocker = this._objectsInLocker[value];

      if (caseId + 1 === objectInLocker.getCaseId() && this._casesState[caseId] === LOCKER_CASE_STATE.Closed) {
        objectInLocker.showView();
      }
    }
  }

  _hideObjectInCase(caseId) {
    for (const value in this._objectsInLocker) {
      const objectInLocker = this._objectsInLocker[value];

      if (caseId + 1 === objectInLocker.getCaseId() && this._casesState[caseId] === LOCKER_CASE_STATE.Closed) {
        objectInLocker.hideView();
      }
    }
  }

  _updateObjectInCasePosition(caseId) {
    const partName = `case0${caseId + 1}`;
    const casePart = this._parts[partName];

    for (const value in this._objectsInLocker) {
      const objectInLocker = this._objectsInLocker[value];

      if (caseId + 1 === objectInLocker.getCaseId()) {
        objectInLocker.getView().position.z = casePart.position.z + objectInLocker.getStartOffsetZ();
      }
    }
  }

  _stopCaseMoveTween(caseId) {
    if (this._caseMoveTween[caseId]) {
      this._caseMoveTween[caseId].stop();
    }
  }

  _stopTweens() {
    for (let i = 0; i < this._caseMoveTween.length; i += 1) {
      this._stopCaseMoveTween(i);
    }
  }

  _showCasesAnimation(animationType) {
    const casesSequence = LOCKER_CASES_ANIMATION_SEQUENCE[animationType];

    for (let j = 0; j < casesSequence.length; j += 1) {
      casesSequence[j].forEach((i) => {
        const delay = j * (1 / LOCKER_CONFIG.caseMoveSpeed) * LOCKER_CONFIG.allCasesAnimationDelayCoefficient;
        this._moveCase(i, LOCKER_CASE_MOVE_DIRECTION.Out, delay);
      });
    }
  }

  _showObjectInLocker(partType) {
    const objectInLocker = this._objectsInLocker[partType];
    this._shownObjectInLocker = objectInLocker;
    const view = objectInLocker.getView();
    objectInLocker.onFocus();

    this.events.post('onObjectInLockerClickToShow', view, this._roomObjectType);

    this._disableActivity();
    this._debugMenu.disableCaseMovement();

    Delayed.call(STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime, () => {
      objectInLocker.setViewActive();
      this.events.post('onObjectInLockerStopMoving');
    });
  }

  _playOpenSound(caseId) {
    if (this._openSounds[caseId].isPlaying) {
      this._openSounds[caseId].stop();
    }

    this._openSounds[caseId].play();
  }

  _playCloseSound(caseId) {
    if (this._closeSounds[caseId].isPlaying) {
      this._closeSounds[caseId].stop();
    }

    this._closeSounds[caseId].play();
  }

  _isAnyObjectInLockerShown() {
    return Object.values(this._objectsInLocker).some(object => object.isShown());
  }

  _getAllObjectsInLocker() {
    return Object.keys(OBJECTS_IN_LOCKER_CONFIG);
  }

  _reset() {
    this._stopTweens();

    this._casesState = [];
    this._casesPreviousState = [];
    this._setDefaultMoveDistance();
    this._setDefaultOpenState();

    CASES.forEach((partName) => {
      const casePart = this._parts[partName];
      casePart.position.z = casePart.userData.startPosition.z;
      this._casesState.push(LOCKER_CASE_STATE.Closed);
    });
  }

  _disableActivity() {
    const body = this._parts[LOCKER_PART_TYPE.Body];
    body.userData.isActive = false;

    CASES.forEach((partName) => {
      const casePart = this._parts[partName];
      casePart.userData.isActive = false;
    });
  }

  _enableActivity() {
    const body = this._parts[LOCKER_PART_TYPE.Body];
    body.userData.isActive = true;

    CASES.forEach((partName) => {
      const casePart = this._parts[partName];
      casePart.userData.isActive = true;
    });
  }

  _setAnimationType(allCasesAnimation) {
    this._currentAnimationType = allCasesAnimation;
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initObjectsInLocker();
    this._setDefaultMoveDistance();
    this._setDefaultOpenState();
    this._initSounds();
    this._initDebugMenu();
    this._initSignals();

    this._reset();
  }

  _addMaterials() {
    const bakedTextureLightOnOpened = Loader.assets['baked-textures/baked-locker-opened'];
    bakedTextureLightOnOpened.flipY = false;

    const bakedTextureLightOffOpened = Loader.assets['baked-textures/baked-locker-opened-light-off'];
    bakedTextureLightOffOpened.flipY = false;

    const bakedTextureLightOnClosed = Loader.assets['baked-textures/baked-locker-closed'];
    bakedTextureLightOnClosed.flipY = false;

    const bakedTextureLightOffClosed = Loader.assets['baked-textures/baked-locker-closed-light-off'];
    bakedTextureLightOffClosed.flipY = false;

    const partsNames = [...CASES, LOCKER_PART_TYPE.Body];

    partsNames.forEach((partName) => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTextureOpenedLightOff: { value: bakedTextureLightOffOpened },
          uTextureOpenedLightOn: { value: bakedTextureLightOnOpened },
          uTextureClosedLightOff: { value: bakedTextureLightOffClosed },
          uTextureClosedLightOn: { value: bakedTextureLightOnClosed },
          uMixLightPercent: { value: 1 },
          uMixOpenedPercent: { value: 0 },
        },
        vertexShader: lockerVertexShader,
        fragmentShader: lockerFragmentShader,
      });

      const part = this._parts[partName];
      part.material = material;
    });
  }

  _addPartsToScene() {
    for (let key in this._parts) {
      const part = this._parts[key];
      const partType = part.userData.partType;

      if (CASES.includes(partType)) {
        part.userData['caseId'] = parseInt(part.name.replace('case', '')) - 1;
      }

      this.add(part);
    }
  }

  _initObjectsInLocker() {
    for (const object in OBJECTS_IN_LOCKER_CONFIG) {
      const objectPart = this._parts[object];
      const casePartType = OBJECTS_IN_LOCKER_CONFIG[object].case;
      const objectClass = OBJECTS_IN_LOCKER_CONFIG[object].class;

      const objectInLocker = new objectClass(objectPart, casePartType);
      this._objectsInLocker[object] = objectInLocker;

      objectInLocker.events.on('onObjectStopMoving', () => this.events.post('onObjectInLockerStopMoving'));

      const startOffsetZ = objectPart.userData.startPosition.z - this._parts[casePartType].userData.startPosition.z;
      objectInLocker.setStartOffsetZ(startOffsetZ);
    }

    // const CVButtons = this._objectsInLocker[LOCKER_PART_TYPE.CV].getButtons();
    // this._allMeshes.push(...CVButtons);
  }

  _setDefaultMoveDistance() {
    for (let i = 0; i < LOCKER_CONFIG.casesCount; i += 1) {
      this._caseMoveDistance[i] = LOCKER_CONFIG.caseMoveDistance;
    }
  }

  _setDefaultOpenState() {
    for (let i = 0; i < LOCKER_CONFIG.casesCount; i += 1) {
      this._casesOpenState[i] = LOCKER_CASE_OPEN_STATE.Full;
    }
  }

  _initSounds() {
    this._initSound();
    this._initSoundHelper();
  }

  _initSound() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];

    for (const key in CASES) {
      const openSound = new THREE.PositionalAudio(this._audioListener);
      this.add(openSound);

      openSound.setRefDistance(soundConfig.refDistance);
      openSound.setVolume(this._globalVolume * this._objectVolume);

      const closeSound = new THREE.PositionalAudio(this._audioListener);
      this.add(closeSound);

      closeSound.setRefDistance(soundConfig.refDistance);
      closeSound.setVolume(this._globalVolume * this._objectVolume);

      const caseType = CASES[key];
      const caseObject = this._parts[caseType];
      openSound.position.copy(caseObject.position);
      openSound.position.z += 0.8;
      closeSound.position.copy(openSound.position);

      this._openSounds.push(openSound);
      this._closeSounds.push(closeSound);
    }

    Loader.events.on('onAudioLoaded', () => {
      this._openSounds.forEach((sound) => {
        sound.setBuffer(Loader.assets['open-case'])
      });

      this._closeSounds.forEach((sound) => {
        sound.setBuffer(Loader.assets['close-case'])
      });
    });
  }

  _initSoundHelper() {
    const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;

    this._openSounds.forEach((sound) => {
      const soundHelper = new SoundHelper(helperSize);
      this.add(soundHelper);

      soundHelper.position.copy(sound.position);
      this._soundHelpers.push(soundHelper);
    });
  }

  _initSignals() {
    this._debugMenu.events.on('pushCase', (msg, caseId) => this.pushCase(caseId));
    this._debugMenu.events.on('pushAllCases', () => this.pushAllCases());
    this._debugMenu.events.on('changeAllCasesAnimation', (msg, allCasesAnimation) => this._setAnimationType(allCasesAnimation));
    this._debugMenu.events.on('changeCaseMoveDistance', () => this._setDefaultMoveDistance());
  }
}
