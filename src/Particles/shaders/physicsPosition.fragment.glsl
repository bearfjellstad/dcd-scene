void main()	{
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 texPos = texture2D(uPositions, uv);
    vec4 texVel = texture2D(uVelocities, uv);

    vec3 pos = texPos.xyz;
    vec3 vel = texVel.xyz;
    // float life = texVel.w;

    pos.xy += vel.xy;

    gl_FragColor = vec4( pos, 1.0 );
}
