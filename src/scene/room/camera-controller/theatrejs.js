import * as THREE from 'three';
import { getProject, types } from '@theatre/core';
import { CAMERA_CONFIG } from './data/camera-config';
// import projectState from '../json/THREE js x Theatre js.theatre-project-state.json';

export default class TheatreJS extends THREE.Group {
  constructor(camera) {
    super();

    this._camera = camera;
    this._lookAtObject = null;

    this._init();
  }

  _init() {
    if (!CAMERA_CONFIG.theatreJs.studioEnabled) {
      return;
    }

    this._initLookAtObject();
    this._initProject();
  }

  _initLookAtObject() {
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = this._lookAtObject = new THREE.Mesh(geometry, material);
    this.add(sphere);
  }

  _initProject() {
    const project = getProject('Camera animation');
    // const project = getProject('THREE.js x Theatre.js', { state: projectState });

    // project.ready.then(() => sheet.sequence.play({ iterationCount: Infinity }));

    const sheet = project.sheet('Animated scene');

    const cameraObject = sheet.object('Camera', {
      // rotation: types.compound({
      //   x: types.number(this._camera.rotation.x, { range: [-Math.PI, Math.PI] }),
      //   y: types.number(this._camera.rotation.y, { range: [-Math.PI, Math.PI] }),
      //   z: types.number(this._camera.rotation.z, { range: [-Math.PI, Math.PI] }),
      // }),
      position: types.compound({
        x: types.number(this._camera.position.x, { range: [-20, 20] }),
        y: types.number(this._camera.position.y, { range: [-20, 20] }),
        z: types.number(this._camera.position.z, { range: [-20, 20] }),
      }),
      lookAt: types.compound({
        x: types.number(this._lookAtObject.position.x, { range: [-20, 20] }),
        y: types.number(this._lookAtObject.position.y, { range: [-20, 20] }),
        z: types.number(this._lookAtObject.position.z, { range: [-20, 20] }),
      }),
    });

    // cameraObject.initialValue = { position: { x: 0, y: 10, z: 0 } };

    cameraObject.onValuesChange((values) => {
      // const rotation = values.rotation;
      // this._camera.rotation.set(rotation.x, rotation.y, rotation.z);

      const position = values.position;
      this._camera.position.set(position.x, position.y, position.z);

      const lookAt = values.lookAt;
      this._lookAtObject.position.set(lookAt.x, lookAt.y, lookAt.z);
      this._camera.lookAt(this._lookAtObject.position);
    });
  }
}
