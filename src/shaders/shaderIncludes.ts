import color_buffer_init_fshader from "./modules/color_buffer_init_fshader"; 
import color_buffer_init_vshader from "./modules/color_buffer_init_vshader"; 
import color_buffer_main_fshader from "./modules/color_buffer_main_fshader"; 
import color_buffer_main_vshader from "./modules/color_buffer_main_vshader"; 
import color_init_fshader from "./modules/color_init_fshader"; 
import color_main_fshader from "./modules/color_main_fshader"; 
import positioning_init_vshader from "./modules/positioning_init_vshader";
import positioning_mvp_init_vshader from "./modules/positioning_mvp_init_vshader";
import precision_selector_fshader from "./modules/precision_selector_fshader";
import texture_init_fshader from "./modules/texture_init_fshader";
import texture_init_vshader from "./modules/texture_init_vshader";
import texture_main_fshader from "./modules/texture_main_fshader";
import texture_main_vshader from "./modules/texture_main_vshader";
import texture2d_init_fshader from "./modules/texture2d_init_fshader";
import texture2d_init_vshader from "./modules/texture2d_init_vshader";
import texture2d_main_fshader from "./modules/texture2d_main_fshader";
import texture2d_main_vshader from "./modules/texture2d_main_vshader";


export const includesToFiles = { 
    color_buffer_init_fshader: color_buffer_init_fshader,
    color_buffer_init_vshader: color_buffer_init_vshader,
    color_buffer_main_fshader: color_buffer_main_fshader,
    color_buffer_main_vshader: color_buffer_main_vshader,
    color_init_fshader: color_init_fshader,
    color_main_fshader: color_main_fshader,
    positioning_init_vshader: positioning_init_vshader, 
    positioning_mvp_init_vshader: positioning_mvp_init_vshader,
    precision_selector_fshader: precision_selector_fshader,
    texture_init_fshader: texture_init_fshader,
    texture_init_vshader: texture_init_vshader,
    texture_main_fshader: texture_main_fshader,
    texture_main_vshader: texture_main_vshader,
    texture2d_init_fshader: texture2d_init_fshader,
    texture2d_init_vshader: texture2d_init_vshader,
    texture2d_main_fshader: texture2d_main_fshader,
    texture2d_main_vshader: texture2d_main_vshader
}
