import * as THREE from 'three';
import RoomObjectAbstract from '../room-object.abstract';
import { MOUSE_PART_TYPE } from './data/mouse-data';
import { MOUSE_CONFIG } from './data/mouse-config';
import MouseAreaBorders from './mouse-area-borders';
import HelpArrows from '../../shared-objects/help-arrows/help-arrows';
import { HELP_ARROW_TYPE } from '../../shared-objects/help-arrows/help-arrows-config';
import Loader from '../../../../core/loader';
import { SOUNDS_CONFIG } from '../../data/sounds-config';
import SoundHelper from '../../shared-objects/sound-helper';
import { Black } from 'black-engine';
import Materials from '../../../../core/materials';

export default class Mouse extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._minAreaVector = null;
    this._maxAreaVector = null;
    this._mouseAreaBorders = null;
    this._helpArrows = null;

    this._plane = new THREE.Plane();
    this._pNormal = new THREE.Vector3(0, 1, 0);
    this._shift = new THREE.Vector3();
    this._currentPosition = new THREE.Vector3();
    this._previousPosition = new THREE.Vector3();

    this._isMouseClick = false;

    this._init();
  }

  update(dt) { // eslint-disable-line
    if (this._currentPosition.equals(this._previousPosition)) {
      return;
    }

    const body = this._parts[MOUSE_PART_TYPE.Body];
    const leftKey = this._parts[MOUSE_PART_TYPE.LeftKey];
    const mouseShadow = this._parts[MOUSE_PART_TYPE.MouseShadow];

    const newPosition = new THREE.Vector3()
      .copy(body.userData.startPosition)
      .add(this._currentPosition);
    body.position.copy(newPosition);
    leftKey.position.copy(newPosition).add(this._leftKeyPositionOffset);
    mouseShadow.position.copy(newPosition).add(this._shadowPositionOffset);
    this._sound.position.copy(leftKey.position);
    this._soundHelper.position.copy(this._sound.position);

    this._helpArrows.position.copy(body.position);
    this._previousPosition.copy(this._currentPosition);
  }

  onClick(intersect, onPointerDownClick) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;
    let isObjectDraggable = false;

    if (partType === MOUSE_PART_TYPE.Body) {
      isObjectDraggable = true;
      this._onMouseClick(intersect);
      Black.engine.containerElement.style.cursor = 'grabbing';
    }

    if (onPointerDownClick === false && partType === MOUSE_PART_TYPE.LeftKey) {
      this._onLeftKeyClick();
    }

    return isObjectDraggable;
  }

  onPointerMove(raycaster) {
    if (!this._isMouseClick) {
      return;
    }

    const planeIntersect = new THREE.Vector3();

    raycaster.ray.intersectPlane(this._plane, planeIntersect);
    const body = this._parts[MOUSE_PART_TYPE.Body];

    this._currentPosition.addVectors(planeIntersect, this._shift);
    this._currentPosition.clamp(this._minAreaVector, this._maxAreaVector);
    this._currentPosition.sub(body.userData.startPosition);

    this._updatePosition();
  }

  getMeshesForOutline(mesh) {
    const partType = mesh.userData.partType;

    if (partType === MOUSE_PART_TYPE.Body) {
      return this._activeMeshes;
    }

    if (partType === MOUSE_PART_TYPE.LeftKey) {
      return [mesh];
    }
  }

  getCurrentPosition() {
    return new THREE.Vector2(this._currentPosition.x, this._currentPosition.z);
  }

  onPointerOver(intersect) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const partType = intersect.object.userData.partType;

    if (partType === MOUSE_PART_TYPE.Body) {
      this._helpArrows.show();
      Black.engine.containerElement.style.cursor = 'grab';
    }
  }

  onPointerUp() {
    Black.engine.containerElement.style.cursor = 'grab';
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    this._helpArrows.hide();
  }

  _onMouseClick(intersect) {
    this._isMouseClick = true;
    const pIntersect = new THREE.Vector3().copy(intersect.point);
    this._plane.setFromNormalAndCoplanarPoint(this._pNormal, pIntersect);
    this._shift.subVectors(intersect.object.position, intersect.point);
  }

  _onLeftKeyClick() {
    this._playSound();
    this._isMouseClick = false;
    this.events.post('onLeftKeyClick');
  }

  _updatePosition() {
    MOUSE_CONFIG.position.x = this._currentPosition.x / MOUSE_CONFIG.movingArea.width * 2;
    MOUSE_CONFIG.position.y = this._currentPosition.z / MOUSE_CONFIG.movingArea.height * 2;

    this._debugMenu.updatePosition();
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._calculateMovingArea();
    this._initHelpArrows();
    this._initMouseAreaBorders();
    this._initSounds();
    this._initDebugMenu();
    this._initSignals();
  }

  _addMaterials() {
    const material = Materials.getMaterial(Materials.type.bakedSmallObjects);

    const body = this._parts[MOUSE_PART_TYPE.Body];
    const leftKey = this._parts[MOUSE_PART_TYPE.LeftKey];

    body.material = material;
    leftKey.material = material;

    const mouseShadow = this._parts[MOUSE_PART_TYPE.MouseShadow];

    const shadowTexture = Loader.assets['mouse-shadow'];
    shadowTexture.flipY = false;

    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
    });

    mouseShadow.material = shadowMaterial;
  }

  _addPartsToScene() {
    const body = this._parts[MOUSE_PART_TYPE.Body];
    const leftKey = this._parts[MOUSE_PART_TYPE.LeftKey];
    const mouseShadow = this._parts[MOUSE_PART_TYPE.MouseShadow];
    this.add(body, leftKey, mouseShadow);

    this._leftKeyPositionOffset = leftKey.position.clone().sub(body.position);
    this._shadowPositionOffset = mouseShadow.position.clone().sub(body.position);
  }

  _calculateMovingArea() {
    const body = this._parts[MOUSE_PART_TYPE.Body];

    const startPosition = new THREE.Vector2(body.userData.startPosition.x, body.userData.startPosition.z);
    const halfWidth = MOUSE_CONFIG.movingArea.width * 0.5;
    const halfHeight = MOUSE_CONFIG.movingArea.height * 0.5;

    this._minAreaVector = new THREE.Vector3(startPosition.x - halfWidth, body.position.y, startPosition.y - halfHeight);
    this._maxAreaVector = new THREE.Vector3(startPosition.x + halfWidth, body.position.y, startPosition.y + halfHeight);
  }

  _initHelpArrows() {
    const helpArrowsTypes = [HELP_ARROW_TYPE.MouseFront, HELP_ARROW_TYPE.MouseRight];
    const helpArrows = this._helpArrows = new HelpArrows(helpArrowsTypes);
    this.add(helpArrows);

    helpArrows.position.copy(this._parts[MOUSE_PART_TYPE.Body].position.clone());
  }

  _initMouseAreaBorders() {
    const body = this._parts[MOUSE_PART_TYPE.Body];
    const mouseAreaBorders = this._mouseAreaBorders = new MouseAreaBorders(body.position);
    this.add(mouseAreaBorders)
  }

  _initSounds() {
    this._initSound();
    this._initSoundHelper();
  }

  _initSound() {
    const soundConfig = SOUNDS_CONFIG.objects[this._roomObjectType];

    const sound = this._sound = new THREE.PositionalAudio(this._audioListener);
    this.add(sound);

    sound.setRefDistance(soundConfig.refDistance);

    const leftKey = this._parts[MOUSE_PART_TYPE.LeftKey];
    this._sound.position.copy(leftKey.position);

    sound.setVolume(this._globalVolume * this._objectVolume);

    Loader.events.on('onAudioLoaded', () => {
      this._sound.setBuffer(Loader.assets['mouse-click']);
    });
  }

  _initSoundHelper() {
    const helperSize = SOUNDS_CONFIG.objects[this._roomObjectType].helperSize;
    this._soundHelper = new SoundHelper(helperSize);
    this.add(this._soundHelper);

    this._soundHelper.position.copy(this._sound.position);
  }

  _initDebugMenu() {
    super._initDebugMenu();

    const startPosition = this._parts[MOUSE_PART_TYPE.Body].userData.startPosition;
    this._debugMenu.initMovingAreaDebugPlane(startPosition);
  }

  _initSignals() {
    this._debugMenu.events.on('onPositionChanged', (msg, position) => this._onDebugPositionChanged(position));
    this._debugMenu.events.on('onAreaChanged', () => this._onDebugAreaChanged());
    this._debugMenu.events.on('onDistanceToShowBorderChanged', () => this._onDistanceToShowBorderChanged());
    this._debugMenu.events.on('onBorderColorUpdated', () => this._onBorderColorUpdated());
    this._debugMenu.events.on('onCursorScaleChanged', () => this.events.post('onCursorScaleChanged'));
    this._debugMenu.events.on('onLeftKeyClick', () => this._onLeftKeyClick());
  }

  _onDebugPositionChanged(position) {
    this._currentPosition.x = position.x * MOUSE_CONFIG.movingArea.width * 0.5;
    this._currentPosition.z = position.y * MOUSE_CONFIG.movingArea.height * 0.5;

    this._mouseAreaBorders.updateMousePosition(this._currentPosition);
  }

  _onDebugAreaChanged() {
    this._calculateMovingArea();

    this._currentPosition.x = 0;
    this._currentPosition.z = 0;

    this._updatePosition();
    this._mouseAreaBorders.onAreaChanged();

    this.events.post('onAreaChanged');
    this._mouseAreaBorders.updateMousePosition(this._currentPosition);
  }

  _onDistanceToShowBorderChanged() {
    this._mouseAreaBorders.updateMousePosition(this._currentPosition);
  }

  _onBorderColorUpdated() {
    this._mouseAreaBorders.onBorderColorUpdated();
  }
}
