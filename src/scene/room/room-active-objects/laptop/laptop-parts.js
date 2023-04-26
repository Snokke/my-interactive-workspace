import * as THREE from 'three';
import { LAPTOP_PART_TYPE, LAPTOP_SCREEN_MUSIC_PARTS } from './data/laptop-data';
import { LAPTOP_CONFIG, LAPTOP_MOUNT_CONFIG } from './data/laptop-config';

export default class LaptopParts extends THREE.Group {
  constructor(parts) {
    super();

    this._parts = parts;

    this._armWithLaptopGroup = null;
    this._laptopTopGroup = null;

    this._init();
  }

  getArmWithLaptopGroup() {
    return this._armWithLaptopGroup;
  }

  getLaptopTopGroup() {
    return this._laptopTopGroup;
  }

  _init() {
    this._initArmWithLaptopGroup();
    this._initLaptopTopGroup();
  }

  _initArmWithLaptopGroup() {
    const armWithLaptopGroup = this._armWithLaptopGroup = new THREE.Group();

    const armMountArm02 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm02];
    const laptopMount = this._parts[LAPTOP_PART_TYPE.LaptopMount];
    const laptopStand = this._parts[LAPTOP_PART_TYPE.LaptopStand];
    const laptopKeyboard = this._parts[LAPTOP_PART_TYPE.LaptopKeyboard];
    const laptopKeyboardSymbols = this._parts[LAPTOP_PART_TYPE.LaptopKeyboardSymbols];

    armWithLaptopGroup.add(armMountArm02, laptopMount, laptopStand, laptopKeyboard, laptopKeyboardSymbols);

    const startPosition = armMountArm02.userData.startPosition.clone();

    armWithLaptopGroup.position.copy(startPosition);
    laptopMount.position.sub(startPosition);
    laptopStand.position.sub(startPosition);
    laptopKeyboard.position.sub(startPosition);
    laptopKeyboardSymbols.position.sub(startPosition);

    armMountArm02.position.set(0, 0, 0);

    armWithLaptopGroup.rotation.y = LAPTOP_MOUNT_CONFIG.startAngle * THREE.MathUtils.DEG2RAD;
    LAPTOP_MOUNT_CONFIG.angle = LAPTOP_MOUNT_CONFIG.startAngle;
  }

  _initLaptopTopGroup() {
    const laptopTopGroup = this._laptopTopGroup = new THREE.Group();
    this._armWithLaptopGroup.add(laptopTopGroup);

    const maxAngleRad = LAPTOP_CONFIG.maxOpenAngle * THREE.MathUtils.DEG2RAD;
    const laptopMonitor = this._parts[LAPTOP_PART_TYPE.LaptopMonitor];
    const laptopScreen = this._parts[LAPTOP_PART_TYPE.LaptopScreen];
    const armMountArm02 = this._parts[LAPTOP_PART_TYPE.LaptopArmMountArm02];
    const screenMusic01 = this._parts[LAPTOP_PART_TYPE.LaptopScreenMusic01];
    const screenMusic02 = this._parts[LAPTOP_PART_TYPE.LaptopScreenMusic02];
    const screenMusic03 = this._parts[LAPTOP_PART_TYPE.LaptopScreenMusic03];

    const startPosition = armMountArm02.userData.startPosition.clone();

    laptopTopGroup.add(laptopMonitor, laptopScreen, screenMusic01, screenMusic02, screenMusic03);

    this._setMusicButtonsPositions();

    laptopTopGroup.rotation.x = -maxAngleRad;
    laptopTopGroup.position.copy(laptopMonitor.position.clone());

    laptopMonitor.position.set(0, 0, 0);
    laptopMonitor.rotation.set(0, 0, 0);
    laptopScreen.position.set(0, 0, 0);
    laptopScreen.rotation.set(0, 0, 0);

    laptopTopGroup.position.sub(startPosition);

    LAPTOP_CONFIG.angle = LAPTOP_CONFIG.maxOpenAngle;
  }

  _setMusicButtonsPositions() {
    const laptopScreen = this._parts[LAPTOP_PART_TYPE.LaptopScreen];
    const maxAngleRad = LAPTOP_CONFIG.maxOpenAngle * THREE.MathUtils.DEG2RAD;

    LAPTOP_SCREEN_MUSIC_PARTS.forEach((partType) => {
      const part = this._parts[partType];
      const musicPosition = part.position.clone().sub(laptopScreen.position.clone());

      part.rotation.set(0, 0, 0);
      part.position.set(0, 0, 0);

      part.translateOnAxis(new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), maxAngleRad), musicPosition.x);
      part.translateOnAxis(new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), maxAngleRad), musicPosition.y);
      part.translateOnAxis(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(1, 0, 0), maxAngleRad), musicPosition.z);
    });
  }
}
