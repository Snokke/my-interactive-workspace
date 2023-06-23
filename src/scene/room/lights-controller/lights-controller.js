import * as THREE from 'three';
import { FLOOR_LAMP_CONFIG } from '../room-active-objects/floor-lamp/data/floor-lamp-config';
import { LIGHTS_CONTROLLER_CONFIG } from './data/lights-controller-config';
import { LIGHT_TYPE } from './data/lights-controller-data';
import SCENE_CONFIG from '../../../core/configs/scene-config';

export default class LightsController {
  constructor(scene, table) {

    this._scene = scene;
    this._table = table;

    this._lampSpotlight = null;
    this._monitorSpotlight = null;

    this._lampSpotlightHelper = null;
    this._monitorSpotlightHelper = null;

    this._tablePositionY = 0;
    this._previousTablePositionY = 0;

    this._init();
  }

  update() {
    if (SCENE_CONFIG.isMobile) {
      return;
    }

    this._previousTablePositionY = this._tablePositionY;
    this._tablePositionY = this._table.getTopTableGroup().position.y;

    if (this._tablePositionY !== this._previousTablePositionY) {
      this._monitorSpotlight.position.y = this._tablePositionY + 6;
    }
  }

  onLightHalfOn() {
    if (SCENE_CONFIG.isMobile) {
      return;
    }

    this._lampSpotlight.visible = true;
    this._monitorSpotlight.visible = false;

    if (FLOOR_LAMP_CONFIG.helpers) {
      this._setHelperColor(this._lampSpotlightHelper, LIGHTS_CONTROLLER_CONFIG.helpers.colorOn);
      this._setHelperColor(this._monitorSpotlightHelper, LIGHTS_CONTROLLER_CONFIG.helpers.colorOff);
    }
  }

  onLightHalfOff() {
    if (SCENE_CONFIG.isMobile) {
      return;
    }

    this._lampSpotlight.visible = false;
    this._monitorSpotlight.visible = true;

    if (FLOOR_LAMP_CONFIG.helpers) {
      this._setHelperColor(this._lampSpotlightHelper, LIGHTS_CONTROLLER_CONFIG.helpers.colorOff);
      this._setHelperColor(this._monitorSpotlightHelper, LIGHTS_CONTROLLER_CONFIG.helpers.colorOn);
    }
  }

  onHelpersChange() {
    if (SCENE_CONFIG.isMobile) {
      return;
    }

    if (FLOOR_LAMP_CONFIG.helpers) {
      if (this._lampSpotlightHelper) {
        this._showHelpers();
      }

      this._initHelpers();
      this._showHelpers();
    } else {
      this._hideHelpers();
    }
  }

  _showHelpers() {
    this._lampSpotlightHelper.visible = true;
    this._monitorSpotlightHelper.visible = true;
  }

  _hideHelpers() {
    this._lampSpotlightHelper.visible = false;
    this._monitorSpotlightHelper.visible = false;
  }

  _initHelpers() {
    const lampSpotlightHelper = this._lampSpotlightHelper = new THREE.SpotLightHelper(this._lampSpotlight);
    this._scene.add(lampSpotlightHelper);

    const lampSpotlightHelperColor = this._lampSpotlight.visible ? LIGHTS_CONTROLLER_CONFIG.helpers.colorOn : LIGHTS_CONTROLLER_CONFIG.helpers.colorOff;
    this._setHelperColor(lampSpotlightHelper, lampSpotlightHelperColor);

    const monitorSpotlightHelper = this._monitorSpotlightHelper = new THREE.SpotLightHelper(this._monitorSpotlight);
    this._scene.add(monitorSpotlightHelper);

    const monitorSpotlightHelperColor = this._monitorSpotlight.visible ? LIGHTS_CONTROLLER_CONFIG.helpers.colorOn : LIGHTS_CONTROLLER_CONFIG.helpers.colorOff;
    this._setHelperColor(monitorSpotlightHelper, monitorSpotlightHelperColor);
  }

  _setHelperColor(helper, color) {
    helper.color = color;
    helper.update();
  }

  _init() {
    if (SCENE_CONFIG.isMobile) {
      return;
    }

    this._initLampSpotlight();
    this._initMonitorSpotlight();

    this.onLightHalfOn();
  }

  _initLampSpotlight() {
    const spotLight = this._lampSpotlight = this._createSpotLight(LIGHT_TYPE.Lamp);
    this._scene.add(spotLight);

    spotLight.position.set(-5.4, 12, -5.4);
    spotLight.angle = Math.PI * 0.15;
  }

  _initMonitorSpotlight() {
    const spotLight = this._monitorSpotlight = this._createSpotLight(LIGHT_TYPE.Monitor);
    this._scene.add(spotLight);

    spotLight.position.set(0, 6, -1.7);
    spotLight.angle = Math.PI * 0.27;

    const targetObject = new THREE.Object3D();
    this._scene.add(targetObject);
    spotLight.target = targetObject;

    targetObject.position.set(0, -1, 0);
  }

  _createSpotLight(type) {
    const config = LIGHTS_CONTROLLER_CONFIG.lights[type];

    const spotLight = new THREE.SpotLight();

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = config.near;
    spotLight.shadow.camera.far = config.far;
    spotLight.shadow.camera.fov = config.fov;

    spotLight.shadow.mapSize.width = config.mapSize;
    spotLight.shadow.mapSize.height = config.mapSize;

    return spotLight;
  }
}
