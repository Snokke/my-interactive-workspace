import * as THREE from 'three';
import { getProject, types } from '@theatre/core';
import projectState from './data/intro.theatre-project-state.json';
import { MessageDispatcher } from 'black-engine';
import { THEATRE_JS_CONFIG } from './data/theatre-js-config';

export default class TheatreJS extends THREE.Group {
  constructor(camera) {
    super();

    this.events = new MessageDispatcher();

    this._camera = camera;

    this._lookAtObject = null;
    this._introProject = null;

    this._previousSequencePosition = 0;

    this._init();
  }

  update(dt) { // eslint-disable-line no-unused-vars
    const sheet = this._introProject.sheet(THEATRE_JS_CONFIG.sheetName);

    if (sheet.sequence.position !== this._previousSequencePosition) {
      THEATRE_JS_CONFIG.sequencePosition = sheet.sequence.position;
      this.events.post('onSequencePositionChanged');
    }

    this._previousSequencePosition = sheet.sequence.position;
  }

  startAnimation() {
    const sheet = this._introProject.sheet(THEATRE_JS_CONFIG.sheetName);
    this._introProject.ready.then(() => {
      sheet.sequence.play({
        rate: THEATRE_JS_CONFIG.rate,
      })
        .then(() => this.events.post('onIntroFinished'));
    });
  }

  stopAnimation() {
    const sheet = this._introProject.sheet(THEATRE_JS_CONFIG.sheetName);
    sheet.sequence.position = 0;
  }

  _init() {
    this._initLookAtObject();
    this._initProject();
  }

  _initLookAtObject() {
    const geometry = new THREE.SphereGeometry(0.1, 6, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const lookAtObject = this._lookAtObject = new THREE.Mesh(geometry, material);
    this.add(lookAtObject);

    lookAtObject.visible = false;

    if (THEATRE_JS_CONFIG.studioEnabled) {
      lookAtObject.visible = true;
    }
  }

  _initProject() {
    let introProject;

    if (THEATRE_JS_CONFIG.studioEnabled) {
      introProject = this._introProject = getProject(THEATRE_JS_CONFIG.projectName);
    } else {
      introProject = this._introProject = getProject(THEATRE_JS_CONFIG.projectName, { state: projectState });
    }

    const sheet = introProject.sheet(THEATRE_JS_CONFIG.sheetName);

    const cameraObject = sheet.object('Camera', {
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

    cameraObject.onValuesChange((values) => {
      const position = values.position;
      this._camera.position.set(position.x, position.y, position.z);

      const lookAt = values.lookAt;
      this._lookAtObject.position.set(lookAt.x, lookAt.y, lookAt.z);
      this._camera.lookAt(this._lookAtObject.position);
    });
  }
}



// rotation: types.compound({
//   x: types.number(this._camera.rotation.x, { range: [-Math.PI, Math.PI] }),
//   y: types.number(this._camera.rotation.y, { range: [-Math.PI, Math.PI] }),
//   z: types.number(this._camera.rotation.z, { range: [-Math.PI, Math.PI] }),
// }),

    // const rotation = values.rotation;
// this._camera.rotation.set(rotation.x, rotation.y, rotation.z);
