uniform sampler2D uTexture01;
uniform sampler2D uTexture02;
uniform sampler2D uTexture03;
uniform sampler2D uTexture04;

uniform float uMixPercent;
uniform float uMixSecret;

varying vec2 vUv;

#include ../../../../shared/perlin-noise/perlin2d;

void main()
{
    vec3 texture01Color = texture2D(uTexture01, vUv).rgb;
    vec3 texture02Color = texture2D(uTexture02, vUv).rgb;
    vec3 mixStandardColor = mix(texture01Color, texture02Color, uMixPercent);

    vec3 texture03Color = texture2D(uTexture03, vUv).rgb;
    vec3 texture04Color = texture2D(uTexture04, vUv).rgb;
    vec3 mixSecretColor = mix(texture03Color, texture04Color, uMixPercent);

    vec2 uv = vUv * 7.0;
    float perlin = perlin2d(uv);

    float clampPerlin = smoothstep(0.0, 1.0, perlin - 1.0 + uMixSecret * 3.0);
    float mixTexture = clamp(clampPerlin, 0.0, 1.0);

    vec3 mixColor = mix(mixStandardColor, mixSecretColor, mixTexture);

    gl_FragColor = vec4(mixColor, 1.0);
}
