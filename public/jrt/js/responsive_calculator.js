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

    if (disp_infosbar == 0) {
        sessioninfos_height_ = 0;
    } else {
        sessioninfos_height_ = sessioninfos_height / dpi_factor_;
    }

    estlaps_bg1_pct = 0;
    fuelneed_bg1_pct = 0;
    lapsremain_bg1_pct = 0;
    gap_pct_lastlap = 0;

    if (responsive) {
        document.getElementById("infosbar").style.fontSize = Math.floor(24 * window_innerWidth / reference_w * (ligne_h / dpi_factor_) / 40 * infosbar_coef) + "px";
        document.getElementById("infosbar").style.lineHeight = Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_) * infosbar_coef) + "px";
        document.getElementById("infosbar").style.top = Math.floor(sessioninfos_height_ * window_innerWidth / reference_w * (ligne_h / dpi_factor_) / (ligne_h / dpi_factor_)) + Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_)) * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_))) + "px";

        document.getElementById("click_infos").style.height = Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + 2 * disp_infosbar * infosbar_coef) * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_))) + "px";
        document.getElementById("click_infos").style.top = Math.floor(sessioninfos_height_ * window_innerWidth / reference_w * (ligne_h / dpi_factor_) / (ligne_h / dpi_factor_)) + 0 + "px";

        document.getElementById("sofbar").style.fontSize = Math.floor(32 * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) * window_innerWidth / reference_w * (ligne_h / dpi_factor_) / 40) + "px";
        document.getElementById("sofbar").style.lineHeight = Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_)) * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_))) + "px";
        document.getElementById("sofbar").style.top = 0*Math.floor(sessioninfos_height_ * window_innerWidth / reference_w * (ligne_h / dpi_factor_) / (ligne_h / dpi_factor_)) + 0 + "px";
    } else {
        document.getElementById("infosbar").style.fontSize = Math.floor(24 * (ligne_h / dpi_factor_) / 40 * infosbar_coef) + "px";
        document.getElementById("infosbar").style.lineHeight = (ligne_h / dpi_factor_) * infosbar_coef + "px";
        document.getElementById("infosbar").style.top = Math.floor(sessioninfos_height_ * (ligne_h / dpi_factor_) / (ligne_h / dpi_factor_)) + Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_)) * (ligne_h / dpi_factor_)) + "px";

        //document.getElementById("click_infos").style.height = (disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + 2 * disp_infosbar)*(ligne_h / dpi_factor_) + "px";
        document.getElementById("click_infos").style.height = Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_)) + Math.floor(2 * disp_infosbar * infosbar_coef) * (ligne_h / dpi_factor_)) + "px";
        document.getElementById("click_infos").style.top = Math.floor(sessioninfos_height_ * (ligne_h / dpi_factor_) / (ligne_h / dpi_factor_)) + 0 + "px";

        document.getElementById("sofbar").style.fontSize = Math.floor(32 * sofbar_h / dpi_factor_ / 40) + "px";
        document.getElementById("sofbar").style.lineHeight = Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_))*(ligne_h / dpi_factor_)) + "px";
        document.getElementById("sofbar").style.top = 0*Math.floor(sessioninfos_height_ * (ligne_h / dpi_factor_) / (ligne_h / dpi_factor_)) + 0 + "px";
    }

    if (transparency_OBS) {
        //document.body.style.backgroundColor = "rgba(134,34,34,0.0)";
        RGBA(jQuery('body'), 0.0);
        RGBA(jQuery('#page'), 0.0);
    } else {
        //document.body.style.backgroundColor = "rgba(34,34,34,1.0)";
        RGBA(jQuery('body'), 1.0);
        RGBA(jQuery('#page'), 1.0);
    }

    $("#page").css("width", window_innerWidth + "px");
    $("#page").css("height", window_innerHeight + "px");

    // Mise en forme de la barre d'infos avec ses éléments
    if (disp_infosbar == 0) {
        document.getElementById("infosbar").style.display = "none"
    } else {
        document.getElementById("infosbar").style.display = "block"
    }
    if (responsive) {
        h = Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_));
    } else {
        h = (ligne_h / dpi_factor_)
    }

    // Si on veut cacher les infos de fuel on décale le timeremain et les infos de session
    if (disp_fuelinfos) {
        decal_timeremain = 0;
        decal_lapsremain = 0;
        decal_infos = 0;
        //document.getElementById("litre").style.display = "block";
        //document.getElementById("kg").style.display = "block";
        document.getElementById("tank_h").style.display = "block";
        document.getElementById("tank").style.display = "block";
        document.getElementById("conso").style.display = "block";
        if (disp_conso_bigger) {
            document.getElementById("conso_h").style.display = "block";
        } else {
            document.getElementById("conso_h").style.display = "none";
        }
        document.getElementById("estlaps_h").style.display = "block";
        document.getElementById("estlaps").style.display = "block";
        document.getElementById("estlaps_bg0").style.display = "block";
        document.getElementById("estlaps_bg1").style.display = "block";
        document.getElementById("fuelneed_h").style.display = "block";
        document.getElementById("fuelneed").style.display = "block"
        document.getElementById("fuelneed_bg0").style.display = "block";
        document.getElementById("fuelneed_bg1").style.display = "block"
    } else {
        decal_timeremain = -6*h*infosbar_coef;
        decal_lapsremain = -6*h*infosbar_coef;
        decal_infos = -11*h*infosbar_coef;
        //document.getElementById("litre").style.display = "none";
        //document.getElementById("kg").style.display = "none";
        document.getElementById("tank_h").style.display = "none";
        document.getElementById("tank").style.display = "none";
        document.getElementById("conso").style.display = "none";
        document.getElementById("conso_h").style.display = "none";
        document.getElementById("estlaps_h").style.display = "none";
        document.getElementById("estlaps").style.display = "none";
        document.getElementById("estlaps_bg0").style.display = "none";
        document.getElementById("estlaps_bg1").style.display = "none";
        document.getElementById("fuelneed_h").style.display = "none";
        document.getElementById("fuelneed").style.display = "none"
        document.getElementById("fuelneed_bg0").style.display = "none";
        document.getElementById("fuelneed_bg1").style.display = "none";
    }

    decal_fuelneed = 0;
    decal_estlaps = 0;
    if(disp_conso_bigger) {
        decal_timeremain += 3 * h * infosbar_coef;
        decal_lapsremain += 3 * h * infosbar_coef;
        decal_infos += 3 * h * infosbar_coef;
        decal_fuelneed += 3 * h * infosbar_coef;
        decal_estlaps += 3 * h * infosbar_coef;
    }
    if (estlaps_decimal > 1) {
        decal_timeremain += (estlaps_decimal - 1) * h * infosbar_coef;
        decal_lapsremain += (estlaps_decimal - 1) * h * infosbar_coef;
        decal_infos += (estlaps_decimal - 1) * h * infosbar_coef;
        decal_fuelneed += (estlaps_decimal - 1) * h * infosbar_coef;
    }
    if (lapsremain_decimal > 2) {
        decal_infos += (lapsremain_decimal - 2) * h * infosbar_coef;
        decal_fuelneed += (lapsremain_decimal - 2) * h * infosbar_coef;
    }

    h_ = h * infosbar_coef;

    //document.getElementById("litre").style.top = 0*h + "px";
    //document.getElementById("litre").style.left = 0*h + "px";
    //document.getElementById("litre").style.width = h + "px";
    //document.getElementById("kg").style.top = h + "px";
    //document.getElementById("kg").style.left = 0*h + "px";
    //document.getElementById("kg").style.width = h + "px";
    document.getElementById("tank_h").style.top = 0*h_ + "px";
    document.getElementById("tank_h").style.left = 0*h_ + "px";
    document.getElementById("tank_h").style.width = 3*h_ + "px";
    document.getElementById("tank_h").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("tank_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("tank").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("tank").style.left = 0*h_ + "px";
    document.getElementById("tank").style.width = 3*h_ + "px";
    document.getElementById("tank").style.lineHeight = 2*h_ - (2 - disp_conso_bigger)*Math.floor(0.5*h_) + "px";
    document.getElementById("tank").style.fontSize = 40 * h_ / 40 + "px";

    if(disp_conso_bigger) {
        document.getElementById("conso_h").style.top = 0*h_ + "px";
        document.getElementById("conso_h").style.left = 3*h_ + "px";
        document.getElementById("conso_h").style.width = 3*h_ + "px";
        document.getElementById("conso_h").style.lineHeight = Math.floor(0.5*h_) + "px";
        document.getElementById("conso_h").style.fontSize = 14 * h_ / 40 + "px";
        document.getElementById("conso").style.top = Math.floor(0.5*h_) + "px";
        document.getElementById("conso").style.left = 3*h_ + "px";
        document.getElementById("conso").style.width = 3*h_ + "px";
        document.getElementById("conso").style.lineHeight = Math.floor(2*h_) - (2 - disp_conso_bigger)*Math.floor(0.5*h_) + "px";
        document.getElementById("conso").style.fontSize = 40 * h_ / 40 + "px";
    } else {
        document.getElementById("conso").style.top = Math.floor(0.5*h_) + 2*h_ - 2*Math.floor(0.5*h_) + "px";
        document.getElementById("conso").style.left = 0*h_ + "px";
        document.getElementById("conso").style.width = 3*h_ + "px";
        document.getElementById("conso").style.lineHeight = Math.floor(0.5*h_) + "px";
        document.getElementById("conso").style.fontSize = 14 * h_ / 40 + "px";
    }

    document.getElementById("estlaps_h").style.top = 0*h_ + "px";
    document.getElementById("estlaps_h").style.left = decal_estlaps + 3*h_ + "px";
    document.getElementById("estlaps_h").style.width = (3 + Math.max(0, estlaps_decimal - 1))*h_ + "px";
    document.getElementById("estlaps_h").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("estlaps_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("estlaps").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("estlaps").style.left = decal_estlaps + 3*h_ + "px";
    document.getElementById("estlaps").style.width = (3 + Math.max(0, estlaps_decimal - 1))*h_ + "px";
    document.getElementById("estlaps").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("estlaps").style.fontSize = 60 * h_ / 40 + "px";
    document.getElementById("estlaps_bg0").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("estlaps_bg0").style.left = decal_estlaps + 3*h_ + "px";
    document.getElementById("estlaps_bg0").style.width = (3 + Math.max(0, estlaps_decimal - 1))*h_ + "px";
    document.getElementById("estlaps_bg0").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("estlaps_bg1").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("estlaps_bg1").style.left = decal_estlaps + 3*h_ + "px";
    document.getElementById("estlaps_bg1").style.width = (3 + Math.max(0, estlaps_decimal - 1))*h_*estlaps_bg1_pct + "px";
    document.getElementById("estlaps_bg1").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("lapsremain_h").style.top = 0*h_ + "px";
    document.getElementById("lapsremain_h").style.left = decal_lapsremain + 13*h_ + "px";
    document.getElementById("lapsremain_h").style.width = (4 + Math.max(0, lapsremain_decimal - 2))*h_ + "px";
    document.getElementById("lapsremain_h").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("lapsremain_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("lapsremain").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("lapsremain").style.left = decal_lapsremain + 13*h_ + "px";
    document.getElementById("lapsremain").style.width = (4 + Math.max(0, lapsremain_decimal - 2))*h_ + "px";
    document.getElementById("lapsremain").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("lapsremain").style.fontSize = 60 * h_ / 40 + "px";
    document.getElementById("lapsremain_bg0").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("lapsremain_bg0").style.left = decal_lapsremain + 13*h_ + "px";
    document.getElementById("lapsremain_bg0").style.width = (4 + Math.max(0, lapsremain_decimal - 2))*h_ + "px";
    document.getElementById("lapsremain_bg0").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("lapsremain_bg1").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("lapsremain_bg1").style.left = decal_lapsremain + 13*h_ + "px";
    document.getElementById("lapsremain_bg1").style.width = (4 + Math.max(0, lapsremain_decimal - 2))*h_ + "px";
    document.getElementById("lapsremain_bg1").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("lapsremain_bg2").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("lapsremain_bg2").style.left = decal_lapsremain + 13*h_ + "px";
    lapsremain_bg2_left = decal_lapsremain + 13*h_;
    document.getElementById("lapsremain_bg2").style.width = 1 + "px";
    document.getElementById("lapsremain_bg2").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("fuelneed_h").style.top = 0*h_ + "px";
    document.getElementById("fuelneed_h").style.left = decal_fuelneed + 17*h_ + "px";
    document.getElementById("fuelneed_h").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("fuelneed_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("fuelneed").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("fuelneed").style.left = decal_fuelneed + 17*h_ + "px";
    document.getElementById("fuelneed_bg0").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("fuelneed_bg0").style.left = decal_fuelneed + 17*h_ + "px";
    document.getElementById("fuelneed_bg1").style.top = Math.floor(0.5*h_) + Math.floor(fuelneed_bg1_pct * (2*h_ - Math.floor(0.5*h_))) + "px";
    document.getElementById("fuelneed_bg1").style.left = decal_fuelneed + 17*h_ + "px";
    if (disp_infosbar == 2) {
        document.getElementById("fuelneed_h").style.right = 0 + "px";
        document.getElementById("fuelneed_h").style.width = "auto";
        document.getElementById("fuelneed").style.right = 0 + "px";
        document.getElementById("fuelneed").style.width = "auto";
        document.getElementById("fuelneed_bg0").style.right = 0 + "px";
        document.getElementById("fuelneed_bg0").style.width = "auto";
        document.getElementById("fuelneed_bg1").style.right = 0 + "px";
        document.getElementById("fuelneed_bg1").style.width = "auto";
    } else {
        document.getElementById("fuelneed_h").style.width = 5*h_ + "px";
        document.getElementById("fuelneed").style.width = 5 * h_ + "px";
        document.getElementById("fuelneed_bg0").style.width = 5 * h_ + "px";
        document.getElementById("fuelneed_bg1").style.width = 5 * h_ + "px";
    }
    document.getElementById("fuelneed").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("fuelneed").style.fontSize = 60 * h_ / 40 + "px";
    document.getElementById("fuelneed_bg0").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("fuelneed_bg0").style.fontSize = 60 * h_ / 40 + "px";
    document.getElementById("fuelneed_bg1").style.lineHeight = 2*h_ - Math.floor(0.5*h_) - Math.floor(fuelneed_bg1_pct * (2*h_ - Math.floor(0.5*h_))) + "px";
    document.getElementById("fuelneed_bg1").style.fontSize = 60 * h_ / 40 + "px";

    document.getElementById("timeremain_h").style.top = 0*h_ + "px";
    document.getElementById("timeremain_h").style.left = decal_timeremain + 6*h_ + "px";
    document.getElementById("timeremain_h").style.width = 7*h_ + "px";
    document.getElementById("timeremain_h").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("timeremain_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("timeremain").style.top = Math.floor(0.5*h_) + "px";
    document.getElementById("timeremain").style.left = decal_timeremain + 6*h_ + "px";
    document.getElementById("timeremain").style.width = 7*h_ + "px";
    document.getElementById("timeremain").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("timeremain").style.fontSize = 60 * h_ / 40 + "px";

    document.getElementById("sessioninfos").style.top = -Math.floor(sessioninfos_height_ * h_ / (ligne_h / dpi_factor_)) + 0*2* (disp_infosbar - 1)*h_ + "px";
    document.getElementById("sessioninfos").style.left = 0*(decal_infos + 22*h_)*(2-disp_infosbar) + "px";
    document.getElementById("sessioninfos").style.fontSize = sessioninfos_height_ / 20 * 14 * h_ / (ligne_h / dpi_factor_) + "px";
    document.getElementById("sessioninfos").style.lineHeight = Math.floor(sessioninfos_height_ * h_ / (ligne_h / dpi_factor_)) + 0*Math.floor(0.5*h_) + "px";

    document.getElementById("sof_cont").style.top = 2* (disp_infosbar - 1)*h_ + 0*Math.floor(0.5 * h_) + "px";
    document.getElementById("sof_cont").style.left = (decal_infos + 22*h_) *(2-disp_infosbar) + "px";
    document.getElementById("sof_cont").style.lineHeight = 2*h_ - 0*Math.floor(0.5*h_) + "px";
    document.getElementById("sof_cont").style.height = 2*h_ - 0*Math.floor(0.5*h_) + "px";

    document.getElementById("tires_all_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("tires_all_h").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("tires_all_cont").style.lineHeight = 2*h_ - (1 + jrt_logo_disp)*Math.floor(0.5*h_) + "px";
    document.getElementById("tires_all_cont").style.width = 2*h_ + "px";
    document.getElementById("tires_none_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("tires_none_h").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("tires_none_cont").style.lineHeight = 2*h_ - (1 + jrt_logo_disp)*Math.floor(0.5*h_) + "px";
    document.getElementById("tires_none_cont").style.width = 2*h_ + "px";
    document.getElementById("tires_left_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("tires_left_h").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("tires_left_cont").style.lineHeight = 2*h_ - (1 + jrt_logo_disp)*Math.floor(0.5*h_) + "px";
    document.getElementById("tires_left_cont").style.width = 2*h_ + "px";
    document.getElementById("tires_right_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("tires_right_h").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("tires_right_cont").style.lineHeight = 2*h_ - (1 + jrt_logo_disp)*Math.floor(0.5*h_) + "px";
    document.getElementById("tires_right_cont").style.width = 2*h_ + "px";
    document.getElementById("tires").style.top = 2* (disp_infosbar - 1)*h_ + jrt_logo_disp * Math.floor(0.5*h_) + "px";
    document.getElementById("tires").style.lineHeight = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("tires").style.height = 2*h_ - Math.floor(0.5*h_) + "px";
    document.getElementById("tires").style.right = jrt_logo_disp*(2*h_ - Math.floor(0.5*h_) + 8) + "px";

    document.getElementById("logo").style.top = 2* (disp_infosbar - 1)*h_ + Math.floor(0.5*h_) + "px";
    document.getElementById("logo").style.height = 2*h_ - Math.floor(0.5*h_) - 2 + "px";

    document.getElementById("app_name").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("app_name").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("app_name").style.top = (disp_infosbar - 1)*(2*h_) + "px";

    document.getElementById("flag_img").style.top = 2* (disp_infosbar - 1)*h_ + Math.floor(0.5*h_) + "px";
    document.getElementById("flag_img").style.left = (decal_infos + 22*h_)*(2-disp_infosbar) + "px";
    document.getElementById("flag_img").style.right = 2*h_ - Math.floor(0.5*h_) + 8 + "px";
    //document.getElementById("flag_img").style.width = window_innerWidth - (2*h_ - Math.floor(0.5*h_) + 8) - (decal_infos + 23*h_)*(2-disp_infosbar) + "px";
    document.getElementById("flag_img").style.height = 2*h_ - Math.floor(0.5*h_) + "px";

    // mini sofbar
    if (disp_sofbar) {
        document.getElementById("sofbar").style.display = "block";
    } else {
        document.getElementById("sofbar").style.display = "none"
    }

    // Logo JRT avec le lien
    if (jrt_logo_disp == 0) {
        document.getElementById("jrt_logo").style.display = "none";
        document.getElementById("app_name").style.display = "none";
    } else {
        document.getElementById("jrt_logo").style.display = "block";
        document.getElementById("app_name").style.display = "block";
    }

    // Tires Buttons
    if (tires_buttons == 0) {
        document.getElementById("tires").style.display = "none";
    } else {
        document.getElementById("tires").style.display = "block";
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

}
