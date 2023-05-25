import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';

export default class LoadingOverlay extends THREE.Group {
  constructor() {
    super();

    this._overlayMaterial = null;

    this._init();
  }

  hide() {
    new TWEEN.Tween(this._overlayMaterial.uniforms.uAlpha)
      .to({ value: 0 }, 400)
      .easing(TWEEN.Easing.Linear.None)
      .start()
      .onComplete(() => {
        this.visible = false;
      });
  }

  _init() {
    const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    const overlayMaterial = this._overlayMaterial = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: { value: 1 },
      },
      vertexShader: `
        void main()
        {
          gl_Position = vec4(position, 0.5);
        }
      `,
      fragmentShader: `
        uniform float uAlpha;

        void main()
        {
          gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
      `,
    });

    const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial);
    this.add(overlay);
  }
}
