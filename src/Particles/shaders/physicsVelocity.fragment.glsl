uniform vec3 uMouse3d;
uniform sampler2D uRestPositions;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    vec4 texPos = texture2D(uPositions, uv);
    vec3 texRestPos = texture2D(uRestPositions, uv).xyz;
    vec4 texVel = texture2D(uVelocities, uv);
    vec3 position = texPos.xyz;
    vec3 velocity = texVel.xyz;

    float distToMouse = distance(position.xy, uMouse3d.xy);
    float radiusMouse = float(VELOCITY_MOUSE_RADIUS);
    float strengthMouse = float(VELOCITY_MOUSE_STRENGTH);

    if (distToMouse < radiusMouse) {
        float offset = 1.0 - distToMouse / radiusMouse;
        vec3 dirToCenter = normalize(position - uMouse3d);
        velocity += dirToCenter * offset * strengthMouse;
    } else {
        float distToRest = distance(position.xy, texRestPos.xy);
        if (distToRest > 0.1) {
            vec2 dirToCenter = normalize(texRestPos.xy - position.xy);
            velocity.xy += dirToCenter * distToRest * float(VELOCITY_REST_INERTIA);
        }

        velocity *= float(VELOCITY_DAMING);
    }

    gl_FragColor = vec4( velocity, 1. );
}
