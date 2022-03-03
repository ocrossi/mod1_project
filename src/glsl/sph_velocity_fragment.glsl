// Compute the next velocity and store it in the fragment vector
varying vec2 texCoords;
uniform sampler2D positionBuffer;
uniform sampler2D velocityBuffer;
uniform sampler2D accelBuffer1;
uniform sampler2D accelBuffer2;
uniform sampler2D collisionBuffer;

uniform float dt;
uniform vec3 numCells;
uniform float cellSize;
uniform float restDistance;
uniform float maxParticleIndex;

void main() {
    vec4 posSample = texture2D(positionBuffer, texCoords);
    vec3 a_i = texture2D(accelBuffer1, texCoords).xyz;
    vec3 a_i_p = texture2D(accelBuffer2, texCoords).xyz;
    vec3 v_i = texture2D(velocityBuffer, texCoords).xyz;
    vec3 x_i = posSample.xyz;
    float thisIndex = posSample.w;

    vec3 v_i_1 = v_i + dt * (a_i + a_i_p) * .5;

    vec3 x_i_1 = x_i + v_i_1 * dt;
    vec4 boundSample = sampleCellLinear(collisionBuffer, x_i_1, numCells, cellSize);
    vec3 wallNormal = normalize(boundSample.xyz);
    float wallDist = max(restDistance * 2.0 - boundSample.w, 0.0);
    // move the particle back to the correct rest distance, this enforces no-slip condition on velocity
    x_i_1 += wallDist * wallNormal;
    // update the velocity to match
    v_i_1 = (x_i_1 - x_i) / dt;

    if (thisIndex > maxParticleIndex)
        v_i_1 = initVelocity(thisIndex, numCells, cellSize);

    gl_FragColor = vec4(v_i_1, 1.0);
}

