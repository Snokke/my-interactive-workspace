import * as THREE from 'three';
import { AREA_BORDER_TYPE } from "./mouse-data";
import { MOUSE_AREA_BORDER_CONFIG, MOUSE_CONFIG } from './mouse-config';
import vertexShader from './mouse-area-borders-shaders/mouse-area-borders-vertex.glsl';
import fragmentShader from './mouse-area-borders-shaders/mouse-area-borders-fragment.glsl';

export default class MouseAreaBorders extends THREE.Group {
  constructor(mouseBodyPosition) {
    super();

    this._mouseBodyPosition = mouseBodyPosition;

    this._areaBorders = {};

    this._init();
  }

  updateMousePosition(position) {
    this._hideBorders();

    const error = 0.001;
    const distanceToShow = MOUSE_AREA_BORDER_CONFIG.distanceToShow;

    if (position.x >= MOUSE_CONFIG.movingArea.width * 0.5 - error - distanceToShow) {
      const percentNearBorder = Math.min(1 - (MOUSE_CONFIG.movingArea.width * 0.5 - error - position.x) / distanceToShow, 1);
      this._areaBorders[AREA_BORDER_TYPE.Right].visible = true;
      this._areaBorders[AREA_BORDER_TYPE.Right].material.uniforms.uAlpha.value = percentNearBorder;
    }

    if (position.x <= -MOUSE_CONFIG.movingArea.width * 0.5 + error + distanceToShow) {
      const percentNearBorder = Math.min(1 - -(-MOUSE_CONFIG.movingArea.width * 0.5 + error - position.x) / distanceToShow, 1);
      this._areaBorders[AREA_BORDER_TYPE.Left].visible = true;
      this._areaBorders[AREA_BORDER_TYPE.Left].material.uniforms.uAlpha.value = percentNearBorder;
    }

    if (position.z >= MOUSE_CONFIG.movingArea.height * 0.5 - error - distanceToShow) {
      const percentNearBorder = Math.min(1 - (MOUSE_CONFIG.movingArea.height * 0.5 - error - position.z) / distanceToShow, 1);
      this._areaBorders[AREA_BORDER_TYPE.Bottom].visible = true;
      this._areaBorders[AREA_BORDER_TYPE.Bottom].material.uniforms.uAlpha.value = percentNearBorder;
    }

    if (position.z <= -MOUSE_CONFIG.movingArea.height * 0.5 + error + distanceToShow) {
      const percentNearBorder = Math.min(1 - -(-MOUSE_CONFIG.movingArea.height * 0.5 + error - position.z) / distanceToShow, 1);
      this._areaBorders[AREA_BORDER_TYPE.Top].visible = true;
      this._areaBorders[AREA_BORDER_TYPE.Top].material.uniforms.uAlpha.value = percentNearBorder;
    }

    const percentX = (position.x + MOUSE_CONFIG.movingArea.width * 0.5) / MOUSE_CONFIG.movingArea.width;
    const percentZ = 1 - (position.z + MOUSE_CONFIG.movingArea.height * 0.5) / MOUSE_CONFIG.movingArea.height;

    this._areaBorders[AREA_BORDER_TYPE.Top].material.uniforms.uCenter.value = percentX;
    this._areaBorders[AREA_BORDER_TYPE.Bottom].material.uniforms.uCenter.value = percentX;
    this._areaBorders[AREA_BORDER_TYPE.Left].material.uniforms.uCenter.value = percentZ;
    this._areaBorders[AREA_BORDER_TYPE.Right].material.uniforms.uCenter.value = percentZ;
  }

  onAreaChanged() {
    for (let key in AREA_BORDER_TYPE) {
      const type = AREA_BORDER_TYPE[key];
      const border = this._areaBorders[type];
      const scale = type === AREA_BORDER_TYPE.Top || type === AREA_BORDER_TYPE.Bottom
        ? MOUSE_CONFIG.movingArea.width + MOUSE_CONFIG.size.x
        : MOUSE_CONFIG.movingArea.height + MOUSE_CONFIG.size.z;

      this._setBorderPosition(border, type);
      border.scale.x = scale;
    }
  }

  onBorderColorUpdated() {
    for (let key in AREA_BORDER_TYPE) {
      const type = AREA_BORDER_TYPE[key];
      const border = this._areaBorders[type];
      border.material.uniforms.uColor.value = new THREE.Color(MOUSE_AREA_BORDER_CONFIG.color);
    }
  }

  _hideBorders() {
    for (let key in AREA_BORDER_TYPE) {
      const type = AREA_BORDER_TYPE[key];
      this._areaBorders[type].visible = false;
    }
  }

  _init() {
    for (let key in AREA_BORDER_TYPE) {
      const type = AREA_BORDER_TYPE[key];
      const border = this._initBorder(type);
      this.add(border);

      border.visible = false;
      this._areaBorders[type] = border;
    }
  }

  _initBorder(type) {
    const scale = type === AREA_BORDER_TYPE.Top || type === AREA_BORDER_TYPE.Bottom
      ? MOUSE_CONFIG.movingArea.width + MOUSE_CONFIG.size.x
      : MOUSE_CONFIG.movingArea.height + MOUSE_CONFIG.size.z;

    const geometry = new THREE.PlaneGeometry(1, MOUSE_AREA_BORDER_CONFIG.height);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uCenter: { value: 0.5 },
        uAlpha: { value: 1 },
        uColor: { value: new THREE.Color(MOUSE_AREA_BORDER_CONFIG.color) },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const border = this._areaBorders[type] = new THREE.Mesh(geometry, material);

    border.scale.x = scale;
    this._setBorderPosition(border, type);
    border.rotation.y = MOUSE_AREA_BORDER_CONFIG.rotation[type];

    return border;
  }

  _setBorderPosition(border, type) {
    border.position.y = this._mouseBodyPosition.y - MOUSE_CONFIG.size.y * 0.5 + MOUSE_AREA_BORDER_CONFIG.height * 0.5;

    const startPositionX = this._mouseBodyPosition.x;
    const startPositionZ = this._mouseBodyPosition.z;

    switch (type) {
      case AREA_BORDER_TYPE.Bottom:
        border.position.x = startPositionX;
        border.position.z = startPositionZ + MOUSE_CONFIG.movingArea.height * 0.5 + MOUSE_CONFIG.size.z * 0.5;
        break;

      case AREA_BORDER_TYPE.Top:
        border.position.x = startPositionX;
        border.position.z = startPositionZ - (MOUSE_CONFIG.movingArea.height * 0.5 + MOUSE_CONFIG.size.z * 0.5);
        break;

      case AREA_BORDER_TYPE.Left:
        border.position.x = startPositionX - (MOUSE_CONFIG.movingArea.width * 0.5 + MOUSE_CONFIG.size.x * 0.5);
        border.position.z = startPositionZ;
        break;

      case AREA_BORDER_TYPE.Right:
        border.position.x = startPositionX + MOUSE_CONFIG.movingArea.width * 0.5 + MOUSE_CONFIG.size.x * 0.5;
        border.position.z = startPositionZ;
        break;
    }
  }
}
