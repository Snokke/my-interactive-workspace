import * as THREE from 'three';
import Utils from '../../helpers/utils';
import TWEEN from 'three/addons/libs/tween.module.js';
import { DRONE_TYPE, DRONE_MODELS, DRONES } from './drone-config';
import Loader from '../../../../../core/loader';

export default class Drone extends THREE.Group {
  constructor() {
    super();

    this.size = null;
    this._propellers = [];
    this._drones = [];
    this._currentDrone = DRONE_TYPE.yellow;
    this._hideTween = null;

    this.visible = false;

    this._init();
  }

  update(dt) {
    const angularVelocity = 50;

    for (let i = 0; i < this._propellers.length; i += 1) {
      const propeller = this._propellers[i];
      propeller.rotation.y += angularVelocity * dt;
    }
  }

  reset() {
    this.visible = false;
    this._drones[0].visible = false;
    this._drones[1].visible = false;
    this._currentDrone = DRONE_TYPE.yellow;

    if (this._hideTween) {
      this._hideTween.stop();
    }
  }

  show() {
    if (this._currentDrone === DRONE_TYPE.yellow) {
      this._currentDrone = DRONE_TYPE.blue;
      this._drones[1].visible = true;
    } else {
      this._currentDrone = DRONE_TYPE.yellow;
      this._drones[0].visible = true;
    }

    this.visible = true;
  }

  hide() {
    this._hideTween = new TWEEN.Tween(this.position)
      .to({ y: 10 }, 500)
      .easing(TWEEN.Easing.Sinusoidal.In)
      .start();

    this._hideTween.onComplete(() => {
      this.visible = false;
      this._drones[0].visible = false;
      this._drones[1].visible = false;
    });
  }

  _init() {
    for (let i = 0; i < DRONES.length; i += 1) {
      const model = DRONE_MODELS[DRONES[i]];
      const drone = this._createDrone(model.modelName);
      this._drones.push(drone);
    }

    this.size = Utils.getBoundingBox(this);
  }

  _createDrone(modelName) {
    const view = Utils.createObject(modelName);

    const droneMaterial = new THREE.MeshLambertMaterial({
      vertexColors: true,
    });

    const propellerMaterial = new THREE.MeshBasicMaterial({
      map: Loader.assets['transfer-it/drone'],
      transparent: true,
    });

    let i = 0;
    view.traverse((child) => {
      if (child.isMesh) {
        const material = i === 0 ? droneMaterial : propellerMaterial;

        Utils.setObjectMaterial(child, material);

        child.castShadow = true;

        if (i !== 0) {
          this._propellers.push(child);
        }

        i += 1;
      }
    });

    this.add(view);
    view.visible = false;

    return view;
  }
}
