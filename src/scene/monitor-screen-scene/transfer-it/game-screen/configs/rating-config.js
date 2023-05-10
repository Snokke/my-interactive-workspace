const RATING_TYPE = {
  perfect: 0,
  good: 1,
  bad: 2,
};

const RATING_DISTANCE = {
  [RATING_TYPE.perfect]: 0.4,
  [RATING_TYPE.good]: 1,
};

const BIG_FURNITURE_COEFF = 3;

export { RATING_TYPE, RATING_DISTANCE, BIG_FURNITURE_COEFF };
