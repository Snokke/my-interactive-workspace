import * as THREE from "three";
import RoomInactiveObjectAbstract from "../../room-inactive-object-abstract";
import vertexShader from './mix-textures-bitmap-shaders/mix-textures-bitmap-vertex.glsl';
import fragmentShader from './mix-textures-bitmap-shaders/mix-textures-bitmap-fragment.glsl';
import Loader from "../../../../../core/loader";
import { CALENDAR_CONFIG } from "./calendar-config";

export default class Calendar extends RoomInactiveObjectAbstract {
  constructor(roomScene, roomObjectType) {
    super(roomScene, roomObjectType);

    this._bitmap = null;
    this._calendarTexture = null;

    this._init();
  }

  onLightPercentChange(lightPercent) {
    this._mesh.material.uniforms.uMixPercent.value = lightPercent;
  }

  _init() {
    this._initCalendarMaterial();
    this._drawCalendar();
  }

  _initCalendarMaterial() {
    const bitmap = this._bitmap = document.createElement('canvas');
    bitmap.width = CALENDAR_CONFIG.canvasSize.width * CALENDAR_CONFIG.canvasResolution;
    bitmap.height = CALENDAR_CONFIG.canvasSize.height * CALENDAR_CONFIG.canvasResolution;

    const bitmapTexture = this._bitmapTexture = new THREE.Texture(bitmap);
    bitmapTexture.flipY = false;

    const bakedTextureLightOn = Loader.assets['baked-calendar'];
    bakedTextureLightOn.flipY = false;

    const bakedTextureLightOff = Loader.assets['baked-calendar-light-off'];
    bakedTextureLightOff.flipY = false;

    const material = new THREE.ShaderMaterial({
      uniforms:
      {
        uTexture01: { value: bakedTextureLightOff },
        uTexture02: { value: bakedTextureLightOn },
        uBitmapTexture: { value: bitmapTexture },
        uMixPercent: { value: 1 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    this._mesh.material = material;
  }

  _drawCalendar() {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('en-us', { month: 'long' });
    const year = date.getFullYear();

    const context = this._bitmap.getContext('2d');
    context.clearRect(0, 0, this._bitmap.width, this._bitmap.height);

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = CALENDAR_CONFIG.textColor;

    context.font = `12px Arial`;
    context.fillText(month, this._bitmap.width * 0.5, this._bitmap.height * 0.18);

    context.font = `50px Arial`;
    context.fillText(`${day}`, this._bitmap.width * 0.5, this._bitmap.height * 0.53);

    context.beginPath();
    context.moveTo(this._bitmap.width * 0.1, this._bitmap.height * 0.8);
    context.lineTo(this._bitmap.width * 0.9, this._bitmap.height * 0.8);
    context.stroke();

    context.font = `11px Arial`;
    context.fillText(`${year}`, this._bitmap.width * 0.5, this._bitmap.height * 0.9);

    this._bitmapTexture.needsUpdate = true;
  }
}
