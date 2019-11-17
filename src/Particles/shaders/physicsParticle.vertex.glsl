#pragma glslify: noise = require(glsl-curl-noise)

#ifdef HAS_COLOR
attribute vec3 aColor;
varying vec3 vColor;
#endif

#ifdef HAS_SIZE
attribute float aSize;
#endif

uniform sampler2D uPositions;
uniform sampler2D uVelocities;
uniform sampler2D uRestPositions;
uniform float uSize;
uniform float uScale;
uniform float uTime;
uniform float uAmp;

void main() {
    #ifdef HAS_COLOR
    vColor = aColor;
    #endif

    vec3 pos = texture2D(uPositions, uv).xyz;
    vec4 vel = texture2D(uVelocities, uv);

    float freq = 0.09;
    float amp = uAmp;
    float curlTime = uTime * 0.01;

    vec3 restPos = texture2D(uRestPositions, uv).xyz;

    pos += noise(restPos * freq + curlTime) * amp;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.);
    #ifdef HAS_SIZE
    gl_PointSize = uSize * (uScale / length(mvPosition.xyz)) * aSize;
    #else
    gl_PointSize = uSize * (uScale / length(mvPosition.xyz));
    #endif
    gl_Position = projectionMatrix * mvPosition;
}
