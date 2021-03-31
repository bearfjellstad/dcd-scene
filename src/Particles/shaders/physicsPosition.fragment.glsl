#pragma glslify: noise = require(glsl-curl-noise)
uniform float uTime;
uniform float uAmp;
uniform sampler2D uRestPositions;

void main()	{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 texPos = texture2D(uPositions, uv);
    vec4 texVel = texture2D(uVelocities, uv);

    vec3 pos = texPos.xyz;
    vec3 vel = texVel.xyz;

    #ifdef HAS_VELOCITY
        pos.xy += vel.xy;
    #else
        float freq = 0.09;
        float amp = uAmp;
        float curlTime = uTime * 0.01;

        vec3 restPos = texture2D(uRestPositions, uv).xyz;
        pos = restPos + noise(restPos * freq + curlTime) * amp;
    #endif

    gl_FragColor = vec4( pos, 1.0 );
}
