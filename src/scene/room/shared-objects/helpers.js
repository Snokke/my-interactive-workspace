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
