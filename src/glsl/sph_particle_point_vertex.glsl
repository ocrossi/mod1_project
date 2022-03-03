attribute vec2 positionUV;

uniform sampler2D positionBuffer;
uniform float particleSize;

#ifdef MAP
varying vec2 texCoords;
#endif

void main() {
    vec4 localPos = vec4(texture2D(positionBuffer, positionUV).xyz, 1.0);
    vec4 viewPos = modelViewMatrix * localPos;
    gl_Position = projectionMatrix * viewPos;
    gl_PointSize = particleSize;

    #ifdef MAP
    texCoords = positionUV;
    #endif

}
