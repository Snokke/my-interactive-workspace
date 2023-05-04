import { CHAIR_BOUNDING_BOX_TYPE } from "../../chair/data/chair-data"

const LOCKER_CONFIG = {
  casesCount: 6,
  caseMoveDistance: 0.9,
  caseMoveSpeed: 4,
  allCasesAnimationDelayCoefficient: 450,
}

const CHAIR_INTERSECTION_CONFIG = {
  [CHAIR_BOUNDING_BOX_TYPE.Main]: [
    { caseId: 0, maxDistance: 0.1 },
    { caseId: 1, maxDistance: 0.1 },
    { caseId: 2, maxDistance: 0.1 },
    { caseId: 4, maxDistance: 0.5 },
    { caseId: 5, maxDistance: 0.5 },
  ],
  [CHAIR_BOUNDING_BOX_TYPE.FrontWheel]: [
    { caseId: 0, maxDistance: 0.3 },
    { caseId: 1, maxDistance: 0.3 },
    { caseId: 2, maxDistance: 0.3 },
  ],
}

export { LOCKER_CONFIG, CHAIR_INTERSECTION_CONFIG };
