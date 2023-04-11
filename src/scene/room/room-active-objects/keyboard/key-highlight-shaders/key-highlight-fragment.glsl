varying vec2 vUv;
varying vec3 vInstanceColor;

void main()
{
  vec2 position = vUv - 0.5;
  float distance = length(position);
  float alpha = 1.0 - mix(0.0, 1.0, smoothstep(0.0, 0.5, distance));

  gl_FragColor = vec4(vInstanceColor, alpha);

  // if (gl_FragColor.a < 0.1) {
  //   discard;
  // }
}
