uniform sampler2D uTexture01;
uniform sampler2D uTexture02;

uniform float uMixPercent;

varying vec2 vUv;

void main()
{
    vec3 texture01Color = texture2D(uTexture01, vUv).rgb;
    vec3 texture02Color = texture2D(uTexture02, vUv).rgb;
    vec3 mixColor = mix(texture01Color, texture02Color, uMixPercent);

    gl_FragColor = vec4(mixColor, 1.0);
}
