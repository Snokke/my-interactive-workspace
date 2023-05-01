import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { CAMERA_CONFIG, CAMERA_FOCUS_POSITION_CONFIG, ORBIT_CONTROLS_CONFIG } from './data/camera-config';
import { CAMERA_FOCUS_OBJECT_TYPE, CAMERA_STATE, FOCUS_TYPE } from './data/camera-data';

export default class CameraController {
  constructor(camera, orbitControls, focusObjects) {
    this._camera = camera;
    this._orbitControls = orbitControls;
    this._focusObjects = focusObjects;

    this._lookAtObject = null;
    this._lookAtLerpObject = null;
    this._positionTween = null;
    this._rotationTween = null;
    this._focusLookAtVector = new THREE.Vector3();

    this._isPointerMoveAllowed = true;
    this._cameraState = CAMERA_STATE.OrbitControls;

    this._init();
  }

  update(dt) {
    if (this._cameraState === CAMERA_STATE.Focused) {
      this._lookAtLerpObject.position.lerp(this._lookAtObject.position, dt * CAMERA_CONFIG.focusedState.lerpTime);
      this._camera.lookAt(this._lookAtLerpObject.position);
    }
  }

  onPointerMove(x, y) {
    if (this._cameraState === CAMERA_STATE.Focused && this._isPointerMoveAllowed) {
      const percentX = x / window.innerWidth * 2 - 1;
      const percentY = y / window.innerHeight * 2 - 1;

      this._lookAtObject.position.copy(this._focusLookAtVector);
      this._lookAtObject.translateOnAxis(new THREE.Vector3(1, 0, 0), percentX * CAMERA_CONFIG.focusedState.rotationCoefficient);
      this._lookAtObject.translateOnAxis(new THREE.Vector3(0, 1, 0), -percentY * CAMERA_CONFIG.focusedState.rotationCoefficient);
    }
  }

  onPointerLeave() {
    if (this._cameraState === CAMERA_STATE.Focused) {
      this._lookAtObject.position.copy(this._focusLookAtVector);

      this._isPointerMoveAllowed = false;
      setTimeout(() => this._isPointerMoveAllowed = true, 100);
    }
  }

  enableOrbitControls() {
    if (this._orbitControls) {
      this._orbitControls.enabled = true;
      ORBIT_CONTROLS_CONFIG.enabled = true;
    }
  }

  disableOrbitControls() {
    if (this._orbitControls) {
      this._orbitControls.enabled = false;
      ORBIT_CONTROLS_CONFIG.enabled = false;
    }
  }

  onObjectDragStart() {
    if (this._cameraState === CAMERA_STATE.OrbitControls) {
      this.disableOrbitControls();
    }
  }

  onObjectDragEnd() {
    if (this._cameraState === CAMERA_STATE.OrbitControls) {
      this.enableOrbitControls();
    }
  }

  focusCamera(focusObjectType) {
    if (CAMERA_CONFIG.focusObjectType === focusObjectType) {
      return;
    }

    CAMERA_CONFIG.focusObjectType = focusObjectType;

    const focusConfig = CAMERA_FOCUS_POSITION_CONFIG[focusObjectType];
    this._cameraState = CAMERA_STATE.NoControls;
    CAMERA_CONFIG.state = this._cameraState;

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
          this.enableOrbitControls();
          this._cameraState = CAMERA_STATE.OrbitControls;
        }

        if (focusObjectType !== CAMERA_FOCUS_OBJECT_TYPE.Room) {
          this._lookAtObject.quaternion.copy(this._camera.quaternion);
          this._lookAtLerpObject.quaternion.copy(this._camera.quaternion);
          this._cameraState = CAMERA_STATE.Focused;
        }

        CAMERA_CONFIG.state = this._cameraState;
      });
  }

  changeFOV() {
    this._camera.fov = CAMERA_CONFIG.fov;
    this._camera.updateProjectionMatrix();
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

  _getFocusData(focusType) {
    const focusConfig = CAMERA_FOCUS_POSITION_CONFIG[focusType];

    let focusPosition = null;
    let focusLookAt = null;

    if (focusConfig.focusType === FOCUS_TYPE.Position) {
      focusPosition = focusConfig.focus.position;
      focusLookAt = focusConfig.focus.lookAt;
    }

    if (focusConfig.focusType === FOCUS_TYPE.Object) {
      const focusObject = this._focusObjects[focusConfig.focus.objectType];
      focusLookAt = focusObject.getFocusPosition();
      focusPosition = focusLookAt.clone().add(focusConfig.focus.positionFromObject);
    }

    return { focusPosition, focusLookAt };
  }

  _init() {
    this._initLookAtObjects();
    this._setCameraStartPosition();
  }

  _initLookAtObjects() {
    this._lookAtObject = new THREE.Object3D();
    this._lookAtLerpObject = new THREE.Object3D();
  }

  _setCameraStartPosition() {
    const cameraFocusType = CAMERA_FOCUS_OBJECT_TYPE.Room;
    const focusConfig = CAMERA_FOCUS_POSITION_CONFIG[cameraFocusType];

    this._camera.position.copy(focusConfig.focus.position)
    this._camera.lookAt(focusConfig.focus.lookAt.x, focusConfig.focus.lookAt.y, focusConfig.focus.lookAt.z);
  }
}
