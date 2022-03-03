// cell-position conversion utilities

#define PI 3.141592

struct Collision {
    bool collided;
    vec3 normal;
    vec3 point;
//    float d;
};

vec2 getBucketUV(vec3 position, vec3 numCells, float cellSize)
{
    // map position to actual cell
    position = position / cellSize + numCells * .5;
    vec2 uv = (position.xy + vec2(.5)) / vec2(numCells.x * numCells.z, numCells.y);
    uv.x += floor(position.z + .5) / numCells.z;
    return uv;
}

vec2 getParticleBufferUV(float particleIndex, vec2 texSize)
{
    particleIndex -= 1.0;
    vec2 uv;
    uv.y = floor(particleIndex / texSize.x);
    uv.x = particleIndex - uv.y * texSize.x;
    return (uv + vec2(.5)) / texSize;
}

// the uv coord in the particle rect texture
vec4 sampleParticleData(sampler2D tex, float particleIndex, vec2 texSize)
{
    vec2 uv = getParticleBufferUV(particleIndex, texSize);
    return texture2D(tex, uv);
}

vec4 sampleCellPoint(sampler2D tex, vec3 pos, vec3 numCells, float cellSize)
{
    pos = pos / cellSize + numCells * .5;
    vec2 uv;
    uv.xy = pos.xy / vec2(numCells.x * numCells.z, numCells.y);
    uv.x += pos.z / numCells.z;
    return texture2D(tex, uv);
}

vec4 sampleCellLinear(sampler2D tex, vec3 pos, vec3 numCells, float cellSize)
{
    vec2 uv;
    pos = pos / cellSize + numCells * .5;
    uv.xy = pos.xy / vec2(numCells.x * numCells.z, numCells.y);
    float flZ = floor(pos.z);
    uv.x += flZ / numCells.z;

    vec4 val1 = texture2D(tex, uv);
    uv.x += 1.0 / numCells.z;
    vec4 val2 = texture2D(tex, uv);

    return mix(val1, val2, pos.z - flZ);
}

bool isInsideFluidDomain(vec3 pos, vec3 numCells, float cellSize)
{
    vec3 he = (numCells * .5) * cellSize;
    bvec3 g = greaterThanEqual(pos, -he);
    bvec3 l = lessThanEqual(pos, he);
    return all(g) && all(l);
}

vec3 getCellPosition(vec2 uv, vec3 numCells, float cellSize)
{
    vec3 cell;
    // coordinates in cell coords (cell Y matches pixel Y)
    cell.xy = uv * vec2(numCells.x * numCells.z, numCells.y);
    cell.z = floor(cell.x / numCells.x);
    cell.x -= cell.z * numCells.x;
    cell -= numCells * .5;
    return cell * cellSize;
}

vec3 getCellPositionFromFragCoord(vec2 fragCoord, vec3 numCells, float cellSize)
{
    vec3 cell;
    // coordinates in cell coords (cell Y matches pixel Y)
    cell.xy = fragCoord;
    cell.z = floor(cell.x / numCells.x);
    cell.x -= cell.z * numCells.x;
    cell -= numCells * .5;
    return cell * cellSize;
}
