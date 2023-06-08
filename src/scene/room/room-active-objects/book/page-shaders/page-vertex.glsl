varying vec2 vUv;

uniform float uProgress;
uniform float uFlipSign;

attribute float startPositionZ;

void main()
{
  float positionZ = startPositionZ * 2.0;
  vec3 newPosition = position;

  float distance = abs(newPosition.x);
  float rotationSpeedFactor = smoothstep(0.0, 1.0, uProgress);
  float rotationSpeed = mix(1.0, rotationSpeedFactor, distance);
  float angle = uFlipSign * uProgress * rotationSpeed * 3.14159;

  float cosAngle = cos(angle);
  float sinAngle = sin(angle);

  newPosition.z -= mix(0.0, positionZ, uProgress);
  newPosition.xz = mat2(cosAngle, -sinAngle, sinAngle, cosAngle) * newPosition.xz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  vUv = uv;
}
