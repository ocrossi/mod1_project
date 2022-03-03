attribute vec2 positionUV;

uniform sampler2D positionBuffer;
uniform vec3 numCells;
uniform float cellSize;
uniform float particleRadius;
uniform float zSliceOffset;

varying vec3 particlePosition;

void main() {
    vec4 localPos = vec4(texture2D(positionBuffer, positionUV).xyz, 1.0);
    vec2 uv = getBucketUV(localPos.xyz, numCells, cellSize);
    uv.x += zSliceOffset / numCells.z;

    // Bucket indices
	gl_Position = vec4(uv * 2.0 - 1.0, 0.0, 1.0);

    float rad = cos(zSliceOffset * cellSize / particleRadius * PI * .5);
    float pointSize = ceil(particleRadius / cellSize * 2.0 * rad) + 1.0;
    gl_PointSize = pointSize;

    particlePosition = localPos.xyz;
}
