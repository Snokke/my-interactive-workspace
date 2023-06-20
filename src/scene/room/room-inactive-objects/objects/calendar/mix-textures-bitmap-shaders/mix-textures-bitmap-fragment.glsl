uniform sampler2D uTexture01;
uniform sampler2D uTexture02;
uniform sampler2D uBitmapTexture;

uniform float uMixPercent;

varying vec2 vUv;

void main()
{
    vec3 texture01Color = texture2D(uTexture01, vUv).rgb;
    vec3 texture02Color = texture2D(uTexture02, vUv).rgb;
    vec4 bitmapColor = texture2D(uBitmapTexture, vUv).rgba;

    vec3 mixColor = mix(texture01Color, texture02Color, uMixPercent);
    vec3 withBitmapColor = mix(mixColor, bitmapColor.rgb, bitmapColor.a);

    gl_FragColor = vec4(withBitmapColor, 1.0);
}
