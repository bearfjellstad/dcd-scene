#ifdef HAS_COLOR
attribute vec3 aColor;
varying vec3 vColor;
#endif

#ifdef HAS_SIZE
attribute float aSize;
#endif

uniform sampler2D positions;
uniform float uSize;
uniform float uScale;


void main() {
    #ifdef HAS_COLOR
    vColor = aColor;
    #endif

    vec4 tex = texture2D(positions, position.xy);
    vec3 pos = tex.xyz;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.);
    #ifdef HAS_SIZE
    gl_PointSize = uSize * (uScale / length(mvPosition.xyz)) * aSize;
    #else
    gl_PointSize = uSize * (uScale / length(mvPosition.xyz));
    #endif
    gl_Position = projectionMatrix * mvPosition;
}
