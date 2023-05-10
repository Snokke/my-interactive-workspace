import * as THREE from 'three';
import Utils from '../../helpers/utils';

export default class Ghost extends THREE.Group {
  constructor(modelConfig, material) {
    super();

    this.size = null;

    this._modelConfig = modelConfig;
    this._material = material;
    this._view = null;

    this.visible = false;

    this._init();
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }

  _init() {
    const view = this._view = Utils.createObject(this._modelConfig.modelName, this._material);
    this.add(view);

    this.size = Utils.getBoundingBox(this);
    view.position.y = -(this.size.y / 2);
  }
}
