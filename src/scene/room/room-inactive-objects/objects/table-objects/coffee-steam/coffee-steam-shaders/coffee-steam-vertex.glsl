uniform float uTime;
uniform float uWindAngle;
uniform float uWindPower;

varying vec2 vUv;

#include perlin2d;

void main()
{
    vec3 newPosition = position;
    vec2 displacementUv = uv;
    displacementUv *= 4.0;
    displacementUv.y -= uTime * 0.0002;

    float displacementStrength = pow(uv.y * 3.0, 2.0);
    float perlin = perlin2d(displacementUv) * displacementStrength;

    newPosition.z += perlin * 0.1;

    newPosition.x += pow(position.y, 2.0) * uWindPower * sin(uWindAngle);
    newPosition.z += pow(position.y, 2.0) * uWindPower * cos(uWindAngle);

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    vUv = uv;
}
