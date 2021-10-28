export default  `
#include <positioning_mvp_init_vshader>
#include <texture_init_vshader> 
#include <color_buffer_init_vshader> 

void main() {
  gl_Position = modelViewProjectionMatrix * vec4(position, 1);

  #include <texture_main_vshader> 
  #include <color_buffer_main_vshader>
}
`;

