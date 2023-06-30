import { Black, Vector } from "black-engine";

export const rotateAroundPoint = (object, point, axis, theta) => {
  object.parent.localToWorld(object.position);

  object.position.sub(point);
  object.position.applyAxisAngle(axis, theta);
  object.position.add(point);

  object.parent.worldToLocal(object.position);

  object.rotateOnAxis(axis, theta);
}

export const arraysEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export const randomBetween = (a, b) => {
  return a + Math.random() * (b - a);
}

export const vector3ToBlackPosition = (vector3, renderer, camera) => {
  const dpr = Black.device.getDevicePixelRatio();
  const width = renderer.getContext().canvas.width / dpr;
  const height = renderer.getContext().canvas.height / dpr;

  camera.updateMatrixWorld();

  vector3.project(camera);

  const globalPos = new Vector().copyFrom(vector3);

  globalPos.x = (globalPos.x + 1) * width / 2;
  globalPos.y = - (globalPos.y - 1) * height / 2;

  return Black.stage.worldTransformationInverted.transformVector(globalPos);
}

export const isVector2Equal = (a, b) => {
  const epsilon = 0.001;
  return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;
}

export const isVector3Equal = (a, b) => {
  const epsilon = 0.001;
  return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon && Math.abs(a.z - b.z) < epsilon;
}

export const isVectorXZEqual = (a, b) => {
  const epsilon = 0.001;
  return Math.abs(a.x - b.x) < epsilon && Math.abs(a.z - b.z) < epsilon;
}

export const aabbIntersect = (rectangle01, rectangle02) => {
  if (Math.abs(rectangle01.center.x - rectangle02.center.x) > (rectangle01.size.x + rectangle02.size.x) * 0.5) {
    return false;
  }

  if (Math.abs(rectangle01.center.y - rectangle02.center.y) > (rectangle01.size.y + rectangle02.size.y) * 0.5) {
    return false;
  }

  return true;
}
