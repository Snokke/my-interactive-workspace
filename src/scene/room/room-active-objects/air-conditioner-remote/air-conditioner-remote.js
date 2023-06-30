import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { AIR_CONDITIONER_REMOTE_BUTTON_TYPE, AIR_CONDITIONER_REMOTE_PART_TYPE, AIR_CONDITIONER_REMOTE_STATIC_PARTS } from './data/air-conditioner-remote-data';
import { STATIC_MODE_CAMERA_CONFIG } from '../../camera-controller/data/camera-config';
import { Black } from 'black-engine';
import { AIR_CONDITIONER_REMOTE_CONFIG } from './data/air-conditioner-remote-config';
import { AIR_CONDITIONER_CONFIG } from '../air-conditioner/data/air-conditioner-config';
import { AIR_CONDITIONER_STATE } from '../air-conditioner/data/air-conditioner-data';
import Loader from '../../../../core/loader';
import vertexShader from '../../shared/mix-three-textures-shaders/mix-three-textures-vertex.glsl';
import fragmentShader from '../../shared/mix-three-textures-shaders/mix-three-textures-fragment.glsl';

export default class AirConditionerRemote extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._isAirConditionerRemoteShown = false;
    this._airConditionerRemoteLastTransform = {};
    this._airConditionerRemoteLastPosition = new THREE.Vector3();
    this._wrapper = null;

    this._buttonClickTween = {};
    this._buttonByType = {};
    this._temperatureScreenBitmap = null;
    this._screenBackgroundColor = null;

    this._init();
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (partType === AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined
      || partType === AIR_CONDITIONER_REMOTE_PART_TYPE.Base
      || partType === AIR_CONDITIONER_REMOTE_PART_TYPE.TemperatureScreen) {
      this._onAirConditionerRemoteClick();
    }

    if (partType === AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonOnOff) {
      const buttonType = AIR_CONDITIONER_REMOTE_BUTTON_TYPE.OnOff;
      this._buttonClickAnimation(buttonType);
      this.events.post('onButtonOnOffClick');
    }

    if (partType === AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonTemperatureUp) {
      const buttonType = AIR_CONDITIONER_REMOTE_BUTTON_TYPE.TemperatureUp;
      this._buttonClickAnimation(buttonType);
      this.events.post('onButtonTemperatureUpClick');
    }

    if (partType === AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonTemperatureDown) {
      const buttonType = AIR_CONDITIONER_REMOTE_BUTTON_TYPE.TemperatureDown;
      this._buttonClickAnimation(buttonType);
      this.events.post('onButtonTemperatureDownClick');
    }
  }

  onPointerOver(intersect) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const roomObject = intersect.object;
    const type = roomObject.userData.partType;

    if (type === AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined
      || type === AIR_CONDITIONER_REMOTE_PART_TYPE.Base
      || type === AIR_CONDITIONER_REMOTE_PART_TYPE.TemperatureScreen) {
      if (this._isAirConditionerRemoteShown) {
        Black.engine.containerElement.style.cursor = 'zoom-out';
      } else {
        Black.engine.containerElement.style.cursor = 'grab';
      }
    }
  }

  hideAirConditionerRemote() {
    this.events.post('onRemoteMoving');
    this._isAirConditionerRemoteShown = false;
    this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.Base].userData.hideOutline = false;
    this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined].userData.hideOutline = false;
    this._hideRemoteOnFocus();
    this._moveRemoteToStartPosition();
  }

  setBaseActive() {
    this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined].userData.isActive = true;
  }

  setBaseInactive() {
    this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined].userData.isActive = false;
  }

  getMeshesForOutline(mesh) {
    const partType = mesh.userData.partType;

    if (partType === AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined || partType === AIR_CONDITIONER_REMOTE_PART_TYPE.TemperatureScreen) {
      const baseJoined = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined];
      return [baseJoined];
    }

    return [mesh];
  }

  setTemperature(temperature) {
    AIR_CONDITIONER_CONFIG.temperature.current = temperature;
    this.updateTemperatureScreen();
    this.events.post('onTemperatureChange');
  }

  increaseTemperature() {
    AIR_CONDITIONER_CONFIG.temperature.current += 1;

    if (AIR_CONDITIONER_CONFIG.temperature.current > AIR_CONDITIONER_CONFIG.temperature.max) {
      AIR_CONDITIONER_CONFIG.temperature.current = AIR_CONDITIONER_CONFIG.temperature.max;
    } else {
      this.updateTemperatureScreen();
    }
  }

  decreaseTemperature() {
    AIR_CONDITIONER_CONFIG.temperature.current -= 1;

    if (AIR_CONDITIONER_CONFIG.temperature.current < AIR_CONDITIONER_CONFIG.temperature.min) {
      AIR_CONDITIONER_CONFIG.temperature.current = AIR_CONDITIONER_CONFIG.temperature.min;
    } else {
      this.updateTemperatureScreen();
    }
  }

  updateTemperatureScreen() {
    const temperature = AIR_CONDITIONER_CONFIG.temperature.current;
    const bitmap = this._temperatureScreenBitmap;
    const context = bitmap.getContext('2d');

    context.clearRect(0, 0, bitmap.width, bitmap.height);

    context.font = `${AIR_CONDITIONER_REMOTE_CONFIG.screen.textSize}px AlarmClock`;
    context.textAlign = 'center';
    context.fillStyle = `#${this._screenBackgroundColor.getHexString()}`;
    context.fillRect(0, 0, bitmap.width, bitmap.height);

    context.fillStyle = AIR_CONDITIONER_REMOTE_CONFIG.screen.textColor;
    context.fillText(temperature, bitmap.width * 0.5, bitmap.height * 0.55);

    const powerStateText = AIR_CONDITIONER_CONFIG.powerState === AIR_CONDITIONER_STATE.PowerOn ? 'ON' : 'OFF';
    context.font = `${AIR_CONDITIONER_REMOTE_CONFIG.screen.onOffTextSize}px AlarmClock`;
    context.textAlign = 'left';
    context.fillStyle = AIR_CONDITIONER_REMOTE_CONFIG.screen.textColor;
    context.fillText(powerStateText, bitmap.width * 0.06, bitmap.height * 0.69);

    context.font = `italic ${AIR_CONDITIONER_REMOTE_CONFIG.screen.celsiusTextSize}px Arial`;
    context.textAlign = 'center';
    context.fillStyle = AIR_CONDITIONER_REMOTE_CONFIG.screen.textColor;
    context.fillText('°C', bitmap.width * 0.81, bitmap.height * 0.67);

    const temperatureScreen = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.TemperatureScreen];
    temperatureScreen.material.map.needsUpdate = true;
  }

  onLightPercentChange(lightPercent) {
    const baseJoined = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined];
    baseJoined.material.uniforms.uMixTextures0102Percent.value = lightPercent;
  }

  resetToInitState() {
    this.setTemperature(AIR_CONDITIONER_CONFIG.temperature.init);
  }

  _buttonClickAnimation(buttonType) {
    const button = this._buttonByType[buttonType];

    this._stopButtonTween(buttonType);
    button.position.y = button.userData.startPosition.y;
    const endPosition = button.userData.startPosition.y - AIR_CONDITIONER_REMOTE_CONFIG.buttonPressDistance;

    this._buttonClickTween[buttonType] = new TWEEN.Tween(button.position)
      .to({ y: endPosition }, 80)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .start()
      .yoyo(true)
      .repeat(1);
  }

  _onAirConditionerRemoteClick() {
    this.events.post('onRemoteMoving');

    if (!this._isAirConditionerRemoteShown) {
      this._showAirConditionerRemote();
    } else {
      this.events.post('onAirConditionerRemoteClickToHide');
    }
  }

  _showAirConditionerRemote() {
    this._isAirConditionerRemoteShown = true;

    this._updateMaterialOnFocus();

    this._airConditionerRemoteLastPosition.copy(this._wrapper.position);
    const globalPosition = this._wrapper.getWorldPosition(new THREE.Vector3());
    this._airConditionerRemoteLastTransform.position.copy(globalPosition);
    this._airConditionerRemoteLastTransform.rotation.copy(this._wrapper.rotation);
    this.events.post('onAirConditionerRemoteClickToShow', this._wrapper, this._roomObjectType);

    this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.Base].userData.hideOutline = true;
    this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined].userData.hideOutline = true;
    this._disableActivity();

    Delayed.call(STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime, () => {
      this._enableActivity();
      this._showRemoteOnFocus();
      this.events.post('onRemoteStopMoving');
    });
  }

  _moveRemoteToStartPosition() {
    this._updateMaterialOnFocus();
    const baseJoined = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined];
    baseJoined.userData.isActive = false;

    const endPosition = this._airConditionerRemoteLastTransform.position;
    const endRotation = this._airConditionerRemoteLastTransform.rotation;

    new TWEEN.Tween(this._wrapper.position)
      .to({ x: endPosition.x, y: endPosition.y, z: endPosition.z }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start()
      .onComplete(() => {
        baseJoined.userData.isActive = true;
        this.add(this._wrapper);
        this._wrapper.position.copy(this._airConditionerRemoteLastPosition);
        this._enableActivity();
        this.events.post('onRemoteStopMoving');
      });

    new TWEEN.Tween(this._wrapper.rotation)
      .to({ x: endRotation.x, y: endRotation.y, z: endRotation.z }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();
  }

  _disableActivity() {
    for (const partType in this._parts) {
      this._parts[partType].userData.isActive = false;
    }
  }

  _enableActivity() {
    for (const partType in this._parts) {
      this._parts[partType].userData.isActive = true;
    }
  }

  _stopButtonTween(buttonType) {
    if (this._buttonClickTween[buttonType]) {
      this._buttonClickTween[buttonType].stop();
    }
  }

  _updateMaterialOnFocus() {
    let endMixTexturesValue;
    let endScreenColor;
    const startScreenColor = new THREE.Color(this._screenBackgroundColor);

    if (this._isAirConditionerRemoteShown) {
      endScreenColor = new THREE.Color(AIR_CONDITIONER_REMOTE_CONFIG.screen.backgroundColorFocused);
      endMixTexturesValue = 1;
    } else {
      endScreenColor = new THREE.Color(AIR_CONDITIONER_REMOTE_CONFIG.screen.backgroundColor);
      endMixTexturesValue = 0;
    }

    const baseJoined = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined];
    const mixTexturesObject = { value: baseJoined.material.uniforms.uMixTexture03Percent.value };

    new TWEEN.Tween(mixTexturesObject)
      .to({ value: endMixTexturesValue }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .onUpdate(() => {
        const baseJoined = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined];
        baseJoined.material.uniforms.uMixTexture03Percent.value = mixTexturesObject.value;
      })
      .start();

    const lerpColorObject = { value: 0 };

    new TWEEN.Tween(lerpColorObject)
      .to({ value: 1 }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .onUpdate(() => {
        this._screenBackgroundColor = new THREE.Color().lerpColors(startScreenColor, endScreenColor, lerpColorObject.value);
        this.updateTemperatureScreen();
      })
      .start();
  }

  _showRemoteOnFocus() {
    const baseJoined = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined];
    baseJoined.scale.set(0.001, 0.001, 0.001);
    baseJoined.visible = false;

    AIR_CONDITIONER_REMOTE_STATIC_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      part.scale.set(1, 1, 1);
      part.visible = true;
    });
  }

  _hideRemoteOnFocus() {
    const baseJoined = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined];
    baseJoined.scale.set(1, 1, 1);
    baseJoined.visible = true;

    AIR_CONDITIONER_REMOTE_STATIC_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      part.scale.set(0.001, 0.001, 0.001);
      part.visible = false;
    });
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initWrapperGroup();
    this._initBaseLastPosition();
    this._initButtonsByType();
    this._initTemperatureScreen();
    this._hideRemoteOnFocus();
  }

  _addMaterials() {
    const bakedTextureLightOn = Loader.assets['baked-textures/baked-air-conditioner-remote'];
    bakedTextureLightOn.flipY = false;

    const bakedTextureLightOff = Loader.assets['baked-textures/baked-air-conditioner-remote-light-off'];
    bakedTextureLightOff.flipY = false;

    const bakedTextureFocus = Loader.assets['baked-textures/baked-air-conditioner-remote-focus'];
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

    const baseJoined = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined];
    baseJoined.material = material;

    const focusMaterial = new THREE.MeshBasicMaterial({
      map: bakedTextureFocus,
    });

    AIR_CONDITIONER_REMOTE_STATIC_PARTS.forEach((partName) => {
      const part = this._parts[partName];
      part.material = focusMaterial;
    });

    this._screenBackgroundColor = new THREE.Color(AIR_CONDITIONER_REMOTE_CONFIG.screen.backgroundColor);
  }

  _initWrapperGroup() {
    const wrapper = this._wrapper = new THREE.Group();
    this.add(wrapper);

    const baseJoined = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.BaseJoined];
    const base = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.Base];
    const buttonOnOff = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonOnOff];
    const buttonTemperatureUp = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonTemperatureUp];
    const buttonTemperatureDown = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonTemperatureDown];
    const temperatureScreen = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.TemperatureScreen];

    wrapper.add(baseJoined, base, buttonOnOff, buttonTemperatureUp, buttonTemperatureDown, temperatureScreen);

    const buttonOnOffDelta = buttonOnOff.position.clone().sub(base.position);
    const buttonTemperatureUpDelta = buttonTemperatureUp.position.clone().sub(base.position);
    const buttonTemperatureDownDelta = buttonTemperatureDown.position.clone().sub(base.position);
    const temperatureScreenDelta = temperatureScreen.position.clone().sub(base.position);

    wrapper.position.copy(base.userData.startPosition);

    baseJoined.position.set(0, 0, 0);
    base.position.set(0, 0, 0);
    buttonOnOff.position.copy(buttonOnOffDelta);
    buttonTemperatureUp.position.copy(buttonTemperatureUpDelta);
    buttonTemperatureDown.position.copy(buttonTemperatureDownDelta);
    temperatureScreen.position.copy(temperatureScreenDelta);

    buttonOnOff.userData.startPosition = buttonOnOff.position.clone();
    buttonTemperatureUp.userData.startPosition = buttonTemperatureUp.position.clone();
    buttonTemperatureDown.userData.startPosition = buttonTemperatureDown.position.clone();
  }

  _initBaseLastPosition() {
    this._airConditionerRemoteLastTransform = {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
    };
  }

  _initButtonsByType() {
    const buttonOnOff = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonOnOff];
    const buttonTemperatureUp = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonTemperatureUp];
    const buttonTemperatureDown = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.ButtonTemperatureDown];

    this._buttonByType = {
      [AIR_CONDITIONER_REMOTE_BUTTON_TYPE.OnOff]: buttonOnOff,
      [AIR_CONDITIONER_REMOTE_BUTTON_TYPE.TemperatureUp]: buttonTemperatureUp,
      [AIR_CONDITIONER_REMOTE_BUTTON_TYPE.TemperatureDown]: buttonTemperatureDown,
    }
  }

  _initTemperatureScreen() {
    this._initTemperatureScreenBitmap();
    this._initTemperatureText();

    setTimeout(() => this.updateTemperatureScreen(), 10);
    setTimeout(() => this.updateTemperatureScreen(), 1000);
  }

  _initTemperatureScreenBitmap() {
    const temperatureScreen = this._parts[AIR_CONDITIONER_REMOTE_PART_TYPE.TemperatureScreen];
    const temperatureScreenBox = new THREE.Box3().setFromObject(temperatureScreen);
    const size = temperatureScreenBox.getSize(new THREE.Vector3());

    const bitmap = this._temperatureScreenBitmap = document.createElement('canvas');
    bitmap.width = size.x * AIR_CONDITIONER_REMOTE_CONFIG.screen.resolution;
    bitmap.height = size.z * AIR_CONDITIONER_REMOTE_CONFIG.screen.resolution;

    const texture = new THREE.Texture(bitmap);
    texture.flipY = false;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    temperatureScreen.material = material;
  }

  _initTemperatureText() {
    const context = this._temperatureScreenBitmap.getContext('2d');
    context.font = `${AIR_CONDITIONER_REMOTE_CONFIG.screen.textSize}px AlarmClock`;

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.fillStyle = AIR_CONDITIONER_REMOTE_CONFIG.screen.textColor;
    context.fillText('00', this._temperatureScreenBitmap.width * 0.5, this._temperatureScreenBitmap.height * 0.55);
  }
}
