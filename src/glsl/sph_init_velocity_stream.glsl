// Diagonal vector field
vec3 initVelocity(float index, vec3 numCells, float cellSize)
{
    return vec3(numCells.x, 0.0, numCells.y) * cellSize;
}
