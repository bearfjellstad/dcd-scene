#include <common>

#define ITERATIONS 10.0

uniform sampler2D texture;
uniform vec2 delta;

varying vec2 vUv;

void main() {

  vec4 color = vec4( 0.0 );

  float total = 0.0;

  // randomize the lookup values to hide the fixed number of samples

  float offset = rand( vUv );

  for ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {

    float percent = ( t + offset - 0.5 ) / ITERATIONS;
    float weight = 1.0 - abs( percent );

    color += texture2D( texture, vUv + delta * percent ) * weight;
    total += weight;

  }

  gl_FragColor = color / total;

}