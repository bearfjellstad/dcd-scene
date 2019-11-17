uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {

  vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );

  gl_FragColor = LinearToGamma( tex, float( GAMMA_FACTOR ) );

}
