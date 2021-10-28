export default  `
precision mediump float;   

varying vec2 v_texCoord;
uniform sampler2D texture; 

void main () {
    vec4 color = texture2D(texture, v_texCoord);
    gl_FragColor = vec4(color.r, color.r, color.r, 1.0);
}
`;




