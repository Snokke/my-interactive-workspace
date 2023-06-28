import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { CAMERA_CONFIG, CAMERA_FOCUS_POSITION_CONFIG, FOCUSED_MODE_CAMERA_CONFIG, ORBIT_CONTROLS_MODE_CONFIG, STATIC_MODE_CAMERA_CONFIG } from './data/camera-config';
import { CAMERA_FOCUS_OBJECT_TYPE, CAMERA_MODE, FOCUS_TYPE } from './data/camera-data';
import { MessageDispatcher } from 'black-engine';
import TRANSFER_IT_DEBUG_CONFIG from '../../monitor-screen-scene/transfer-it/configs/transfer-it-debug-config';
import { ROOM_OBJECT_TYPE } from '../data/room-config';
import TheatreJS from './theatre-js/theatre-js';
import SCENE_CONFIG from '../../../core/configs/scene-config';

export default class CameraController extends THREE.Group {
  constructor(camera, orbitControls, focusObjects, roomDebug) {
    super();

    this.events = new MessageDispatcher();

    this._camera = camera;
    this._orbitControls = orbitControls;
    this._focusObjects = focusObjects;
    this._roomDebug = roomDebug;

    this._lookAtObject = new THREE.Object3D();
    this._lookAtLerpObject = new THREE.Object3D();
    this._focusModeZoomObject = new THREE.Object3D();
    this._staticObjectStartQuaternion = new THREE.Quaternion();
    this._staticObjectRotationObject = new THREE.Object3D();
    this._staticModeZoomObject = new THREE.Object3D();
    this._positionTween = null;
    this._rotationTween = null;
    this._focusLookAtVector = new THREE.Vector3();
    this._lastCameraPosition = new THREE.Vector3();
    this._lastCameraLookAt = new THREE.Vector3();
    this._currentZoomDistanceStaticMode = 0;
    this._currentZoomDistanceFocusedMode = 0;
    this._currentPointerPosition = new THREE.Vector2();

    this._previousCameraMode = CAMERA_MODE.OrbitControls;
    this._cameraMode = CAMERA_MODE.OrbitControls;

    this._staticModeObject = null;
    this._staticModeRoomObjectType = null;
    this._staticModeBackPlane = null;

    this._isPointerDown = false;

    this._init();
  }

  update(dt) {
    this._updateFocusedMode(dt);
    this._updateStaticMode(dt);
  }

