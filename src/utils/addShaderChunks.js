import { getOriginalRef } from '../utils/threeProxy';

export default () => {
    const THREE = getOriginalRef();

    THREE.ShaderChunk.dcd_uvCover = `vec2 uvCover(in vec2 _uv, vec2 boxDimensions, vec2 textureDimensions) {
        vec2 s = boxDimensions;
        vec2 i = textureDimensions;
        float rs = s.x / s.y;
        float ri = i.x / i.y;
        vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
        vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
        vec2 uv = _uv * s / new + offset;
        return uv;
    }`;
    THREE.ShaderChunk.dcd_luma = `float luma(vec3 color) {
        return dot(vec3(0.3, 0.59, 0.11), color);
    }`;
    THREE.ShaderChunk.dcd_circle = `float circle(in vec2 _st, in float _radius, in float _smoothing) {
        vec2 l = _st - vec2(0.5);
        return 1.0 - smoothstep(
            _radius - (_radius * _smoothing),
            _radius + (_radius * _smoothing),
            dot(l, l) * 4.0
        );
    }`;
    THREE.ShaderChunk.dcd_darken = `float darken(float base, float blend) {return min(blend,base);}vec3 darken(vec3 base, vec3 blend) {return vec3(darken(base.r,blend.r),darken(base.g,blend.g),darken(base.b,blend.b));}vec3 darken(vec3 base, vec3 blend, float opacity) {return (darken(base, blend) * opacity + base * (1.0 - opacity));}`;
    THREE.ShaderChunk.dcd_lighten = `float lighten(float base, float blend) {return max(blend,base);}vec3 lighten(vec3 base, vec3 blend) {return vec3(lighten(base.r,blend.r),lighten(base.g,blend.g),lighten(base.b,blend.b));}vec3 lighten(vec3 base, vec3 blend, float opacity) {return (lighten(base, blend) * opacity + base * (1.0 - opacity));}`;
    THREE.ShaderChunk.dcd_screen = `float screen(float base, float blend) {return 1.0-((1.0-base)*(1.0-blend));}vec3 screen(vec3 base, vec3 blend) {return vec3(screen(base.r,blend.r),screen(base.g,blend.g),screen(base.b,blend.b));}vec3 screen(vec3 base, vec3 blend, float opacity) {return (screen(base, blend) * opacity + base * (1.0 - opacity));}`;
    THREE.ShaderChunk.dcd_overlay = `float overlay(float base, float blend) {return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));}vec3 overlay(vec3 base, vec3 blend) {return vec3(overlay(base.r,blend.r),overlay(base.g,blend.g),overlay(base.b,blend.b));}vec3 overlay(vec3 base, vec3 blend, float opacity) {return (overlay(base, blend) * opacity + base * (1.0 - opacity));}`;
    THREE.ShaderChunk.dcd_polygon = `float polygon(in vec2 _st, in float sideCount, in float smoothing) {
        float _PI = 3.14159265359;
        _st = _st * 2.0 - 1.0;
        float angle = atan(_st.x, _st.y) + _PI;
        float radius = (_PI * 2.) / sideCount;
        float shape = cos(floor(0.5 + angle / radius) * radius - angle) * length(_st);
        return 1.0 - smoothstep(0.4, 0.4 + smoothing, shape);
    }`;
    THREE.ShaderChunk.dcd_rgb = `vec3 rgb(float r, float g, float b) {return vec3(r / 255., g / 255., b / 255.);}vec3 rgb(float c) {return vec3(c / 255.);}`;
    THREE.ShaderChunk.dcd_hsv2rgb = `vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }`;
    THREE.ShaderChunk.dcd_rgb2hsv = `vec3 rgb2hsv(vec3 c) {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }`;
    THREE.ShaderChunk.dcd_sat = `
    ${THREE.ShaderChunk.dcd_rgb2hsv}
    ${THREE.ShaderChunk.dcd_hsv2rgb}
    vec3 sat(vec3 c, float amount) {
        vec3 hsv = rgb2hsv(c);
        hsv.y += amount;
        return hsv2rgb(hsv);
    }`;

    THREE.ShaderChunk.dcd_rotateX = `
    mat3 rotateX(float rad) {
        float c = cos(rad);
        float s = sin(rad);
        return mat3(
            1.0, 0.0, 0.0,
            0.0, c, s,
            0.0, -s, c
        );
    }`;

    THREE.ShaderChunk.dcd_rotateY = `
    mat3 rotateY(float rad) {
      float c = cos(rad);
      float s = sin(rad);
      return mat3(
          c, 0.0, -s,
          0.0, 1.0, 0.0,
          s, 0.0, c
      );
    }`;

    THREE.ShaderChunk.dcd_finalUniforms = ``;
    THREE.ShaderChunk.dcd_finalPre = ``;
    THREE.ShaderChunk.dcd_finalPost = ``;
};
