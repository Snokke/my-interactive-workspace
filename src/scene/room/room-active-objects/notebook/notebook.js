import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../data/room-config';
import { NOTEBOOK_MOUNT_PARTS, NOTEBOOK_PARTS, NOTEBOOK_PART_TYPE, NOTEBOOK_POSITION_STATE, NOTEBOOK_STATE } from './notebook-data';
import { NOTEBOOK_CONFIG, NOTEBOOK_MOUNT_CONFIG } from './notebook-config';
import { HELP_ARROW_TYPE } from '../../help-arrows/help-arrows-config';
import HelpArrows from '../../help-arrows/help-arrows';

export default class Notebook extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._notebookTopGroup = null;
    this._armWithNotebookGroup = null;
    this._notebookTween = null;
    this._helpArrows = null;

    this._isMountSelected = false;
    this._plane = new THREE.Plane();
    this._pNormal = new THREE.Vector3(0, 1, 0);

    this._previousArmMountAngle = 0;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const notebookStand = this._parts[NOTEBOOK_PART_TYPE.NotebookStand];
      const notebookMount = this._parts[NOTEBOOK_PART_TYPE.NotebookMount];
      const notebookArmMountBase = this._parts[NOTEBOOK_PART_TYPE.NotebookArmMountBase];
      const notebookArmMountArm01 = this._parts[NOTEBOOK_PART_TYPE.NotebookArmMountArm01];
      const notebookArmMountArm02 = this._parts[NOTEBOOK_PART_TYPE.NotebookArmMountArm02];
      const armMountParts = [notebookStand, notebookMount, notebookArmMountBase, notebookArmMountArm01, notebookArmMountArm02]

      const notebookKeyboard = this._parts[NOTEBOOK_PART_TYPE.NotebookKeyboard];
      const notebookMonitor = this._parts[NOTEBOOK_PART_TYPE.NotebookMonitor];
      const notebookScreen = this._parts[NOTEBOOK_PART_TYPE.NotebookScreen];
      const notebookParts = [notebookKeyboard, notebookMonitor, notebookScreen]

      armMountParts.forEach((part) => {
        new TWEEN.Tween(part.position)
          .to({ y: part.userData.startPosition.y }, fallDownTime)
          .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
          .start();
      });

      notebookParts.forEach((part) => {
        new TWEEN.Tween(part.position)
          .to({ y: part.userData.startPosition.y }, fallDownTime)
          .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
          .delay(fallDownTime * 0.5)
          .start();
      });

      Delayed.call(fallDownTime * 0.5 + fallDownTime, () => {
        this._debugMenu.enable();
        this._onShowAnimationComplete();
      });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (NOTEBOOK_PARTS.includes(partType)) {
      this._notebookInteract();
    } else {
      this._standInteract(intersect);
    }
  }

  onPointerMove(raycaster) {
    if (!this._isMountSelected) {
      return;
    }

    const notebookMount = this._parts[NOTEBOOK_PART_TYPE.NotebookStand];
    const planeIntersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(this._plane, planeIntersect);

    const angle = Math.atan2(planeIntersect.z - notebookMount.position.z, planeIntersect.x - notebookMount.position.x);
    const angleDelta = angle - this._previousArmMountAngle;

    if (Math.abs(angleDelta) < 0.1) {
      NOTEBOOK_MOUNT_CONFIG.angle += angleDelta * THREE.MathUtils.RAD2DEG;
    }

    const leftEdge = NOTEBOOK_MOUNT_CONFIG.leftEdgeAngle;
    const rightEdge = NOTEBOOK_MOUNT_CONFIG.rightEdgeAngle;

    NOTEBOOK_MOUNT_CONFIG.angle = THREE.MathUtils.clamp(NOTEBOOK_MOUNT_CONFIG.angle, leftEdge, rightEdge);
    this._onMountAngleChanged();
    this._debugMenu.updateMountAngle();

    this._previousArmMountAngle = angle;
  }

  onPointerOver(mesh) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const partType = mesh.userData.partType;

    if (NOTEBOOK_MOUNT_PARTS.includes(partType)) {
      this._helpArrows.show();
    }
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    this._helpArrows.hide();
  }

  getMeshesForOutline(mesh) {
    const partType = mesh.userData.partType;

    if (NOTEBOOK_MOUNT_PARTS.includes(partType)) {
      return this._getNotebookMountParts();
    }

    if (NOTEBOOK_PARTS.includes(partType)) {
      return this._getNotebookParts();
    }
  }

  getScreen() {
    return this._parts[NOTEBOOK_PART_TYPE.NotebookScreen];
  }

  _notebookInteract() {
    this._isMountSelected = false;

    if (NOTEBOOK_CONFIG.state === NOTEBOOK_STATE.Moving) {
      this._updateNotebookPositionType();
    }

    this._debugMenu.updateNotebookButtonTitle();

    NOTEBOOK_CONFIG.state = NOTEBOOK_STATE.Moving;
    this._debugMenu.updateTopPanelState();
    this._stopNotebookTween();

    const maxAngle = NOTEBOOK_CONFIG.positionType === NOTEBOOK_POSITION_STATE.Opened ? 0 : NOTEBOOK_CONFIG.maxOpenAngle;

    const remainingRotationAngle = maxAngle - (-this._notebookTopGroup.rotation.x * THREE.MathUtils.RAD2DEG);
    const time = Math.abs(remainingRotationAngle) / NOTEBOOK_CONFIG.rotationSpeed * 100;

    this._notebookTween = new TWEEN.Tween(this._notebookTopGroup.rotation)
      .to({ x: -maxAngle * THREE.MathUtils.DEG2RAD }, time)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onUpdate(() => {
        NOTEBOOK_CONFIG.angle = -this._notebookTopGroup.rotation.x * THREE.MathUtils.RAD2DEG;
      })
      .onComplete(() => {
        this._updateNotebookPositionType();

        if (NOTEBOOK_CONFIG.positionType === NOTEBOOK_POSITION_STATE.Closed) {
          this.events.post('onNotebookClosed');
        }

        NOTEBOOK_CONFIG.state = NOTEBOOK_STATE.Idle;
        this._debugMenu.updateTopPanelState();
      });
  }

  _updateNotebookPositionType() {
    NOTEBOOK_CONFIG.positionType = NOTEBOOK_CONFIG.positionType === NOTEBOOK_POSITION_STATE.Opened ? NOTEBOOK_POSITION_STATE.Closed : NOTEBOOK_POSITION_STATE.Opened;
  }

  _stopNotebookTween() {
    if (this._notebookTween) {
      this._notebookTween.stop();
    }
  }

  _standInteract(intersect) {
    this._isMountSelected = true;

    const pIntersect = new THREE.Vector3().copy(intersect.point);
    this._plane.setFromNormalAndCoplanarPoint(this._pNormal, pIntersect);
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initHelpArrows();
    this._initDebugMenu();
    this._initSignals();
  }

  _initSignals() {
    this._debugMenu.events.on('openNotebook', () => this._notebookInteract());
    this._debugMenu.events.on('mountAngleChanged', () => this._onMountAngleChanged());
  }

  _onMountAngleChanged() {
    this._armWithNotebookGroup.rotation.y = NOTEBOOK_MOUNT_CONFIG.angle * THREE.MathUtils.DEG2RAD;
  }

  _addPartsToScene() {
    super._addPartsToScene();

    this._initArmWithNotebookGroup();
    this._initNotebookTopGroup();
  }

  _initArmWithNotebookGroup() {
    const armWithNotebookGroup = this._armWithNotebookGroup = new THREE.Group();
    this.add(armWithNotebookGroup);

    const armMountArm02 = this._parts[NOTEBOOK_PART_TYPE.NotebookArmMountArm02];
    const notebookMount = this._parts[NOTEBOOK_PART_TYPE.NotebookMount];
    const notebookStand = this._parts[NOTEBOOK_PART_TYPE.NotebookStand];
    const notebookKeyboard = this._parts[NOTEBOOK_PART_TYPE.NotebookKeyboard];

    armWithNotebookGroup.add(armMountArm02, notebookMount, notebookStand, notebookKeyboard);

    const startPosition = armMountArm02.userData.startPosition.clone();

    armWithNotebookGroup.position.copy(startPosition);
    notebookMount.position.sub(startPosition);
    notebookStand.position.sub(startPosition);
    notebookKeyboard.position.sub(startPosition);

    armMountArm02.position.set(0, 0, 0);

    armWithNotebookGroup.rotation.y = NOTEBOOK_MOUNT_CONFIG.startAngle * THREE.MathUtils.DEG2RAD;
    NOTEBOOK_MOUNT_CONFIG.angle = NOTEBOOK_MOUNT_CONFIG.startAngle;
  }

  _initNotebookTopGroup() {
    const notebookTopGroup = this._notebookTopGroup = new THREE.Group();
    this._armWithNotebookGroup.add(notebookTopGroup);

    const notebookMonitor = this._parts[NOTEBOOK_PART_TYPE.NotebookMonitor];
    const notebookScreen = this._parts[NOTEBOOK_PART_TYPE.NotebookScreen];
    const armMountArm02 = this._parts[NOTEBOOK_PART_TYPE.NotebookArmMountArm02];

    const startPosition = armMountArm02.userData.startPosition.clone();

    notebookTopGroup.add(notebookMonitor, notebookScreen);

    notebookTopGroup.rotation.x = -NOTEBOOK_CONFIG.maxOpenAngle * THREE.MathUtils.DEG2RAD;
    notebookTopGroup.position.copy(notebookMonitor.position.clone());

    notebookMonitor.position.set(0, 0, 0);
    notebookMonitor.rotation.set(0, 0, 0);
    notebookScreen.position.set(0, 0, 0);
    notebookScreen.rotation.set(0, 0, 0);

    notebookTopGroup.position.sub(startPosition);

    NOTEBOOK_CONFIG.angle = NOTEBOOK_CONFIG.maxOpenAngle;
  }

  _initHelpArrows() {
    const helpArrowsTypes = [HELP_ARROW_TYPE.NotebookMountLeft, HELP_ARROW_TYPE.NotebookMountRight];
    const helpArrows = this._helpArrows = new HelpArrows(helpArrowsTypes);
    this._armWithNotebookGroup.add(helpArrows);

    const stand = this._parts[NOTEBOOK_PART_TYPE.NotebookStand];
    helpArrows.position.copy(stand.position.clone());
    helpArrows.position.z += 0.7;
    helpArrows.position.y -= 0.27;
  }

  _getNotebookParts() {
    const parts = [];

    NOTEBOOK_PARTS.forEach((partName) => {
      parts.push(this._parts[partName]);
    });

    return parts;
  }

  _getNotebookMountParts() {
    const parts = [];

    NOTEBOOK_MOUNT_PARTS.forEach((partName) => {
      parts.push(this._parts[partName]);
    });

    return parts;
  }
}
