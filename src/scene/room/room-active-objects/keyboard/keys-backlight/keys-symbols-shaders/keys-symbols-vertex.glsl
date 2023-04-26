varying vec2 vUv;
varying vec3 vInstanceColor;

attribute vec2 uvOffset;

uniform float uAtlasSize;

void main()
{
  vUv = uvOffset + (uv / uAtlasSize);
  vInstanceColor = instanceColor;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
}
