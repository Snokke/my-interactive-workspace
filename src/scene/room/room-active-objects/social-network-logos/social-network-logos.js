import * as THREE from 'three';
import RoomObjectAbstract from '../room-object.abstract';
import { GITHUB_PARTS, LINKEDIN_PARTS, SOCIAL_NETWORK_LOGOS_PART_TYPE } from './social-network-logos-data';

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

    if (partType === SOCIAL_NETWORK_LOGOS_PART_TYPE.GithubFront) {
      window.open('https://github.com/Snokke/my-interactive-workspace', '_blank').focus();
    }

    if (partType === SOCIAL_NETWORK_LOGOS_PART_TYPE.LinkedinFront) {
      window.open('https://www.linkedin.com/in/andriibabintsev/', '_blank').focus();
    }
  }

  getMeshesForOutline(mesh) {
    const partType = mesh.userData.partType;

    if (GITHUB_PARTS.includes(partType)) {
      const meshes = [];
      GITHUB_PARTS.forEach((partType) => meshes.push(this._parts[partType]));

      return meshes;
    }

    if (LINKEDIN_PARTS.includes(partType)) {
      const meshes = [];
      LINKEDIN_PARTS.forEach((partType) => meshes.push(this._parts[partType]));

      return meshes;
    }
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
  }

  _addMaterials() {
    const githubFront = this._parts[SOCIAL_NETWORK_LOGOS_PART_TYPE.GithubFront];
    const githubBack = this._parts[SOCIAL_NETWORK_LOGOS_PART_TYPE.GithubBack];
    const linkedinFront = this._parts[SOCIAL_NETWORK_LOGOS_PART_TYPE.LinkedinFront];
    const linkedinBack = this._parts[SOCIAL_NETWORK_LOGOS_PART_TYPE.LinkedinBack];

    const githubBackMaterial = new THREE.MeshBasicMaterial({ color: 0xC1C1C1 });
    const githubFrontMaterial = new THREE.MeshBasicMaterial({ color: 0xd3d3d3 });
    const linkedinBackMaterial = new THREE.MeshBasicMaterial({ color: 0x2868B2 });
    const linkedinFrontMaterial = new THREE.MeshBasicMaterial({ color: 0x307acf });

    githubFront.material = githubFrontMaterial;
    githubBack.material = githubBackMaterial;
    linkedinFront.material = linkedinFrontMaterial;
    linkedinBack.material = linkedinBackMaterial;
  }
}
