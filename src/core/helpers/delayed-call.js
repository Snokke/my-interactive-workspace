import { Black, GameObject, Tween } from 'black-engine';

/**
 * @author Comics
 */
export default class Delayed {
  constructor() {
  }

  static call(delay, callback, context, ...params) {

    if (!Delayed.helper) {
      Delayed.helper = Black.stage.addChild(new GameObject());
    }

    if (delay > 0) {
      let t = new Tween({}, delay * 0.001);
      t.on('complete', () => {
        callback.apply(context, params);
        this.__removeCall(callback);
      });
      Delayed.helper.addComponent(t);
      Delayed.calls[callback] = t;
      return t;
    } else {
      callback.apply(context, params);
    }
  }

  static __removeCall(callback) {
    Delayed.calls[callback] = null;
    delete Delayed.calls[callback];
  }

  static kill(callback) {
    if (Delayed.calls[callback]) {
      Delayed.calls[callback].stop();
      Delayed.calls[callback].removeFromParent();
      Delayed.__removeCall(callback);
    }
  }
}

Delayed.helper = null;
Delayed.calls = {};
