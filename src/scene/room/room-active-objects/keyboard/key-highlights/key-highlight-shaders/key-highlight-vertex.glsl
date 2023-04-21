varying vec2 vUv;
varying vec3 vInstanceColor;

void main()
{
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);

  vUv = uv;
  vInstanceColor = instanceColor;
}
