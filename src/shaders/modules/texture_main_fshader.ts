export default  `
#ifdef TEXTURE 
    gl_FragColor = texture2D(texture, v_texcoord);
#endif 
`;

