uniform sampler2D uTextureClosedLightOff;
uniform sampler2D uTextureClosedLightOn;
uniform sampler2D uTextureOpenedLightOff;
uniform sampler2D uTextureOpenedLightOn;

uniform float uMixLightPercent;
uniform float uMixOpenedPercent;

varying vec2 vUv;

void main()
{
    vec3 textureClosedLightOffColor = texture2D(uTextureClosedLightOff, vUv).rgb;
    vec3 textureClosedLightOnColor = texture2D(uTextureClosedLightOn, vUv).rgb;
    vec3 textureOpenedLightOffColor = texture2D(uTextureOpenedLightOff, vUv).rgb;
    vec3 textureOpenedLightOnColor = texture2D(uTextureOpenedLightOn, vUv).rgb;

    vec3 mixLightOnOpenedColor = mix(textureClosedLightOnColor, textureOpenedLightOnColor, uMixOpenedPercent);
    vec3 mixLightOffOpenedColor = mix(textureClosedLightOffColor, textureOpenedLightOffColor, uMixOpenedPercent);

    vec3 mixColor = mix(mixLightOffOpenedColor, mixLightOnOpenedColor, uMixLightPercent);

    gl_FragColor = vec4(mixColor, 1.0);
}
