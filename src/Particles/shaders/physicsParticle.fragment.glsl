#include <dcd_circle>

#ifdef HAS_COLOR
varying vec3 vColor;
#endif

void main() {
    #ifdef HAS_COLOR
    vec3 color = vColor;
    #else
    vec3 color = vec3(1.);
    #endif

    vec2 pos = gl_PointCoord.xy;

    float alpha = circle(pos, 0.1, 2.9);
    gl_FragColor = vec4(color, alpha);
}
