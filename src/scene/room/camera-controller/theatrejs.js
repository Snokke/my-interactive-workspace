import * as THREE from 'three';
import { getProject, types } from '@theatre/core';
import { CAMERA_CONFIG } from './data/camera-config';
// import projectState from '../json/THREE js x Theatre js.theatre-project-state.json';

export default class TheatreJS extends THREE.Group {
  constructor(camera) {
    super();

    this._camera = camera;

    this._init();
  }

  _init() {
    if (!CAMERA_CONFIG.theatreJs.studioEnabled) {
      return;
    }

    const project = getProject('Camera animation');
    // const project = getProject('THREE.js x Theatre.js', { state: projectState });

    project.ready.then(() => sheet.sequence.play({ iterationCount: Infinity }));

    const sheet = project.sheet('Animated scene');

    const torusKnotObj = sheet.object('Camera', {
      rotation: types.compound({
        x: types.number(this._camera.rotation.x, { range: [-2, 2] }),
        y: types.number(this._camera.rotation.y, { range: [-2, 2] }),
        z: types.number(this._camera.rotation.z, { range: [-2, 2] }),
      }),
    });


    torusKnotObj.onValuesChange((values) => {
      const { x, y, z } = values.rotation;

      this._camera.rotation.set(x * Math.PI, y * Math.PI, z * Math.PI);
    })
  }
}
