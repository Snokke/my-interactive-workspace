import * as THREE from "three";
import { Black } from 'black-engine';
import DEBUG_CONFIG from "../../configs/debug-config";
import RendererStats from 'three-webgl-stats';
import Stats from '/node_modules/three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import GUIHelper from "./gui-helper";
import { GUI_CONFIG } from "./gui-helper-config";
import { DEBUG_MENU_START_STATE } from "../../configs/debug-menu-start-state";
import SCENE_CONFIG from "../../configs/scene-config";

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
    if (DEBUG_CONFIG.orbitControls) {
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

    if (DEBUG_CONFIG.orbitControls) {
      this._orbitControls.enabled = true;
    }

    GUIHelper.instance.showAfterAssetsLoad();
  }

  getOrbitControls() {
    return this._orbitControls;
  }

  _init() {
    this._checkBuildMode();

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
    if (DEBUG_CONFIG.orbitControls) {
      const orbitControls = this._orbitControls = new OrbitControls(this._camera, Black.engine.containerElement);
      orbitControls.enableDamping = true;
      orbitControls.dampingFactor = 0.04;
      orbitControls.rotateSpeed = 0.5;

      orbitControls.target.set(SCENE_CONFIG.camera.lookAt.x, SCENE_CONFIG.camera.lookAt.y, SCENE_CONFIG.camera.lookAt.z);

      orbitControls.minPolarAngle = 0;
      orbitControls.maxPolarAngle = Math.PI * 0.5;

      // orbitControls.minDistance = 2;
      orbitControls.maxDistance = 50;

      orbitControls.panSpeed = 0.5;

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
    const gui = new GUIHelper();

    // const scene3DFolder = gui.addFolder({
    //   title: 'Scene',
    //   expanded: DEBUG_MENU_START_STATE.Scene,
    // });

    // scene3DFolder.addInput(DEBUG_CONFIG, 'fpsMeter', { label: 'Stats' })
    //   .on('change', (statsState) => {
    //     this.onFpsMeterClick(statsState.value);
    //     this.onRendererStatsClick(statsState.value);
    //   });

    // scene3DFolder.addInput(DEBUG_CONFIG, 'wireframe', { label: 'Wireframe' })
    //   .on('change', (wireframeState) => {
    //     if (wireframeState.value) {
    //       if (DEBUG_CONFIG.gridHelper) {
    //         const gridHelperController = GUIHelper.getController(scene3DFolder, 'Grid');
    //         DEBUG_CONFIG.gridHelper = false;
    //         gridHelperController.refresh();
    //       }

    //       this._scene.overrideMaterial = new THREE.MeshBasicMaterial({
    //         color: 0x000000,
    //         wireframe: true,
    //       });
    //     } else {
    //       this._scene.overrideMaterial = null;
    //     }
    //   });

    // scene3DFolder.addInput(DEBUG_CONFIG, 'orbitControls', { label: 'Orbit' })
    //   .on('change', (orbitControlsState) => {
    //     this.onOrbitControlsClick(orbitControlsState.value);
    //   });

    // scene3DFolder.addInput(DEBUG_CONFIG, 'gridHelper', { label: 'Grid' })
    //   .on('change', (gridHelperState) => {
    //     this.onGridHelperClick(gridHelperState.value);
    //   });
  }

  onFpsMeterClick(fpsMeterState) {
    if (fpsMeterState) {
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
