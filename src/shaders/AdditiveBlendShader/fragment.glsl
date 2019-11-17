uniform sampler2D tDiffuse;
uniform sampler2D tAdd;
uniform float amount;

varying vec2 vUv;

void main() {
	vec4 texelBase = texture2D(tDiffuse, vUv);
	vec4 texelAdd = texture2D(tAdd, vUv);

	gl_FragColor = texelBase + texelAdd * amount;
}
