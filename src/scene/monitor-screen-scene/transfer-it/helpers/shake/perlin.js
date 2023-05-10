import { MathEx } from 'black-engine';

export default class Perlin1D {
  constructor(octaves = 2) {
    this._seed = ~~(Math.random() * 30000);
    this._octaves = octaves;
  }

  _pseudoRandom(x) {
    let n = x * 563;
    n = ((n + this._seed) << 13) ^ n;
    n = (1.0 - ((n * (n * n * 15731 + 789221) + this._seed) % 0x7fffffff) / 1073741824.0);

    return n;
  }

  _interpolatedNoise(x) {
    const integerX = ~~(x);

    let t = x - integerX;
    t = t * t * (3 - 2 * t);

    return MathEx.lerp(this._pseudoRandom(integerX), this._pseudoRandom(integerX + 1), t);
  }

  getValue(x) {
    let frequency = 1;
    let amplitude = 1;
    let scale = 0;
    let total = 0;

    for(let i = 0; i < this._octaves; ++i)
    {
      total += this._interpolatedNoise(x * frequency) * amplitude;
      scale += amplitude;
      frequency *= 2;
      amplitude *= 0.5;
    }

    return total / scale;
  }
}
