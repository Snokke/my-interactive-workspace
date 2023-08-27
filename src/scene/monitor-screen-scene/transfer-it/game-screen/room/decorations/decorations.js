import * as THREE from 'three';
import Utils from '../../../helpers/utils';
import { MessageDispatcher, MathEx } from "black-engine";
import WALL_TYPE from '../walls/wall-config';
import { CARPET_CONFIG, PICTURE_CONFIG } from './decorations-config';
import { ROOM_TYPE, ROOM_CONFIG } from '../room-config';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import TransferItLoader from '../../../loader/transfer-it-loader';

export default class Decorations extends THREE.Group {
  constructor(floorSize) {
    super();

    this.events = new MessageDispatcher();

    this._floorSize = floorSize;

    this._carpet = null;
    this._pictures = [];
    this._roomType = ROOM_TYPE.SMALL;
    this._config = ROOM_CONFIG[this._roomType].decorations;

    this._init();
  }

  show() {
    this.visible = true;

    this._showCarpet();
    this._showPictures();
  }

  hide() {
    this.visible = false;
  }

  reset() {
    this._pictures.forEach((picture) => {
      if (picture.placement === WALL_TYPE.right) {
        picture.rotation.x = 0;
      } else {
        picture.rotation.z = -Math.PI / 2;
        picture.rotation.x = Math.PI / 2;
        picture.rotation.y = Math.PI / 2;
      }
    });
  }

  bouncePictures() {
    const bounceTime = 110;
    const maxBounceAngle = 10;
    const angle = Math.random() * maxBounceAngle * (Math.random() < 0.5 ? -1 : 1);

    this._pictures.forEach((picture) => {
      new TWEEN.Tween(picture.position)
        .to({ y: picture.position.y + 0.3 }, bounceTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .yoyo(true)
        .repeat(1)
        .start();

      if (picture.placement === WALL_TYPE.right) {
        new TWEEN.Tween(picture.rotation)
          .to({ x: MathEx.DEG2RAD * angle }, bounceTime)
          .easing(TWEEN.Easing.Sinusoidal.In)
          .start();
      } else {
        new TWEEN.Tween(picture.rotation)
          .to({ y: Math.PI / 2 + MathEx.DEG2RAD * angle }, bounceTime)
          .easing(TWEEN.Easing.Sinusoidal.In)
          .start();
      }
    });
  }

  _showCarpet() {
    this._carpet.visible = true;
    this._carpet.scale.set(0, 0.01, 0);

    new TWEEN.Tween(this._carpet.scale)
      .to({ x: 0.01, z: 0.01 }, 400)
      .easing(TWEEN.Easing.Back.Out)
      .start();
  }

  _showPictures() {
    const delayDelta = 150;
    let delay = 0;

    this._pictures.forEach((picture, i) => {
      picture.visible = true;
      picture.scale.set(0.01, 0, 0);

      new TWEEN.Tween(picture.scale)
        .to({ y: [0.017, 0.01], z: [0.017, 0.01] }, 400)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .delay(delay)
        .start()
        .onComplete(() => {
          if (i === this._pictures.length - 1) {
            this.events.post('shown');
          }
        });

      delay += delayDelta;
    });
  }

  _init() {
    this._createCarpet();
    this._createPictures();
  }

  _createPictures() {
    for (let i = 0; i < this._config.pictures.length; i += 1) {
      const pictureConfig = this._config.pictures[i];
      const picture = this._createPicture(pictureConfig);
      this._pictures.push(picture);
    }
  }

  _createCarpet() {
    const carpetConfig = this._config.carpet;
    const frameName = CARPET_CONFIG[carpetConfig.type].texture;
    const texture = TransferItLoader.assets[frameName];

    const material = new THREE.MeshLambertMaterial({
      map: texture,
    });

    const carpet = this._carpet = Utils.createObject('transfer-it/carpet', material);

    const mesh = carpet.getObjectByProperty('isMesh', true);
    mesh.receiveShadow = true;

    this.add(carpet);

    carpet.position.y = 0.01;
    carpet.position.x = carpetConfig.position.x;
    carpet.position.z = carpetConfig.position.z;
    carpet.rotation.y = MathEx.DEG2RAD * carpetConfig.angle;

    carpet.visible = false;
  }

  _createPicture(config) {
    const picture = Utils.createObject('transfer-it/picture');
    const frameName = PICTURE_CONFIG[config.type].texture;

    const texture = TransferItLoader.assets[frameName];
    texture.center.set(0.5, 0.5);
    texture.rotation = Math.PI;

    const materials = [
      new THREE.MeshLambertMaterial({
        vertexColors: true,
      }),
      new THREE.MeshLambertMaterial({
        map: texture,
      }),
    ];

    let i = 0;
    picture.traverse((child) => {
      if (child.isMesh) {
        Utils.setObjectMaterial(child, materials[i]);

        child.castShadow = true;
        child.receiveShadow = true;

        i += 1;
      }
    });

    picture.placement = config.placement;
    picture.position.y = config.position.y;

    if (config.placement === WALL_TYPE.right) {
      picture.position.x = this._floorSize.x / 2 - 0.04;
      picture.position.z = config.position.x;
    } else {
      picture.position.x = config.position.x;
      picture.position.z = -this._floorSize.z / 2 + 0.04;

      picture.rotation.z = -Math.PI / 2;
      picture.rotation.x = Math.PI / 2;
      picture.rotation.y = Math.PI / 2;
    }

    this.add(picture);
    picture.visible = false;

    return picture;
  }
}
