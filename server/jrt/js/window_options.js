
function opt_borders(elt) {
    if(broadcast == 0) {
        if (elt.checked) {
            window_borders = 1;
            ws.send("window;" + window_name + ";-1;-1;-1;-1;-1;" + window_topmost + ";1");
        } else {
            window_borders = 0;
            ws.send("window;" + window_name + ";-1;-1;-1;-1;-1;" + window_topmost + ";0");
        }
    }
}


function opt_transparency() {
    window_alpha = document.getElementById('opt_transparency').value;
    if(broadcast == 0) {
        ws.send("window;"+window_name+";-1;-1;-1;-1;"+window_alpha+";"+window_topmost+";-1");
    }
}


function opt_always_on_top(elt) {
    if(broadcast == 0) {
        if (elt.checked) {
            window_topmost = 1;
            ws.send("window;" + window_name + ";-1;-1;-1;-1;-1;1;-1");
        } else {
            window_topmost = 0;
            ws.send("window;" + window_name + ";-1;-1;-1;-1;-1;0;-1");
        }
    }
}


function opt_window_x() {
    if(broadcast == 0) {
        window_x = document.getElementById('opt_window_x').value;
        ws.send("window;"+window_name+";"+window_x+";-1;-1;-1;-1;"+window_topmost+";-1");
    }
}


function opt_window_y() {
    if(broadcast == 0) {
        window_y = document.getElementById('opt_window_y').value;
        ws.send("window;"+window_name+";-1;"+window_y+";-1;-1;-1;"+window_topmost+";-1");
    }
}


function opt_window_w() {
    if(broadcast == 0) {
        window_w = document.getElementById('opt_window_w').value;
        ws.send("window;"+window_name+";-1;-1;"+window_w+";-1;-1;"+window_topmost+";-1");
    }
}


function opt_window_h() {
    if(broadcast == 0) {
        window_h = document.getElementById('opt_window_h').value;
        ws.send("window;"+window_name+";-1;-1;-1;"+window_h+";-1;"+window_topmost+";-1");
    }
}


function opt_iracing_fullscreen() {
    if(broadcast == 0) {
        window_iracing_borders = 0;
        document.getElementById("opt_iracing_borders").checked = false;
        ws.send("window;iRacing.com Simulator;0;0;0;0;-1;"+window_iracing_topmost+";0");
    }
}


function opt_iracing_1280x720() {
    if(broadcast == 0) {
        ws.send("window;iRacing.com Simulator;" + window_iracing_x + ";" + window_iracing_y + ";1280;720;-1;"+window_iracing_topmost+";-1");
    }
}


function opt_iracing_1920x1080() {
    if(broadcast == 0) {
        ws.send("window;iRacing.com Simulator;" + window_iracing_x + ";" + window_iracing_y + ";1920;1080;-1;"+window_iracing_topmost+";-1");
    }
}


function opt_iracing_borders(elt) {
    if(broadcast == 0) {
        if (elt.checked) {
            window_iracing_borders = 1;
            ws.send("window;iRacing.com Simulator;-1;-1;-1;-1;-1;" + window_iracing_topmost + ";1");
        } else {
            window_iracing_borders = 0;
            ws.send("window;iRacing.com Simulator;-1;-1;-1;-1;-1;" + window_iracing_topmost + ";0");
        }
    }
}


function opt_iracing_always_on_top(elt) {
    if(broadcast == 0) {
        if (elt.checked) {
            window_iracing_topmost = 1;
            ws.send("window;iRacing.com Simulator;-1;-1;-1;-1;-1;1;-1");
        } else {
            window_iracing_topmost = 0;
            ws.send("window;iRacing.com Simulator;-1;-1;-1;-1;-1;0;-1");
        }
    }
}


function opt_iracing_window_x() {
    if(broadcast == 0) {
        window_iracing_x = document.getElementById('opt_iracing_window_x').value;
        ws.send("window;iRacing.com Simulator;"+window_iracing_x+";-1;-1;-1;-1;"+window_iracing_topmost+";-1");
    }
}


function opt_iracing_window_y() {
    if(broadcast == 0) {
        window_iracing_y = document.getElementById('opt_iracing_window_y').value;
        ws.send("window;iRacing.com Simulator;-1;"+window_iracing_y+";-1;-1;-1;"+window_iracing_topmost+";-1");
    }
}


function opt_iracing_window_w() {
    if(broadcast == 0) {
        window_iracing_w = document.getElementById('opt_iracing_window_w').value;
        ws.send("window;iRacing.com Simulator;-1;-1;"+window_iracing_w+";-1;-1;"+window_iracing_topmost+";-1");
    }
}


function opt_iracing_window_h() {
    if(broadcast == 0) {
        window_iracing_h = document.getElementById('opt_iracing_window_h').value;
        ws.send("window;iRacing.com Simulator;-1;-1;-1;"+window_iracing_h+";-1;"+window_iracing_topmost+";-1");
    }
}


