#include <common>
#include <packing>

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;

uniform float cameraNear;
uniform float cameraFar;
uniform float depthCutoff;

uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];
uniform float sampleWeights[ KERNEL_RADIUS + 1 ];

varying vec2 vUv;
varying vec2 vInvSize;

float getDepth( const in vec2 screenPosition ) {
	#if DEPTH_PACKING == 1
	  return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
	#else
	  return texture2D( tDepth, screenPosition ).x;
	#endif
}

float getViewZ( const in float depth ) {
	#if PERSPECTIVE_CAMERA == 1
	  return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
	#else
	  return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
	#endif
}

void main() {
	float depth = getDepth(vUv);

	if (depth >= ( 1.0 - EPSILON )) {
		discard;
	}

	float centerViewZ = -getViewZ(depth);
	bool rBreak = false, lBreak = false;

	float weightSum = sampleWeights[0];
	vec4 diffuseSum = texture2D(tDiffuse, vUv) * weightSum;

	for (int i = 1; i <= KERNEL_RADIUS; i ++) {

		float sampleWeight = sampleWeights[i];
		vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;

		vec2 sampleUv = vUv + sampleUvOffset;
		float viewZ = -getViewZ(getDepth(sampleUv));

		if (abs(viewZ - centerViewZ) > depthCutoff) rBreak = true;

		if (!rBreak) {
			diffuseSum += texture2D(tDiffuse, sampleUv) * sampleWeight;
			weightSum += sampleWeight;
		}

		sampleUv = vUv - sampleUvOffset;
		viewZ = -getViewZ(getDepth(sampleUv));

		if (abs(viewZ - centerViewZ) > depthCutoff) lBreak = true;

		if (!lBreak) {
			diffuseSum += texture2D(tDiffuse, sampleUv) * sampleWeight;
			weightSum += sampleWeight;
		}
	}

	gl_FragColor = diffuseSum / weightSum;
}
