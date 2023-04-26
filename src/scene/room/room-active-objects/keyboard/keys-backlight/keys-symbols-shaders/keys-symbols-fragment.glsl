uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vInstanceColor;

void main()
{
  gl_FragColor = texture2D(uTexture, vUv) * vec4(vInstanceColor, 1.0);
}
