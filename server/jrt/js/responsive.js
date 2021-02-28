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

function responsive_dim(param) {

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

    trackmap_canvas_w = -1;
    trackmap_canvas_h = -1;

    banner_and_ticker_height = banner_height + events_ticker_height / dpi_factor_ * disp_events_ticker;

    if (disp_infosbar == 0) {
        sessioninfos_height_ = 0;
    } else {
        sessioninfos_height_ = sessioninfos_height / dpi_factor_;
    }

    if (donnees.logo_pct != undefined) {
        logo_pct = donnees.logo_pct;
    }

    estlaps_bg1_pct = 0;
    fuelneed_bg1_pct = 0;
    lapsremain_bg1_pct = 0;
    gap_pct_lastlap = 0;

    if (param == 0) {
        disp_ = disp;
    } else {
        disp_ = disp_all;
    }

    largeur_totale = 0;
    for (t in disp_) {
        largeur_totale += w[t]*disp_[t];
    }

    if (reference_w_auto) {
        reference_w = largeur_totale;
        //console.log(reference_w)
    }

    if (param == 0) {
        reference_w_ = reference_w
    } else {
        reference_w_ = 2000
    }

    // Si ce n'est pas une course en team en passe du mode 5 ou du mode 6 au mode 1
    if ((name_mode == 5 || name_mode == 6) && (donnees.teamracing == undefined || donnees.teamracing == 0)) {
        name_mode_ = 1;
    } else {
        name_mode_ = name_mode;
    }

    if (responsive) {
        if (disp_scrollbar && !(/Android|webOS|iPhone|iPad/i.test(navigator.userAgent))) {
            coef_w = window_innerWidth - 17;
        } else {
            coef_w = window_innerWidth;
        }
        for (t in disp_) {
            //padd = $("#"+t+"0").css("paddingLeft");
            padd = 0;  // plus besoin d'enlever la marge
            //coef_w -= parseInt(padd);
        }
        coef_w = coef_w / largeur_totale;
    } else {
        coef_w = 1;
    }

    /*
    tmp = 0;
    for (t in disp_) {
        tmp += Math.floor(w[t]*disp_[t]*coef_w);
    }
    console.log(window_innerWidth, tmp)
    */

    if (responsive) {
        if (name_mode_ == 5) {
            coef_ligne = 2 * window_innerWidth / reference_w_;  // on double la hauteur des lignes quand on afficher le nom et la team sur 2 lignes
        } else {
            coef_ligne = 1 * window_innerWidth / reference_w_
        }
    } else {
        if (name_mode_ == 5) {
            coef_ligne = 2;  // on double la hauteur des lignes quand on afficher le nom et la team sur 2 lignes
        } else {
            coef_ligne = 1;
        }
    }

    delta_h = Math.floor(coef_ligne * ligne_h / dpi_factor_);

    // Redimensionnement des graphiques
    for (i = 0; i < 64; i++) {
        img = document.createElement("canvas");
        img.setAttribute("height", Math.max(1, delta_h));
        img.setAttribute("width", Math.max(1, Math.floor(coef_w * w['delta'] / dpi_factor_)));
        ctx = img.getContext('2d');
        //console.log(coef_w, w['delta'], delta_h)
        if (canvas[i].width != 0 && canvas[i].height != 0) {
            ctx.drawImage(canvas[i], 0, 0, Math.max(1, Math.floor(coef_w * w['delta'] / dpi_factor_)), Math.max(1, delta_h));
        }
        context[i].canvas.height = Math.max(1, delta_h);
        context[i].canvas.width = Math.max(1, Math.floor(coef_w * w['delta'] / dpi_factor_));
        if (img.width != 0 && img.height != 0) {
            context[i].drawImage(img, 0, 0);
        }
        img.remove();
        imgB = document.createElement("canvas");
        imgB.setAttribute("height", Math.max(1, delta_h));
        imgB.setAttribute("width", Math.max(1, Math.floor(coef_w * w['delta'] / dpi_factor_)));
        ctxB = img.getContext('2d');
        if (canvasB[i].width != 0 && canvasB[i].height != 0) {
            ctxB.drawImage(canvasB[i], 0, 0, Math.max(1, Math.floor(coef_w * w['delta'] / dpi_factor_)), Math.max(1, delta_h));
        }
        contextB[i].canvas.height = Math.max(1, delta_h);
        contextB[i].canvas.width = Math.max(1, Math.floor(coef_w * w['delta'] / dpi_factor_));
        if (imgB.width != 0 && imgB.height != 0) {
            contextB[i].drawImage(imgB, 0, 0);
        }
        imgB.remove()
    }

    if( !(/Android|webOS|iPhone|iPad/i.test(navigator.userAgent)) )  {  //Si c'est une tablette on désactive l'astuce permettant de cacher la scrolling barre car sinon ça rame
        document.getElementById("container").style.position = "absolute";
    } else {
    	document.body.style.overflow = "auto";
    }

    class_ligne_ = document.getElementsByClassName("ligne");
    class_ligne0_ = document.getElementsByClassName("ligne0");
    class_name_ = document.getElementsByClassName("name");
    if (responsive) {
        class_ligne0_[0].style.height = Math.floor(window_innerWidth / reference_w_ * ligne_h / dpi_factor_) + "px";
    } else {
        class_ligne0_[0].style.height = ligne_h / dpi_factor_ + "px";
    }
    for (i = 0; i < class_ligne_.length; i++) {
        class_ligne_[i].style.height = Math.floor(coef_ligne * ligne_h / dpi_factor_) + "px";
        //class_ligne_[i].style.lineHeight = Math.floor(coef_ligne * ligne_h) + "px";
    }

    ligneP_height = Math.floor(coef_ligne * ligne_h / dpi_factor_);

    for (i = 0; i < class_name_.length; i++) {
        if (name_mode_ == 5) {
            if (responsive) {
                class_name_[i].style.lineHeight = Math.floor(window_innerWidth / reference_w_ * ligne_h / dpi_factor_) + "px";
            } else {
                class_name_[i].style.lineHeight = ligne_h / dpi_factor_ + "px";
            }
        } else {
            if (responsive) {
                class_name_[i].style.lineHeight = Math.floor(coef_ligne * ligne_h / dpi_factor_) + "px";
            } else {
                class_name_[i].style.lineHeight = ligne_h / dpi_factor_ + "px";
            }
        }
    }

    //var tmp_count_w = 0;
    //var tmp_count_padd = 0;
    for (t in disp_) {
        class_t = document.getElementsByClassName(t);
        padd = $("#"+t+"0").css("paddingLeft"); // on enlève la marge
        //padd = parseInt($("#"+t+"0").css("paddingLeft")) / dpi_factor + "px";
        //padd = 0;  // plus besoin d'enlever la marge
        for (i = 0; i < class_t.length; i++) {
            if (responsive) {
                //class_t[i].style.width = Math.floor(coef_w * (w[t] / dpi_factor_ - parseInt(padd) * dpi_factor)) + "px";
                //class_t[i].style.width = Math.floor(coef_w * (w[t] / dpi_factor_ - parseInt(padd))) + "px";
                class_t[i].style.width = coef_w * w[t] - parseInt(padd) + "px";
                //console.log(t, Math.floor(coef_w * (w[t] / dpi_factor_ - parseInt(padd) * dpi_factor)), Math.round(coef_w * w[t]), padd);
            } else {
                //class_t[i].style.width = Math.floor(coef_w * (w[t] / dpi_factor_ - parseInt(padd))) + "px";
                class_t[i].style.width = coef_w * w[t] / dpi_factor_ - parseInt(padd) + "px";
                //class_t[i].style.width = coef_w * w[t] - parseInt(padd) + "px";
            }
        }
        //tmp_count_w += coef_w * w[t] - parseInt(padd);
        //tmp_count_padd += parseInt(padd);
    }
    //console.log("***", tmp_count_w, tmp_count_padd, tmp_count_w + tmp_count_padd, window_innerWidth);

    if (responsive) {
        h = Math.floor(window_innerWidth / reference_w * ligne_h / dpi_factor_);
    } else {
        h = ligne_h / dpi_factor_;
    }

    id_tableau = document.getElementById("tableau");
    if (responsive) {
        id_tableau.style.lineHeight = Math.floor(coef_ligne * ligne_h / dpi_factor_) + "px";

        //document.getElementById("container").style.fontSize = Math.floor(24 * window_innerWidth / reference_w_ * ligne_h / 40) + "px";

        document.getElementById("timing").style.fontSize = Math.floor(24 * window_innerWidth / reference_w_ * ligne_h / dpi_factor_ / 40) + "px";
        document.getElementById("p00").style.fontSize = Math.floor(24 * window_innerWidth / reference_w_ * ligne_h / dpi_factor_ / 40) + "px";
        document.getElementById("p00").style.lineHeight = Math.floor(window_innerWidth / reference_w_ * ligne_h / dpi_factor_) + "px";
        document.getElementById("container").style.top = (disp_titres - 1) * Math.floor(window_innerWidth / reference_w_ * ligne_h / dpi_factor_) + Math.floor(sessioninfos_height_ * h / (ligne_h / dpi_factor_)) + Math.floor(banner_and_ticker_height * h / 40) + Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + disp_paypal + 2 * disp_infosbar * infosbar_coef) * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_))) + Math.floor(window_innerWidth / reference_w_ * (ligne_h / dpi_factor_)) + "px"

        document.getElementById("infosbar").style.fontSize = Math.floor(24 * window_innerWidth / reference_w * (ligne_h / dpi_factor_) / 40 * infosbar_coef) + "px";
        document.getElementById("infosbar").style.lineHeight = Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_) * infosbar_coef) + "px";
        document.getElementById("infosbar").style.top = Math.floor(sessioninfos_height_ * h / (ligne_h / dpi_factor_)) + Math.floor(banner_and_ticker_height * h / 40) + Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + disp_paypal) * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_))) + "px";

        document.getElementById("click_infos").style.height = Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + 2 * disp_infosbar * infosbar_coef) * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_))) + "px";
        document.getElementById("click_infos").style.top = Math.floor(sessioninfos_height_ * h / (ligne_h / dpi_factor_)) + Math.floor(banner_and_ticker_height * h / 40) + disp_paypal * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_)) + "px";

        document.getElementById("p00").style.top = Math.floor(sessioninfos_height_ * h / (ligne_h / dpi_factor_)) + Math.floor(banner_and_ticker_height * h / 40) + Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + disp_paypal + 2 * disp_infosbar * infosbar_coef) * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_))) + "px";

        document.getElementById("sofbar").style.fontSize = Math.floor(32 * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) * window_innerWidth / reference_w * (ligne_h / dpi_factor_) / 40) + "px";
        document.getElementById("sofbar").style.lineHeight = Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_)) * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_))) + "px";
        //document.getElementById("sofbar").style.top = 0*Math.floor(sessioninfos_height_ * h / ligne_h) + 0*Math.floor(banner_and_ticker_height * h / 40) + disp_paypal * Math.floor(window_innerWidth / reference_w * ligne_h) + "px";
        document.getElementById("sofbar").style.top = Math.floor(banner_height * h / 40) + disp_paypal * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_)) + "px";

        document.getElementById("events_ticker").style.top = Math.floor(banner_height * h / 40) + Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + disp_paypal) * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_))) + "px";
        document.getElementById("events_ticker").style.height = Math.floor(banner_and_ticker_height * h / 40) - Math.floor(banner_height * h / 40) + "px";
        document.getElementById("events_ticker").style.fontSize = Math.floor(events_ticker_font_coef * 24 * window_innerWidth / reference_w_ * (ligne_h / dpi_factor_) / 40) + "px";
        ticker_lineheight = Math.floor(events_ticker_font_coef * 24 * window_innerWidth / reference_w_ * (ligne_h / dpi_factor_) / 40);
        document.getElementById("events_ticker").style.lineHeight = ticker_lineheight + "px";

        // L'heure
        document.getElementById("clock").style.fontSize = 2*Math.floor(24 * window_innerWidth / reference_w_ * (ligne_h / dpi_factor_) / 40) + "px";

    } else {
        id_tableau.style.lineHeight = coef_ligne * (ligne_h / dpi_factor_) + "px";

        //document.getElementById("container").style.fontSize = Math.floor(24 * ligne_h / 40) + "px";

        document.getElementById("timing").style.fontSize = Math.floor(24 * (ligne_h / dpi_factor_) / 40) + "px";
        document.getElementById("p00").style.fontSize = Math.floor(24 * (ligne_h / dpi_factor_) / 40) + "px";
        document.getElementById("infosbar").style.fontSize = Math.floor(24 * (ligne_h / dpi_factor_) / 40 * infosbar_coef) + "px";
        document.getElementById("p00").style.lineHeight = (ligne_h / dpi_factor_) + "px";
        document.getElementById("infosbar").style.lineHeight = (ligne_h / dpi_factor_) * infosbar_coef + "px";
        document.getElementById("container").style.top = (disp_titres - 1) * (ligne_h / dpi_factor_) + Math.floor(sessioninfos_height_ * h / (ligne_h / dpi_factor_)) + events_ticker_height / dpi_factor_ * disp_events_ticker + Math.floor(banner_height * h / 40) + Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + disp_paypal + 2 * disp_infosbar * infosbar_coef + 1) * (ligne_h / dpi_factor_)) + "px"
        document.getElementById("infosbar").style.top = Math.floor(sessioninfos_height_ * h / (ligne_h / dpi_factor_)) + events_ticker_height / dpi_factor_ * disp_events_ticker + Math.floor(banner_height * h / 40) + Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + disp_paypal) * (ligne_h / dpi_factor_)) + "px";

        document.getElementById("click_infos").style.height = Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_)) + Math.floor(2 * disp_infosbar * infosbar_coef) * (ligne_h / dpi_factor_)) + "px";
        document.getElementById("click_infos").style.top = Math.floor(sessioninfos_height_ * h / (ligne_h / dpi_factor_)) + events_ticker_height / dpi_factor_ * disp_events_ticker + Math.floor(banner_height * h / 40) + disp_paypal * (ligne_h / dpi_factor_) + "px";

        document.getElementById("p00").style.top = Math.floor(sessioninfos_height_ * h / (ligne_h / dpi_factor_)) + events_ticker_height / dpi_factor_ * disp_events_ticker + Math.floor(banner_height * h / 40) + (disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + disp_paypal + 2 * disp_infosbar * infosbar_coef) * (ligne_h / dpi_factor_) + "px";

        document.getElementById("sofbar").style.fontSize = Math.floor(32 * sofbar_h / dpi_factor_ / 40) + "px";
        document.getElementById("sofbar").style.lineHeight = Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_)) * (ligne_h / dpi_factor_)) + "px";
        //document.getElementById("sofbar").style.top = 0*Math.floor(sessioninfos_height_ * h / ligne_h) + 0*events_ticker_height * disp_events_ticker + Math.floor(banner_height * h / 40) + disp_paypal * ligne_h + "px";
        document.getElementById("sofbar").style.top = Math.floor(banner_height * h / 40) + disp_paypal * (ligne_h / dpi_factor_) + "px";

        document.getElementById("events_ticker").style.top = Math.floor(banner_height * h / 40) + Math.floor((disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) + disp_paypal) * (ligne_h / dpi_factor_)) + "px";
        document.getElementById("events_ticker").style.height = events_ticker_height / dpi_factor_ + "px";
        document.getElementById("events_ticker").style.fontSize = Math.floor(events_ticker_font_coef * 24 * (ligne_h / dpi_factor_) / 40) + "px";
        ticker_lineheight = Math.floor(events_ticker_font_coef * 24 * (ligne_h / dpi_factor_) / 40);
        document.getElementById("events_ticker").style.lineHeight = ticker_lineheight + "px";

        // L'heure
        document.getElementById("clock").style.fontSize = 2 * Math.floor(24 * (ligne_h / dpi_factor_) / 40) + "px";
    }

    if (clock_disp == 1) {
        document.getElementById("clock").style.display = "block";
    } else {
        document.getElementById("clock").style.display = "none";
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

    if (lic_mode >= 3) {
        for (i in donnees.d) {
            if (donnees.d[i].lic != undefined && donnees.d[i].licsub != undefined) {
                if ("lic" in disp_) document.getElementById("lic" + i).innerHTML = reformat_lic(donnees.d[i].lic, donnees.d[i].licsub)
            }
        }
    }

    // Mise en forme de la barre d'infos avec ses éléments
    if (disp_infosbar == 0) {
        document.getElementById("infosbar").style.display = "none";
    } else {
        document.getElementById("infosbar").style.display = "block";
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
        document.getElementById("fuelneed").style.display = "block";
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
        document.getElementById("fuelneed").style.display = "none";
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
    document.getElementById("tank").style.lineHeight = Math.floor(2*h_) - (2 - disp_conso_bigger)*Math.floor(0.5*h_) + "px";
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
        document.getElementById("conso").style.top = Math.floor(0.5*h_) + Math.floor(2*h_) - 2*Math.floor(0.5*h_) + "px";
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
    document.getElementById("sessioninfos").style.top = -Math.floor(sessioninfos_height_ * h / (ligne_h / dpi_factor_)) + 0*2* (disp_infosbar - 1)*h + "px";
    document.getElementById("sessioninfos").style.left = 0*(decal_infos + 22*h)*(2-disp_infosbar) + "px";
    document.getElementById("sessioninfos").style.fontSize = sessioninfos_height_ / 20 * 14 * h / (ligne_h / dpi_factor_) + "px";
    document.getElementById("sessioninfos").style.lineHeight = Math.floor(sessioninfos_height_ * h / (ligne_h / dpi_factor_)) + 0*Math.floor(0.5*h) + "px";
    document.getElementById("sof_cont").style.top = 2* (disp_infosbar - 1)*h_ + 0*Math.floor(0.5 * h_)+ "px";
    document.getElementById("sof_cont").style.left = (decal_infos + 22*h_) *(2-disp_infosbar) + "px";
    document.getElementById("sof_cont").style.lineHeight = 2*h_ - 0*Math.floor(0.5*h_) + "px";
    document.getElementById("sof_cont").style.height = 2*h_ - 0*Math.floor(0.5*h_) + "px";

    document.getElementById("tires_all_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("tires_all_h").style.lineHeight = Math.floor(0.5 * h_) + "px";
    document.getElementById("tires_all_cont").style.lineHeight = 2 * h_ - (1 + jrt_logo_disp) * Math.floor(0.5 * h_) + "px";
    document.getElementById("tires_all_cont").style.width = 2 * h_ + "px";
    document.getElementById("tires_none_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("tires_none_h").style.lineHeight = Math.floor(0.5 * h_) + "px";
    document.getElementById("tires_none_cont").style.lineHeight = 2 * h_ - (1 + jrt_logo_disp) * Math.floor(0.5 * h_) + "px";
    document.getElementById("tires_none_cont").style.width = 2 * h_ + "px";
    document.getElementById("tires_left_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("tires_left_h").style.lineHeight = Math.floor(0.5 * h_) + "px";
    document.getElementById("tires_left_cont").style.lineHeight = 2 * h_ - (1 + jrt_logo_disp) * Math.floor(0.5 * h_) + "px";
    document.getElementById("tires_left_cont").style.width = 2 * h_ + "px";
    document.getElementById("tires_right_h").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("tires_right_h").style.lineHeight = Math.floor(0.5 * h_) + "px";
    document.getElementById("tires_right_cont").style.lineHeight = 2 * h_ - (1 + jrt_logo_disp) * Math.floor(0.5 * h_) + "px";
    document.getElementById("tires_right_cont").style.width = 2 * h_ + "px";
    document.getElementById("tires").style.top = 2 * (disp_infosbar - 1) * h_ + jrt_logo_disp * Math.floor(0.5 * h_) + "px";
    document.getElementById("tires").style.lineHeight = 2 * h_ - Math.floor(0.5 * h_) + "px";
    document.getElementById("tires").style.height = 2 * h_ - Math.floor(0.5 * h_) + "px";
    document.getElementById("tires").style.right = jrt_logo_disp * (2 * h_ - Math.floor(0.5 * h_) + 8) + "px";

    document.getElementById("logo").style.top = 2* (disp_infosbar - 1)*h_ + Math.floor(0.5*h_) + "px";
    document.getElementById("logo").style.height = 2*h_ - Math.floor(0.5*h_) - 2 + "px";

    document.getElementById("app_name").style.fontSize = 14 * h_ / 40 + "px";
    document.getElementById("app_name").style.lineHeight = Math.floor(0.5*h_) + "px";
    document.getElementById("app_name").style.top = (disp_infosbar - 1)*(2*h_) + "px";

    document.getElementById("flag_img").style.top = 2* (disp_infosbar - 1)*h_ + Math.floor(0.5*h_) + "px";
    document.getElementById("flag_img").style.left = (decal_infos + 22*h_)*(2-disp_infosbar) + "px";
    document.getElementById("flag_img").style.right = 2*h_ - Math.floor(0.5*h_) + 8 + "px";
    //document.getElementById("flag_img").style.width = window_innerWidth - (2*h - Math.floor(0.5*h) + 8) - (decal_infos + 23*h)*(2-disp_infosbar) + "px";
    document.getElementById("flag_img").style.height = 2*h_ - Math.floor(0.5*h_) + "px";


    container_h = parseInt($("#container").css("height"));
    container_w = parseInt($("#container").css("width"));

    container_diag = Math.sqrt(container_w*container_w + container_h*container_h);
    container_top = parseInt($("#container").css("top"));

    document.getElementById("waitforiracing").style.fontSize = 2 * h + "px";
    document.getElementById("waitforiracing").style.lineHeight = container_h + "px";

    // mini sofbar
    if (disp_sofbar) {
        document.getElementById("sofbar").style.display = "block";
    } else {
        document.getElementById("sofbar").style.display = "none"
    }

    document.getElementById("options").style.top = container_top + "px";
    document.getElementById("display_options").style.top = container_top + "px";

    document.getElementById("trackmap").style.top = container_top - h * disp_titres + "px";
    document.getElementById("trackmap_bg").style.top = container_top - h * disp_titres + "px";
    document.getElementById("display_trackmap").style.top = container_top + "px";
    //document.getElementById("trackmap_canvas").setAttribute("height", container_h + h * disp_titres);
    trackmap_canvas.height = (container_h + h * disp_titres) * devicePixelRatio;
    trackmap_canvas.style.height = container_h + h * disp_titres + "px";
    //document.getElementById("trackmap_fond_canvas").setAttribute("height", container_h + h * disp_titres);
    trackmap_fond_canvas.height = (container_h + h * disp_titres) * devicePixelRatio;
    trackmap_fond_canvas.style.height = container_h + h * disp_titres + "px";
    //document.getElementById("trackmap_fond_turns_canvas").setAttribute("height", container_h + h * disp_titres);
    trackmap_fond_turns_canvas.height = (container_h + h * disp_titres) * devicePixelRatio;
    trackmap_fond_turns_canvas.style.height = container_h + h * disp_titres + "px";

    ttl = window_innerWidth / reference_w * timing_trackmap_leftmargin;
    document.getElementById("trackmap").style.left = ttl + "px";
    document.getElementById("trackmap_bg").style.left = ttl + "px";
    //document.getElementById("trackmap_canvas").setAttribute("width", Math.max(1, container_w - ttl - 17 - 8));
    trackmap_canvas.width = Math.max(1, container_w - ttl - 17 - 8) * devicePixelRatio;
    trackmap_canvas.style.width = Math.max(1, container_w - ttl - 17 - 8) + "px";
    //document.getElementById("trackmap_fond_canvas").setAttribute("width", Math.max(1, container_w - ttl - 17 - 8));
    trackmap_fond_canvas.width = Math.max(1, container_w - ttl - 17 - 8) * devicePixelRatio;
    trackmap_fond_canvas.style.width = Math.max(1, container_w - ttl - 17 - 8) + "px";
    //document.getElementById("trackmap_fond_turns_canvas").setAttribute("width", Math.max(1, container_w - ttl - 17 - 8));
    trackmap_fond_turns_canvas.width = Math.max(1, container_w - ttl - 17 - 8) * devicePixelRatio;
    trackmap_fond_turns_canvas.style.width = Math.max(1, container_w - ttl - 17 - 8) + "px";

    document.getElementById("trackmap").style.width = container_w - ttl - 17 - 8 + "px";
    document.getElementById("trackmap_bg").style.width = container_w - ttl - 17 - 8 + "px";

    // On redessine le circuit à la bonne taille
    //draw_track("rgba(90,90,90,0.8)", 1, 2, 1);
    //draw_track("#2c2c2c", 1, 1, 1);
    draw_track();

    //document.getElementById("trackmap").style.background = "url(./img/trackmap_logo.png) right bottom no-repeat";
    document.getElementById("trackmap").style.backgroundSize = container_w*logo_pct + "px";


    // Chargement du logo et du fond (après avoir vérifié qu'ils existent)
    if (donnees.trackpath != undefined) {
        if (trackmap_disp_logo == 1) {
            imgurl = "./img/" + donnees.trackpath + "_logo.png";
            img = new Image();
            img.src = imgurl;
            $(img)
                .load(function () {
                    if (donnees.trackpath != undefined) {
                        imgurl = "./img/" + donnees.trackpath + "_logo.png";
                    } else {
                        imgurl = "url('./img - default/trackmap_logo.png')";
                    }
                    $("#trackmap").css("background-image", "url('" + imgurl + "')");
                })
                .error(function () {
                    imgurl = "url('./img - default/trackmap_logo.png')";
                    $("#trackmap").css("background-image", "url('" + imgurl + "')");
                });
            img = null;
        }
        if (trackmap_bg_img) {
            imgurl = "./img/" + donnees.trackpath + "_bg.png";
            img2 = new Image();
            img2.src = imgurl;
            $(img2)
                .load(function () {
                    if (donnees.trackpath != undefined) {
                        imgurl = "./img/" + donnees.trackpath + "_bg.png";
                    } else {
                        imgurl = "url('./img - default/trackmap_bg.png')";
                    }
                    $("#trackmap_bg").css("background-image", "url('" + imgurl + "')");
                })
                .error(function () {
                    imgurl = "url('./img - default/trackmap_bg.png')";
                    $("#trackmap_bg").css("background-image", "url('" + imgurl + "')");
                });
            img2 = null;
        } else {
            $("#trackmap_bg").css("background-color", trackmap_bg_color);
            $("#trackmap_bg").css("background-image", "url('')");
        }
    }

    if (trackmap_disp_logo == 0) {
        $("#trackmap").css("background-image", "url('./img - default/trackmap_nologo.png')");
    }

    //document.getElementById("trackmap_bg").style.background = "url(./img/trackmap_bg.png) right bottom no-repeat";
    //document.getElementById("trackmap_bg").style.backgroundSize = "100% auto";

    //document.getElementById("container").style.filter = "blur(8px)"


    // On s'occupe de la bannière
    if ((banner_logo != "" || banner_mode != 0) && banner_height != 0) {
        $("#banner_live").css("height", Math.floor(40 * h / 40) - 0 + "px");
        $("#banner_live").css("line-height", Math.floor(40 * h / 40) + 0 + "px");
        $("#banner").css("color", banner_color);
        $("#banner").css("background-color", banner_background);
        if (banner_mode == 0) {
            var banner_logo_path = banner_logo;
            // Pour avoir une rétro compatibilité avec les anciens réglages on ne rajoute pas le "skins/" s'il y était déjà
            if ( !banner_logo_path.startsWith("skins") ) {
                banner_logo_path = "skins/" + banner_logo_path;
            }
            $("#banner_logo").attr('src', banner_logo_path);
        } else {
            if (donnees.srid != undefined && donnees.srid != 0) {
                if(donnees.srid != 34) {
                    $("#banner_logo").attr('src', 'https://d3bxz2vegbjddt.cloudfront.net/members/member_images/series/seriesid_' + donnees.srid + '/logo.jpg');
                } else {
                    $("#banner_logo").attr('src', 'https://d3bxz2vegbjddt.cloudfront.net/members/member_images/series/sbarbrs/logo_s_sbarbrs_sm.jpg');
                }
            }
        }
        $("#banner_logo").css("height", Math.floor(banner_height * h / 40) + "px");
        $("#banner").css("display", "block");
        $("#banner").css("height", Math.floor(banner_height * h / 40) + "px");

        $("#banner_text").css("padding-top", 12 * Math.floor(banner_height * h / 40) / 80 + "px");
        $("#banner_text").css("padding-left", 24 * Math.floor(banner_height * h / 40) / 80 + "px");
        $("#banner").css("font-size", 16 * Math.floor(banner_height * h / 40) / 80 + "px");
        $("#banner_live").css("padding-top", 4 * Math.floor(40 * h / 40) / 80 + "px");
        $("#banner_live").css("padding-left", 24 * Math.floor(40 * h / 40) / 80 + "px");
        $("#banner_live").css("padding-right", 24 * Math.floor(40 * h / 40) / 80 + "px");
        $("#banner_live").css("font-size", 36 * Math.floor(40 * h / 40) / 80  + "px");
    } else {
        $("#banner").css("display", "none");
    }

    if (trackmap_disp_timelost) {
        document.getElementById("plost").style.display = "block";
    } else {
        document.getElementById("plost").style.display = "none";
    }

    // events ticker
    if (disp_events_ticker) {
        $("#events_ticker").css("display", "block");
    } else {
        $("#events_ticker").css("display", "none");
    }


    // Gestion du bouton fullscreen
    if ((fullscreen_button == 1) && (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement)) {  // current working methods
        // On n'est pas en fullscreen
        if (broadcast <= 1) {
            //if (fullscreen_button == 1) {
                $("#fullscreen").css("display", "block");
                if (fullscreen_button_timeout > 0) {
                    fullscreen_button_settimeout = setTimeout(function () {
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


    class_car_ = document.getElementsByClassName("car");
    if (car_mode == 3 || car_mode == 9) {
        for (i = 0; i < class_car_.length; i++) {
            class_car_[i].style.backgroundColor = "rgba(255,255,255,0.65)";
        }
    } else {
        for (i = 0; i < class_car_.length; i++) {
            class_car_[i].style.backgroundColor = "rgba(0,0,0,0)";
        }
    }
    document.getElementById("car00").style.backgroundColor = "rgba(0,0,0,0)";

    reload_clublogos = {};
    reload_carlogos = {};

    // Certains menus n'ont pas besoin d'être affichés en mode broadcast
    if (broadcast >= 2) {
        document.getElementById("my_results_button").style.display = "none";
    }

    // Permet de fixer la hauteur de container à 64 lignes pour pouvoir centrer le pilote sélectionnée
    document.getElementById("container_height").style.height = 64 * Math.floor(coef_ligne * (ligne_h / dpi_factor_)) + "px";

    $("#session").css("max-height", window_innerHeight -  3*parseInt($('#my_results_button').css('height')) + "px");
    $("#loading").css("line-height", window_innerHeight + "px");
    $("#wind_alert").css("line-height", window_innerHeight / 4 + "px");

    if (disp_menu == 1) {
        document.getElementById('menu').style.display='block';
    } else {
        document.getElementById('menu').style.display='none';
    }

    // Lignes pour les packs de voitures
    class_ligneP_ = document.getElementsByClassName("ligneP");
    for (i = 0; i < class_ligneP_.length; i++) {
        //class_ligneP_[i].style.height = Math.floor(coef_ligne * ligne_h) - 3 + "px";
        class_ligneP_[i].style.width = container_w - 17 - 4 + "px";
    }
    class_lignePr_ = document.getElementsByClassName("lignePr");
    for (i = 0; i < class_lignePr_.length; i++) {
        class_lignePr_[i].style.backgroundColor = pack_color;
        RGBA(class_lignePr_[i], 0);
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

    if (drag_enable == 0) {
        document.getElementById("drag").style.display = "none";
    } else {
        document.getElementById("drag").style.display = "block";
    }

    // On charge les éventuels css perso
    // ...

}
