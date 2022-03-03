// Initialize values for depth test

attribute vec2 positionUV;

uniform sampler2D positionBuffer;
uniform float particleSize;
uniform vec2 viewportSize;

varying float radius;
varying vec2 centerFrag;
varying vec3 viewPosition;

void main() {
    vec4 localPos = vec4(texture2D(positionBuffer, positionUV).xyz, 1.0);
    vec4 viewPos = modelViewMatrix * localPos;
    gl_Position = projectionMatrix * viewPos;
    radius = -projectionMatrix[1][1] * particleSize / viewPos.z * viewportSize.y;
    gl_PointSize = radius * 2.0;

    centerFrag = (gl_Position.xy / gl_Position.w + 1.0) * viewportSize * .5;

    viewPosition = viewPos.xyz;
}
