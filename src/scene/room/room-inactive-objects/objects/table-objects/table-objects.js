import Materials from "../../../../../core/materials";
import RoomInactiveObjectAbstract from "../../room-inactive-object-abstract";
import CoffeeSteam from "./coffee-steam/coffee-steam";

export default class TableObjects extends RoomInactiveObjectAbstract {
  constructor(roomScene, roomObjectType) {
    super(roomScene, roomObjectType);

    this._coffeeSteam = null;

    this._addMaterials();
    this._initCoffeeSteam();
  }

  update(dt) {
    this._coffeeSteam.update(dt);
  }

  onStartSnowing() {
    this._coffeeSteam.onStartSnowing();
  }

  onStopSnowing() {
    this._coffeeSteam.onStopSnowing();
  }

  onWindowOpened() {
    this._coffeeSteam.onWindowOpened();
  }

  onWindowClosed() {
    this._coffeeSteam.onWindowClosed();
  }

  _addMaterials() {
    const material = Materials.getMaterial(Materials.type.bakedSmallObjects);
    this._mesh.material = material;
  }

  _initCoffeeSteam() {
    const coffeeSteam = this._coffeeSteam = new CoffeeSteam();
    this.add(coffeeSteam);

    coffeeSteam.position.copy(this._mesh.position);
  }
}
