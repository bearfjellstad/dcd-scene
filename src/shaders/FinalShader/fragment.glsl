#include <dcd_finalUniforms>
uniform sampler2D tDiffuse;
uniform vec2 resolution;

uniform float vignetteBoost;
uniform float vignetteReduction;
uniform vec2 uMouse;

#ifdef SHOW_OVERLAY
    uniform sampler2D uOverlay;
    uniform vec3 uOverlayColor;
#endif
#ifdef SHOW_NFT
    #pragma glslify: blur = require(glsl-fast-gaussian-blur)
    uniform sampler2D uOverlay;
    uniform float uTime;
    uniform float uCaptureProgress;
#endif

varying vec2 vUv;

#define FXAA_REDUCE_MIN (1.0 / 128.0)
#define FXAA_REDUCE_MUL (1.0 / 8.0)
#define FXAA_SPAN_MAX 8.0

vec4 fxaa(sampler2D tex, vec2 coord) {
  vec2 res = 1. / resolution;

  vec3 rgbNW = texture2D(tex, (coord + vec2(-1.0, -1.0)) * res).xyz;
  vec3 rgbNE = texture2D(tex, (coord + vec2(1.0, -1.0)) * res).xyz;
  vec3 rgbSW = texture2D(tex, (coord + vec2(-1.0, 1.0)) * res).xyz;
  vec3 rgbSE = texture2D(tex, (coord + vec2(1.0, 1.0)) * res).xyz;
  vec4 rgbaM = texture2D(tex, coord * res);
  vec3 rgbM = rgbaM.xyz;
  vec3 luma = vec3(0.299, 0.587, 0.114);

  float lumaNW = dot(rgbNW, luma);
  float lumaNE = dot(rgbNE, luma);
  float lumaSW = dot(rgbSW, luma);
  float lumaSE = dot(rgbSE, luma);
  float lumaM = dot(rgbM, luma);
  float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
  float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

  vec2 dir;
  dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
  dir.y = ((lumaNW + lumaSW) - (lumaNE + lumaSE));

  float dirReduce =
      max((lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),
          FXAA_REDUCE_MIN);

  float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
  dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
            max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX), dir * rcpDirMin)) *
        res;
  vec4 rgbA = (1.0 / 2.0) *
              (texture2D(tex, coord * res + dir * (1.0 / 3.0 - 0.5)) +
               texture2D(tex, coord * res + dir * (2.0 / 3.0 - 0.5)));
  vec4 rgbB =
      rgbA * (1.0 / 2.0) +
      (1.0 / 4.0) *
          (texture2D(tex, coord * res + dir * (0.0 / 3.0 - 0.5)) +
           texture2D(tex, coord * res + dir * (3.0 / 3.0 - 0.5)));
  float lumaB = dot(rgbB, vec4(luma, 0.0));

  if ((lumaB < lumaMin) || (lumaB > lumaMax)) {
    return rgbA;
  } else {
    return rgbB;
  }
}

float vignette(vec2 uv, float boost, float reduction) {
  vec2 position = vUv - .5;
  return boost - length(position) * reduction;
}

float applySoftLightToChannel(float base, float blend) {
  return (
      (blend < 0.5)
          ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend))
          : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)));
}

vec4 softLight(vec4 base, vec4 blend) {
  vec4 color = vec4(applySoftLightToChannel(base.r, blend.r),
                    applySoftLightToChannel(base.g, blend.g),
                    applySoftLightToChannel(base.b, blend.b),
                    applySoftLightToChannel(base.a, blend.a));
  return color;
}

float ditherNoise(vec2 n, float offset) {
  return .5 - fract(sin(dot(n.xy + vec2(offset, 0.), vec2(12.9898, 78.233))) *
                    43758.5453);
}

void main() {
  vec2 coord = gl_FragCoord.xy;
  #include <dcd_finalPre>
  vec4 color = fxaa(tDiffuse, coord);

  color = softLight(
      color,
      vec4(vec3(vignette(vUv, vignetteBoost, vignetteReduction)), color.a));

  float n = ditherNoise(vUv, 0.0);
  color = softLight(color, vec4(0.5 + 0.001 * n)) + 0.01 * n;

  #ifdef SHOW_MOUSE_TRACE
  color += pow(1. - distance(uMouse, vUv), 4.);
  #endif

  #include <dcd_finalPost>

  #ifdef SHOW_OVERLAY
    float overlay = texture2D(uOverlay, vUv).r;
    color.rgb = mix(
        color.rgb,
        uOverlayColor,
        overlay
    );
  #endif

  #ifdef SHOW_NFT
    float overlay = texture2D(uOverlay, vUv).r;
    float bottomArea = step(0.825, 1. - vUv.y);
    vec2 bottomUv = vUv - 0.5;
    bottomUv *= 0.6;
    bottomUv += 0.5 + vec2(0., 0.35);

    vec3 bottomTex = blur(tDiffuse, bottomUv, resolution, vec2(8., 8.)).rgb;

    float bottomEffect = (sin(uCaptureProgress * 3.141592 * 5.9 + 3.141592 * 1.25) * 0.5 + 0.5);
    bottomEffect = clamp(pow(bottomEffect, 2.), 0., 1.4);
    vec3 bottomColor = mix(
        color.rgb,
        mix(vec3(0.), bottomTex, 1.),
        bottomArea * (0.2 + bottomEffect * 0.8) * 1.2
    );

    color.rgb = mix(
        bottomColor,
        vec3(1.),
        overlay
    );
  #endif

  gl_FragColor = color;
}
