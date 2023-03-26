import Delayed from '../../../../core/helpers/delayed-call';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import RoomObjectAbstract from '../room-object.abstract';
import { WALLS_PART_CONFIG, WALLS_PART_TYPE } from './walls-data';

export default class Walls extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._floorLampDebug = null;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = 600;

      const floor = this._parts[WALLS_PART_TYPE.Floor];
      const leftWall = this._parts[WALLS_PART_TYPE.WallLeft];
      const rightWall = this._parts[WALLS_PART_TYPE.WallRight];

      new TWEEN.Tween(floor.position)
        .to({ y: floor.userData.startPosition.y }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start();

      new TWEEN.Tween(leftWall.position)
        .to({ y: leftWall.userData.startPosition.y }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .delay(250)
        .start();

      new TWEEN.Tween(rightWall.position)
        .to({ y: rightWall.userData.startPosition.y }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .delay(500)
        .start()
        .onComplete(() => {
          this._onShowAnimationComplete();
        });
    });
  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  _setPositionForShowAnimation() {
    const startPositionY = 20;

    this._parts[WALLS_PART_TYPE.WallLeft].position.y = startPositionY;
    this._parts[WALLS_PART_TYPE.WallRight].position.y = startPositionY;

    this._parts[WALLS_PART_TYPE.Floor].position.y = -35;
  }

  _init() {
    this._initParts(WALLS_PART_TYPE, WALLS_PART_CONFIG);
    this._addMaterials();

    for (let key in this._parts) {
      const part = this._parts[key];

      this.add(part);
    }
  }
}
