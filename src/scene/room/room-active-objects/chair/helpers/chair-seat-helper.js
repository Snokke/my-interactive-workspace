import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { CHAIR_CONFIG } from '../data/chair-config';

export default class ChairSeatHelper extends THREE.Group {
  constructor() {
    super();

    this._availableAngleView = null;
    this._availableAngleGeometry = null;
    this._unavailableAngleView = null;
    this._unavailableAngleGeometry = null;
    this._currentAngleView = null;

    this._radius = 1.7;
    this._helperY = 3.6;

    this._init();
  }

  updateVisibility() {
    this.visible = CHAIR_CONFIG.seatRotation.showSeatHelper;
  }

  setChairPosition(position) {
    if (!CHAIR_CONFIG.seatRotation.showSeatHelper) {
      return;
    }

    this._availableAngleView.position.x = position.x;
    this._availableAngleView.position.z = position.z;

    this._unavailableAngleView.position.x = position.x;
    this._unavailableAngleView.position.z = position.z;

    this._currentAngleView.position.x = position.x;
    this._currentAngleView.position.z = position.z;
  }

  updateSeatAngle(angle) {
    this._currentAngleView.rotation.y = angle + Math.PI * 0.5;
  }

  setAvailableAngle(angle) {
    if (!CHAIR_CONFIG.seatRotation.showSeatHelper) {
      return;
    }

    if (angle === Math.PI * 2) {
      angle = 0;
    }

    this._createAvailableAngleGeometry(angle);

    if (angle === 0) {
      this._unavailableAngleView.visible = false;
    } else {
      this._unavailableAngleView.visible = true;
      this._createUnavailableAngleGeometry(angle);
    }
  }

  _createAvailableAngleGeometry(angle) {
    this._availableAngleGeometry.dispose();

    const startAngle = angle * 0.5;
    const endAngle = Math.PI * 2 - angle;

    const availableAngleGeometry = this._availableAngleGeometry = new THREE.CircleGeometry(this._radius, 30, startAngle, endAngle);
    this._availableAngleView.geometry = availableAngleGeometry;
  }

  _createUnavailableAngleGeometry(angle) {
    this._unavailableAngleGeometry.dispose();

    const startAngle = -angle * 0.5;
    const endAngle = angle;

    const unavailableAngleGeometry = this._unavailableAngleGeometry = new THREE.CircleGeometry(this._radius, 30, startAngle, endAngle);
    this._unavailableAngleView.geometry = unavailableAngleGeometry;
  }

  _init() {
    this._initAvailableAngleView();
    this._initUnavailableAngleView();
    this._initCurrentAngleView();
    this._initTableEdgeView();

    this.visible = CHAIR_CONFIG.seatRotation.showSeatHelper;
  }

  _initAvailableAngleView() {
    const geometry = this._availableAngleGeometry = new THREE.CircleGeometry(CHAIR_CONFIG.seatRotation.rotationRadius, 20, 0, Math.PI * 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5,
    });

    const availableAngleView = this._availableAngleView = new THREE.Mesh(geometry, material);
    this.add(availableAngleView);

    availableAngleView.rotation.x = -Math.PI * 0.5;
    availableAngleView.position.y = this._helperY;
    availableAngleView.rotation.z = Math.PI * 0.5;
  }

  _initUnavailableAngleView() {
    const geometry = this._unavailableAngleGeometry = new THREE.CircleGeometry(CHAIR_CONFIG.seatRotation.rotationRadius, 20, 0, 0);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.5,
    });

    const unavailableAngleView = this._unavailableAngleView = new THREE.Mesh(geometry, material);
    this.add(unavailableAngleView);

    unavailableAngleView.rotation.x = -Math.PI * 0.5;
    unavailableAngleView.position.y = this._helperY;
    unavailableAngleView.rotation.z = Math.PI * 0.5;
  }

  _initCurrentAngleView() {
    const currentAngleView = this._currentAngleView = new THREE.Group();
    this.add(currentAngleView);

    const leftAngleView = this._initTriangleView(CHAIR_CONFIG.seatRotation.seatWidthAngle * 0.5 * THREE.MathUtils.DEG2RAD);
    const rightAngleView = this._initTriangleView(-CHAIR_CONFIG.seatRotation.seatWidthAngle * 0.5 * THREE.MathUtils.DEG2RAD);

    currentAngleView.add(leftAngleView, rightAngleView);
    currentAngleView.position.y = this._helperY;
    currentAngleView.rotation.y = Math.PI * 0.5;
  }

  _initTriangleView(additionalAngle) {
    const height = 2;

    const triangleShape = new THREE.Shape();

    triangleShape.lineTo(0, 0);
    triangleShape.moveTo(this._radius, 0);
    triangleShape.lineTo(0, height);
    triangleShape.lineTo(0, 0);

    const geometry = new THREE.ShapeGeometry(triangleShape);
    geometry.translate(-this._radius, 0, 0);

    const material = new THREE.MeshBasicMaterial({
      color: 0x0000ff,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const triangle = new THREE.Mesh(geometry, material);
    this.add(triangle);

    triangle.rotation.y =  additionalAngle;

    return triangle;
  }

  _initTableEdgeView() {
    const geometry = new THREE.PlaneGeometry(8, 0.4);
    const material = new THREE.MeshBasicMaterial({
      color: 0xaa0000,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const tableEdgeView = new THREE.Mesh(geometry, material);
    this.add(tableEdgeView);

    tableEdgeView.position.y = this._helperY;
    tableEdgeView.position.z = CHAIR_CONFIG.seatRotation.tableEdgeZ;
  }
}
