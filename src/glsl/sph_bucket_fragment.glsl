// Compute particle bucket index

varying float index;
uniform float numParticles;

void main() {
    gl_FragColor = vec4(index);
}
sph_bucket_vertex.glsl attribute vec2 positionUV;
attribute float particleIndex;

uniform sampler2D positionBuffer;
uniform vec3 numCells;
uniform float numParticles;
uniform float cellSize;

varying float index;

void main() {
    vec4 localPos = vec4(texture2D(positionBuffer, positionUV).xyz, 1.0);
    vec2 uv = getBucketUV(localPos.xyz, numCells, cellSize);

    // write index to depth
    gl_Position = vec4(uv * 2.0 - 1.0, particleIndex / numParticles * 2.0 - 1.0, 1.0);
    gl_PointSize = 1.0;

    // When reading, we assume 0 (clear value) means "no particle"
    index = particleIndex + 1.0;
}
