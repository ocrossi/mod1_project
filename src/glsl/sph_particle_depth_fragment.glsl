// Check for depth from center to discard invisible particles

varying float radius;
varying vec2 centerFrag;
varying vec3 viewPosition;

uniform float particleSize;
uniform float cameraNear;
uniform float rcpCameraRange;
uniform mat4 projectionMatrix;

void main() {
    float radius2 = radius * radius;
    vec2 diff = gl_FragCoord.xy - centerFrag;
    diff /= radius;
    float dist2 = dot(diff, diff);
    if (dist2 > 1.0) discard;

    vec3 normal;
    normal.xy = diff;
    normal.z = sqrt(1.0 - dist2);

    vec3 pos = viewPosition - normal * particleSize;
    float linearDepth = (-pos.z - cameraNear) * rcpCameraRange;

    gl_FragColor = floatToRGBA8(linearDepth);
    gl_FragDepthEXT = linearDepth;
}

