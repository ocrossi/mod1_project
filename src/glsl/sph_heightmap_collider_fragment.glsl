uniform vec3 wallExtent;
uniform vec3 numCells;
uniform float cellSize;
uniform vec3 spherePosition;
uniform float sphereRadius;

uniform sampler2D heightMap;

// Get distance to the nearest wall given a position
float getDistance(vec3 pos)
{
    float wallDist = signedDistanceWalls(pos, wallExtent);

    // this is not entirely correct, but let's hope it's good enough
    vec3 size = numCells * cellSize;
    vec2 uv = pos.xz / size.xz + .5;
    uv.y = 1.0 - uv.y;
    float y =(texture2D(heightMap, uv).x - .5) * size.y;
    float heightMapDist = pos.y - y;

    return min(wallDist, heightMapDist);
}

// Get the nearest wall's average normal given a position
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

// Set the fragment vector's members to the nearest wall's normal and distance
void main() {
    vec3 pos = getCellPositionFromFragCoord(gl_FragCoord.xy, numCells, cellSize);
    float dist = getDistance(pos);
    vec3 normal = getNormal(pos);

    gl_FragColor = vec4(normal, dist);
}

