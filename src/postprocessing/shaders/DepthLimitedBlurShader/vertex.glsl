#include <common>

uniform vec2 size;

varying vec2 vUv;
varying vec2 vInvSize;

void main() {
	vUv = uv;
	vInvSize = 1.0 / size;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
