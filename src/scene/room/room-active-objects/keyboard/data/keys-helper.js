import TWEEN from 'three/addons/libs/tween.module.js';
import { KEYS_CONFIG, KEYS_ID_BY_ROW } from "./keys-config";
import { SCALE_ZERO } from '../../../data/room-config';

export const getClosestKeyByX = (x, row) => {
  const minDistance = 0.05;
  const rowIds = KEYS_ID_BY_ROW[row];

  let closestKeyId = null;
  let distance = Infinity;

  for (let i = rowIds[0]; i <= rowIds[rowIds.length - 1]; i++) {
    const keyConfig = KEYS_CONFIG[i];
    const currentDistance = Math.abs(keyConfig.position.x - x);

    if (currentDistance < distance) {
      distance = currentDistance;
      closestKeyId = i;
    }
  }

  return distance < minDistance ? closestKeyId : null;
}

export const toZeroTween = (object, time) => {
  return new TWEEN.Tween(object)
    .to({ value: SCALE_ZERO }, time)
    .easing(TWEEN.Easing.Sinusoidal.Out)
    .start();
}

export const from0To1YoyoTween = (object, time, delay) => {
  return new TWEEN.Tween(object)
    .to({ value: 1 }, time)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .delay(delay)
    .repeatDelay(0)
    .yoyo(true)
    .repeat(1)
    .start();
}

export const from0To1Tween = (object, time, delay) => {
  return new TWEEN.Tween(object)
    .to({ value: 1 }, time)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    .delay(delay)
    .repeatDelay(0)
    .start();
}