function opt_iracing_photo() {
    if (broadcast == 0) {
        //if (photo_processing == 0 && free_ram != undefined && free_ram > ram_required + 0.2) {
        if (photo_processing == 0 && free_ram != undefined) {
            // Il faut récupérer les valeurs sauf pour les checkboxes
            shutter = document.getElementById('opt_iracing_shutter').value;

            // On divise le nombre de photos par un coefficient pour que la ram soit suffisante
            nb_images_div = 1;
            new_ram_required = (shutter/nb_images_div*(1+1/8) + 1) * photo_w * photo_h * 4 * (1 + 3 * photo_AA2) / (1024 * 1024 * 1024);
            while (free_ram < new_ram_required + 0.2) {
                nb_images_div = nb_images_div * 2;
                new_ram_required = (shutter/nb_images_div*(1+1/8) + 1) * photo_w * photo_h * 4 * (1 + 3 * photo_AA2) / (1024 * 1024 * 1024);
            }

            photo_w = document.getElementById('opt_iracing_photo_w').value;
            photo_h = document.getElementById('opt_iracing_photo_h').value;
            photo_x0 = document.getElementById('opt_iracing_photo_x0').value;
            photo_y0 = document.getElementById('opt_iracing_photo_y0').value;
            photo_smooth = document.getElementById('opt_iracing_photo_smooth').value;
            photo_cuda_level = document.getElementById('opt_iracing_cuda_level').value;
            ws.send("photo;" + shutter + ";" + window_iracing_borders + ";" + photo_w + ";" + photo_h + ";" + photo_smooth + ";" + photo_bracketting + ";" + photo_cuda_level + ";" + photo_display + ";" + photo_AA2 + ";" + photo_check + ";" + nb_images_div + ";" + fix_4K + ";" + fix_4K_coef + ";" + photo_x0 + ";" + photo_y0 + ";" + photo_spotter_pack + ";" + photo_hide_watermark);

            document.getElementById('opt_iracing_photo').innerHTML = "<b>STOP PROCESS</b>";
            photo_processing = 1;
            photo_stop = 0;
        } else {
            photo_processing_old = 1;
            photo_processing = 0;
            document.getElementById('opt_iracing_photo').innerHTML = "<b>TAKE PHOTO(S)</b>";
            photo_stop = 1;
        }
    }
}

function calcul_photo_memory() {
    ram_required = (shutter*(1+1/8) + 1) * photo_w * photo_h * 4 * (1 + 3 * photo_AA2) / (1024 * 1024 * 1024);

    if (free_ram != undefined && free_ram != -1) {
        // On divise le nombre de photos par un coefficient pour que la ram soit suffisante
        nb_images_div = 1;
        new_ram_required = (shutter / nb_images_div * (1 + 1 / 8) + 1) * photo_w * photo_h * 4 * (1 + 3 * photo_AA2) / (1024 * 1024 * 1024);
        while (free_ram < new_ram_required + 0.2) {
            nb_images_div = nb_images_div * 2;
            new_ram_required = (shutter / nb_images_div * (1 + 1 / 8) + 1) * photo_w * photo_h * 4 * (1 + 3 * photo_AA2) / (1024 * 1024 * 1024);
        }
    } else {
        new_ram_required = ram_required;
    }

    if (free_ram != undefined && free_ram != -1) {
        free_ram_txt = " / " + free_ram.toFixed(2) + "GB";
    } else {
        free_ram_txt = "";
    }
    if (free_ram != undefined && free_ram != -1 && free_ram <= new_ram_required + 0.2) {
        document.getElementById('free_memory_required').innerHTML = "Free RAM required: " + (new_ram_required).toFixed(2) + "GB" + free_ram_txt + " - NOT ENOUGH MEMORY !!!"
    } else {
        document.getElementById('free_memory_required').innerHTML = "Free RAM required: " + (new_ram_required).toFixed(2) + "GB" + free_ram_txt;
    }
}


function opt_iracing_shutter() {
    if (broadcast == 0) {
        shutter = document.getElementById('opt_iracing_shutter').value;
    }
    calcul_photo_memory()
}

function opt_iracing_photo_w() {
    if (broadcast == 0) {
        photo_w = document.getElementById('opt_iracing_photo_w').value;
    }
    calcul_photo_memory()
}

function opt_iracing_photo_h() {
    if (broadcast == 0) {
        photo_h = document.getElementById('opt_iracing_photo_h').value;
    }
    calcul_photo_memory()
}

function opt_iracing_photo_x0() {
    if (broadcast == 0) {
        photo_x0 = document.getElementById('opt_iracing_photo_x0').value;
    }
}

function opt_iracing_photo_y0() {
    if (broadcast == 0) {
        photo_y0 = document.getElementById('opt_iracing_photo_y0').value;
    }
}

function opt_iracing_photo_smooth() {
    if (broadcast == 0) {
        photo_smooth = document.getElementById('opt_iracing_photo_smooth').value;
    }
}

