import { MessageDispatcher } from "black-engine";
import GUIHelper from "../../../../core/helpers/gui-helper/gui-helper";
import LOCKER_CONFIG from "./locker-config";
import { LOCKER_CASES_ANIMATION_TYPE, LOCKER_CASES_RANDOM_ANIMATIONS } from "./locker-data";

export default class LockerDebug {
  constructor(allCasesAnimationType) {
    this.events = new MessageDispatcher();

    this._allCasesAnimationType = allCasesAnimationType;
    this._lockerFolder = null;

    this._init();
  }

  enable() {
    this._lockerFolder.children.forEach((child) => {
      child.disabled = false;
    });
  }

  disable() {
    this._lockerFolder.children.forEach((child) => {
      child.disabled = true;
    });
  }

  _init() {
    const lockerFolder = this._lockerFolder = GUIHelper.getGui().addFolder({
      title: 'Locker',
    });

    lockerFolder.addBlade({
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

    lockerFolder.addBlade({
      view: 'list',
      label: 'All cases animation',
      options: [
        { text: 'From top', value: LOCKER_CASES_ANIMATION_TYPE.FromTop },
        { text: 'From bottom', value: LOCKER_CASES_ANIMATION_TYPE.FromBottom },
        { text: 'From center', value: LOCKER_CASES_ANIMATION_TYPE.FromCenter },
        { text: 'To center', value: LOCKER_CASES_ANIMATION_TYPE.ToCenter },
        { text: 'From top by 3', value: LOCKER_CASES_ANIMATION_TYPE.FromTopByThree },
        { text: 'From bottom by 3', value: LOCKER_CASES_ANIMATION_TYPE.FromBottomByThree },
        { text: 'Random sequence 1', value: LOCKER_CASES_ANIMATION_TYPE.Random01 },
        { text: 'Random sequence 2', value: LOCKER_CASES_ANIMATION_TYPE.Random02 },
        { text: 'Random sequence 3', value: LOCKER_CASES_ANIMATION_TYPE.Random03 },
        { text: 'Random animation', value: LOCKER_CASES_RANDOM_ANIMATIONS },
      ],
      value: this._allCasesAnimationType,
    }).on('change', (animationType) => {
      this.events.post('changeAllCasesAnimation', animationType.value);
    });

    lockerFolder.addButton({
      title: 'Push all cases',
    }).on('click', () => this.events.post('pushAllCases'));

    lockerFolder.addSeparator();

    lockerFolder.addInput(LOCKER_CONFIG, 'caseMoveDistance', {
      label: 'Move out distance',
      min: 0.1,
      max: 1.5,
    });

    lockerFolder.addInput(LOCKER_CONFIG, 'caseMoveSpeed', {
      label: 'Case speed',
      min: 0.5,
      max: 20,
    });
  }
}
