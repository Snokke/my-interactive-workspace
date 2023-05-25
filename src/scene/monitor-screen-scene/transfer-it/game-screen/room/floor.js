import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import Utils from '../../helpers/utils';
import { MessageDispatcher } from "black-engine";
import SimplePhysics from '../../helpers/simple-physics';
import { ROOM_TYPE, ROOM_CONFIG } from './room-config';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Loader from '../../../../../core/loader';

export default class Floor extends THREE.Group {
  constructor(audioListener) {
    super();

    this.events = new MessageDispatcher();

    this._audioListener = audioListener;

    this._floor = null;
    this._bottomFloor = null;
    this._showTween = null;
    this._cellSize = {};

    this._roomType = ROOM_TYPE.SMALL;

    this._init();
  }

  reset() {
    if (this._showTween) {
      this._showTween.stop();
    }

    this.hide();
  }

  show() {
    this._floor.visible = true;
    this._bottomFloor.visible = true;
    this.body.position.y = -40;
    this._playSound();

    this._showTween = new TWEEN.Tween(this.body.position)
      .to({ y: -(this.size.y / 2) }, 300)
      .easing(TWEEN.Easing.Sinusoidal.Out)
      .start()
      .onComplete(() => this.events.post('shown'));
  }

  hide() {
    this._floor.visible = false;
    this._bottomFloor.visible = false;
  }

  getCellSize() {
    return this._cellSize;
  }

  getPositionByGrid(gridX, gridZ) {
    const x = -(this.size.x / 2) + (gridX * this._cellSize.depth) + this._cellSize.depth / 2;
    const z = -(this.size.z / 2) + (gridZ * this._cellSize.width) + this._cellSize.width / 2;
    return { x, z };
  }

  getShowSoundAnalyser() {
    return this._showSoundAnalyzer;
  }

  onVolumeChanged(volume) {
    this._showSound.setVolume(volume);
  }

  _calculateCellSize() {
    this._cellSize = {
      depth: this.size.x / ROOM_CONFIG[this._roomType].depth,
      width: this.size.z / ROOM_CONFIG[this._roomType].width,
    };
  }

  _init() {
    this._createFloor();
    this._createBottomFloor();
    this._createBody();
    this._calculateCellSize();
    this._initSounds();
  }

  _createFloor() {
    const texture = Loader.assets['transfer-it/floor-texture'];
    const material = new THREE.MeshLambertMaterial({ map: texture });
    const floor = Utils.createObject('transfer-it/floor', material);

    const mesh = this._floor = floor.getObjectByProperty('isMesh', true);
    mesh.receiveShadow = true;

    this.size = Utils.getBoundingBox(this._floor);

    this.add(floor);
  }

  _createBottomFloor() {
    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
    });

    const bottomFloor = this._bottomFloor = Utils.createObject('transfer-it/bottom_floor', material);

    const mesh = bottomFloor.getObjectByProperty('isMesh', true);
    mesh.receiveShadow = true;

    this.add(bottomFloor);
  }

  _createBody() {
    const sizeScale = 0.5;

    const body = this.body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(this.size.x * sizeScale, this.size.y * sizeScale, this.size.z * sizeScale)),
    });

    SimplePhysics.addBody(body, this, 'floor');

    body.position.y = -(this.size.y / 2);

    const bottomFloorSize = Utils.getBoundingBox(this._bottomFloor);
    this._bottomFloor.position.y = -(this.size.y / 2) - (bottomFloorSize.y / 2);
    this._bottomFloor.position.x = (bottomFloorSize.x - this.size.x) / 2;
    this._bottomFloor.position.z = -(bottomFloorSize.z - this.size.z) / 2;
  }

  _playSound() {
    if (this._showSound.isPlaying) {
      this._showSound.stop();
    }

    this._showSound.play();
  }

  _initSounds() {
    const showSound = this._showSound = new THREE.PositionalAudio(this._audioListener);
    this.add(showSound);

    showSound.setRefDistance(10);

    this._showSoundAnalyzer = new THREE.AudioAnalyser(showSound, 128);

    Loader.events.on('onAudioLoaded', () => {
      this._showSound.setBuffer(Loader.assets['transfer-it/whoosh']);
    });
  }
}
