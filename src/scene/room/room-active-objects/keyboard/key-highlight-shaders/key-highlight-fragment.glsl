varying vec2 vUv;
varying vec3 vInstanceColor;

void main()
{
  // for mouse border 1
  // float alpha = (1.0 - abs(0.5 - vUv.x) * 2.0) + 0.2;


  // for mouse border 2
  // float alpha = 0.0;
  // float center = 0.1;

  // if (vUv.x < center) {
  //   alpha = mix(0.0, 1.0, vUv.x * (1.0 / center));
  // } else {
  //   alpha = mix(1.0, 0.0, (vUv.x - center) * (1.0 / (1.0 - center)));
  // }


  // for mouse border 3
  // float alpha = 0.0;
  // float delta = 0.1;
  // float center = 0.2;

  // if (vUv.x < center - delta * 0.5) {
  //   alpha = mix(0.0, 1.0, vUv.x * (1.0 / (center - delta * 0.5)));
  // }

  // if (vUv.x > center - delta * 0.5 && vUv.x < center + delta * 0.5) {
  //   alpha = 1.0;
  // }

  // if (vUv.x > center + delta * 0.5) {
  //   alpha = mix(1.0, 0.0, (vUv.x - (center + delta * 0.5)) * (1.0 / (center + delta * 0.5)));
  // }



  vec2 position = vUv - 0.5;
  float distance = length(position);
  float alpha = 1.0 - mix(0.0, 1.0, smoothstep(0.0, 0.5, distance));

  gl_FragColor = vec4(vInstanceColor, alpha);

  // if (gl_FragColor.a < 0.1) {
  //   discard;
  // }
}
