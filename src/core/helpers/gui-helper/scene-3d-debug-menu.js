import * as THREE from "three";
import { Black } from 'black-engine';
import DEBUG_CONFIG from "../../configs/debug-config";
import RendererStats from 'three-webgl-stats';
import Stats from '/node_modules/three/examples/jsm/libs/stats.module.js';
import GUIHelper from "./gui-helper";
import { GUI_CONFIG } from "./gui-helper-config";
import { CAMERA_FOCUS_OBJECT_TYPE } from "../../../scene/room/camera-controller/data/camera-data";
import { CAMERA_FOCUS_POSITION_CONFIG, ORBIT_CONTROLS_MODE_CONFIG } from "../../../scene/room/camera-controller/data/camera-config";
import { OrbitControls } from "../../OrbitControls";

export default class Scene3DDebugMenu {
  constructor(scene, camera, renderer) {
    this._scene = scene;
    this._camera = camera;
    this._renderer = renderer;

    this._fpsStats = null;
    this._rendererStats = null;
    this._orbitControls = null;
    this._gridHelper = null;
    this._axesHelper = null;
    this._baseGUI = null;

    this._isAssetsLoaded = false;

    this._init();
  }

  preUpdate() {
    if (DEBUG_CONFIG.fpsMeter) {
      this._fpsStats.begin();
    }
  }

  postUpdate() {
    if (DEBUG_CONFIG.fpsMeter) {
      this._fpsStats.end();
    }
  }

  update() {
    if (ORBIT_CONTROLS_MODE_CONFIG.enabled) {
      this._orbitControls.update();
    }

    if (DEBUG_CONFIG.rendererStats) {
      this._rendererStats.update(this._renderer);
    }
  }

  showAfterAssetsLoad() {
    this._isAssetsLoaded = true;

    if (DEBUG_CONFIG.fpsMeter) {
      this._fpsStats.dom.style.visibility = 'visible';
    }

    if (DEBUG_CONFIG.rendererStats) {
      this._rendererStats.domElement.style.visibility = 'visible';
    }

    if (ORBIT_CONTROLS_MODE_CONFIG.enabled) {
      this._orbitControls.enabled = true;
    }

    GUIHelper.instance.showAfterAssetsLoad();
  }

  getOrbitControls() {
    return this._orbitControls;
  }

  _init() {
    // this._checkBuildMode();

    this._initRendererStats();
    this._initFPSMeter();
    this._initOrbitControls();
    this._initGridAndAxesHelper();

    this._initLilGUIHelper();
  }

  _checkBuildMode() {
    if (GUI_CONFIG.disableAllDebugAtNormalMode) {
      const currentUrl = window.location.href;
      const isDebug = currentUrl.indexOf('#debug') !== -1;

      if (isDebug) {
        for (const key in DEBUG_CONFIG) {
          DEBUG_CONFIG[key] = false;
        }
      }
    }
  }

  _initRendererStats() {
    if (DEBUG_CONFIG.rendererStats) {
      const rendererStats = this._rendererStats = new RendererStats();

      rendererStats.domElement.style.position = 'absolute';
      rendererStats.domElement.style.left = '0px';
      rendererStats.domElement.style.bottom = '0px';
      document.body.appendChild(rendererStats.domElement);

      if (!this._isAssetsLoaded) {
        this._rendererStats.domElement.style.visibility = 'hidden';
      }
    }
  }

  _initFPSMeter() {
    if (DEBUG_CONFIG.fpsMeter) {
      const stats = this._fpsStats = new Stats();
      stats.showPanel(0);
      document.body.appendChild(stats.dom);

      if (!this._isAssetsLoaded) {
        this._fpsStats.dom.style.visibility = 'hidden';
      }
    }
  }

  _initOrbitControls() {
    if (ORBIT_CONTROLS_MODE_CONFIG.enabled) {
      const orbitControls = this._orbitControls = new OrbitControls(this._camera, Black.engine.containerElement);

      const cameraFocusType = CAMERA_FOCUS_OBJECT_TYPE.Room;
      const lookAt = CAMERA_FOCUS_POSITION_CONFIG[cameraFocusType].focus.lookAt;
      orbitControls.target.set(lookAt.x, lookAt.y, lookAt.z);

      orbitControls.enableDamping = ORBIT_CONTROLS_MODE_CONFIG.enableDamping;
      orbitControls.dampingFactor = ORBIT_CONTROLS_MODE_CONFIG.dampingFactor;
      orbitControls.rotateSpeed = ORBIT_CONTROLS_MODE_CONFIG.rotateSpeed;
      orbitControls.minPolarAngle = ORBIT_CONTROLS_MODE_CONFIG.minPolarAngle;
      orbitControls.maxPolarAngle = ORBIT_CONTROLS_MODE_CONFIG.maxPolarAngle;
      orbitControls.minDistance = ORBIT_CONTROLS_MODE_CONFIG.minDistance;
      orbitControls.maxDistance = ORBIT_CONTROLS_MODE_CONFIG.maxDistance;
      orbitControls.panSpeed = ORBIT_CONTROLS_MODE_CONFIG.panSpeed;

      if (!this._isAssetsLoaded) {
        orbitControls.enabled = false;
      }
    }
  }

  _initGridAndAxesHelper() {
    if (DEBUG_CONFIG.gridHelper) {
      const gridHelper = this._gridHelper = new THREE.GridHelper(10, 10);
      this._scene.add(gridHelper);

      const axesHelper = this._axesHelper = new THREE.AxesHelper(3);
      this._scene.add(axesHelper);
    }
  }

  _initLilGUIHelper() {
    new GUIHelper();
  }

  onFpsMeterClick() {
    if (DEBUG_CONFIG.fpsMeter) {
      if (!this._fpsStats) {
        this._initFPSMeter();
      }
      this._fpsStats.dom.style.display = 'block';
    } else {
      this._fpsStats.dom.style.display = 'none';
    }
  }

  onRendererStatsClick(rendererStatsState) {
    if (DEBUG_CONFIG.rendererStats) {
      if (rendererStatsState) {
        if (!this._rendererStats) {
          this._initRendererStats();
        }

        this._rendererStats.domElement.style.display = 'block';
      } else {
        this._rendererStats.domElement.style.display = 'none';
      }
    }
  }

  onOrbitControlsClick(orbitControlsState) {
    if (orbitControlsState) {
      if (!this._orbitControls) {
        this._initOrbitControls();
      }

      this._orbitControls.enabled = true;
    } else {
      this._orbitControls.enabled = false;
    }
  }

  onGridHelperClick(gridHelperState) {
    if (gridHelperState) {
      if (!this._gridHelper) {
        this._initGridAndAxesHelper();
      }

      this._axesHelper.visible = true;
      this._gridHelper.visible = true;
    } else {
      this._axesHelper.visible = false;
      this._gridHelper.visible = false;
    }
  }
}
