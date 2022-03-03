varying vec2 texCoords;

uniform sampler2D densityField;
uniform vec2 rcpTexSize;
uniform vec3 numCells;

float sampleDensity(vec2 texCoord)
{
    vec4 samp = texture2D(densityField, texCoord);
    return samp.x;
}

void main() {
    float right = sampleDensity(texCoords + vec2(rcpTexSize.x, 0.0));
    float left = sampleDensity(texCoords - vec2(rcpTexSize.x, 0.0));
    float top = sampleDensity(texCoords + vec2(0.0, rcpTexSize.y));
    float bottom = sampleDensity(texCoords - vec2(0.0, rcpTexSize.y));
    float far = sampleDensity(texCoords + vec2(1.0/numCells.z, 0.0));
    float near = sampleDensity(texCoords - vec2(1.0/numCells.z, 0.0));
    // use the inverse gradient as the hint of direction where most light comes from (similar to bent normals)
    vec3 grad = vec3(right - left, top - bottom, far - near);
    grad /= max(length(grad), 0.001);
    gl_FragColor = vec4(-grad * .5 + .5, 1.0);
}
