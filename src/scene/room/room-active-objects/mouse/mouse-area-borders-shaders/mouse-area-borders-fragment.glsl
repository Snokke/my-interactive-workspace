varying vec2 vUv;

uniform float uCenter;
uniform vec3 uColor;
uniform float uAlpha;

void main()
{
  float alpha = mix(1.0, 0.0, abs(vUv.x - uCenter) * 2.0);

  gl_FragColor = vec4(uColor, alpha * uAlpha);
}
