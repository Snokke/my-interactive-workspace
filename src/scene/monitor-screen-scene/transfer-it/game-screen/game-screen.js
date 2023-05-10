import * as THREE from 'three';
import { MessageDispatcher } from "black-engine";
import Drone from './drone/drone';
import Target from './target/target';
import RobotCleaner from './robot-cleaner/robot-cleaner';
import GameScreenController from './game-screen-controller';
import Room from './room/room';
import GhostsController from './ghost/ghosts-controller';
import FurnitureController from './furniture/furniture-controller';
import UI from './ui/ui';

export default class GameScreen extends THREE.Group {
  constructor(camera) {
    super();

    this.events = new MessageDispatcher();

    this._camera = camera;
    this._target = null;
    this._drone = null;
    this._robotCleaner = null;
    this._furnitureController = null;

    this._cellSize = {};

    this._init();
  }

  startGame() {
    this._gameScreenController.showLoadingScreen();
    // this._gameScreenController.startGame();
  }

  stopGame() {
    this._gameScreenController.stopGame();
  }

  update(dt) {
    this._gameScreenController.update(dt);
  }

  onInputDown() {
    this._gameScreenController.onInputDown();
  }

  _init() {
    const room = this._room = this._createRoom();
    const furnitureController = this._furnitureController = new FurnitureController(this._room);
    const robotCleaner = this._robotCleaner = new RobotCleaner(this._room.getFloorSize());
    const ghostController = this._ghostController = this._createGhostController();
    const target = this._target = new Target(this._cellSize);
    const drone = this._drone = new Drone();
    const ui = this._ui = this._createUI();

    this.add(room, furnitureController, ghostController, target, drone, robotCleaner, ui);

    const data = {
      room,
      furnitureController,
      ghostController,
      target,
      drone,
      robotCleaner,
      ui,
    };

    this._gameScreenController = new GameScreenController(data);

    this._initSignals();
  }

  _initSignals() {
    this._gameScreenController.events.on('furnitureCollision', () => this.events.post('furnitureCollision'));
    this._gameScreenController.events.on('restart-level', () => this.events.post('restart-level'));
  }

  _createRoom() {
    const room = new Room();
    this._cellSize = room.getCellSize();

    return room;
  }

  _createGhostController() {
    const wallHeight = this._room.getWallHeight();

    return new GhostsController(wallHeight);
  }

  _createUI() {
    const ui = new UI();
    ui.quaternion.copy(this._camera.quaternion);
    ui.position.copy(this._camera.position);
    ui.translateZ(-1);

    return ui;
  }
}
