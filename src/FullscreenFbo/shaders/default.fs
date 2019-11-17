varying vec2 vUv;

uniform sampler2D uTexture;
uniform vec2 uMouse;

void main() {
    vec3 tex = texture2D(uTexture, vUv).rgb;
    vec3 color = tex;

    float mouseDist = distance(uMouse, vUv);
    // if (mouseDist < 0.1) {
        float effect = 0.1 / mouseDist;
        color += effect * 0.02;
    // }
    color = min(vec3(1.), color);

    color -= 0.01;

    gl_FragColor = vec4(color, 1.);
}
