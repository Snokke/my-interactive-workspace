import * as THREE from "three";
import RoomInactiveObjectAbstract from "../room-inactive-object-abstract";

export default class Calendar extends RoomInactiveObjectAbstract {
  constructor(roomScene, roomObjectType) {
    super(roomScene, roomObjectType);

    this._bitmap = null;
    this._calendarTexture = null;

    this._size = { width: 400, height: 660 };
    this._resolution = 0.2;

    this._initCalendarBitmap();
    this._loadTexture();
  }

  _initCalendarBitmap() {
    const bitmap = this._bitmap = document.createElement('canvas');
    bitmap.width = this._size.width * this._resolution;
    bitmap.height = this._size.height * this._resolution;

    const texture = new THREE.Texture(bitmap);
    texture.flipY = false;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    this._mesh.material = material;
  }

  _loadTexture() {
    const calendarTexture = this._calendarTexture = new Image();
    calendarTexture.src = '/textures/baked-calendar.jpg';

    calendarTexture.onload = () => this._drawCalendar();
  }

  _drawCalendar() {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('en-us', { month: 'long' });
    const year = date.getFullYear();

    const context = this._bitmap.getContext('2d');
    context.clearRect(0, 0, this._bitmap.width, this._bitmap.height);

    context.drawImage(this._calendarTexture, 0, 0, this._bitmap.width, this._bitmap.height);

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#000000';

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

    this._mesh.material.map.needsUpdate = true;
  }
}
