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

  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
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
