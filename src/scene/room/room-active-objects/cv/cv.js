import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import RoomObjectAbstract from '../room-object.abstract';
import { CV_CONFIG, CV_LINKS_CONFIG } from './data/cv-config';
import * as pdfjs from 'pdfjs-dist/build/pdf';
import Loader from '../../../../core/loader';
import mixTexturesVertexShader from '../../shared/mix-three-textures-shaders/mix-three-textures-vertex.glsl';
import mixTexturesFragmentShader from '../../shared/mix-three-textures-shaders/mix-three-textures-fragment.glsl';
import { CV_PART_ACTIVITY_CONFIG, CV_PART_TYPE } from './data/cv-data';
import Delayed from '../../../../core/helpers/delayed-call';
import { STATIC_MODE_CAMERA_CONFIG } from '../../camera-controller/data/camera-config';
import { Black } from 'black-engine';
import SCENE_CONFIG from '../../../../core/configs/scene-config';

export default class CV extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._pdf = null;
    this._pdfBitmap = null;
    this._canvasTexture = null;

    this._isCVShown = false;
    this._CVLastPosition = new THREE.Vector3();
    this._CVLastTransform = {};
    this._wrapper = null;
    this._buttons = [];

    this._init();
  }

  onClick(intersect) { // eslint-disable-line
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const type = roomObject.userData.partType;

    if (type === CV_PART_TYPE.Page) {
      this._onPageClick();
    }

    if (type === CV_PART_TYPE.LinkedIn) {
      this._onLinkClick(CV_CONFIG.links.linkedIn);
    }

    if (type === CV_PART_TYPE.EMail) {
      this._onLinkClick(CV_CONFIG.links.email);
    }

    if (type === CV_PART_TYPE.OpenPDF) {
      this._onLinkClick(CV_CONFIG.links.pdf);
    }
  }

  getMeshesForOutline(mesh) {
    return [mesh];
  }

  hideCV() {
    this.events.post('onCVMoving');
    this._isCVShown = false;
    this._parts[CV_PART_TYPE.Page].userData.hideOutline = false;
    this._moveCVToStartPosition();
  }

  onPointerOver(intersect) {
    if (this._isPointerOver) {
      return;
    }

    super.onPointerOver();

    const roomObject = intersect.object;
    const type = roomObject.userData.partType;

    if (type === CV_PART_TYPE.Page) {
      if (this._isCVShown) {
        Black.engine.containerElement.style.cursor = 'zoom-out';
      } else {
        Black.engine.containerElement.style.cursor = 'grab';
      }
    }
  }

  onLightPercentChange(lightPercent) {
    const page = this._parts[CV_PART_TYPE.Page];
    page.material.uniforms.uMixTextures0102Percent.value = lightPercent;
  }

  _onPageClick() {
    this.events.post('onCVMoving');

    if (!this._isCVShown) {
      this._showCV();
    } else {
      this.events.post('onCVClickToHide');
    }
  }

  _showCV() {
    this._isCVShown = true;
    this._canvasTexture.needsUpdate = true;

    this._updateMaterialOnFocus();

    this._CVLastPosition.copy(this._wrapper.position);
    const globalPosition = this._wrapper.getWorldPosition(new THREE.Vector3());
    this._CVLastTransform.position.copy(globalPosition);
    this._CVLastTransform.rotation.copy(this._wrapper.rotation);
    this.events.post('onCVClickToShow', this._wrapper, this._roomObjectType);

    this._parts[CV_PART_TYPE.Page].userData.hideOutline = true;
    this._disableActivity();

    Delayed.call(STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime, () => {
      this._enableActivity();
      this._showAllButtons();
      this.events.post('onCVStopMoving');
    });
  }

  _moveCVToStartPosition() {
    this._updateMaterialOnFocus();
    this._hideAllButtons();

    const page = this._parts[CV_PART_TYPE.Page];
    page.userData.isActive = false;

    const endPosition = this._CVLastTransform.position;
    const endRotation = this._CVLastTransform.rotation;

    new TWEEN.Tween(this._wrapper.position)
      .to({ x: endPosition.x, y: endPosition.y, z: endPosition.z }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start()
      .onComplete(() => {
        page.userData.isActive = true;
        this.add(this._wrapper);
        this._wrapper.position.copy(this._CVLastPosition);
        this._enableActivity();
        this.events.post('onCVStopMoving');
      });

    new TWEEN.Tween(this._wrapper.rotation)
      .to({ x: endRotation.x, y: endRotation.y, z: endRotation.z }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();
  }

  _updateMaterialOnFocus() {
    let endMixTexturesValue;

    if (this._isCVShown) {
      endMixTexturesValue = 1;
    } else {
      endMixTexturesValue = 0;
    }

    const page = this._parts[CV_PART_TYPE.Page];
    const mixTexturesObject = { value: page.material.uniforms.uMixTexture03Percent.value };

    new TWEEN.Tween(mixTexturesObject)
      .to({ value: endMixTexturesValue }, STATIC_MODE_CAMERA_CONFIG[this._roomObjectType].objectMoveTime)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .onUpdate(() => {
        const page = this._parts[CV_PART_TYPE.Page];
        page.material.uniforms.uMixTexture03Percent.value = mixTexturesObject.value;
      })
      .start();
  }

  _onLinkClick(link) {
    if (SCENE_CONFIG.isMobile) {
      const linkElement = document.getElementById('cv_link');
      linkElement.setAttribute('href', link);
      linkElement.click();
    } else {
      window.open(link, '_blank').focus();
    }
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

  _hideAllButtons() {
    this._buttons.forEach((button) => {
      button.visible = false;
      button.scale.set(0, 0, 0);
    });
  }

  _showAllButtons() {
    this._buttons.forEach((button) => {
      button.visible = true;
      button.scale.set(1, 1, 1);
    });
  }

  _init() {
    this._initParts();
    this._initWrapperGroup();
    this._initPDFRender();
    this._initMaterial();
    this._initBaseLastPosition();
    this._initButtons();
  }

  _initWrapperGroup() {
    const wrapper = this._wrapper = new THREE.Group();
    this.add(wrapper);

    const page = this._parts[CV_PART_TYPE.Page];
    wrapper.add(page);

    wrapper.position.copy(page.userData.startPosition);
    wrapper.rotation.copy(page.userData.startAngle);
    page.position.set(0, 0, 0);
    page.rotation.set(0, 0, 0);
  }

  _initPDFRender() {
    const bitmap = this._pdfBitmap = document.createElement('canvas');
    bitmap.width = CV_CONFIG.width * CV_CONFIG.resolution;
    bitmap.height = CV_CONFIG.height * CV_CONFIG.resolution;

    const path = `/pdf/${CV_CONFIG.fileName}`;
    const loadingTask = pdfjs.getDocument(path);

    loadingTask.promise.then((pdf) => {
      this._pdf = pdf;

      this._renderPage();
    }, (reason) => {
      console.error(reason);
    });

    const texture = this._canvasTexture = new THREE.Texture(this._pdfBitmap);
    texture.flipY = false;
  }

  _renderPage() {
    this._pdf.getPage(1).then((page) => {
      const viewport = page.getViewport({
        scale: CV_CONFIG.page.scale * CV_CONFIG.resolution,
        offsetX: CV_CONFIG.page.offsetX * CV_CONFIG.resolution,
        offsetY: CV_CONFIG.page.offsetY * CV_CONFIG.resolution,
      });

      const context = this._pdfBitmap.getContext('2d');

      const renderContext = {
        canvasContext: context,
        // background: 'rgba(0, 0, 0, 0)',
        viewport: viewport,
      };

      page.render(renderContext);

      this._canvasTexture.needsUpdate = true;
    });
  }

  _initMaterial() {
    const bakedTextureLightOn = Loader.assets['baked-textures/baked-cv-light-on'];
    bakedTextureLightOn.flipY = false;

    const bakedTextureLightOff = Loader.assets['baked-textures/baked-cv-light-off'];
    bakedTextureLightOff.flipY = false;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture01: { value: bakedTextureLightOff },
        uTexture02: { value: bakedTextureLightOn },
        uTexture03: { value: this._canvasTexture },
        uMixTextures0102Percent: { value: 1 },
        uMixTexture03Percent: { value: 0 },
      },
      vertexShader: mixTexturesVertexShader,
      fragmentShader: mixTexturesFragmentShader,
    });

    const page = this._parts[CV_PART_TYPE.Page];
    page.material = material;
  }

  _initButtons() {
    const linksMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
    });

    const texture = Loader.assets[CV_LINKS_CONFIG[2].texture];
    const buttonMaterial = new THREE.MeshBasicMaterial({
      map: texture,
    });

    CV_LINKS_CONFIG.forEach((linkConfig) => {
      const buttonConfig = linkConfig;

      const geometry = new THREE.PlaneGeometry(buttonConfig.width, buttonConfig.height);
      const material = buttonConfig.texture ? buttonMaterial : linksMaterial;
      const button = new THREE.Mesh(geometry, material);
      this._wrapper.add(button);

      CV_PART_TYPE[buttonConfig.partTypeKey] = buttonConfig.partTypeValue;
      this._parts[CV_PART_TYPE[buttonConfig.partTypeKey]] = button;

      CV_PART_ACTIVITY_CONFIG[CV_PART_TYPE[buttonConfig.partTypeKey]] = true;

      button.name = CV_PART_TYPE[buttonConfig.partTypeKey];
      button.userData['objectType'] = this._roomObjectType;
      button.userData['partType'] = CV_PART_TYPE[buttonConfig.partTypeKey];
      button.userData['isActive'] = false;
      button.userData['hideOutline'] = true;

      button.rotation.x = -Math.PI * 0.5;
      button.position.y = 0.001;

      button.position.x = buttonConfig.x;
      button.position.z = buttonConfig.y;

      this._buttons.push(button);

      this._allMeshes.push(button);
      this._activeMeshes.push(button);
    });

    this._hideAllButtons();
  }

  _initBaseLastPosition() {
    this._CVLastTransform = {
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
    };
  }
}
