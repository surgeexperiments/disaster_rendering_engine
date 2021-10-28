export default  `
attribute vec3 position;
attribute vec2 texCoord;

uniform mat4 modelViewProjectionMatrix;

varying vec2 v_texCoord;

void main () {
    gl_Position = modelViewProjectionMatrix * vec4(position, 1);
    v_texCoord = texCoord;
}
`;

