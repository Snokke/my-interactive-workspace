uniform float uCenter;
uniform vec3 uColor;
uniform float uAlpha;

varying vec2 vUv;

varying float vCenter;
varying vec3 vColor;
varying float vAlpha;

void main()
{
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

  vUv = uv;
  vCenter = uCenter;
  vColor = uColor;
  vAlpha = uAlpha;
}
