import * as THREE from "three";
import Materials from "../../../../core/materials";
import RoomInactiveObjectAbstract from "../room-inactive-object-abstract";

export default class BookShelf extends RoomInactiveObjectAbstract {
  constructor(roomScene, roomObjectType) {
    super(roomScene, roomObjectType);

    this._addMaterials();
  }

  _addMaterials() {
    // const material = new THREE.MeshLambertMaterial({
    //   color: 0xffffff,
    // });

    // this._mesh.material = material;
    const material = Materials.getMaterial(Materials.type.bakedSmallObjects);
    this._mesh.material = material;
  }
}
