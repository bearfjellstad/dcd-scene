#pragma glslify: curl = require(glsl-curl-noise)

varying vec2 vUv;

uniform sampler2D uPositions;
uniform float uTime;
uniform float uNoiseStrength;

void main() {
    vec3 pos = texture2D(uPositions, vUv).xyz;

    float freq = 0.09;
    float curlTime = uTime *  0.1;

    pos += curl(pos * freq + curlTime) * uNoiseStrength;

    gl_FragColor = vec4(pos, 1.);
}
