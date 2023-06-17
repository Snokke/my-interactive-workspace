uniform float uTime;
uniform float uTimeFrequency;
uniform vec2 uUvFrequency;
uniform vec3 uColor;

varying vec2 vUv;

#include perlin2d;

void main()
{
    vec2 uv = vUv * uUvFrequency;
    uv.y -= uTime * uTimeFrequency;

    float borderAlpha = min(vUv.x * 5.0, (1.0 - vUv.x) * 5.0);
    borderAlpha = borderAlpha * (1.0 - vUv.y);

    float perlin = perlin2d(uv);
    perlin *= borderAlpha;
    perlin *= 1.1;
    perlin = min(perlin, 1.0);

    float alpha = mix(0.0, perlin, vUv.y * 3.0 - 0.1);

    gl_FragColor = vec4(uColor, alpha);
}
