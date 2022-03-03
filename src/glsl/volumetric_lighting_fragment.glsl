varying vec2 texCoords;

uniform sampler2D densityField;
uniform samplerCube irradiance;
uniform vec3 numCells;
uniform vec3 absorption;
uniform vec3 cameraPos;
uniform float sampleStep;
uniform float cellSize;
uniform vec3 mieG;

struct DirectionalLight {
    vec3 direction;
    vec3 color;
    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
};

struct PointLight {
    vec3 position;
    vec3 color;
    float distance;
    float decay;
    int shadow;
    float shadowBias;
    float shadowRadius;
    vec2 shadowMapSize;
};

#if NUM_DIR_LIGHTS > 0
uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
#endif

#if NUM_POINT_LIGHTS > 0
uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
#endif


// does this contain anything useful?
// http://orbit.dtu.dk/files/5501107/paper.pdf
vec3 mieFactor(vec3 lightDir, vec3 viewDir)
{
    float cosAng = dot(lightDir, viewDir);
    vec3 num = vec3(1.0) - mieG;
    vec3 p = vec3(1.0) + mieG*mieG - 2.0 * mieG * cosAng;
    p.x = pow(p.x, 1.5);
    p.y = pow(p.y, 1.5);
    p.z = pow(p.z, 1.5);
    return num * num / (4.0 * PI * p);
}

float sampleDensity(vec3 pos)
{
    vec4 samp = sampleCellLinear(densityField, pos, numCells, cellSize);
    #ifdef WATER
        samp.x = samp.x < 0.0? 1.0 : 0.0;
    #endif
    return isInsideFluidDomain(pos, numCells, cellSize)? samp.x : 0.0;
}

vec3 getTransmittedLight(vec3 pos, DirectionalLight light, vec3 viewDir)
{
    float amount = 0.0;
    vec3 marchStep = light.direction * sampleStep;
    for (int i = 0; i < NUM_SAMPLES; ++i) {
        amount += sampleDensity(pos);
        pos += marchStep;
    }

    vec3 mie = mieFactor(light.direction, viewDir);

    return exp(-amount * absorption * sampleStep) * light.color * mie;
}

vec3 getTransmittedLight(vec3 pos, PointLight light, vec3 viewDir, vec3 localPos)
{
    float amount = 0.0;
    vec3 lightDir = light.position - localPos;
    float len = length(lightDir);
    float step = min(len / float(NUM_SAMPLES), sampleStep);
    lightDir = normalize(lightDir);
    vec3 marchStep = lightDir * step;

    for (int i = 0; i < NUM_SAMPLES; ++i) {
        pos += marchStep;
        amount += sampleDensity(pos);
    }

    vec3 mie = mieFactor(lightDir, viewDir);

// pretend the light has some sort of size
//    len = max(len, 10.0);
    return exp(-amount * absorption * step) * mie * light.color / (len * len);
}

vec3 getGlobalIllum()
{
    float occlStrength = .1;
    float sampleDist = 2.0;
    vec2 rcpTexSize = vec2(1.0 / (numCells.x * numCells.z), 1.0 / numCells.y) * sampleDist;
    float right = texture2D(densityField, texCoords + vec2(rcpTexSize.x, 0.0)).x;
    float left = texture2D(densityField, texCoords - vec2(rcpTexSize.x, 0.0)).x;
    float top = texture2D(densityField, texCoords + vec2(0.0, rcpTexSize.y)).x;
    float bottom = texture2D(densityField, texCoords - vec2(0.0, rcpTexSize.y)).x;
    float far = texture2D(densityField, texCoords + vec2(sampleDist/numCells.z, 0.0)).x;
    float near = texture2D(densityField, texCoords - vec2(sampleDist/numCells.z, 0.0)).x;
    // use the inverse gradient as the hint of direction where most light comes from (similar to bent normals)
    vec3 grad = -normalize(vec3(right - left, top - bottom, far - near));
    right = clamp(right * occlStrength, 0.0, 1.0);
    left = clamp(left * occlStrength, 0.0, 1.0);
    top = clamp(top * occlStrength, 0.0, 1.0);
    bottom = clamp(bottom * occlStrength, 0.0, 1.0);
    far = clamp(far * occlStrength, 0.0, 1.0);
    near = clamp(near * occlStrength, 0.0, 1.0);

    float occl = (6.0 - right - left - top - bottom - far - near) / 6.0;
    vec3 cube = textureCube(irradiance, grad).xyz;
    return cube * cube * occl;
}

void main() {
    vec4 data = texture2D(densityField, texCoords);
    vec3 localPos = getCellPosition(texCoords, numCells, cellSize);
    vec3 color = vec3(0.0);
    vec3 viewDir = normalize(cameraPos - localPos);

    #if NUM_DIR_LIGHTS > 0
        for (int i = 0; i < NUM_DIR_LIGHTS; ++i) {
            color += getTransmittedLight(localPos, directionalLights[i], viewDir);
        }
    #endif

    #if NUM_POINT_LIGHTS > 0
        for (int i = 0; i < NUM_POINT_LIGHTS; ++i) {
            color += getTransmittedLight(localPos, pointLights[i], viewDir, localPos);
        }
    #endif

    #ifndef WATER
    color += getGlobalIllum() * clamp(data.x, 0.0, 1.0);
    #endif

    gl_FragColor.xyz = color;

    #ifdef WATER
//        gl_FragColor.w = smoothstep(0.0, -0.001, data.x);
        gl_FragColor.w = data.x < 0.0? 1.0 : 0.0;
    #else
        gl_FragColor.w = data.x;
    #endif
}
