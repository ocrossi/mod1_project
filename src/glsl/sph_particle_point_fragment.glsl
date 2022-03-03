// Map texture from points
#ifdef MAP
uniform sampler2D colorBuffer;

varying vec2 texCoords;
#endif

void main() {
#ifdef MAP
    gl_FragColor.xyz = (.5 + length(texture2D(colorBuffer, texCoords).xyz)) * vec3(.5, .8, 1.0) * .5;
    gl_FragColor.w = 1.0;
#else
    gl_FragColor = vec4(1.0);
#endif
}

