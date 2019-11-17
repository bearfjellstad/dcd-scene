uniform vec2 resolution;

varying vec2 vUv;
varying vec4 vOffset[ 3 ];

void SMAAEdgeDetectionVS( vec2 texcoord ) {
  vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 ); // WebGL port note: Changed sign in W component
  vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 ); // WebGL port note: Changed sign in W component
  vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 ); // WebGL port note: Changed sign in W component
}

void main() {

  vUv = uv;

  SMAAEdgeDetectionVS( vUv );

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
