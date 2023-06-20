import RoomObjectDebugAbstract from "../room-object-debug.abstract";
import { LOCKER_CONFIG } from "./data/locker-config";
import { LOCKER_CASES_ANIMATION_TYPE, LOCKER_CASES_RANDOM_ANIMATIONS } from "./data/locker-data";

export default class LockerDebugMenu extends RoomObjectDebugAbstract {
  constructor(roomObjectType) {
    super(roomObjectType);

    this._pushCasesButtons = null;
    this._pushAllCasesButton = null;

    this._allCasesAnimationType = LOCKER_CASES_RANDOM_ANIMATIONS;

    this._init();
    this._checkToDisableFolder();
  }

  disableCaseMovement() {
    this._pushCasesButtons.disabled = true;
    this._pushAllCasesButton.disabled = true;
  }

  enableCaseMovement() {
    this._pushCasesButtons.disabled = false;
    this._pushAllCasesButton.disabled = false;
  }

  _init() {
    this._pushCasesButtons = this._debugFolder.addBlade({
      view: 'buttongrid',
      size: [3, 2],
      cells: (x, y) => ({
        title: [
          ['1', '2', '3'],
          ['4', '5', '6'],
        ][y][x],
      }),
      label: 'Push case',
    }).on('click', (ev) => {
      const caseIndex = ev.index[0] + ev.index[1] * 3;

      if (caseIndex + 1 <= LOCKER_CONFIG.casesCount) {
        this.events.post('pushCase', caseIndex);
      }
    });

    this._debugFolder.addBlade({
      view: 'list',
      label: 'All cases animation',
      options: [
        { text: 'Random animation', value: LOCKER_CASES_RANDOM_ANIMATIONS },
        { text: 'From top', value: LOCKER_CASES_ANIMATION_TYPE.FromTop },
        { text: 'From bottom', value: LOCKER_CASES_ANIMATION_TYPE.FromBottom },
        { text: 'From center', value: LOCKER_CASES_ANIMATION_TYPE.FromCenter },
        { text: 'To center', value: LOCKER_CASES_ANIMATION_TYPE.ToCenter },
      ],
      value: this._allCasesAnimationType,
    }).on('change', (animationType) => {
      this.events.post('changeAllCasesAnimation', animationType.value);
    });

    this._pushAllCasesButton = this._debugFolder.addButton({
      title: 'Push all cases',
    }).on('click', () => this.events.post('pushAllCases'));

    this._debugFolder.addSeparator();

    this._debugFolder.addInput(LOCKER_CONFIG, 'caseMoveDistance', {
      label: 'Move out distance',
      min: 0.1,
      max: 1.3,
    }).on('change', () => this.events.post('changeCaseMoveDistance'));

    this._debugFolder.addInput(LOCKER_CONFIG, 'caseMoveSpeed', {
      label: 'Case speed',
      min: 0.5,
      max: 20,
    });
  }
}
