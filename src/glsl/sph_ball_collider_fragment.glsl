// Compute particle to ball collisions

uniform vec3 numCells;
uniform vec3 wallExtent;
uniform float cellSize;
uniform vec3 spherePosition;
uniform float sphereRadius;

// Used to check for intersections
float getDistance(vec3 pos)
{
    float wallDist = signedDistanceWalls(pos, wallExtent);
    float sphereDist = signedDistanceSphere(pos, spherePosition, sphereRadius);
    return min(wallDist, sphereDist);
}

// Used to calculate a collision's resulting force
vec3 getNormal(vec3 pos)
{
    float r = getDistance(pos + vec3(cellSize, 0.0, 0.0));
    float l = getDistance(pos - vec3(cellSize, 0.0, 0.0));
    float t = getDistance(pos + vec3(0.0, cellSize, 0.0));
    float b = getDistance(pos - vec3(0.0, cellSize, 0.0));
    float n = getDistance(pos + vec3(0.0, 0.0, cellSize));
    float f = getDistance(pos - vec3(0.0, 0.0, cellSize));

    // normalization happens in collision test anyway, so no need for it here
    return normalize(vec3(r - l, t - b, n - f));
}

void main() {
    vec3 pos = getCellPositionFromFragCoord(gl_FragCoord.xy, numCells, cellSize);
    float dist = getDistance(pos);
    vec3 normal = getNormal(pos);

	// Set the color vector to the resulting force
    gl_FragColor = vec4(normal, dist);
}

