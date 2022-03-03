// Compute particle densities using surrounding particles

uniform sampler2D positionBuffer;
uniform sampler2D collisionBuffer;
uniform sampler2D bucketBuffer;

varying vec2 texCoords;

uniform vec3 numCells;
uniform float cellSize;
uniform vec2 particleBufferSize;
uniform vec2 bucketPixelSize;
uniform float mass;
uniform float h2;
uniform float kernelNorm;

float kernel(float dist2)
{
    // 6th degree polynomial kernel
    float diff = max(h2 - dist2, 0.0);
    return kernelNorm * pow(diff, 3.0);
}

void main() {
    vec3 x_i = texture2D(positionBuffer, texCoords).xyz;

    // when using half float texture, this messes up
    float sum = 0.0;

    vec2 bucketUV = getBucketUV(x_i, numCells, cellSize);
    for (int z = -SAMPLE_RADIUS; z <= SAMPLE_RADIUS; ++z) {
        for (int y = -SAMPLE_RADIUS; y <= SAMPLE_RADIUS; ++y) {
            for (int x = -SAMPLE_RADIUS; x <= SAMPLE_RADIUS; ++x) {
                vec2 uvNeigh = bucketUV + vec2(x, y) * bucketPixelSize;
                uvNeigh.x += float(z) / numCells.z;
                vec4 partIndices = texture2D(bucketBuffer, uvNeigh);

                for (int p = 0; p < 4; ++p) {
                    float index = partIndices[p];
                    if (index > 0.0) {
                        vec3 x_j = sampleParticleData(positionBuffer, index, particleBufferSize).xyz;
                        vec3 r = x_i - x_j;
                        float dist2 = dot(r, r);
                        sum += kernel(dist2);
                    }
                }
            }
        }
    }

//    float wallDist = texture2D(collisionBuffer, bucketUV).w;
//    sum += kernel(wallDist * wallDist) * 3.0;
    sum *= mass;

    gl_FragColor = vec4(sum, sum, sum, 1.0);
}