function opt_iracing_photo_bracketting(elt) {
    if (broadcast == 0) {
        if (elt.checked) {
            photo_bracketting = 1;
        } else {
            photo_bracketting = 0;
        }
    }
}

function opt_iracing_photo_spotter_pack(elt) {
    if (broadcast == 0) {
        if (elt.checked) {
            photo_spotter_pack = 1;
        } else {
            photo_spotter_pack = 0;
        }
    }
}

function opt_iracing_cuda_level() {
    if (broadcast == 0) {
        photo_cuda_level = document.getElementById('opt_iracing_cuda_level').value;
    }
}

function opt_iracing_photo_display(elt) {
    if (broadcast == 0) {
        if (elt.checked) {
            photo_display = 1;
        } else {
            photo_display = 0;
        }
    }
}

function sansEspace()
{
    // interdiction d'utiliser le bouton espace
    if (event.keyCode == 32) return false;
    return true;
}

function opt_iracing_photo_hide_watermark(elt) {
    if (broadcast == 0) {
        if (elt.checked) {
            photo_hide_watermark = 1;
        } else {
            photo_hide_watermark = 0;
        }
    }
}

function opt_iracing_photo_AA2(elt) {
    if (broadcast == 0) {
        if (elt.checked) {
            photo_AA2 = 1;
        } else {
            photo_AA2 = 0;
        }
    }
    calcul_photo_memory()
}

function opt_iracing_photo_check(elt) {
    if (broadcast == 0) {
        if (elt.checked) {
            photo_check = 1;
        } else {
            photo_check = 0;
        }
    }
}

function opt_iracing_fix_4K(elt) {
    if (broadcast == 0) {
        if (elt.checked) {
            fix_4K = 1;
        } else {
            fix_4K = 0;
        }
    }
}

function opt_iracing_fix_4K_coef(elt) {
    if (broadcast == 0) {
        fix_4K_coef = document.getElementById('opt_iracing_fix_4K_coef').value;
    }
}

function opt_charge_photo_favoris(option) {
    calcul_photo_memory();
    document.getElementById('opt_iracing_shutter').value = shutter;
    document.getElementById('opt_iracing_photo_w').value = photo_w;
    document.getElementById('opt_iracing_photo_h').value = photo_h;
    document.getElementById('opt_iracing_photo_x0').value = photo_x0;
    document.getElementById('opt_iracing_photo_y0').value = photo_y0;
    document.getElementById('opt_iracing_photo_smooth').value = photo_smooth;
    document.getElementById('opt_iracing_photo_bracketting').value = photo_bracketting;
    if (photo_bracketting) {
        document.getElementById('opt_iracing_photo_bracketting').checked = true
    } else {
        document.getElementById('opt_iracing_photo_bracketting').checked = false
    }
    document.getElementById('opt_iracing_photo_hide_watermark').value = photo_hide_watermark;
    if (photo_hide_watermark) {
        document.getElementById('opt_iracing_photo_hide_watermark').checked = true
    } else {
        document.getElementById('opt_iracing_photo_hide_watermark').checked = false
    }
    document.getElementById('opt_iracing_photo_AA2').value = photo_AA2;
    if (photo_AA2) {
        document.getElementById('opt_iracing_photo_AA2').checked = true
    } else {
        document.getElementById('opt_iracing_photo_AA2').checked = false
    }
    document.getElementById('opt_iracing_cuda_level').value = photo_cuda_level;
    document.getElementById('opt_iracing_photo_display').value = photo_display;
    if (photo_display) {
        document.getElementById('opt_iracing_photo_display').checked = true
    } else {
        document.getElementById('opt_iracing_photo_display').checked = false
    }
    document.getElementById('opt_iracing_photo_check').value = photo_check;
    if (photo_check) {
        document.getElementById('opt_iracing_photo_check').checked = true
    } else {
        document.getElementById('opt_iracing_photo_check').checked = false
    }
    /*document.getElementById('opt_iracing_fix_4K').value = fix_4K;
    if (fix_4K) {
        document.getElementById('opt_iracing_fix_4K').checked = true
    } else {
        document.getElementById('opt_iracing_fix_4K').checked = false
    }
    document.getElementById('opt_iracing_fix_4K_coef').value = fix_4K_coef;*/

    // On demande éventuellement au serveur quelles sont les valeurs par défaut
    if (option == 1) {
        ws.send("photo;0");
    }
}

function opt_save_photo_favoris() {
    ws.send("save_photo_favoris;" + shutter + ";" + photo_w + ";" +  photo_h + ";" + photo_smooth + ";" + photo_bracketting + ";" + photo_cuda_level + ";" + photo_display + ";" + photo_AA2 + ";" + photo_check + ";" + fix_4K + ";" + fix_4K_coef + ";" + photo_x0 + ";" +  photo_y0 + ";" + photo_hide_watermark);
}