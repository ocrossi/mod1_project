// Project vertex on the view

#ifdef ALBEDO_MAP
varying vec2 texCoords;
#endif

#ifdef FOG
varying vec3 viewPosition;
#endif

void main() {
    vec3 localPos = position;
    vec4 viewPos = modelViewMatrix * vec4(localPos, 1.0);
    gl_Position = projectionMatrix * viewPos;
    #ifdef FOG
    viewPosition = viewPos.xyz;
    #endif

    #ifdef ALBEDO_MAP
    texCoords = uv;
    #endif
}
