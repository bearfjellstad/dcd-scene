uniform float opacity;

uniform sampler2D tDiffuse;

varying vec2 vUv;

#include <packing>

void main() {

  float depth = 1.0 - unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );
  gl_FragColor = opacity * vec4( vec3( depth ), 1.0 );

}
