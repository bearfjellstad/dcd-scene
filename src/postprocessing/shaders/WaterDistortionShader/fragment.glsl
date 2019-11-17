/**
 * Water distortion effect using noise for the X value
 * Based on https://www.shadertoy.com/view/lljBWy
 */

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform float iTime;
uniform float distortionSpeed;

lowp float snoise(in lowp vec2 v);

void mainImage( out vec4 fragColor, in vec2 uv ) {
	float t = iTime * 0.8;
  uv.y += distortionSpeed * sin(t + uv.x * 5.) * cos(t + uv.y * 8.) * 0.2;
  uv.x += distortionSpeed * snoise(uv * (4.3 * (distortionSpeed / 10.7 + 1.2)) - vec2(t * 1.2, 0.0));
  float tt = mod(t, 10.0);

  fragColor = texture(tDiffuse, uv);
}

void main() {
  mainImage(gl_FragColor, vUv);
}

lowp vec3 permute(in lowp vec3 x) {
  return mod(x * x * 34.0 + x, 289.0);
}

lowp float snoise(in lowp vec2 v) {
  lowp vec2 i = floor((v.x+v.y) * 0.36602540378443 + v),
    x0 = (i.x + i.y) * 0.211324865405187 + v - i;

  lowp float s = step(x0.x, x0.y);

  lowp vec2 j = vec2(1.0 - s, s),
    x1 = x0 - j + 0.211324865405187,
    x3 = x0 - 0.577350269189626;

  i = mod(i, 289.0);
  lowp vec3 p = permute( permute( i.y + vec3(0, j.y, 1))+ i.x + vec3(0, j.x, 1)),
    m = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x3, x3)), 0.0),
    x = fract(p * 0.024390243902439) * 2.0 - 1.0,
    h = abs(x) - 0.5,
    a0 = x - floor(x + 0.5);

  return 0.5 + 65.0 * dot(pow(m, vec3(4.0)) * (-0.85373472095314 * (a0 * a0 + h * h ) + 1.79284291400159), a0 * vec3(x0.x, x1.x, x3.x) + h * vec3(x0.y, x1.y, x3.y));
}
