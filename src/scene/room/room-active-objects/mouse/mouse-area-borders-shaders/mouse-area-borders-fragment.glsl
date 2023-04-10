varying vec2 vUv;
varying float vCenter;
varying vec3 vColor;
varying float vAlpha;

void main()
{
  float alpha = 0.0;

  if (vUv.x < vCenter) {
    alpha = mix(0.0, 1.0, vUv.x * (1.0 / vCenter));
  } else {
    alpha = mix(1.0, 0.0, (vUv.x - vCenter) * (1.0 / (1.0 - vCenter)));
  }

  gl_FragColor = vec4(vColor, alpha * vAlpha);
}
