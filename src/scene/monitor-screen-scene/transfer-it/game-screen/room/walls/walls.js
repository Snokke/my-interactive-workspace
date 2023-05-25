import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import Utils from '../../../helpers/utils';
import { MessageDispatcher } from "black-engine";
import SimplePhysics from '../../../helpers/simple-physics';
import TWEEN from 'three/addons/libs/tween.module.js';
import Loader from '../../../../../../core/loader';

export default class Walls extends THREE.Group {
  constructor(floorSize, audioListener) {
    super();

    this.events = new MessageDispatcher();

    this._audioListener = audioListener;

    this._floorSize = floorSize;
    this._rightWall = null;
    this._leftWall = null;
    this._rightWallTween = null;
    this._leftWallTween = null;
    this._wallsBody = [];

    this._wallWidth = 0.4;
    this._startOffset = 20;

    this._init();
  }

  reset() {
    if (this._rightWallTween) {
      this._rightWallTween.stop();
    }

    if (this._leftWallTween) {
      this._leftWallTween.stop();
    }

    this.hide();
  }

  show() {
    this._playSound();
    this._rightWall.visible = true;
    this._rightWall.position.x = this._startOffset;
    const wallSize = Utils.getBoundingBox(this._rightWall);

    this._rightWallTween = new TWEEN.Tween(this._rightWall.position)
      .to({ x: this._floorSize.x / 2 + wallSize.x / 2 - 0.05 }, 300)
      .easing(TWEEN.Easing.Linear.None)
      .start()
      .onComplete(() => this._showLeftWall());
  }

  hide() {
    this._rightWall.visible = false;
    this._leftWall.visible = false;
  }

  getHeight() {
    const wallSize = Utils.getBoundingBox(this._rightWall);

    return wallSize.y;
  }

  getShowSoundAnalyser() {
    return this._showSoundAnalyzer;
  }

  onVolumeChanged(volume) {
    this._showSound.setVolume(volume);
  }

  _showLeftWall() {
    this._playSound();
    this._leftWall.visible = true;
    this._leftWall.position.z = -this._startOffset;
    const wallSize = Utils.getBoundingBox(this._leftWall);

    this._leftWallTween = new TWEEN.Tween(this._leftWall.position)
      .to({ z: -this._floorSize.z / 2 - wallSize.z / 2 + 0.07 }, 300)
      .easing(TWEEN.Easing.Linear.None)
      .start()
      .onComplete(() => this.events.post('shown'));
  }

  _init() {
    this._createWalls();
    this._createBody();
    this._initSounds();
  }

  _createWalls() {
    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
    });

    const leftWall = this._leftWall = this._createWall('transfer-it/left-wall', material);
    this.add(leftWall);

    const rightWall = this._rightWall = this._createWall('transfer-it/right-wall', material);
    this.add(rightWall);
  }

  _createWall(objectName, material) {
    const wall = Utils.createObject(objectName, material);

    const mesh = wall.getObjectByProperty('isMesh', true);
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    wall.position.y = -this._floorSize.y;
    wall.visible = false;

    return wall;
  }

  _createBody() {
    const wallSize = Utils.getBoundingBox(this._rightWall);

    for (let i = 0; i < 2; i += 1) {
      const body = this._createWallBody(i);
      this._wallsBody.push(body);

      body.position.y = wallSize.y / 2 - this._floorSize.y;
    }

    this._wallsBody[0].position.x = this._floorSize.x / 2 + this._wallWidth / 2;

    const axis = new CANNON.Vec3(0, 1, 0);
    const angle = Math.PI / 2;

    this._wallsBody[1].quaternion.setFromAxisAngle(axis, angle);
    this._wallsBody[1].position.z = -this._floorSize.z / 2 - this._wallWidth / 2;
  }

  _createWallBody(index) {
    const sizeScale = 0.5;
    const wallSize = Utils.getBoundingBox(this._rightWall);

    const body = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(this._wallWidth * sizeScale, wallSize.y * sizeScale, this._floorSize.z * sizeScale)),
    });

    SimplePhysics.addBody(body, null, `wall-${index}`);

    return body;
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
