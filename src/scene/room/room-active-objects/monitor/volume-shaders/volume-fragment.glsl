uniform sampler2D uTexture;
uniform int uRectsCount;
uniform float uAlpha;

varying vec2 vUv;

struct Rect {
  vec2 center;
  vec2 size;
};

void main()
{
  Rect rects[10];

  float distBetweenRects = 0.08;

  rects[0] = Rect(vec2(0.143 + distBetweenRects * 0.0, 0.121), vec2(0.065, 0.03));
  rects[1] = Rect(vec2(0.143 + distBetweenRects * 1.0, 0.121), vec2(0.065, 0.03));
  rects[2] = Rect(vec2(0.143 + distBetweenRects * 2.0, 0.121), vec2(0.065, 0.03));
  rects[3] = Rect(vec2(0.143 + distBetweenRects * 3.0, 0.121), vec2(0.065, 0.03));
  rects[4] = Rect(vec2(0.143 + distBetweenRects * 4.0, 0.121), vec2(0.065, 0.03));
  rects[5] = Rect(vec2(0.143 + distBetweenRects * 5.0, 0.121), vec2(0.065, 0.03));
  rects[6] = Rect(vec2(0.143 + distBetweenRects * 6.0, 0.121), vec2(0.065, 0.03));
  rects[7] = Rect(vec2(0.143 + distBetweenRects * 7.0, 0.121), vec2(0.065, 0.03));
  rects[8] = Rect(vec2(0.143 + distBetweenRects * 8.0, 0.121), vec2(0.065, 0.03));
  rects[9] = Rect(vec2(0.143 + distBetweenRects * 9.0, 0.121), vec2(0.065, 0.03));

  vec3 rectColor = vec3(0.972, 0.604, 0.329);

  vec4 texColor = texture2D(uTexture, vUv);
  vec3 color = vec3(texColor.rgb);

  for (int i = 0; i < uRectsCount; i++) {
    Rect rect = rects[i];

    float insideRect = step(rect.center.x - rect.size.x * 0.5, vUv.x) *
                       step(rect.center.y - rect.size.y * 0.5, vUv.y) *
                       step(vUv.x, rect.center.x + rect.size.x * 0.5) *
                       step(vUv.y, rect.center.y + rect.size.y * 0.5);

    color = mix(color, rectColor, insideRect);
  }

  gl_FragColor = vec4(color, texColor.a * uAlpha);
}
