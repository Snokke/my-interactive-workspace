uniform vec3 uColor;
uniform float uAlpha;

void main()
{
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float alpha = 0.1 / distanceToCenter - 0.2;

  gl_FragColor = vec4(uColor, alpha * uAlpha);
}
