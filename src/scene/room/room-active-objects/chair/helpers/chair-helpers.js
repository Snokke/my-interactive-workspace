import { CHAIR_CONFIG } from "../data/chair-config";
import { BORDER_TYPE, WHEELS_PARTS } from "../data/chair-data";

export const getWheelsParts = (chairParts) => {
  const parts = [];

  WHEELS_PARTS.forEach((partName) => {
    parts.push(chairParts[partName]);
  });

  return parts;
}

export const getChairBoundingBox = (type) => {
  const { center: chairCenter, size: chairSize } = CHAIR_CONFIG.chairMoving.chairBoundingBox[type];

  const chairBoundingBox = {
    [BORDER_TYPE.Left]: chairCenter.x + chairSize.x * 0.5,
    [BORDER_TYPE.Right]: chairCenter.x - chairSize.x * 0.5,
    [BORDER_TYPE.Top]: -chairCenter.y + chairSize.y * 0.5,
    [BORDER_TYPE.Bottom]: -chairCenter.y - chairSize.y * 0.5,
  };

  return chairBoundingBox;
}

export const getMovingArea = (type) => {
  const { center: areaCenter, size: areaSize } = CHAIR_CONFIG.chairMoving.movingArea[type];

  const mainMovingArea = {
    [BORDER_TYPE.Left]: areaCenter.x - areaSize.x * 0.5,
    [BORDER_TYPE.Right]: areaCenter.x + areaSize.x * 0.5,
    [BORDER_TYPE.Top]: areaCenter.y - areaSize.y * 0.5,
    [BORDER_TYPE.Bottom]: areaCenter.y + areaSize.y * 0.5,
  };

  return mainMovingArea;
}

export const checkLeftBorderBounce = (wrapperPosition, chairMainBoundingBox, chairFrontWheelBoundingBox, mainMovingArea, underTableMovingArea) => {
  const epsilon = CHAIR_CONFIG.chairMoving.borderEpsilon;
  const error = CHAIR_CONFIG.chairMoving.disableBouncingBorderError;

  if (wrapperPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] + epsilon > mainMovingArea[BORDER_TYPE.Top]) {
    if (Math.abs(wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Left] - mainMovingArea[BORDER_TYPE.Left]) < error) {
      return true;
    }
  }

  if (wrapperPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] + epsilon < mainMovingArea[BORDER_TYPE.Top]) {
    if (Math.abs(wrapperPosition.x - chairFrontWheelBoundingBox[BORDER_TYPE.Left] - underTableMovingArea[BORDER_TYPE.Left]) < error) {
      return true;
    }
  }

  if (wrapperPosition.z - chairMainBoundingBox[BORDER_TYPE.Top] + epsilon < mainMovingArea[BORDER_TYPE.Top]) {
    if (Math.abs(wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Left] - underTableMovingArea[BORDER_TYPE.Left]) < error) {
      return true;
    }
  }

  return false;
}

export const checkRightBorderBounce = (wrapperPosition, chairMainBoundingBox, chairFrontWheelBoundingBox, mainMovingArea, underTableMovingArea) => {
  const epsilon = CHAIR_CONFIG.chairMoving.borderEpsilon;
  const error = CHAIR_CONFIG.chairMoving.disableBouncingBorderError;

  if (wrapperPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] + epsilon > mainMovingArea[BORDER_TYPE.Top]) {
    if (Math.abs(wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Right] - mainMovingArea[BORDER_TYPE.Right]) < error) {
      return true;
    }
  }

  if (wrapperPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] + epsilon < mainMovingArea[BORDER_TYPE.Top]) {
    if (Math.abs(wrapperPosition.x - chairFrontWheelBoundingBox[BORDER_TYPE.Right] - underTableMovingArea[BORDER_TYPE.Right]) < error) {
      return true;
    }
  }

  if (wrapperPosition.z - chairMainBoundingBox[BORDER_TYPE.Top] + epsilon < mainMovingArea[BORDER_TYPE.Top]) {
    if (Math.abs(wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Right] - underTableMovingArea[BORDER_TYPE.Right]) < error) {
      return true;
    }
  }

  return false;
}

export const checkTopBorderBounce = (wrapperPosition, chairMainBoundingBox, chairFrontWheelBoundingBox, mainMovingArea, underTableMovingArea) => {
  const epsilon = CHAIR_CONFIG.chairMoving.borderEpsilon;
  const error = CHAIR_CONFIG.chairMoving.disableBouncingBorderError;

  if ((wrapperPosition.x - chairFrontWheelBoundingBox[BORDER_TYPE.Right] - epsilon > underTableMovingArea[BORDER_TYPE.Right])
    || (wrapperPosition.x - chairFrontWheelBoundingBox[BORDER_TYPE.Left] + epsilon < underTableMovingArea[BORDER_TYPE.Left])) {
    if (Math.abs(wrapperPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] - mainMovingArea[BORDER_TYPE.Top]) < error) {
      return true;
    }
  }

  if ((wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Right] - epsilon > underTableMovingArea[BORDER_TYPE.Right])
    || (wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Left] + epsilon < underTableMovingArea[BORDER_TYPE.Left])) {
    if (Math.abs(wrapperPosition.z - chairMainBoundingBox[BORDER_TYPE.Top] - mainMovingArea[BORDER_TYPE.Top]) < error) {
      return true;
    }
  }

  if ((wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Right] - epsilon < underTableMovingArea[BORDER_TYPE.Right])
    && (wrapperPosition.x - chairMainBoundingBox[BORDER_TYPE.Left] + epsilon > underTableMovingArea[BORDER_TYPE.Left])) {
    if (Math.abs(wrapperPosition.z - chairFrontWheelBoundingBox[BORDER_TYPE.Top] - underTableMovingArea[BORDER_TYPE.Top]) < error) {
      return true;
    }
  }

  return false;
}

export const checkBottomBorderBounce = (wrapperPosition, chairMainBoundingBox, mainMovingArea) => {
  const error = CHAIR_CONFIG.chairMoving.disableBouncingBorderError;

  return Math.abs((wrapperPosition.z - chairMainBoundingBox[BORDER_TYPE.Bottom]) - mainMovingArea[BORDER_TYPE.Bottom]) < error;
}
