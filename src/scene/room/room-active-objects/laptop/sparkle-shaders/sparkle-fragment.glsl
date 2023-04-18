uniform sampler2D uTexture;
uniform vec3 uColor;
uniform vec3 uSparkleColor;
uniform float uTime;
uniform float uStartOffset;
uniform float uLineThickness;
uniform float uBlurAmount;
uniform float uLineAngle;
uniform float uSpeed;
uniform float uLineMovingWidth;

varying vec2 vUv;

void main()
{
  mat2 rotationMatrix = mat2(cos(uLineAngle), -sin(uLineAngle), sin(uLineAngle), cos(uLineAngle));
  vec2 rotatedUV = rotationMatrix * (vUv - vec2(0.5)) + vec2(0.5);
  float position = mod(rotatedUV.x - uTime * uSpeed * 0.1 + uStartOffset * uLineMovingWidth, uLineMovingWidth);

  float distance = abs(position - uLineMovingWidth * 0.5);
  float line = smoothstep((uLineMovingWidth * 0.5 - uLineThickness) - uBlurAmount, (uLineMovingWidth * 0.5 - uLineThickness) + uBlurAmount, distance);

  gl_FragColor = mix(texture2D(uTexture, vUv) * vec4(uColor, 1.0), vec4(uSparkleColor, 1.0), line);
}
