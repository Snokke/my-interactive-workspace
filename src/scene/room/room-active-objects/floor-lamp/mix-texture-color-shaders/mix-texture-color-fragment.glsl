uniform sampler2D uTexture;
uniform vec3 uColor;
uniform float uMixPercent;

varying vec2 vUv;

void main()
{
    vec3 textureColor = texture2D(uTexture, vUv).rgb;
    vec3 mixColor = mix(textureColor, uColor, uMixPercent);

    gl_FragColor = vec4(mixColor, 1.0);
}
