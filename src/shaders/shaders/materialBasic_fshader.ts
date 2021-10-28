export default  `
#include <precision_selector_fshader> 

#include <texture_init_fshader> 
#include <color_init_fshader>
#include <color_buffer_init_fshader>

void main () {
  #include <texture_main_fshader> 
  #include <color_main_fshader>
  #include <color_buffer_main_fshader>
}
`;
