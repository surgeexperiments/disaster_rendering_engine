export default  `
#include <positioning_init_vshader>
#include <texture2d_init_vshader> 

void main() {
    #ifdef TEXTURE_2D
        gl_Position = vec4(position, 1);
    #endif 
    
  #include <texture2d_main_vshader> 
}
`;