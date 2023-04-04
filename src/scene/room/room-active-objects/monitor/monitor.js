import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../room-config';
import MonitorDebugMenu from './monitor-debug-menu';
import { HELP_ARROW_TYPE, MONITOR_PART_TYPE } from './monitor-data';
import MONITOR_CONFIG from './monitor-config';

export default class Monitor extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._monitorGroup = null;
    this._arrowsGroup = null;
    this._arrowsTween = null;

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
    this._currentPositionZ = THREE.MathUtils.clamp(this._currentPositionZ, MONITOR_CONFIG.monitor.minZ + startPositionZ, MONITOR_CONFIG.monitor.maxZ + startPositionZ);

    this._updatePosition();
  }

  onPointerOver() {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    this._arrowsGroup.visible = true;

    if (this._arrowsTween) {
      this._arrowsTween.stop();
    }

    this._arrowsGroup.scale.set(0, 0, 0);
    this._arrowsTween = new TWEEN.Tween(this._arrowsGroup.scale)
      .to({ x: 1, y: 1, z: 1 }, 200)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }

  onPointerOut() {
    if (!this._isPointerOver) {
      return;
    }

    super.onPointerOut();

    if (this._arrowsTween) {
      this._arrowsTween.stop();
    }

    this._arrowsTween = new TWEEN.Tween(this._arrowsGroup.scale)
      .to({ x: 0, y: 0, z: 0 }, 200)
      .easing(TWEEN.Easing.Back.In)
      .start()
      .onComplete(() => {
        this._arrowsGroup.visible = false;
      });
  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  _updatePosition() {
    MONITOR_CONFIG.monitor.positionZ = this._currentPositionZ - this._parts[MONITOR_PART_TYPE.Monitor].userData.startPosition.z;
    this._debugMenu.updatePosition();
  }

  _setPositionForShowAnimation() {
    for (let key in this._parts) {
      const part = this._parts[key];
      part.position.y = part.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;
    }
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

    arm01.rotation.y = arm01.userData.startAngle.y - deltaZ * MONITOR_CONFIG.armMount.arm01.angleCoeff;
    arm02.rotation.y = arm02.userData.startAngle.y - deltaZ * MONITOR_CONFIG.armMount.arm02.angleCoeff;

    arm02.position.x = arm01.position.x + Math.cos(arm01.rotation.y + Math.PI * 0.5) * MONITOR_CONFIG.armMount.arm01.shoulderCoeff;
    arm02.position.z = arm01.position.z + Math.sin(arm01.rotation.y + Math.PI * 0.5) * MONITOR_CONFIG.armMount.arm01.shoulderCoeff;

    const bonusAngle = MONITOR_CONFIG.armMount.arm02.bonusAngle * THREE.MathUtils.DEG2RAD;
    const positionX = arm02.position.x + Math.cos(-arm02.rotation.y - bonusAngle + Math.PI * 0.5) * MONITOR_CONFIG.armMount.arm02.shoulderCoeff;
    monitor.position.x = monitorScreen.position.x = monitorMount.position.x = positionX;

    this._updateArmRotation();
    this._debugMenu.updateArmRotation();
  }

  _updateArmRotation() {
    const arm01 = this._parts[MONITOR_PART_TYPE.MonitorArmMountArm01];
    const arm02 = this._parts[MONITOR_PART_TYPE.MonitorArmMountArm02];

    MONITOR_CONFIG.armMount.arm01.angle = Math.round(arm01.rotation.y * THREE.MathUtils.RAD2DEG * 100) / 100;
    MONITOR_CONFIG.armMount.arm02.angle = -Math.round(arm02.rotation.y * THREE.MathUtils.RAD2DEG * 100) / 100;
  }

  _updateHelpArrows(deltaZ) {
    this._arrowsGroup.position.z = this._parts[MONITOR_PART_TYPE.Monitor].userData.startPosition.z + deltaZ;
    this._arrowsGroup.position.x = this._parts[MONITOR_PART_TYPE.Monitor].position.x;
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initGroups();
    this._updateArmRotation();
    this._initArrows();
    this._initDebug();
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
    const arrowsGroup = this._arrowsGroup = new THREE.Group();
    this.add(arrowsGroup);

    const frontArrow = this._frontArrow = this._createArrow(HELP_ARROW_TYPE.Front);
    const backArrow = this._backArrow = this._createArrow(HELP_ARROW_TYPE.Back);

    arrowsGroup.add(frontArrow, backArrow);
    arrowsGroup.position.copy(this._parts[MONITOR_PART_TYPE.Monitor].position.clone());
    arrowsGroup.visible = false;
  }

  _createArrow(type) {
    const arrow = new THREE.ArrowHelper(
      MONITOR_CONFIG.helpArrows[type].direction,
      new THREE.Vector3(0, 0, MONITOR_CONFIG.helpArrows[type].offsetZ),
      MONITOR_CONFIG.helpArrows[type].length,
      MONITOR_CONFIG.helpArrows[type].color,
    );

    return arrow;
  }

  _initDebug() {
    const debugMenu = this._debugMenu = new MonitorDebugMenu();

    debugMenu.events.on('onPositionChanged', (msg, position) => {
      this._currentPositionZ = position + this._parts[MONITOR_PART_TYPE.Monitor].userData.startPosition.z;
    });
  }
}
