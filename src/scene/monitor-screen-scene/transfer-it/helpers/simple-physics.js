import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import TRANSFER_IT_DEBUG_CONFIG from '../configs/transfer-it-debug-config';

export default class SimplePhysics {
  constructor(scene, gravity, timeStep = 1 / 60, maxSubSteps = 3) {
    this._scene = scene;

    this.world = new CANNON.World();
    this.world.solver.iterations = 2;

    this._phyFixedTimeStep = timeStep;
    this._maxPhySubSteps = maxSubSteps;
    this._bodies = [];

    this.world.gravity.set(gravity.x, gravity.y, gravity.z);
    SimplePhysics.instance = this;

    this._initCannonDebugger();
  }

  addBody(body, mesh, tag) {
    body.tag = tag;
    body.mesh = mesh;
    this._bodies.push({ body, mesh });
    this.world.addBody(body);
  }

  removeBody(body) {
    this.world.removeBody(body);
  }

  reset() {
    this._bodies.forEach(({ body }) => this.removeBody(body));
    this._bodies.splice(0);
  }

  update(dt) {
    this.world.step(this._phyFixedTimeStep, dt, this._maxPhySubSteps);

    for (let i = 0; i < this._bodies.length; i++) {
      const mesh = this._bodies[i].mesh;
      const body = this._bodies[i].body;

      if (mesh) {
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
      }
    }

    if (TRANSFER_IT_DEBUG_CONFIG.cannonDebugger) {
      this._cannonDebugger.update();
    }
  }

  resetBody(body) {
    body.position.setZero();
    body.previousPosition.setZero();
    body.interpolatedPosition.setZero();
    body.initPosition.setZero();

    // orientation
    body.quaternion.set(0, 0, 0, 1);
    body.initQuaternion.set(0, 0, 0, 1);
    body.interpolatedQuaternion.set(0, 0, 0, 1);

    // Velocity
    body.velocity.setZero();
    body.initVelocity.setZero();
    body.angularVelocity.setZero();
    body.initAngularVelocity.setZero();

    // Force
    body.force.setZero();
    body.torque.setZero();

    // Sleep state reset
    body.sleepState = 0;
    body.timeLastSleepy = 0;
    body._wakeUpAfterNarrowphase = false;
  }

  onContact(body, callBack, context) {
    body.addEventListener("collide", event => callBack.call(context, event));
  }

  _initCannonDebugger() {
    if (TRANSFER_IT_DEBUG_CONFIG.cannonDebugger) {
      this._cannonDebugger = CannonDebugger(this._scene, this.world);
    }
  }

  static resetBody(body) {
    SimplePhysics.instance.resetBody(body);
  }

  static onContact(body, callBack, context) {
    SimplePhysics.instance.onContact(body, callBack, context);
  }

  static addBody(body, mesh, tag = '') {
    SimplePhysics.instance.addBody(body, mesh, tag);
  }

  static removeBody(body) {
    return SimplePhysics.instance.removeBody(body);
  }

  static reset() {
    return SimplePhysics.instance.reset();
  }
}

SimplePhysics.instance = null;
