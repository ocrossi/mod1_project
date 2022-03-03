// Compute the distance from a particle to the frag vector coordinates

varying vec3 particlePosition;

uniform vec3 numCells;
uniform float cellSize;
uniform float particleRadius;

void main() {
    vec3 pos = getCellPositionFromFragCoord(gl_FragCoord.xy, numCells, cellSize);
    // the * 10 is just so that interpolations find the edge quicker
    float signedDist = distance(particlePosition, pos) - particleRadius * 100.0;
    gl_FragColor = vec4(signedDist, 0.0, 0.0, 1.0);
}

