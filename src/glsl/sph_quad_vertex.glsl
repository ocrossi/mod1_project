// Set position and texCoords

varying vec2 texCoords;

void main() {
    texCoords = uv;
    gl_Position = vec4(position, 1.0);
}
