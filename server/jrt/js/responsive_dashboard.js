function RGBA(e, alpha) { //e = jQuery element, alpha = background-opacity
    if (alpha < 1/500) {  // Pour éviter de bugguer avec firefox
        alpha = 1/500;
    }
    //b = e.css('backgroundColor');
    b = $(e).css('background-color');
    if (b != 'transparent') {
        $(e).css('backgroundColor', 'rgba' + b.slice(b.indexOf('('), ( (b.match(/,/g).length == 2) ? -1 : b.lastIndexOf(',') - b.length)) + ', ' + alpha + ')');
    }
}

function hexToRgb(str) {
    if ( /^#([0-9a-f]{3}|[0-9a-f]{6})$/ig.test(str) ) {
        var hex = str.substr(1);
        hex = hex.length == 3 ? hex.replace(/(.)/g, '$1$1') : hex;
        var rgb = parseInt(hex, 16);
        return 'rgb(' + [(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255].join(',') + ')';
    }

    return false;
}

function change_bg(name, bg, alpha) {
    var b = hexToRgb(bg);
    var tmp_bg = 'rgba' + b.slice(b.indexOf('('), ( (b.match(/,/g).length == 2) ? -1 : b.lastIndexOf(',') - b.length)) + ', ' + alpha + ')';
    //jQuery('#' + name).css('backgroundColor', tmp_bg);
    set_style_bg(name, tmp_bg)
}

function set(id, left, top, larg, haut, fontsize) {
    if (document.getElementById(id) != undefined) {
        document.getElementById(id).style.left = Math.floor(w * left / dashboard_ref_w) + x_offset + "px";
        if (larg >= 0)
            document.getElementById(id).style.width = wh(w * left / dashboard_ref_w, w * larg / dashboard_ref_w) + "px";
        document.getElementById(id).style.top = Math.floor(w * top / dashboard_ref_w) + y_offset + "px";
        if (haut >= 0) {
            document.getElementById(id).style.lineHeight = wh(w * top / dashboard_ref_w, w * haut / dashboard_ref_w) + "px";
            document.getElementById(id).style.height = wh(w * top / dashboard_ref_w, w * haut / dashboard_ref_w) + "px";  // important pour les iframes qui sont affiché en block et pas en inline-block
        }
        if (fontsize > 0)
            document.getElementById(id).style.fontSize = w * fontsize + "px";
    }
}

function set_leds(left, top, larg, haut) {
    //haut = larg * 128 / 1536;
    var id = "rpm_leds";
    document.getElementById(id).style.left = Math.floor(w * left / dashboard_ref_w) + x_offset + "px";
    if (larg >= 0)
        document.getElementById(id).style.width = wh(w * left / dashboard_ref_w, w * larg / dashboard_ref_w) + "px";
    document.getElementById(id).style.top = Math.floor(w * top / dashboard_ref_w) + y_offset + "px";
    if (haut >= 0)
        document.getElementById(id).style.height = wh(w * top / dashboard_ref_w, w * haut / dashboard_ref_w) + "px";

    for (var i = 1; i <= 12; i++) {
        document.getElementById("led" + i).style.left = w / dashboard_ref_w * larg * (8 + 128 * (i - 1)) / 1536 + "px";
        document.getElementById("led" + i).style.top = w * larg / dashboard_ref_w * 8 / 1536 + "px";
        document.getElementById("led" + i).style.width = w * larg / dashboard_ref_w * 112 / 1536 + "px";
        document.getElementById("led" + i).style.height = w * haut / dashboard_ref_w - w * larg / dashboard_ref_w * 16 / 1536 + "px";
    }

}

function set4perfs(id, left, top, larg, haut, fontsize) {
    document.getElementById(id).style.left = Math.floor(w * left / dashboard_ref_w) + x_offset + "px";
    if (larg >= 0)
        document.getElementById(id).style.width = wh(w * left / dashboard_ref_w, w * larg / dashboard_ref_w) + "px";
    document.getElementById(id).style.top = Math.floor(w * top / dashboard_ref_w) + y_offset + "px";
    if (haut >= 0) {
        document.getElementById(id).style.lineHeight = wh(w * top / dashboard_ref_w, w * haut / dashboard_ref_w / 4) + "px";
        document.getElementById(id).style.height = wh(w * top / dashboard_ref_w, w * haut / dashboard_ref_w) + "px";
    }
    if (fontsize > 0)
        document.getElementById(id).style.fontSize = w * fontsize + "px";
}

function cc(d, num, c) {
    var str = d;
    //if (str == "0xffffff" || str == "0x0") str = "0xaaaaaa";
    if (str != undefined) {
        //if (str != "0xffffff" && str != "0x0") {
            str = str.slice(2);
            for (n = str.length; n < 6; n++) {
                str = "0" + str
            }

            // on change le classid si c'est le cas dans classid_by_num
            if (num != undefined && num in classid_by_num) {
                c = classid_by_num[num];
            }
            if (num != undefined && num in bg_by_num) {
                str = bg_by_num[num].slice(1);
            }
            if (c != undefined && c in bg_by_classid) {  // si on a définit une class spécifique pour un numéros ainsi qu'un couleur
                str = bg_by_classid[c].slice(1);
            }

            return "#" + str;
        /*} else {
            return "#9e9e9e";
        }*/
    }
}

function wh(start, long) {
    return Math.floor(start + long) - Math.floor(start)
}

function responsive_dim() {

    if (force_inner_w) {
        window_innerWidth = inner_width;
    } else {
        window_innerWidth = window.innerWidth;
    }
    if (force_inner_h) {
        window_innerHeight = inner_height;
    } else {
        window_innerHeight = window.innerHeight;
    }

    estlaps_bg1_pct = 0;
    fuelneed_bg1_pct = 0;
    fuelneed1_bg1_pct = 0;
    fuelneed5_bg1_pct = 0;
    lapsremain_bg1_pct = 0;
    gap_pct_lastlap = 0;

    w = window_innerWidth;
    h = window_innerHeight;

    // Si le ref_w et ref_h sont définis pour le display, il remplace le réglage général
    disp_sel = "_" + advanced["display_selected"];
    ref_w = advanced["ref_w" + disp_sel];
    ref_h = advanced["ref_h" + disp_sel];
    if (ref_w != undefined) dashboard_ref_w = ref_w;
    if (ref_h != undefined) dashboard_ref_h = ref_h;
    trans_obs = advanced["transparency_OBS" + disp_sel];
    if (trans_obs != undefined) transparency_OBS = trans_obs;

    ratio = dashboard_ref_w / dashboard_ref_h;

    if (w/h > ratio) {
        w = Math.floor(h * ratio);
        x_offset = (window_innerWidth - w)/2;  // pour centrer le dashboard
        y_offset = 0;
    } else {
        h = Math.floor(w / ratio);
        x_offset = 0;
        y_offset = (window_innerHeight - h)/2;  // pour centrer le dashboard
    }

    if (transparency_OBS) {
        //document.body.style.backgroundColor = "rgba(134,34,34,0.0)";
        RGBA(jQuery('body'), 0.0);
        RGBA(jQuery('#page'), 0.0);
        document.getElementById("shift").style.backgroundColor = "rgba(0,0,0,0)";
        document.getElementById("shift_bg").style.backgroundColor = "rgba(0,0,0,0)";
        change_bg("bb", "#000000", advanced["bg_" + "bb" + "_" + advanced["display_selected"]]);
        change_bg("tc", "#00bb00", advanced["bg_" + "tc" + "_" + advanced["display_selected"]]);
        change_bg("tc2", "#00bb00", advanced["bg_" + "tc2" + "_" + advanced["display_selected"]]);
        change_bg("ffb", "#000000", advanced["bg_" + "ffb" + "_" + advanced["display_selected"]]);
        change_bg("b_cont", "#000000", advanced["bg_" + "b_cont" + "_" + advanced["display_selected"]]);
        change_bg("t_cont", "#000000", advanced["bg_" + "t_cont" + "_" + advanced["display_selected"]]);
        change_bg("c_cont", "#000000", advanced["bg_" + "c_cont" + "_" + advanced["display_selected"]]);
        change_bg("ffbpct_cont", "#000000", advanced["bg_" + "ffbpct_cont" + "_" + advanced["display_selected"]]);
        // ??? change_bg("abs", "#bb0000", advanced["bg_" + "abs" + "_" + advanced["display_selected"]]);
        // ??? change_bg("wj", "#000000", advanced["bg_" + "wj" + "_" + advanced["display_selected"]]);
    } else {
        //document.body.style.backgroundColor = "rgba(34,34,34,1.0)";
        RGBA(jQuery('body'), 1.0);
        RGBA(jQuery('#page'), 1.0);
    }

    $("#page").css("width", window_innerWidth + "px");
    $("#page").css("height", window_innerHeight + "px");

    if (carname in car_with_drs) {
        document.getElementById("drs").style.display = "inline-block";
    } else {
        document.getElementById("drs").style.display = "none";
    }
    if (carname in car_with_ers_drs) {
        document.getElementById("ers").style.display = "inline-block";
        document.getElementById("ersco").style.display = "inline-block";
        document.getElementById("ers_margin").style.display = "inline-block";
        document.getElementById("mgul").style.display = "inline-block";
        document.getElementById("mgu").style.display = "inline-block";
        document.getElementById("mgua").style.display = "inline-block";
        document.getElementById("mguf").style.display = "inline-block";
        document.getElementById("regen_lap").style.display = "inline-block";
        document.getElementById("regen_turn").style.display = "inline-block";
    } else {
        document.getElementById("ers").style.display = "none";
        document.getElementById("ersco").style.display = "none";
        document.getElementById("ers_margin").style.display = "none";
        document.getElementById("mgul").style.display = "none";
        document.getElementById("mgu").style.display = "none";
        document.getElementById("mgua").style.display = "none";
        document.getElementById("mguf").style.display = "none";
        document.getElementById("regen_lap").style.display = "none";
        document.getElementById("regen_turn").style.display = "none";
    }

    //set("shift", 0, 0, -1, 80, 0.034);
    //document.getElementById("shift").style.height = h + "px";
    //document.getElementById("shift_bg").style.height = h + "px";

    d = "_" + advanced["display_selected"];

    if (window_name == "JRT Dashboard") {
        window_shortname = "dashboard";
    }
    if (window_name == "JRT Dashboard2") {
        window_shortname = "dashboard2";
    }

    if (transparency_OBS) {
        // On lit l'image de fond si elle existe et qu'on a choisi l'option transparency for CLR Browser

        if ("image_de_fond" + d in advanced) {
            filename_loc = advanced["image_de_fond" + d];
        } else {
            filename_loc = window_shortname + "/display" + d + ".png";
        }
        if (filename_loc == "") filename_loc = "display_vide.png";
        //console.log("*" +  filename_loc + "*");
        imgurl = "./" + dashboard_online_folder + "displays_bg/" + filename_loc;

        img = new Image();
        img.src = imgurl;
        $(img)
            .load(function () {
                imgurl = "./" + dashboard_online_folder + "displays_bg/" + filename_loc;
                $("#page").css("background-image", "url('" + imgurl + "')");
                $("#page").css("background-position", x_offset + "px " + y_offset + "px");
                $("#page").css("background-size", w + "px " + h + "px");
            })
            .error(function () {
                // Pas d'image de fond -> on charge une image transparente
                imgurl = "./" + dashboard_online_folder + "displays_bg - default/display_vide.png";
                $("#page").css("background-image", "url('" + imgurl + "')");
                $("#page").css("background-position", x_offset + "px " + y_offset + "px");
                $("#page").css("background-size", w + "px " + h + "px");
            });
        img = null;
    } else {
        $("#page").css("background-image", "");
    }

    for (i in modlist) {
        name = modlist[i];
        if (("disp_" + name + d) in advanced) {
            if (name != 'perfs') {
                set(name, advanced["x_" + name + d], advanced["y_" + name + d], advanced["w_" + name + d], advanced["h_" + name + d], advanced["f_" + name + d] / dashboard_ref_w);
                if (name == 'ers_margin') {
                    set('ers_margin_min_bar', advanced["x_" + name + d], advanced["y_" + name + d], advanced["w_" + name + d], advanced["h_" + name + d], advanced["f_" + name + d] / dashboard_ref_w);
                    set('mgu_margin_max_bar', advanced["x_" + name + d], advanced["y_" + name + d], advanced["w_" + name + d], advanced["h_" + name + d], advanced["f_" + name + d] / dashboard_ref_w);
                    set('ers_margin_free_bar', advanced["x_" + name + d], advanced["y_" + name + d], advanced["w_" + name + d], advanced["h_" + name + d], advanced["f_" + name + d] / dashboard_ref_w);
                }
            } else {
                set4perfs(name, advanced["x_" + name + d], advanced["y_" + name + d], advanced["w_" + name + d], advanced["h_" + name + d], advanced["f_" + name + d] / dashboard_ref_w);
            }

            if (name != "fuelneed" && name != "fuelneed1" && name != "fuelneed5" && name != "estlaps" && name != "lapsremain" && name != "pre_pos" && name != "me_pos" && name != "post_pos" && name != "pre_cpos" && name != "me_cpos" && name != "post_cpos") {
                RGBA(jQuery('#' + name), advanced["bg_" + name + d]);
            } else {
                RGBA(jQuery('#' + name), 0.0);
            }

            if (advanced["disp_" + name + d]) {
                $("#" + name).css("display", "inline-block");
                if (name == 'ers_margin') {
                    $("#" + 'ers_margin_min_bar').css("display", "inline-block");
                    $("#" + 'mgu_margin_max_bar').css("display", "inline-block");
                    $("#" + 'ers_margin_free_bar').css("display", "inline-block");
                    tmp_h = (advanced["h_" + name + d] - advanced["f_" + name + d]) / advanced["h_" + name + d] * 100 / 2;
                    $("#" + 'ers_margin_min_bar_').css("height", tmp_h + "%");
                    $("#" + 'mgu_margin_max_bar_').css("height", tmp_h + "%");
                    $("#" + 'ers_margin_free_bar_').css("height", tmp_h + "%");
                }
            } else {
                $("#" + name).css("display", "none");
                if (name == 'ers_margin') {
                    $("#" + 'ers_margin_min_bar').css("display", "none");
                    $("#" + 'mgu_margin_max_bar').css("display", "none");
                    $("#" + 'ers_margin_free_bar').css("display", "none");
                }
            }
        } else {
            $("#" + name).css("display", "none");  // C'est important pour ne pas afficher les nouvelles valeurs avancées du dashboard si les paramètres n'étaient pas dans le fichier de config
        }
    }

    tmp_list = ['pre_pos', 'me_pos', 'post_pos', 'pre_cpos', 'me_cpos', 'post_cpos'];
    for (i in tmp_list) {
        name = tmp_list[i];
        if (("disp_" + name + d) in advanced) {
            set(name + "_cont", advanced["x_" + name + d], advanced["y_" + name + d], advanced["w_" + name + d], advanced["h_" + name + d], advanced["f_" + name + d] / dashboard_ref_w);
            RGBA(jQuery('#' + name + "_cont"), advanced["bg_" + name + d]);
            if (advanced["disp_" + name + d])
                $("#" + name + "_cont").css("display", "inline-block");
            else
                $("#" + name + "_cont").css("display", "none");
        }
    }

    // On s'occupe des iframe
    tmp_list = ['iframe1', 'iframe2', 'iframe3', 'iframe4'];
    for (i in tmp_list) {  // i sera compris entre 0 et 3
        name = tmp_list[i];
        if ((name + "_disp" + d) in advanced) {
            set(name + "_cont", advanced[name + "_X" + d], advanced[name + "_Y" + d], advanced[name + "_W" + d], advanced[name + "_H" + d], 0);
            document.getElementById(name + "_cont").style.zIndex = advanced[name + "_zIndex" + d];
            if (advanced[name + "_disp" + d]) {
                // On vérifie si l'adresse entrée est valide
                var url;
                var is_url_valid = true;
                try {
                    url = advanced[name + "_src" + d];
                    if (url.includes("http")) {
                        //url = new URL(url);
                        //if (!(url.protocol === "http:" || url.protocol === "https:")) {
                        if ( !(url.includes("http://") || url.includes("https://")) ) {
                            is_url_valid = false;
                        }
                        //url = url.href;
                    }
                    // REM : l'adresse doit contenir .php ou .html
                    if ( !(url.includes(".html") || url.includes(".php")) ) {
                        is_url_valid = false;
                    }
                } catch (_) {
                    is_url_valid = false;
                }

                //console.log(is_url_valid, url)
                if (is_url_valid && advanced[name + "_src" + d] != frame_src_selected[i]) {
                    frame_src_selected[i] = advanced[name + "_src" + d];
                    var left = advanced[name + "_X" + d];
                    var top = advanced[name + "_Y" + d];
                    var larg = advanced[name + "_W" + d];
                    var haut = advanced[name + "_H" + d];
                    var tmp_width = wh(w * left / dashboard_ref_w, w * larg / dashboard_ref_w);
                    var tmp_height = wh(w * top / dashboard_ref_w, w * haut / dashboard_ref_w);
                    var tmp_param = "";
                    // REM : on envoie la largeur et la hauteur en paramètre pour que l'iPad puisse avoir la bonne valeur du innerWidth et innerHeight
                    if( /webOS|iPhone|iPad/i.test(navigator.userAgent) ) {
                        if (url.includes("?")) {
                            tmp_param = "&inner_width=" + tmp_width + "&inner_height=" + tmp_height;
                        } else {
                            tmp_param = "?inner_width=" + tmp_width + "&inner_height=" + tmp_height;
                        }
                    }
                    $("#" + name).attr("src", url + tmp_param);
                }
                $("#" + name).css("display", "block");
            } else {
                frame_src_selected[i] = "";  // Pour bien recharger la page si on réactive la frame plus tard
                $("#" + name).css("display", "none");
                document.getElementById(name + "_cont").style.zIndex = -9999;  // on le place vers l'arrière pour qu'il n'empêche pas les clicks
                $("#" + name).attr("src", "");
            }
        }
    }

    set("estlaps_bg0", advanced["x_" + "estlaps" + d], advanced["y_" + "estlaps" + d], advanced["w_" + "estlaps" + d], advanced["h_" + "estlaps" + d], advanced["f_" + "estlaps" + d] / dashboard_ref_w);
    set("estlaps_bg1", advanced["x_" + "estlaps" + d], advanced["y_" + "estlaps" + d], Math.floor(advanced["w_" + "estlaps" + d] * estlaps_bg1_pct), advanced["h_" + "estlaps" + d], advanced["f_" + "estlaps" + d] / dashboard_ref_w);
    set("fuelneed_bg0", advanced["x_" + "fuelneed" + d], advanced["y_" + "fuelneed" + d], advanced["w_" + "fuelneed" + d], advanced["h_" + "fuelneed" + d], advanced["f_" + "fuelneed" + d] / dashboard_ref_w);
    set("fuelneed_bg1", advanced["x_" + "fuelneed" + d],advanced["y_" + "fuelneed" + d] + Math.floor(fuelneed_bg1_pct * advanced["h_" + "fuelneed" + d]), Math.floor(advanced["w_" + "fuelneed" + d] * fuelneed_bg1_pct), advanced["h_" + "fuelneed" + d] - Math.floor(fuelneed_bg1_pct * advanced["h_" + "fuelneed" + d]), advanced["f_" + "fuelneed" + d] / dashboard_ref_w);
    set("fuelneed1_bg0", advanced["x_" + "fuelneed1" + d], advanced["y_" + "fuelneed1" + d], advanced["w_" + "fuelneed1" + d], advanced["h_" + "fuelneed1" + d], advanced["f_" + "fuelneed1" + d] / dashboard_ref_w);
    set("fuelneed1_bg1", advanced["x_" + "fuelneed1" + d],advanced["y_" + "fuelneed1" + d] + Math.floor(fuelneed1_bg1_pct * advanced["h_" + "fuelneed1" + d]), Math.floor(advanced["w_" + "fuelneed1" + d] * fuelneed1_bg1_pct), advanced["h_" + "fuelneed1" + d] - Math.floor(fuelneed1_bg1_pct * advanced["h_" + "fuelneed1" + d]), advanced["f_" + "fuelneed1" + d] / dashboard_ref_w);
    set("fuelneed5_bg0", advanced["x_" + "fuelneed5" + d], advanced["y_" + "fuelneed5" + d], advanced["w_" + "fuelneed5" + d], advanced["h_" + "fuelneed5" + d], advanced["f_" + "fuelneed5" + d] / dashboard_ref_w);
    set("fuelneed5_bg1", advanced["x_" + "fuelneed5" + d],advanced["y_" + "fuelneed5" + d] + Math.floor(fuelneed5_bg1_pct * advanced["h_" + "fuelneed5" + d]), Math.floor(advanced["w_" + "fuelneed5" + d] * fuelneed5_bg1_pct), advanced["h_" + "fuelneed5" + d] - Math.floor(fuelneed5_bg1_pct * advanced["h_" + "fuelneed5" + d]), advanced["f_" + "fuelneed5" + d] / dashboard_ref_w);
    set("lapsremain_bg0", advanced["x_" + "lapsremain" + d], advanced["y_" + "lapsremain" + d], advanced["w_" + "lapsremain" + d], advanced["h_" + "lapsremain" + d], advanced["f_" + "lapsremain" + d] / dashboard_ref_w);
    set("lapsremain_bg1", advanced["x_" + "lapsremain" + d], advanced["y_" + "lapsremain" + d], Math.floor(advanced["w_" + "lapsremain" + d] * lapsremain_bg1_pct), advanced["h_" + "lapsremain" + d], advanced["f_" + "lapsremain" + d] / dashboard_ref_w);
    set("lapsremain_bg2", advanced["x_" + "lapsremain" + d] + Math.floor(advanced["w_" + "lapsremain" + d] * gap_pct_lastlap), advanced["y_" + "lapsremain" + d], 1, advanced["h_" + "lapsremain" + d], advanced["f_" + "lapsremain" + d] / dashboard_ref_w);
    tmp_list = ["estlaps", "fuelneed", "fuelneed1", "fuelneed5", "lapsremain"];
    for (i in tmp_list) {
        name = tmp_list[i];
        if (("disp_" + name + d) in advanced) {
            RGBA(jQuery('#' + name + "_bg0"), advanced["bg_" + name + d]);
            RGBA(jQuery('#' + name + "_bg1"), advanced["bg_" + name + d]);
            if (advanced["disp_" + name + d]) {
                $("#" + name + "_bg0").css("display", "inline-block");
                $("#" + name + "_bg1").css("display", "inline-block");
                $("#" + name + "_bg2").css("display", "inline-block");
            } else {
                $("#" + name + "_bg0").css("display", "none");
                $("#" + name + "_bg1").css("display", "none");
                $("#" + name + "_bg2").css("display", "none");
            }
        }
    }

    set_leds(advanced["x_" + "rpm_leds" + d], advanced["y_" + "rpm_leds" + d], advanced["w_" + "rpm_leds" + d], advanced["h_" + "rpm_leds" + d]);

    // Redimensionnement des delta graphs
    context_pre.canvas.width = Math.max(1, wh(w * advanced["x_" + "delta_pre" + d] / dashboard_ref_w, w * advanced["w_" + "delta_pre" + d] / dashboard_ref_w));
    context_pre.canvas.height = Math.max(1, wh(w * advanced["y_" + "delta_pre" + d] / dashboard_ref_w, w * advanced["h_" + "delta_pre" + d] / dashboard_ref_w));
    context_post.canvas.width = Math.max(1, wh(w * advanced["x_" + "delta_post" + d] / dashboard_ref_w, w * advanced["w_" + "delta_post" + d] / dashboard_ref_w));
    context_post.canvas.height = Math.max(1, wh(w * advanced["y_" + "delta_post" + d] / dashboard_ref_w, w * advanced["h_" + "delta_post" + d] / dashboard_ref_w));

    contextB_pre.canvas.width = Math.max(1, wh(w * advanced["x_" + "delta_pre" + d] / dashboard_ref_w, w * advanced["w_" + "delta_pre" + d] / dashboard_ref_w));
    contextB_pre.canvas.height = Math.max(1, wh(w * advanced["y_" + "delta_pre" + d] / dashboard_ref_w, w * advanced["h_" + "delta_pre" + d] / dashboard_ref_w));
    contextB_post.canvas.width = Math.max(1, wh(w * advanced["x_" + "delta_post" + d] / dashboard_ref_w, w * advanced["w_" + "delta_post" + d] / dashboard_ref_w));
    contextB_post.canvas.height = Math.max(1, wh(w * advanced["y_" + "delta_post" + d] / dashboard_ref_w, w * advanced["h_" + "delta_post" + d] / dashboard_ref_w));
    if (advanced["disp_delta_pre" + d]) {
        set("deltaB_pre", advanced["x_" + "delta_pre" + d], advanced["y_" + "delta_pre" + d], advanced["w_" + "delta_pre" + d], advanced["h_" + "delta_pre" + d], advanced["f_" + "delta_pre" + d] / dashboard_ref_w);
        $("#deltaB_pre").css("display", "inline-block");
    } else {
        $("#deltaB_pre").css("display", "none");
    }
    if (advanced["disp_delta_post" + d]) {
        set("deltaB_post", advanced["x_" + "delta_post" + d], advanced["y_" + "delta_post" + d], advanced["w_" + "delta_post" + d], advanced["h_" + "delta_post" + d], advanced["f_" + "delta_post" + d] / dashboard_ref_w);
        $("#deltaB_post").css("display", "inline-block");
    } else {
        $("#deltaB_post").css("display", "none");
    }

    //document.getElementById("delta_pre").style.top = Math.floor(w * 192 / 1280) + y_offset + "px";
    //document.getElementById("delta_pre").style.left = Math.floor(w * 976 / 1280) + x_offset + "px";
    //document.getElementById("delta_post").style.top = Math.floor(w * 448 / 1280) + + y_offset + "px";
    //document.getElementById("delta_post").style.left = Math.floor(w * 976 / 1280) + x_offset + "px";

    // Redimensionnement de la boussole
    context_compass.canvas.width = Math.max(1, wh(w * advanced["x_" + "compass" + d] / dashboard_ref_w, w * advanced["w_" + "compass" + d] / dashboard_ref_w));
    context_compass.canvas.height = Math.max(1, wh(w * advanced["y_" + "compass" + d] / dashboard_ref_w, w * advanced["h_" + "compass" + d] / dashboard_ref_w));

    //document.getElementById("compass").style.left = Math.floor(w * 1152 / 1280) + x_offset + "px";
    //document.getElementById("compass").style.top = Math.floor(w * 0 / 1280) + y_offset + "px";

    carname = donnees.carname;
    gear_ = {};
    maxspeed_ = {};
    for (i in donnees.gear_) {
        gear_[i] = donnees.gear_[i]
    }

    if (carname in car_with_drs) {
        tmp_list = ["drs"];
        for (i in tmp_list) {
            name = tmp_list[i];
            if (advanced["disp_" + name + d]) {
                document.getElementById(name).style.display = "inline-block";
            }
        }
    } else {
        document.getElementById("drs").style.display = "none";
    }
    if (carname in car_with_ers_drs) {
        tmp_list = ["ers", "ersco", "ers_margin", "mgul", "mgu", "mgua", "mguf", "regen_lap", "regen_turn"];
        for (i in tmp_list) {
            name = tmp_list[i];
            if (advanced["disp_" + name + d]) {
                document.getElementById(name).style.display = "inline-block";
            }
        }
    } else {
        document.getElementById("ers").style.display = "none";
        document.getElementById("ersco").style.display = "none";
        document.getElementById("ers_margin").style.display = "none";
        document.getElementById("mgul").style.display = "none";
        document.getElementById("mgu").style.display = "none";
        document.getElementById("mgua").style.display = "none";
        document.getElementById("mguf").style.display = "none";
        document.getElementById("regen_lap").style.display = "none";
        document.getElementById("regen_turn").style.display = "none";
    }

    // Utilisé pour les rpm_leds
    if (donnees.rpm_redline != undefined) {
        max_rpm = donnees.rpm_redline;
    }

    if (advanced["disp_" + "brake2" + d]) {
        $("#brake2").css("border-radius", advanced["h_" + "brake2" + d]/8 * w / dashboard_ref_w + "px");
        $("#brake2_").css("border-radius", advanced["h_" + "brake2" + d]/8 * w / dashboard_ref_w + "px");
        set("brake2_text", advanced["x_" + "brake2" + d], advanced["y_" + "brake2" + d], advanced["w_" + "brake2" + d], advanced["h_" + "brake2" + d], advanced["f_" + "brake2" + d] / dashboard_ref_w);
        $("#brake2_text").css("display", "inline-block");
    } else {
        $("#brake2_text").css("display", "none");
    }
    if (advanced["disp_" + "brake3" + d]) {
        $("#brake3").css("border-radius", advanced["h_" + "brake3" + d]/8 * w / dashboard_ref_w + "px");
        $("#brake3_").css("border-radius", advanced["h_" + "brake3" + d]/8 * w / dashboard_ref_w + "px");
        set("brake3_text", advanced["x_" + "brake3" + d], advanced["y_" + "brake3" + d], advanced["w_" + "brake3" + d], advanced["h_" + "brake3" + d], advanced["f_" + "brake3" + d] / dashboard_ref_w);
        $("#brake3_text").css("display", "inline-block");
    } else {
        $("#brake3_text").css("display", "none");
    }
    if (advanced["disp_" + "throttle2" + d]) {
        $("#throttle2").css("border-radius", advanced["h_" + "throttle2" + d]/8 * w / dashboard_ref_w + "px");
        $("#throttle2_").css("border-radius", advanced["h_" + "throttle2" + d]/8 * w / dashboard_ref_w + "px");
        set("throttle2_text", advanced["x_" + "throttle2" + d], advanced["y_" + "throttle2" + d], advanced["w_" + "throttle2" + d], advanced["h_" + "throttle2" + d], advanced["f_" + "throttle2" + d] / dashboard_ref_w);
        $("#throttle2_text").css("display", "inline-block");
    } else {
        $("#throttle2_text").css("display", "none");
    }
    if (advanced["disp_" + "throttle3" + d]) {
        $("#throttle3").css("border-radius", advanced["h_" + "throttle3" + d]/8 * w / dashboard_ref_w + "px");
        $("#throttle3_").css("border-radius", advanced["h_" + "throttle3" + d]/8 * w / dashboard_ref_w + "px");
        set("throttle3_text", advanced["x_" + "throttle3" + d], advanced["y_" + "throttle3" + d], advanced["w_" + "throttle3" + d], advanced["h_" + "throttle3" + d], advanced["f_" + "throttle3" + d] / dashboard_ref_w);
        $("#throttle3_text").css("display", "inline-block");
    } else {
        $("#throttle3_text").css("display", "none");
    }
    if (advanced["disp_" + "clutch2" + d]) {
        $("#clutch2").css("border-radius", advanced["h_" + "clutch2" + d]/8 * w / dashboard_ref_w + "px");
        $("#clutch2_").css("border-radius", advanced["h_" + "clutch2" + d]/8 * w / dashboard_ref_w + "px");
        set("clutch2_text", advanced["x_" + "clutch2" + d], advanced["y_" + "clutch2" + d], advanced["w_" + "clutch2" + d], advanced["h_" + "clutch2" + d], advanced["f_" + "clutch2" + d] / dashboard_ref_w);
        $("#clutch2_text").css("display", "inline-block");
    } else {
        $("#clutch2_text").css("display", "none");
    }
    if (advanced["disp_" + "ffb2" + d]) {
        $("#ffb2").css("border-radius", advanced["h_" + "ffb2" + d]/8 * w / dashboard_ref_w + "px");
        $("#ffb2_").css("border-radius", advanced["h_" + "ffb2" + d]/8 * w / dashboard_ref_w + "px");
        set("ffb2_text", advanced["x_" + "ffb2" + d], advanced["y_" + "ffb2" + d], advanced["w_" + "ffb2" + d], advanced["h_" + "ffb2" + d], advanced["f_" + "ffb2" + d] / dashboard_ref_w);
        $("#ffb2_text").css("display", "inline-block");
    } else {
        $("#ffb2_text").css("display", "none");
    }
    if (advanced["disp_" + "traffic" + d]) {
        $("#traffic").css("border-radius", advanced["h_" + "traffic" + d]/2 * w / dashboard_ref_w + "px")
    }
    if (advanced["disp_" + "traffic_pit" + d]) {
        $("#traffic_pit").css("border-radius", advanced["h_" + "traffic_pit" + d]/2 * w / dashboard_ref_w + "px")
    }


    // Affichage des valeurs changées (TC, ABS, ...)
    //set("setting_changed_name", 0, 0,  dashboard_ref_w, dashboard_ref_h, 0.07);
    document.getElementById("setting_changed_name").style.left = 0 + x_offset + "px";
    document.getElementById("setting_changed_name").style.width = wh(0, w) + "px";
    document.getElementById("setting_changed_name").style.top = 0 + y_offset + "px";
    document.getElementById("setting_changed_name").style.lineHeight = wh(w * 0 / dashboard_ref_w, w * dashboard_ref_h / 5 / dashboard_ref_w) + "px";
    document.getElementById("setting_changed_name").style.fontSize = w * 0.075 + "px";
    //set("setting_changed_value", 0, 0, dashboard_ref_w, dashboard_ref_h, 0.40);
    document.getElementById("setting_changed_value").style.left = 0 + x_offset + "px";
    document.getElementById("setting_changed_value").style.width = wh(0, w) + "px";
    document.getElementById("setting_changed_value").style.top = Math.floor(w * dashboard_ref_h / 5 / dashboard_ref_w) + y_offset + "px";
    document.getElementById("setting_changed_value").style.lineHeight = wh(w * dashboard_ref_h / 5 / dashboard_ref_w, w * dashboard_ref_h * 4/5 / dashboard_ref_w) + "px";
    document.getElementById("setting_changed_value").style.fontSize = w * 0.35 + "px";

    var font_ = {};
    for (var fontsetname in {"family": 1, "weight": 1, "style": 1}) {
        if ("font_" + fontsetname + d in advanced) {
            font_[fontsetname] = advanced["font_" + fontsetname + d];
        } else {
            font_[fontsetname] = advanced["font-" + fontsetname];
        }
    }

    $("body").css("font-family", '"' + font_["family"] + '"');
    $("body").css("font-weight", font_["weight"]);
    $("body").css("font-style", font_["style"]);

    if (drag_enable == 0) {
        document.getElementById("drag").style.display = "none";
    } else {
        document.getElementById("drag").style.display = "block";
    }

    // Gestion du bouton fullscreen
    if ((fullscreen_button == 1) && (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement)) {  // current working methods
        // On n'est pas en fullscreen
        if (broadcast <= 1) {
            //if (fullscreen_button == 1) {
                $("#fullscreen").css("display", "block");
                if (fullscreen_button_timeout > 0) {
                    setTimeout(function () {
                        $("#fullscreen").css("display", "none");
                    }, 1000*fullscreen_button_timeout)
                }
            //}
        }
    } else {
        // On est déjà en fullscreen donc on cache le bouton
        $("#fullscreen").css("display", "none");
    }

    if( /iPhone|iPad/i.test(navigator.userAgent)) {  //Si c'est un iPad ou iPhone
        $("#fullscreen").css("display", "none");
    }

    // On charge les éventuels css perso
    // ...
    //console.log(use_css_perso)

}


// On regarde si on a forcé un display en paramètre : dashboard.html?display=1
display_selected_in_url = getParamValue('display');
if (display_selected_in_url != false) {
    advanced["display_selected"] = parseInt(display_selected_in_url);
}
