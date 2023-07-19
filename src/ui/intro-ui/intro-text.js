import { DisplayObject, TextField } from "black-engine";


export default class IntroText extends DisplayObject {
  constructor() {
    super();

  }

  onAdded() {
    this._init();
  }

  _hide() {

  }

  _init() {
    // const textField = new BitmapTextField('', 'ANDRII BABINTSEV');
    const textField = new TextField('ANDRII BABINTSEV', 'Arial', 0xffffff, 40);
    // this.add(textField);

    textField.align = 'center';

    textField.highQuality = true;
    textField.alignPivot();

    textField.dropShadow  = true;
    textField.shadowDistanceX = 2;
    textField.shadowDistanceY = 2;
    textField.shadowColor = 0x000000;
    textField.shadowBlur = 5;

    textField.multiline = true;
  }
}
