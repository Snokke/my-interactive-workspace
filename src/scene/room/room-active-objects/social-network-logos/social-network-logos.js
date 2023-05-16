import RoomObjectAbstract from '../room-object.abstract';
import { SOCIAL_NETWORK_LOGOS_PART_TYPE } from './social-network-logos-data';

export default class SocialNetworkLogos extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType, audioListener) {
    super(meshesGroup, roomObjectType, audioListener);

    this._init();
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    const roomObject = intersect.object;
    const partType = roomObject.userData.partType;

    if (partType === SOCIAL_NETWORK_LOGOS_PART_TYPE.Github) {
      window.open('https://github.com/Snokke/room-project', '_blank').focus();

    }

    if (partType === SOCIAL_NETWORK_LOGOS_PART_TYPE.Linkedin) {
      window.open('https://www.linkedin.com/in/andriibabintsev/', '_blank').focus();
    }
  }

  getMeshesForOutline(mesh) {
    return [mesh];
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
  }
}
