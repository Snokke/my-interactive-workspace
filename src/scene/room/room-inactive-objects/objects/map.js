import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from "../../../../core/helpers/delayed-call";
import { ROOM_CONFIG } from "../../data/room-config";
import RoomInactiveObjectAbstract from "../room-inactive-object-abstract";

export default class Map extends RoomInactiveObjectAbstract {
  constructor(roomScene, roomObjectType) {
    super(roomScene, roomObjectType);
  }

  showWithAnimation(delay) {
    const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

    this._mesh.scale.set(0, 0, 0);

    Delayed.call(delay, () => {
      new TWEEN.Tween(this._mesh.scale)
        .to({ x: 1, y: 1, z: 1 }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectScaleEasing)
        .start();
    });
  }
}
