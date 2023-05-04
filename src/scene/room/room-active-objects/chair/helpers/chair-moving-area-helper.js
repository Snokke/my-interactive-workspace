import * as THREE from 'three';
import { CHAIR_CONFIG } from '../data/chair-config';
import { CHAIR_BOUNDING_BOX_TYPE, MOVING_AREA_TYPE } from '../data/chair-data';

export default class ChairMovingAreaHelper extends THREE.Group {
  constructor() {
    super();

    this._chairMainBoundingBox = null;
    this._chairFrontWheelBoundingBox = null;

    this._init();
  }

  updateVisibility() {
    this.visible = CHAIR_CONFIG.chairMoving.showMovingArea;
  }

  setChairPosition(position) {
    if (!CHAIR_CONFIG.chairMoving.showMovingArea) {
      return;
    }

    const mainMoundingBoxConfig = CHAIR_CONFIG.chairMoving.chairBoundingBox[CHAIR_BOUNDING_BOX_TYPE.Main];
    const frontWheelMoundingBoxConfig = CHAIR_CONFIG.chairMoving.chairBoundingBox[CHAIR_BOUNDING_BOX_TYPE.FrontWheel];

    this._chairMainBoundingBox.position.x = position.x + mainMoundingBoxConfig.center.x;
    this._chairMainBoundingBox.position.z = position.z + mainMoundingBoxConfig.center.y;

    this._chairFrontWheelBoundingBox.position.x = position.x + frontWheelMoundingBoxConfig.center.x;
    this._chairFrontWheelBoundingBox.position.z = position.z + frontWheelMoundingBoxConfig.center.y;
  }

  _init() {
    this._initChairBoundingBox();
    this._initArea();
    this._initLockerArea();

    this.visible = CHAIR_CONFIG.chairMoving.showMovingArea;
  }

  _initChairBoundingBox() {
    const boundingBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    this._chairMainBoundingBox = this._createBoundingBox(CHAIR_BOUNDING_BOX_TYPE.Main, boundingBoxMaterial);
    this._chairFrontWheelBoundingBox = this._createBoundingBox(CHAIR_BOUNDING_BOX_TYPE.FrontWheel, boundingBoxMaterial);
  }

  _createBoundingBox(type, material) {
    const boundingBoxConfig = CHAIR_CONFIG.chairMoving.chairBoundingBox[type];

    const geometry = new THREE.PlaneGeometry(boundingBoxConfig.size.x, boundingBoxConfig.size.y);
    const plane = new THREE.Mesh(geometry, material);
    this.add(plane);

    plane.rotation.x = -Math.PI * 0.5;
    plane.position.y = 0.12;

    return plane;
  }

  _initArea() {
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });

    this._initMovingArea(MOVING_AREA_TYPE.Main, material);
    this._initMovingArea(MOVING_AREA_TYPE.UnderTable, material);
  }

  _initMovingArea(type, material) {
    const areaConfig = CHAIR_CONFIG.chairMoving.movingArea[type];

    const geometry = new THREE.PlaneGeometry(areaConfig.size.x, areaConfig.size.y);
    const plane = new THREE.Mesh(geometry, material);
    this.add(plane);

    plane.rotation.x = -Math.PI * 0.5;
    plane.position.set(areaConfig.center.x, 0.1, areaConfig.center.y);
  }

  _initLockerArea() {
    const areaConfig = CHAIR_CONFIG.chairMoving.lockerArea;

    const geometry = new THREE.PlaneGeometry(areaConfig.size.x, areaConfig.size.y);
    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

    const plane = new THREE.Mesh(geometry, material);
    this.add(plane);

    plane.rotation.x = -Math.PI * 0.5;
    plane.position.set(areaConfig.center.x, 0.14, areaConfig.center.y);
  }
}
