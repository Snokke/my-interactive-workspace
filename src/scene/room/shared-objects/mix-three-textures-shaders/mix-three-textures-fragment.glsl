uniform sampler2D uTexture01;
uniform sampler2D uTexture02;
uniform sampler2D uTexture03;

uniform float uMixTextures0102Percent;
uniform float uMixTexture03Percent;

varying vec2 vUv;

void main()
{
    vec3 texture01Color = texture2D(uTexture01, vUv).rgb;
    vec3 texture02Color = texture2D(uTexture02, vUv).rgb;
    vec3 texture03Color = texture2D(uTexture03, vUv).rgb;

    vec3 mixTexture0102Color = mix(texture01Color, texture02Color, uMixTextures0102Percent);
    vec3 mixColor = mix(mixTexture0102Color, texture03Color, uMixTexture03Percent);

    gl_FragColor = vec4(mixColor, 1.0);
}
