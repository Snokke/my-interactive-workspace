import * as THREE from "three";
import { AIR_CONDITIONER_CONFIG } from "../air-conditioner-config";
import SnowflakeParticles from "./snowflake-particles";
import { SNOWFLAKE_PARTICLES_CONFIG } from "./snowflake-particles-config";
import { SNOWFLAKE_PARTICLES_TYPE } from "./snowflake-particles-data";

export default class SnowflakeParticlesController extends THREE.Group {
  constructor() {
    super();

    this._particles = [];

    this._init();
  }

  update(dt) {
    if (dt > 0.1) {
      dt = 0.1;
    }

    this._particles.forEach((particles) => {
      particles.update(dt);
    });
  }

  show() {
    this._particles.forEach((particles) => {
      particles.show();
    });
  }

  hide() {
    this._particles.forEach((particles) => {
      particles.hide();
    });
  }

  _init() {
    this._initParticles();
    this._initDebug();
  }

  _initParticles() {
    for (const key in SNOWFLAKE_PARTICLES_TYPE) {
      const type = SNOWFLAKE_PARTICLES_TYPE[key];

      const snowflakeParticles = new SnowflakeParticles(type);
      this.add(snowflakeParticles);

      this._particles.push(snowflakeParticles);
    }
  }

  _initDebug() {
    if (SNOWFLAKE_PARTICLES_CONFIG.showDebugAlphaEdge) {
      const alphaEdgeSize = SNOWFLAKE_PARTICLES_CONFIG.alphaEdge;
      const alphaEdgeColor = 0x00ff00;
      this._initDebugPlanes(alphaEdgeSize, alphaEdgeColor);
    }
  }

  _initDebugPlanes(edgeSize, color) {
    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });

    const horizontalGeometry = new THREE.PlaneGeometry(edgeSize.x, AIR_CONDITIONER_CONFIG.doorWidth);
    const horizontalPlane = new THREE.Mesh(horizontalGeometry, material);
    this.add(horizontalPlane);

    horizontalPlane.rotation.x = Math.PI * 0.5;
    horizontalPlane.position.set(edgeSize.x * 0.5, -edgeSize.y, 0);

    const verticalGeometry = new THREE.PlaneGeometry(edgeSize.y, AIR_CONDITIONER_CONFIG.doorWidth);
    const verticalPlane = new THREE.Mesh(verticalGeometry, material);
    this.add(verticalPlane);

    verticalPlane.rotation.x = Math.PI * 0.5;
    verticalPlane.rotation.y = Math.PI * 0.5;
    verticalPlane.position.set(edgeSize.x, -edgeSize.y * 0.5, 0);
  }
}
