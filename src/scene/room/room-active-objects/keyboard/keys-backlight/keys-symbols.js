import * as THREE from 'three';
import Loader from '../../../../../core/loader';
import vertexShader from './keys-symbols-shaders/keys-symbols-vertex.glsl';
import fragmentShader from './keys-symbols-shaders/keys-symbols-fragment.glsl';

export default class KeysSymbols extends THREE.Group {
  constructor() {
    super();

    this._view = null;
    this._count = 4;

    this._init();
  }

  _init() {
    this._initInstanceMesh();
    this._setPositionsAndColors();
  }

  _initInstanceMesh() {
    const texture = Loader.assets['keyboard-keys-atlas'];

    const geometry = new THREE.PlaneGeometry();
    const instancedGeometry = new THREE.InstancedBufferGeometry().copy(geometry);

    const atlasRowsCount = 10;
    const uvOffset = new Float32Array(this._count * 2);

    for (let i = 0; i < this._count; ++i) {
      uvOffset[i * 2 + 0] = i / atlasRowsCount;
      uvOffset[i * 2 + 1] = 0;
    }

    instancedGeometry.setAttribute("uvOffset", new THREE.InstancedBufferAttribute(uvOffset, 2));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uAtlasSize: { value: atlasRowsCount },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // transparent: true,
      // depthWrite: false,
    });

    const view = this._view = new THREE.InstancedMesh(instancedGeometry, material, this._count);
    this.add(view);
  }

  _setPositionsAndColors() {
    this._view.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();

    for (let i = 0; i < this._count; i += 1) {
      dummy.position.set(i * 1.3, 0.5, 0);
      dummy.rotation.x = -Math.PI * 0.5;

      dummy.updateMatrix();

      this._view.setMatrixAt(i, dummy.matrix);

      const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
      this._view.setColorAt(i, randomColor);
    }

    this._view.instanceMatrix.needsUpdate = true;
    this._view.instanceColor.needsUpdate = true;
  }
}
