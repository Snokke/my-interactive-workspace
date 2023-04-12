uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;

void main()
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // modelPosition.x += uTime;
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;
  gl_PointSize = uSize * uPixelRatio;
  gl_PointSize *= (1.0 / -viewPosition.z);
}
