import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { CHAIR_CONFIG } from "./data/chair-config";

export default class ChairDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._seatSpeedController = null;
    this._seatRotationDirectionController = null;
    this._chairStateController = null;
    this._chairMovementStateController = null;

    this._movementState = { value: CHAIR_CONFIG.chairMoving.movementState };

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

  updateChairMovementState() {
    if (this._movementState.value !== CHAIR_CONFIG.chairMoving.movementState) {
      this._movementState.value = CHAIR_CONFIG.chairMoving.movementState;
      this._chairMovementStateController.refresh();
    }
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

    this._debugFolder.addButton({
      title: 'Rotate seat',
    }).on('click', () => this.events.post('rotate'));

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(CHAIR_CONFIG.seatRotation, 'showSeatHelper', {
      label: 'Helpers',
    }).on('change', () => this.events.post('onShowSeatHelper'));

    this._debugFolder.addInput(CHAIR_CONFIG.seatRotation, 'impulse', {
      label: 'Impulse',
      min: 2,
      max: 30,
    });

    this._debugFolder.addInput(CHAIR_CONFIG.seatRotation, 'maxSpeed', {
      label: 'Max speed',
      min: 5,
      max: 100,
    });

    this._debugFolder.addInput(CHAIR_CONFIG.seatRotation, 'speedDecrease', {
      label: 'Fading',
      min: 0,
      max: 10,
    });

    this._debugFolder.addSeparator();

    this._chairMovementStateController = this._debugFolder.addInput(this._movementState, 'value', {
      label: 'State',
      disabled: true,
    });
    this._chairMovementStateController.customDisabled = true;

    this._debugFolder.addButton({
      title: 'Move to start position',
    }).on('click', () => this.events.post('moveChairToStartPosition'));

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(CHAIR_CONFIG.chairMoving, 'showMovingArea', {
      label: 'Helpers',
    }).on('change', () => this.events.post('onShowMovingArea'));

    this._debugFolder.addInput(CHAIR_CONFIG.chairMoving, 'lerpSpeed', {
      label: 'Position lerp alpha',
      min: 0.01,
      max: 1,
    });

    this._debugFolder.addInput(CHAIR_CONFIG.chairMoving, 'bouncingCoefficient', {
      label: 'Bouncing coefficient',
      min: 1,
      max: 2,
    });
  }
}
