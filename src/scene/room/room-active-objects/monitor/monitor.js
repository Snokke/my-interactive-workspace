import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../data/room-config';
import { MONITOR_PART_TYPE } from './monitor-data';
import  { MONITOR_ARM_MOUNT_CONFIG, MONITOR_CONFIG } from './monitor-config';
import { HELP_ARROW_TYPE } from '../../help-arrows/help-arrows-config';
import HelpArrows from '../../help-arrows/help-arrows';

export default class Monitor extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._monitorGroup = null;
    this._arrowsTween = null;
    this._helpArrows = null;

    this._plane = new THREE.Plane();
    this._pNormal = new THREE.Vector3(0, 1, 0);
    this._shift = new THREE.Vector3();
    this._currentPositionZ = 0;
    this._previousPositionZ = 0;

    this._init();
  }

  update(dt) {
    if (this._currentPositionZ === this._previousPositionZ) {
      return;
    }

    const monitor = this._parts[MONITOR_PART_TYPE.Monitor];
    const deltaZ = this._currentPositionZ - monitor.userData.startPosition.z;
    monitor.position.z = this._currentPositionZ;

    this._updateMonitorPosition(deltaZ);
    this._updateArmMount(deltaZ);
    this._updateHelpArrows(deltaZ);

    this._previousPositionZ = this._currentPositionZ;
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      for (let key in this._parts) {
        const part = this._parts[key];

        new TWEEN.Tween(part.position)
          .to({ y: part.userData.startPosition.y }, fallDownTime)
          .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
          .start();
      }

      Delayed.call(fallDownTime, () => {
        this._debugMenu.enable();
        this._onShowAnimationComplete();
      });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const pIntersect = new THREE.Vector3().copy(intersect.point);
    this._plane.setFromNormalAndCoplanarPoint(this._pNormal, pIntersect);
    this._shift.subVectors(this._parts[MONITOR_PART_TYPE.Monitor].position, intersect.point);
  }

  onPointerMove(raycaster) {
    const planeIntersect = new THREE.Vector3();

    raycaster.ray.intersectPlane(this._plane, planeIntersect);
    const monitor = this._parts[MONITOR_PART_TYPE.Monitor];
    const startPositionZ = monitor.userData.startPosition.z;

    this._currentPositionZ = planeIntersect.z + this._shift.z;
    this._currentPositionZ = THREE.MathUtils.clamp(this._currentPositionZ, MONITOR_CONFIG.minZ + startPositionZ, MONITOR_CONFIG.maxZ + startPositionZ);

    this._updatePosition();
  }

  onPointerOver() {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    this._helpArrows.show();
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    this._helpArrows.hide();
  }

  getScreen() {
    return this._parts[MONITOR_PART_TYPE.MonitorScreen];
  }

  _updatePosition() {
    MONITOR_CONFIG.positionZ = this._currentPositionZ - this._parts[MONITOR_PART_TYPE.Monitor].userData.startPosition.z;
    this._debugMenu.updatePosition();
  }

  _updateMonitorPosition(deltaZ) {
    const screen = this._parts[MONITOR_PART_TYPE.MonitorScreen];
    const monitorMount = this._parts[MONITOR_PART_TYPE.MonitorMount];

    screen.position.z = screen.userData.startPosition.z + deltaZ;
    monitorMount.position.z = monitorMount.userData.startPosition.z + deltaZ;
  }

  _updateArmMount(deltaZ) {
    const monitor = this._parts[MONITOR_PART_TYPE.Monitor];
    const monitorScreen = this._parts[MONITOR_PART_TYPE.MonitorScreen];
    const monitorMount = this._parts[MONITOR_PART_TYPE.MonitorMount];
    const arm01 = this._parts[MONITOR_PART_TYPE.MonitorArmMountArm01];
    const arm02 = this._parts[MONITOR_PART_TYPE.MonitorArmMountArm02];

    arm01.rotation.y = arm01.userData.startAngle.y - deltaZ * MONITOR_ARM_MOUNT_CONFIG.arm01.angleCoeff;
    arm02.rotation.y = arm02.userData.startAngle.y - deltaZ * MONITOR_ARM_MOUNT_CONFIG.arm02.angleCoeff;

    arm02.position.x = arm01.position.x + Math.cos(arm01.rotation.y + Math.PI * 0.5) * MONITOR_ARM_MOUNT_CONFIG.arm01.shoulderCoeff;
    arm02.position.z = arm01.position.z + Math.sin(arm01.rotation.y + Math.PI * 0.5) * MONITOR_ARM_MOUNT_CONFIG.arm01.shoulderCoeff;

    const bonusAngle = MONITOR_ARM_MOUNT_CONFIG.arm02.bonusAngle * THREE.MathUtils.DEG2RAD;
    const positionX = arm02.position.x + Math.cos(-arm02.rotation.y - bonusAngle + Math.PI * 0.5) * MONITOR_ARM_MOUNT_CONFIG.arm02.shoulderCoeff;
    monitor.position.x = monitorScreen.position.x = monitorMount.position.x = positionX;

    this._updateArmRotation();
    this._debugMenu.updateArmRotation();
  }

  _updateArmRotation() {
    const arm01 = this._parts[MONITOR_PART_TYPE.MonitorArmMountArm01];
    const arm02 = this._parts[MONITOR_PART_TYPE.MonitorArmMountArm02];

    MONITOR_ARM_MOUNT_CONFIG.arm01.angle = Math.round(arm01.rotation.y * THREE.MathUtils.RAD2DEG * 100) / 100;
    MONITOR_ARM_MOUNT_CONFIG.arm02.angle = -Math.round(arm02.rotation.y * THREE.MathUtils.RAD2DEG * 100) / 100;
  }

  _updateHelpArrows(deltaZ) {
    this._helpArrows.position.z = this._parts[MONITOR_PART_TYPE.Monitor].userData.startPosition.z + deltaZ;
    this._helpArrows.position.x = this._parts[MONITOR_PART_TYPE.Monitor].position.x;
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initGroups();
    this._updateArmRotation();
    this._initArrows();
    this._initDebugMenu();
    this._initSignals();
  }

  _initGroups() {
    const monitorGroup = this._monitorGroup = new THREE.Group();
    this.add(monitorGroup);

    const monitor = this._parts[MONITOR_PART_TYPE.Monitor];
    const monitorScreen = this._parts[MONITOR_PART_TYPE.MonitorScreen];
    const monitorMount = this._parts[MONITOR_PART_TYPE.MonitorMount];

    monitorGroup.add(monitor, monitorScreen, monitorMount);
  }

  _initArrows() {
    const helpArrowsTypes = [HELP_ARROW_TYPE.MonitorBack, HELP_ARROW_TYPE.MonitorFront];
    const helpArrows = this._helpArrows = new HelpArrows(helpArrowsTypes);
    this.add(helpArrows);

    helpArrows.position.copy(this._parts[MONITOR_PART_TYPE.Monitor].position.clone());
  }

  _initSignals() {
    this._debugMenu.events.on('onPositionChanged', (msg, position) => {
      this._currentPositionZ = position + this._parts[MONITOR_PART_TYPE.Monitor].userData.startPosition.z;
    });
  }
}
