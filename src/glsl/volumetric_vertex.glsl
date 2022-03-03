varying vec2 texCoords;

void main() {
    gl_Position = vec4(position, 1.0);
    texCoords = uv;
}

