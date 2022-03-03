// Compute particle's next position and store it in the fragment vector

varying vec2 texCoords;
uniform sampler2D velocityBuffer;
uniform sampler2D positionBuffer;
uniform sampler2D accelBuffer;

uniform float dt;
uniform vec3 wallExtent;
uniform float maxParticleIndex;

void main() {
    vec4 posSample = texture2D(positionBuffer, texCoords);
    vec3 a_i = texture2D(accelBuffer, texCoords).xyz;
    vec3 v_i = texture2D(velocityBuffer, texCoords).xyz;
    vec3 x_i = posSample.xyz;
    float thisIndex = posSample.w;

    vec3 x_i_1 = x_i + dt * (v_i + .5 * a_i * dt);

//    x_i_1 = min(x_i_1, wallExtent);
//    x_i_1 = max(x_i_1, -wallExtent);

    if (thisIndex > maxParticleIndex)
        x_i_1 = x_i;

    gl_FragColor = vec4(x_i_1, thisIndex);
}

