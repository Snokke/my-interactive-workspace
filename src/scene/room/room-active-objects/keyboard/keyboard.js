import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { ROOM_CONFIG } from '../../data/room-config';
import { KEYBOARD_PART_TYPE } from './keyboard-data';
import vertexShader from './key-highlight-shaders/key-highlight-vertex.glsl';
import fragmentShader from './key-highlight-shaders/key-highlight-fragment.glsl';
import { KEYS_POSITION, KEYBOARD_CONFIG, KEY_HIGHLIGHT_CONFIG } from './keyboard-config';

export default class Keyboard extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._highlights = null;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const base = this._parts[KEYBOARD_PART_TYPE.Base];

      new TWEEN.Tween(base.position)
        .to({ y: base.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start()
        .onComplete(() => {
          this._debugMenu.enable();
          this._onShowAnimationComplete();
        });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    console.log('Keyboard click');
  }

  _init() {
    this._initParts();
    this._initHighlights();

    this._addMaterials();
    this._addPartsToScene();
    this._initDebugMenu();
    this._initSignals();
  }

  _addMaterials() {
    for (const partName in this._parts) {
      const part = this._parts[partName];
      const material = new THREE.MeshStandardMaterial({
        color: `hsl(${Math.random() * 360}, 80%, 50%)`,
        transparent: true,
        // opacity: 0.5,
      });

      part.material = material;
    }
  }

  _initHighlights() {
    this._initHighlightsInstanceMesh();
    this._setHighlightsPosition();
  }

  _initHighlightsInstanceMesh() {
    const size = KEY_HIGHLIGHT_CONFIG.size;
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      // depthWrite: false,
      // alphaTest: 0.9,
    });

    const highlightCount = KEYS_POSITION.length;
    const highlights = this._highlights = new THREE.InstancedMesh(geometry, material, highlightCount);
    this.add(highlights);
  }

  _setHighlightsPosition() {
    const base = this._parts[KEYBOARD_PART_TYPE.Base];

    this._highlights.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const dummy = new THREE.Object3D();

    const keyboardSize = KEYBOARD_CONFIG.size;
    const offsetLeft = KEYBOARD_CONFIG.offsetLeft;
    const offsetTop = KEYBOARD_CONFIG.offsetTop;

    const leftX = base.position.x - keyboardSize.x * 0.5 + offsetLeft;
    const heightY = base.position.y + keyboardSize.y * 0.5;
    const topZ = base.position.z - keyboardSize.z * 0.5 + offsetTop;

    const highlightCount = KEYS_POSITION.length;

    for (let i = 0; i < highlightCount; i += 1) {
      const highlightPosition = KEYS_POSITION[i].position;

      dummy.position.set(leftX + highlightPosition.x, heightY + highlightPosition.y, topZ - highlightPosition.z);
      dummy.rotation.x = -Math.PI * 0.5 + KEY_HIGHLIGHT_CONFIG.angle * THREE.MathUtils.DEG2RAD;
      dummy.updateMatrix();

      this._highlights.setMatrixAt(i, dummy.matrix);

      const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
      this._highlights.setColorAt(i, randomColor);
    }

    this._highlights.instanceMatrix.needsUpdate = true;
    this._highlights.instanceColor.needsUpdate = true;

    // const object = {
    //   value: 0,
    // }

    // new TWEEN.Tween(object)
    //     .to({ value: 1 }, 5000)
    //     .easing(TWEEN.Easing.Sinusoidal.Out)
    //     .start()
    //     .onUpdate(() => {
    //       const color = new THREE.Color().lerpColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), object.value);

    //       for (let i = 0; i < 10; i += 1) {
    //         highlight.setColorAt(i, color);
    //       }

    //       highlight.instanceColor.needsUpdate = true;
    //     });
  }

  _initSignals() {
    this._debugMenu.events.on('switchOn', () => {
      this.onClick();
    });
  }
}
