import * as THREE from 'three';
import Ghost from './ghost';
import RaycasterController from './raycaster-controller';

export default class GhostsController extends THREE.Group {
  constructor(wallHeight) {
    super();

    this._wallHeight = wallHeight;
    this._furniture = null;
    this._collideObjects = null;

    this._ghosts = [];
    this._raycasterController = null;

    this._init();
  }

  createGhosts(furniture) {
    this._furniture = furniture;
    this._ghosts = this._initGhosts();
  }

  setCollideObjects(collideObjects) {
    this._collideObjects = collideObjects;
    this._raycasterController.setCollideObjects(this._collideObjects);
  }

  showGhost(currentModelIndex) {
    const ghost = this._ghosts[currentModelIndex];
    ghost.show();

    this._raycasterController.setGhost(ghost);
    this._raycasterController.enable();
  }

  hideGhost(currentModelIndex) {
    this._ghosts[currentModelIndex].hide();
    this._raycasterController.disable();
  }

  killGhosts() {
    this._ghosts.forEach((ghost) => {
      this.remove(ghost);
    });

    this._ghosts = [];
  }

  update(dt, currentModelIndex) {
    const furniture = this._furniture[currentModelIndex];
    const ghost = this._ghosts[currentModelIndex];
    ghost.position.x = furniture.position.x;
    ghost.position.z = furniture.position.z;

    this._raycasterController.update(furniture, dt);
  }

  _init() {
    this._raycasterController = new RaycasterController(this._wallHeight);
  }

  _initGhosts() {
    const ghosts = [];

    const material = new THREE.MeshBasicMaterial({
      opacity: 0.5,
      transparent: true,
    });

    this._furniture.forEach((furniture) => {
      const ghost = new Ghost(furniture.modelConfig, material);
      this.add(ghost);

      ghost.position.y = ghost.size.y / 2;
      ghost.quaternion.copy(furniture.body.quaternion);

      ghosts.push(ghost);
    });

    return ghosts;
  }
}
