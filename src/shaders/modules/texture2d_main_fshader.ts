export default  `
#ifdef TEXTURE_2D 
    gl_FragColor = texture2D(texture, v_texcoord);
#endif 
`;

