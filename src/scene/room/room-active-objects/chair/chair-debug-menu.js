import * as THREE from 'three';
import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { CHAIR_CONFIG } from "./data/chair-config";

export default class ChairDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._seatSpeedController = null;
    this._seatRotationDirectionController = null;
    this._chairStateController = null;

    this._init();
    this._checkToDisableFolder();
  }

  updateSeatSpeed() {
    this._seatSpeedController.refresh();
  }

  updateSeatRotationDirection() {
    this._seatRotationDirectionController.refresh();
  }

  updateChairState() {
    this._chairStateController.refresh();
  }

  _init() {
    this._seatSpeedController = this._debugFolder.addInput(CHAIR_CONFIG.seatRotation, 'speed', {
      label: 'Rotation speed',
      min: 0,
      max: 100,
      disabled: true,
    });
    this._seatSpeedController.customDisabled = true;

    this._seatRotationDirectionController = this._debugFolder.addInput(CHAIR_CONFIG.seatRotation, 'direction', {
      label: 'Rotation direction',
      disabled: true,
    });
    this._seatRotationDirectionController.customDisabled = true;

    this._debugFolder.addInput(CHAIR_CONFIG.seatRotation, 'showSeatHelper', {
      label: 'Helper',
    }).on('change', () => this.events.post('onShowSeatHelper'));

    this._debugFolder.addButton({
      title: 'Rotate seat',
    }).on('click', () => this.events.post('rotate'));

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(CHAIR_CONFIG.chairMoving, 'showMovingArea', {
      label: 'Helper',
    }).on('change', () => this.events.post('onShowMovingArea'));

    this._debugFolder.addButton({
      title: 'Move chair to start position',
    }).on('click', () => this.events.post('moveChairToStartPosition'));

    // this._debugFolder.addInput(CHAIR_CONFIG.seatRotation, 'impulse', {
    //   label: 'Impulse',
    //   min: 2,
    //   max: 30,
    // });

    // this._debugFolder.addInput(CHAIR_CONFIG.seatRotation, 'maxSpeed', {
    //   label: 'Max speed',
    //   min: 5,
    //   max: 100,
    // });

    // this._debugFolder.addInput(CHAIR_CONFIG.seatRotation, 'speedDecrease', {
    //   label: 'Fading',
    //   min: 0,
    //   max: 10,
    // });

    // this._debugFolder.addSeparator();

    // this._chairStateController = this._debugFolder.addInput(CHAIR_CONFIG.chairMoving, 'state', {
    //   label: 'State',
    //   disabled: true,
    // });
    // this._chairStateController.customDisabled = true;

    // this._moveChairButton = this._debugFolder.addButton({
    //   title: 'Move chair',
    // }).on('click', () => this.events.post('move'));

    // this._debugFolder.addSeparator();

    // this._debugFolder.addInput(CHAIR_CONFIG.chairMoving, 'speed', {
    //   label: 'Speed',
    //   min: 0.1,
    //   max: 10,
    // });

    // this._debugFolder.addInput(CHAIR_CONFIG.chairMoving, 'distanceToTablePosition', {
    //   label: 'Distance to table',
    //   min: 0.5,
    //   max: CHAIR_CONFIG.chairMoving.maxDistanceToTable,
    // });
  }
}
