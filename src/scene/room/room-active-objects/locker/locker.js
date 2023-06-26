import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { CASES, CASE_01_PARTS, CASE_02_PARTS, LOCKER_CASES_ANIMATION_SEQUENCE, LOCKER_CASES_ANIMATION_TYPE, LOCKER_CASES_RANDOM_ANIMATIONS, LOCKER_CASE_MOVE_DIRECTION, LOCKER_CASE_OPEN_STATE, LOCKER_CASE_STATE, LOCKER_PART_TYPE } from './data/locker-data';
import { LOCKER_CONFIG } from './data/locker-config';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import Loader from '../../../../core/loader';
import SoundHelper from '../../shared-objects/sound-helper';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import { CHAIR_BOUNDING_BOX_TYPE } from '../chair/data/chair-data';
import { STATIC_MODE_CAMERA_CONFIG } from '../../camera-controller/data/camera-config';
import { Black } from 'black-engine';
import Materials from '../../../../core/materials';
import vertexShader from '../../shared-objects/mix-three-textures-shaders/mix-three-textures-vertex.glsl';
import fragmentShader from '../../shared-objects/mix-three-textures-shaders/mix-three-textures-fragment.glsl';

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

    this._isWorkplacePhotoShown = false;
    this._workplacePhotoLastTransform = {};

    this._init();
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (partType === LOCKER_PART_TYPE.Body && !this._isWorkplacePhotoShown) {
      this.pushAllCases();
    }

    if (CASES.includes(partType) && !this._isWorkplacePhotoShown) {
      this.pushCase(roomObject.userData.caseId);
    }

    if (CASE_01_PARTS.includes(partType) && !this._isWorkplacePhotoShown) {
      this.pushCase(0);
    }

    if (CASE_02_PARTS.includes(partType) && !this._isWorkplacePhotoShown) {
      this.pushCase(1);
    }

    if (partType === LOCKER_PART_TYPE.WorkplacePhoto) {
      this._onWorkplacePhotoClick();
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

    if (type === LOCKER_PART_TYPE.WorkplacePhoto) {
      if (this._isWorkplacePhotoShown) {
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

    if (mesh.userData.partType === LOCKER_PART_TYPE.WorkplacePhoto) {
      return [mesh];
    }

    if (CASE_01_PARTS.includes(mesh.userData.partType)) {
      return CASE_01_PARTS.map((partName) => this._parts[partName]);
    }

    if (CASE_02_PARTS.includes(mesh.userData.partType)) {
      return CASE_02_PARTS.map((partName) => this._parts[partName]);
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

  hideWorkplacePhoto() {
    this.events.post('onWorkplacePhotoMoving');
    this._isWorkplacePhotoShown = false;
    this._moveWorkplacePhotoToStartPosition();
    this._debugMenu.enableCaseMovement();
    this._parts[LOCKER_PART_TYPE.WorkplacePhoto].userData.hideOutline = false;
    this._enableActivity();
  }

  onLightPercentChange(lightPercent) {
    const workplacePhoto = this._parts[LOCKER_PART_TYPE.WorkplacePhoto];
    workplacePhoto.material.uniforms.uMixTextures0102Percent.value = lightPercent;
  }

  _onWorkplacePhotoClick() {
    this.events.post('onWorkplacePhotoMoving');

    if (!this._isWorkplacePhotoShown) {
      this._showWorkplacePhoto();
    } else {
      this.events.post('onWorkplacePhotoClickToHide');
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
    const workplacePhoto = this._parts[LOCKER_PART_TYPE.WorkplacePhoto];

    if (caseId === 0 && this._casesState[caseId] === LOCKER_CASE_STATE.Closed) {
      workplacePhoto.visible = true;

      this._parts[LOCKER_PART_TYPE.LockerClosedPartCase01].visible = false;
      this._parts[LOCKER_PART_TYPE.LockerOpenedPartCase01].visible = true;
    }

    if (caseId === 1 && this._casesState[caseId] === LOCKER_CASE_STATE.Closed) {
      workplacePhoto.visible = true;

      this._parts[LOCKER_PART_TYPE.LockerClosedPartCase02].visible = false;
      this._parts[LOCKER_PART_TYPE.LockerOpenedPartCase02].visible = true;
    }

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

      if (caseId === 0) {
        workplacePhoto.position.z = casePart.position.z + 0.23;
        this._parts[LOCKER_PART_TYPE.LockerOpenedPartCase01].position.z = casePart.position.z;
      }

      if (caseId === 1) {
        this._parts[LOCKER_PART_TYPE.LockerOpenedPartCase02].position.z = casePart.position.z;
      }
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

      if (caseId === 0 && this._casesState[caseId] === LOCKER_CASE_STATE.Closed) {
        workplacePhoto.visible = false;

        this._parts[LOCKER_PART_TYPE.LockerClosedPartCase01].visible = true;
        this._parts[LOCKER_PART_TYPE.LockerOpenedPartCase01].visible = false;
      }

      if (caseId === 1 && this._casesState[caseId] === LOCKER_CASE_STATE.Closed) {
        this._parts[LOCKER_PART_TYPE.LockerClosedPartCase02].visible = true;
        this._parts[LOCKER_PART_TYPE.LockerOpenedPartCase02].visible = false;
      }

      this.events.post('onCaseStopMoving');
    });
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

  _showWorkplacePhoto() {
    this._isWorkplacePhotoShown = true;
    this._updateMaterialOnFocus();
    const workplacePhoto = this._parts[LOCKER_PART_TYPE.WorkplacePhoto];
    this._workplacePhotoLastTransform.position.copy(workplacePhoto.position);
    this._workplacePhotoLastTransform.rotation.copy(workplacePhoto.rotation);
    this.events.post('onWorkplacePhotoClickToShow', workplacePhoto, this._roomObjectType);

    this._debugMenu.disableCaseMovement();
    this._disableActivity();
    workplacePhoto.userData.isActive = false;
    workplacePhoto.userData.hideOutline = true;

    Delayed.call(STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime, () => {
      workplacePhoto.userData.isActive = true;
      this.events.post('onWorkplacePhotoStopMoving');
    });
  }

  _moveWorkplacePhotoToStartPosition() {
    this._updateMaterialOnFocus();

    const workplacePhoto = this._parts[LOCKER_PART_TYPE.WorkplacePhoto];
    workplacePhoto.userData.isActive = false;

    const endPosition = this._workplacePhotoLastTransform.position;
    const endRotation = this._workplacePhotoLastTransform.rotation;

    new TWEEN.Tween(workplacePhoto.position)
      .to({ x: endPosition.x, y: endPosition.y, z: endPosition.z }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start()
      .onComplete(() => {
        workplacePhoto.userData.isActive = true;
        this.events.post('onWorkplacePhotoStopMoving');
      });

    new TWEEN.Tween(workplacePhoto.rotation)
      .to({ x: endRotation.x, y: endRotation.y, z: endRotation.z }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();
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

  _updateMaterialOnFocus() {
    let endMixTexturesValue;

    if (this._isWorkplacePhotoShown) {
      endMixTexturesValue = 1;
    } else {
      endMixTexturesValue = 0;
    }

    const workplacePhoto = this._parts[LOCKER_PART_TYPE.WorkplacePhoto];
    const mixTexturesObject = { value: workplacePhoto.material.uniforms.uMixTexture03Percent.value };

    new TWEEN.Tween(mixTexturesObject)
      .to({ value: endMixTexturesValue }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .onUpdate(() => {
        workplacePhoto.material.uniforms.uMixTexture03Percent.value = mixTexturesObject.value;
      })
      .start();

  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initWorkplacePhoto();
    this._setDefaultMoveDistance();
    this._setDefaultOpenState();
    this._initSounds();
    this._initDebugMenu();
    this._initSignals();

    this._reset();
  }

  _addMaterials() {
    const material = Materials.getMaterial(Materials.type.bakedBigObjects);

    for (const partName in this._parts) {
      const part = this._parts[partName];
      part.material = material;
    }
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

    this._parts[LOCKER_PART_TYPE.LockerOpenedPartCase01].visible = false;
    this._parts[LOCKER_PART_TYPE.LockerOpenedPartCase02].visible = false;
  }

  _initWorkplacePhoto() {
    const workplacePhoto = this._parts[LOCKER_PART_TYPE.WorkplacePhoto];

    const bakedTextureLightOn = Loader.assets['baked-textures/baked-workplace-photo'];
    bakedTextureLightOn.flipY = false;

    const bakedTextureLightOff = Loader.assets['baked-textures/baked-workplace-photo-light-off'];
    bakedTextureLightOff.flipY = false;

    const bakedTextureFocus = Loader.assets['baked-textures/baked-workplace-photo-focus'];
    bakedTextureFocus.flipY = false;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture01: { value: bakedTextureLightOff },
        uTexture02: { value: bakedTextureLightOn },
        uTexture03: { value: bakedTextureFocus },
        uMixTextures0102Percent: { value: 1 },
        uMixTexture03Percent: { value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    workplacePhoto.material = material;

    this._workplacePhotoLastTransform = {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
    };

    workplacePhoto.visible = false;
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
    this._debugMenu.events.on('changeAllCasesAnimation', (msg, allCasesAnimation) => this._currentAnimationType = allCasesAnimation);
    this._debugMenu.events.on('changeCaseMoveDistance', () => this._setDefaultMoveDistance());
  }
}
