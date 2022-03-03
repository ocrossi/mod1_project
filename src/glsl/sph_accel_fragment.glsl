// Calculate particle forces using it's neighbours

uniform sampler2D bucketBuffer;
uniform sampler2D positionBuffer;
uniform sampler2D densityBuffer;
uniform sampler2D velocityBuffer;

varying vec2 texCoords;

uniform vec3 numCells;
uniform vec2 particleBufferSize;
uniform vec2 bucketPixelSize;
uniform float cellSize;
uniform float gravity;
uniform float h;
uniform float h2;
uniform float pressNorm;
uniform float viscNorm;
uniform float surfaceNorm;
uniform float viscosity;
uniform float stiffness;
uniform float restDensity;
uniform float mass;
uniform float drag;
uniform float dt;
uniform float curvatureThreshold;
uniform float surfaceTension;
uniform float maxParticleIndex;

float pressure(float density)
{
    // rest density is there to cause attraction when density is too low
    return stiffness * (density - restDensity);
}

// all these contributions have mass removed from them, as it's constant we add it later

vec3 getPressContrib(vec3 R_ij, float dist, float p_i, float rho_j)
{
    float p_j = pressure(rho_j);
    float d = max(h - dist, 0.0);
    vec3 gradW = pressNorm * d * d * normalize(R_ij);
    return -(p_i + p_j) * .5 /**  mass *// rho_j * gradW;
}

vec3 getViscContrib(vec3 R_ij, float dist, vec3 v_i, vec3 v_j, float rho_j)
{
    float diff = max(h - dist, 0.0);
    float laplW = viscNorm * diff;
    return (v_j - v_i) /** mass *// rho_j * laplW;
}

vec3 getGradColContrib(vec3 R_ij, float dist, float rho_j)
{
    float d = max(h2 - dist * dist, 0.0);
    vec3 gradW = surfaceNorm * R_ij * d * d;
    return gradW /** mass*/ / rho_j;
}

float getLaplaceColContrib(vec3 R_ij, float dist, float rho_j)
{
    float d1 = max(h2 - dist * dist, 0.0);
    float d2 = 3.0 * h2 - 7.0 * dist * dist;
    float laplW = surfaceNorm * d1 * d2;
    return laplW /** mass *// rho_j;
}

void main() {
    vec4 posSample = texture2D(positionBuffer, texCoords);
    vec3 v_i = texture2D(velocityBuffer, texCoords).xyz;
    vec3 x_i = posSample.xyz;
    float rho_i = texture2D(densityBuffer, texCoords).x;
    float p_i = pressure(rho_i);
    float thisIndex = posSample.w;

    vec3 Fpress = vec3(0.0);
    vec3 Fvisc = vec3(0.0);

	// Get the current bucket
    vec2 bucketUV = getBucketUV(x_i, numCells, cellSize);

    vec3 normal = vec3(0.0);
    float laplCol = 0.0;

	// Check neighbour cells in a specific radius and calculate contributions

    for (int z = -SAMPLE_RADIUS; z <= SAMPLE_RADIUS; ++z) {
        for (int y = -SAMPLE_RADIUS; y <= SAMPLE_RADIUS; ++y) {
            for (int x = -SAMPLE_RADIUS; x <= SAMPLE_RADIUS; ++x) {
                vec2 uvNeigh = bucketUV + vec2(x, y) * bucketPixelSize;
                uvNeigh.x += float(z) / numCells.z;
                vec4 partIndices = texture2D(bucketBuffer, uvNeigh);

                for (int p = 0; p < 4; ++p) {
                    float index = partIndices[p];

                    if (index > 0.0 && thisIndex != index) {
                        vec2 uv = getParticleBufferUV(index, particleBufferSize);
                        vec3 x_j = texture2D(positionBuffer, uv).xyz;
                        vec3 v_j = texture2D(velocityBuffer, uv).xyz;
                        float rho_j = texture2D(densityBuffer, uv).x;
                        vec3 R_ij = x_i - x_j;
                        float dist = length(R_ij);
                        Fpress += getPressContrib(R_ij, dist, p_i, rho_j);
                        Fvisc += getViscContrib(R_ij, dist, v_i, v_j, rho_j);
                        normal += getGradColContrib(R_ij, dist, rho_j);
                        laplCol += getLaplaceColContrib(R_ij, dist, rho_j);
                    }
                }
            }
        }
    }

	// Scale by the constant mass

    laplCol *= mass;
    normal *= mass;
    Fpress *= mass;
    Fvisc *= mass;

    vec3 Fsurface = vec3(0.0);
    float normalLen = length(normal);
    if (normalLen > curvatureThreshold) {
        float curvature = -laplCol / normalLen;
        Fsurface = surfaceTension * curvature * normal / normalLen;
    }

    vec3 dragAccell = -v_i * drag;
    vec3 F = viscosity * Fvisc + Fpress + Fsurface;
    vec3 a_i = F / rho_i;
    a_i.y += gravity;
    a_i += dragAccell;

    if (thisIndex > maxParticleIndex)
        a_i = vec3(0.0);

	// Apply the forces to the color vector
    gl_FragColor.xyz = a_i;
    gl_FragColor.w = 1.0;
}