  onPointerMove(x, y) {
    if (SCENE_CONFIG.isMobile && !this._isPointerDown) {
      return;
    }

    this._currentPointerPosition.set(x, y);

    const percentX = x / window.innerWidth * 2 - 1;
    const percentY = y / window.innerHeight * 2 - 1;

    if (this._cameraMode === CAMERA_MODE.Focused) {
      this._lookAtObject.position.copy(this._focusLookAtVector);
      this._lookAtObject.translateOnAxis(new THREE.Vector3(1, 0, 0), percentX * FOCUSED_MODE_CAMERA_CONFIG.rotation.coefficient);
      this._lookAtObject.translateOnAxis(new THREE.Vector3(0, 1, 0), -percentY * FOCUSED_MODE_CAMERA_CONFIG.rotation.coefficient);
    }

    if (this._cameraMode === CAMERA_MODE.Static) {
      const config = STATIC_MODE_CAMERA_CONFIG[this._staticModeRoomObjectType];

      this._staticObjectRotationObject.quaternion.copy(this._staticObjectStartQuaternion);
      this._staticObjectRotationObject.rotateOnAxis(new THREE.Vector3(0, 1, 0), percentX * config.rotation.coefficient);
      this._staticObjectRotationObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), percentY * config.rotation.coefficient);
      this._staticObjectRotationObject.rotateOnAxis(config.rotation.startRotation.axis, config.rotation.startRotation.angle);
    }
  }

  onWheelScroll(delta) {
    if (this._cameraMode === CAMERA_MODE.Static) {
      const config = STATIC_MODE_CAMERA_CONFIG[this._staticModeRoomObjectType];

      const zoomDelta = -delta * config.zoom.coefficient;
      const minDistance = config.zoom.minDistance;
      const maxDistance = config.zoom.maxDistance;
      this._currentZoomDistanceStaticMode = THREE.MathUtils.clamp(this._currentZoomDistanceStaticMode + zoomDelta, minDistance, maxDistance);

      if (this._currentZoomDistanceStaticMode !== minDistance && this._currentZoomDistanceStaticMode !== maxDistance) {
        this._staticModeZoomObject.translateOnAxis(new THREE.Vector3(0, 0, 1), zoomDelta);
      }
    }

    if (this._cameraMode === CAMERA_MODE.Focused) {
      const objectType = CAMERA_CONFIG.focusObjectType;
      const zoomDelta = delta * FOCUSED_MODE_CAMERA_CONFIG.zoom.coefficient;
      const minDistance = FOCUSED_MODE_CAMERA_CONFIG.zoom.objects[objectType].minDistance;
      const maxDistance = FOCUSED_MODE_CAMERA_CONFIG.zoom.objects[objectType].maxDistance;
      this._currentZoomDistanceFocusedMode = THREE.MathUtils.clamp(this._currentZoomDistanceFocusedMode + zoomDelta, minDistance, maxDistance);

      if (this._currentZoomDistanceFocusedMode !== minDistance && this._currentZoomDistanceFocusedMode !== maxDistance) {
        this._focusModeZoomObject.translateOnAxis(new THREE.Vector3(0, 0, 1), zoomDelta);
      }
    }
  }

  _enableOrbitControls() {
    if (this._orbitControls) {
      this._orbitControls.enabled = true;
      ORBIT_CONTROLS_MODE_CONFIG.enabled = true;
    }
  }

  disableOrbitControls() {
    if (this._orbitControls) {
      this._orbitControls.enabled = false;
      ORBIT_CONTROLS_MODE_CONFIG.enabled = false;
    }
  }

  onPointerUp() {
    if (SCENE_CONFIG.isMobile) {
      this._isPointerDown = false;
    }
  }

  onPointerDown() {
    if (SCENE_CONFIG.isMobile) {
      this._isPointerDown = true;
    }
  }

  onObjectDragStart() {
    if (this._cameraMode === CAMERA_MODE.OrbitControls) {
      this.disableOrbitControls();
    }
  }

  onObjectDragEnd() {
    if (this._cameraMode === CAMERA_MODE.OrbitControls) {
      this._enableOrbitControls();
    }
  }

  focusCamera(focusObjectType) {
    if (this._cameraMode === CAMERA_MODE.NoControls) {
      return;
    }

    if (this._cameraMode === CAMERA_MODE.OrbitControls && focusObjectType !== CAMERA_FOCUS_OBJECT_TYPE.Room) {
      this._lastCameraPosition.copy(this._camera.position);
      this._lastCameraLookAt.copy(this._orbitControls.target);
    }

    CAMERA_CONFIG.focusObjectType = focusObjectType;

    const focusConfig = CAMERA_FOCUS_POSITION_CONFIG[focusObjectType];
    this._previousCameraMode = this._cameraMode;
    this._cameraMode = CAMERA_MODE.NoControls;
    CAMERA_CONFIG.mode = this._cameraMode;
    this._roomDebug.updateCameraStateController();

    this.disableOrbitControls();
    this._orbitControls.stopDamping();

    const { focusPosition, focusLookAt } = this._getFocusData(focusObjectType);
    this._lookAtObject.position.copy(focusLookAt);
    this._lookAtLerpObject.position.copy(focusLookAt);
    this._focusLookAtVector = focusLookAt;

    const distance = this._camera.position.distanceTo(focusPosition);
    const time = THREE.MathUtils.clamp(distance / (CAMERA_CONFIG.movementToFocusObject.speed * 0.01), CAMERA_CONFIG.movementToFocusObject.minTime, CAMERA_CONFIG.movementToFocusObject.maxTime);

    this._lerpCameraPosition(focusPosition, focusLookAt, focusConfig.positionEasing, time);
    this._lerpCameraRotation(focusPosition, focusLookAt, focusConfig.rotationEasing, time)

    this._rotationTween.onComplete(() => {
      if (focusConfig.enableOrbitControlsOnComplete) {
        this._orbitControls.target.set(focusLookAt.x, focusLookAt.y, focusLookAt.z);
        this._enableOrbitControls();
        this._cameraMode = CAMERA_MODE.OrbitControls;
      }

      if (focusObjectType === CAMERA_FOCUS_OBJECT_TYPE.Keyboard || focusObjectType === CAMERA_FOCUS_OBJECT_TYPE.Monitor) {
        this._lookAtObject.quaternion.copy(this._camera.quaternion);
        this._lookAtLerpObject.quaternion.copy(this._camera.quaternion);

        this._focusModeZoomObject.position.copy(this._camera.position);
        this._focusModeZoomObject.quaternion.copy(this._camera.quaternion);
        this._currentZoomDistanceFocusedMode = this._camera.position.distanceTo(this._lookAtObject.position);

        this._cameraMode = CAMERA_MODE.Focused;
        this.events.post('onObjectFocused', focusObjectType);

        this.onPointerMove(this._currentPointerPosition.x, this._currentPointerPosition.y);
      }

      if (focusObjectType === CAMERA_FOCUS_OBJECT_TYPE.Room) {
        this.events.post('onRoomFocused');
      }

      CAMERA_CONFIG.mode = this._cameraMode;
      this._roomDebug.updateCameraStateController();
    });
  }

  setStaticState(object, roomObjectType) {
    this._staticModeObject = object;
    this._staticModeRoomObjectType = roomObjectType;

    this._previousCameraMode = this._cameraMode;
    this._cameraMode = CAMERA_MODE.NoControls;
    CAMERA_CONFIG.mode = this._cameraMode;
    this._roomDebug.updateCameraStateController();

    this._orbitControls.stopDamping();
    this.disableOrbitControls();

    this._moveObjectToCamera();
  }

  setOrbitState() {
    this._previousCameraMode = this._cameraMode;
    this._cameraMode = CAMERA_MODE.OrbitControls;
    CAMERA_CONFIG.mode = this._cameraMode;
    this._roomDebug.updateCameraStateController();

    this._staticModeObject = null;
    this._staticModeRoomObjectType = null;

    this._enableOrbitControls();
  }

  setNoControlsState() {
    this._cameraMode = CAMERA_MODE.NoControls;
    CAMERA_CONFIG.mode = this._cameraMode;
    this._roomDebug.updateCameraStateController();

    this.disableOrbitControls();
  }

  getPreviousCameraMode() {
    return this._previousCameraMode;
  }

  getStaticModeRoomObjectType() {
    return this._staticModeRoomObjectType;
  }

  onExitStaticMode() {
    this._staticModeBackPlane.userData.isActive = false;
    this._staticModeBackPlane.scale.set(0, 0, 0);
    this._staticModeBackPlane.position.set(0, 0, 0);
  }

  getStaticModePlane() {
    return this._staticModeBackPlane;
  }

  onStaticModeBackPlaneClick() {
    if (this._staticModeRoomObjectType === ROOM_OBJECT_TYPE.AirConditionerRemote) {
      this.events.post('onAirConditionerRemoteHide');
    }

    if (this._staticModeRoomObjectType === ROOM_OBJECT_TYPE.Locker) {
      this.events.post('onWorkplacePhotoHide');
    }

    if (this._staticModeRoomObjectType === ROOM_OBJECT_TYPE.Book) {
      this.events.post('onBookHide');
    }
  }

  showIntro() {
    this._theatreJs.showIntro();
  }

  stopIntro() {
    this._theatreJs.stopIntro();
  }

  _updateFocusedMode(dt) {
    if (this._cameraMode === CAMERA_MODE.Focused) {
      if (TRANSFER_IT_DEBUG_CONFIG.orbitControls && CAMERA_CONFIG.focusObjectType === CAMERA_FOCUS_OBJECT_TYPE.Monitor) {
        return;
      }

      this._lookAtLerpObject.position.lerp(this._lookAtObject.position, dt * 60 * FOCUSED_MODE_CAMERA_CONFIG.rotation.lerpTime);
      this._camera.lookAt(this._lookAtLerpObject.position);

      this._camera.position.lerp(this._focusModeZoomObject.position, dt * 60 * FOCUSED_MODE_CAMERA_CONFIG.zoom.lerpTime);
    }
  }

  _updateStaticMode(dt) {
    if (this._cameraMode === CAMERA_MODE.Static) {
      this._staticModeObject.quaternion.slerp(this._staticObjectRotationObject.quaternion, dt * 60 * STATIC_MODE_CAMERA_CONFIG[this._staticModeRoomObjectType].rotation.lerpTime);
      this._staticModeObject.position.lerp(this._staticModeZoomObject.position, dt * 60 * STATIC_MODE_CAMERA_CONFIG[this._staticModeRoomObjectType].zoom.lerpTime);
    }
  }

  _lerpCameraPosition(focusPosition, focusLookAt, easing, time) {
    if (this._positionTween) {
      this._positionTween.stop();
    }

    const startPosition = this._camera.position.clone();

    const positionObject = { value: 0 };

    this._positionTween = new TWEEN.Tween(positionObject)
      .to({ value: 1 }, time)
      .easing(easing)
      .start()
      .onUpdate(() => {
        const position = new THREE.Vector3().lerpVectors(startPosition, focusPosition, positionObject.value);
        this._camera.position.copy(position);
      });
  }

  _lerpCameraRotation(focusPosition, focusLookAt, easing, time) {
    if (this._rotationTween) {
      this._rotationTween.stop();
    }

    const startQuaternion = this._camera.quaternion.clone();
    const dummy = new THREE.Object3D();
    dummy.position.copy(focusLookAt);
    dummy.lookAt(focusPosition);
    const endQuaternion = dummy.quaternion.clone();

    const lookAtObject = { value: 0 };

    this._rotationTween = new TWEEN.Tween(lookAtObject)
      .to({ value: 1 }, time)
      .easing(easing)
      .start()
      .onUpdate(() => {
        const quaternion = new THREE.Quaternion().slerpQuaternions(startQuaternion, endQuaternion, lookAtObject.value)
        this._camera.quaternion.copy(quaternion);
      });
  }

  _getFocusData(focusObjectType) {
    const focusConfig = CAMERA_FOCUS_POSITION_CONFIG[focusObjectType];

    let focusPosition = null;
    let focusLookAt = null;

    if (focusObjectType === CAMERA_FOCUS_OBJECT_TYPE.LastPosition) {
      focusPosition = this._lastCameraPosition;
      focusLookAt = this._lastCameraLookAt;
    } else {
      if (focusConfig.focusType === FOCUS_TYPE.Position) {
        focusPosition = focusConfig.focus.position;
        focusLookAt = focusConfig.focus.lookAt;
      }

      if (focusConfig.focusType === FOCUS_TYPE.Object) {
        const focusObject = this._focusObjects[focusConfig.focus.objectType];
        focusLookAt = focusObject.getFocusPosition();
        focusPosition = focusLookAt.clone().add(focusConfig.focus.positionFromObject);
      }
    }

    return { focusPosition, focusLookAt };
  }

  _moveObjectToCamera() {
    const config = STATIC_MODE_CAMERA_CONFIG[this._staticModeRoomObjectType];
    const endPositionObject = new THREE.Object3D();

    endPositionObject.position.copy(this._camera.position);
    endPositionObject.quaternion.copy(this._camera.quaternion);

    endPositionObject.translateZ(-config.zoom.defaultDistance);
    endPositionObject.rotateOnAxis(config.rotation.startRotation.axis, config.rotation.startRotation.angle);

    const globalPosition = this._staticModeObject.getWorldPosition(new THREE.Vector3());
    this.add(this._staticModeObject);
    this._staticModeObject.position.copy(globalPosition);

    new TWEEN.Tween(this._staticModeObject.position)
      .to({ x: endPositionObject.position.x, y: endPositionObject.position.y, z: endPositionObject.position.z }, config.objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => {
        this._onObjectMovedToCamera();
      });

    new TWEEN.Tween(this._staticModeObject.rotation)
      .to({ x: endPositionObject.rotation.x, y: endPositionObject.rotation.y, z: endPositionObject.rotation.z }, config.objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start();
  }

  _onObjectMovedToCamera() {
    const config = STATIC_MODE_CAMERA_CONFIG[this._staticModeRoomObjectType];

    this._staticObjectStartQuaternion.copy(this._camera.quaternion);
    this._staticObjectRotationObject.quaternion.copy(this._staticObjectStartQuaternion);
    this._staticObjectRotationObject.rotateOnAxis(config.rotation.startRotation.axis, config.rotation.startRotation.angle);

    this._staticModeZoomObject.position.copy(this._staticModeObject.position);
    this._staticModeZoomObject.quaternion.copy(this._camera.quaternion);

    this._currentZoomDistanceStaticMode = config.zoom.defaultDistance;

    this._cameraMode = CAMERA_MODE.Static;
    CAMERA_CONFIG.mode = this._cameraMode;
    this._roomDebug.updateCameraStateController();

    this.onPointerMove(this._currentPointerPosition.x, this._currentPointerPosition.y);

    this._staticModeBackPlane.scale.set(1, 1, 1);
    this._staticModeBackPlane.position.copy(this._camera.position);
    this._staticModeBackPlane.quaternion.copy(this._camera.quaternion);
    this._staticModeBackPlane.translateZ(-(config.zoom.maxDistance + 1));
    this._staticModeBackPlane.userData.isActive = true;
  }

  _init() {
    this._initTheatreJS();
    this._initStaticModeBackPlane();
    this._setCameraStartPosition();
    this._setParametersForMobile();
    this._intiSignals();
  }

  _initTheatreJS() {
    const theatreJs = this._theatreJs = new TheatreJS(this._camera);
    this.add(theatreJs);
  }

  _initStaticModeBackPlane() {
    const geometry = new THREE.PlaneGeometry(5, 4);
    const material = new THREE.MeshBasicMaterial();
    const staticModeBackPlane = this._staticModeBackPlane = new THREE.Mesh(geometry, material);
    this.add(staticModeBackPlane);

    staticModeBackPlane.userData['objectType'] = ROOM_OBJECT_TYPE.Global;
    staticModeBackPlane.userData['type'] = 'staticModeBackPlane';
    staticModeBackPlane.userData['isActive'] = true;
    staticModeBackPlane.visible = false;

    staticModeBackPlane.scale.set(0, 0, 0);
    staticModeBackPlane.position.set(0, 0, 0);
  }

  _setCameraStartPosition() {
    const cameraFocusType = CAMERA_FOCUS_OBJECT_TYPE.Room;
    const focusConfig = CAMERA_FOCUS_POSITION_CONFIG[cameraFocusType];

    this._camera.position.copy(focusConfig.focus.position)
    this._camera.lookAt(focusConfig.focus.lookAt.x, focusConfig.focus.lookAt.y, focusConfig.focus.lookAt.z);
  }

  _setParametersForMobile() {
    if (SCENE_CONFIG.isMobile) {
      STATIC_MODE_CAMERA_CONFIG[ROOM_OBJECT_TYPE.Book].zoom.defaultDistance = 4;
      STATIC_MODE_CAMERA_CONFIG[ROOM_OBJECT_TYPE.Book].zoom.maxDistance = 4;
    }
  }

  _intiSignals() {
    this._theatreJs.events.on('onIntroFinished', () => {
      this.events.post('onIntroFinished');
    });
  }
}
