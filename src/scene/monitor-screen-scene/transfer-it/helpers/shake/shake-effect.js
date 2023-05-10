import Perlin1D from './perlin';

export default class ShakeEffect {
  constructor(target, strength = 20, time = 300, frequency = 4) {
    this._target = target;

    this._perlinAngle = new Perlin1D();
    this._perlinRadius = new Perlin1D();

    this._timePassedAngle = 0;
    this._timePassedRadius = 0;

    this._amplitude = 0;
    this._maxAmplitude = strength;
    this._amplitudeDecrease = (strength * 1000) / time;

    this._frequencyAngle = frequency * 1.5;
    this._frequencyRadius = frequency;
  }

  show() {
    this._amplitude = this._maxAmplitude;
  }

  setStartPosition(startPosition) {
    this._startPosition = {
      x: startPosition.x,
      y: startPosition.y,
      z: startPosition.z,
    };
  }

  update(dt) {
    const amplitude = this._amplitude;

    if (amplitude > 0) {
      this._timePassedAngle += this._frequencyAngle * dt;
      this._timePassedRadius += this._frequencyRadius * dt;

      const angle = this._perlinAngle.getValue(this._timePassedAngle) * Math.PI * 2;
      const radius = this._mapRadius(this._perlinRadius.getValue(this._timePassedRadius)) * this._amplitude;

      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      this._amplitude -= this._amplitudeDecrease * dt;

      if (this._amplitude > 0) {

        this._target.position.set(
          this._startPosition.x + x,
          this._startPosition.y + y,
          this._startPosition.z + x,
        );
      } else {
        this._amplitude = 0;

        this._target.position.set(
          this._startPosition.x,
          this._startPosition.y,
          this._startPosition.z,
        );
      }
    }
  }

  _mapRadius(value) {
    return value * 0.4 + 0.6;
  }
}
