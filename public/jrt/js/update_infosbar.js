function update_infosbar() {

    if (donnees.fnman != fnman_old) {
        fnman_disp_temporary_tstamp = Date.now() / 1000;
        fnman_old = donnees.fnman;
    }
    if (donnees.fn_auto_offset != fn_auto_offset_old) {
        fn_auto_offset_disp_temporary_tstamp = Date.now() / 1000;
        fn_auto_offset_old = donnees.fn_auto_offset;
    }

    if (donnees.u != undefined) {
        speedfactor = donnees.u == 1 ? 1 : 1 / 1.609344;
        if (donnees.carname == "lotus79" || donnees.carname == "lotus49") {
            fuelfactor = donnees.u == 1 ? 1 : 1 / 4.54609;
        } else {
            fuelfactor = donnees.u == 1 ? 1 : 1 / 3.78541178;
        }
    }

    //document.getElementById("tank").innerHTML = (fuelfactor * coef_fuel * donnees.f).toFixed(2);
    set_inner_html("tank", (fuelfactor * coef_fuel * donnees.f).toFixed(2));
    conso = 0;
    if (donnees.calculations_mode != undefined) {
        calculations_mode = donnees.calculations_mode;
    }
    if (donnees.refuel_mode != undefined) {
        refuel_mode = donnees.refuel_mode;
    }

    if (calculations_mode == 1) {
        conso = donnees.co5;
        fuelneed = donnees.fn5;
        text_conso = "(5L)";
        text_fuelneed = "(5L-";
    } else if (calculations_mode == 2) {
        conso = donnees.coMAX;
        fuelneed = donnees.fnMAX;
        text_conso = "(MAX)"
        text_fuelneed = "(MAX-";
    } else if (calculations_mode == 3) {
        conso = donnees.coSet;
        fuelneed = donnees.fnSet;
        text_conso = "(Set)"
        text_fuelneed = "(Set-";
    } else {
        conso = donnees.co;
        fuelneed = donnees.fn;
        text_conso = "(1L)";
        text_fuelneed = "(1L-";
    }

    fuelneed_p = fuelneed;  // fuelneed pour le calcul des nbpits
    fn_dont_change_colors = 0;
    fn_signe = "";

    // On affiche la valeur 'fuel to add' entrée manuellement
    if (refuel_mode == 1) {
        if (donnees.fnman_disp || (Date.now() / 1000 - fnman_disp_temporary_tstamp <= 2) ) {
            fuelneed = donnees.fnman;
        }
        text_fuelneed = "(S-A:" + (fuelfactor * coef_fuel * donnees.fnman).toFixed(1) + ")";
    } else if (refuel_mode == 0) {
        text_fuelneed += "M)";
    } else if (refuel_mode == 2) {
        if (Date.now() / 1000 - fn_auto_offset_disp_temporary_tstamp <= 2) {  // en fonction de l'option choisie, on l'affiche tout le temps ou bien juste pendant 2 secondes
            fuelneed = donnees.fn_auto_offset;
            fn_dont_change_colors = 1;
        }
        if (donnees.fn_auto_offset >= 0) {
            fn_signe = "+";
        }
        text_fuelneed += "A:" + fn_signe + donnees.fn_auto_offset + ")";
    }

    if (donnees.refuelspeed == 0) {
        donnees.refuelspeed = 1
    }
    if (fuelneed >= 5*donnees.refuelspeed) {
        fuelneed_bg1_pct = 1;
    } else if (fuelneed <= 0) {
        fuelneed_bg1_pct = 0;
    } else {
        fuelneed_bg1_pct = fuelneed / (5 * donnees.refuelspeed);
    }

    //fuelneed_bg1_pct = 0.5;

    if (responsive) {
        h = Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_));
    } else {
        h = (ligne_h / dpi_factor_);
    }
	h = h * infosbar_coef;

    if (fn_dont_change_colors == 0) {
        document.getElementById("fuelneed_bg1").style.top = Math.floor(0.5 * h) + Math.floor(fuelneed_bg1_pct * (2 * h - Math.floor(0.5 * h))) + "px";
        document.getElementById("fuelneed_bg1").style.lineHeight = 2 * h - Math.floor(0.5 * h) - Math.floor(fuelneed_bg1_pct * (2 * h - Math.floor(0.5 * h))) + "px";

        if (donnees.estim_status == 0 || donnees.fuel_accurate != 1) {
            //document.getElementById("fuelneed").style.color = "#666666";
            set_style_color("fuelneed", "#666666");
        } else {
            if (fuelneed_bg1_pct == 0) {
                //document.getElementById("fuelneed").style.color = "#ffffff";
                set_style_color("fuelneed", "#ffffff");
            } else {
                //document.getElementById("fuelneed").style.color = "#000000";
                set_style_color("fuelneed", "#000000");
            }
        }
    }

    if (donnees.fuel_accurate != 1) {
        //document.getElementById("tank").style.color = "#bbbbbb";
        set_style_color("tank", "#bbbbbb");
        //document.getElementById("conso").style.color = "#bbbbbb";
        set_style_color("conso", "#bbbbbb");
        //document.getElementById("estlaps").style.color = "#555555";
        set_style_color("estlaps", "#555555");
    } else {
        //document.getElementById("tank").style.color = "#ffffff";
        set_style_color("tank", "#ffffff");
        //document.getElementById("conso").style.color = "#ffffff";
        set_style_color("conso", "#ffffff");
        //document.getElementById("estlaps").style.color = "#000000";
        set_style_color("estlaps", "#000000");
    }

    //conso = 1.5;  // DEBUG ***
    if (conso > 0) {
        // On rajoute les tours de marge
        //fuelneed += fuel_spare_nblaps * conso;

        if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
            //document.getElementById("conso").innerHTML = (fuelfactor * coef_fuel * conso).toFixed(3) + " " + text_conso;
            if (disp_conso_bigger) {
                set_inner_html("conso_h", "Cons. " + text_conso);
                set_inner_html("conso", (fuelfactor * coef_fuel * conso).toFixed(3));
            } else {
                set_inner_html("conso", (fuelfactor * coef_fuel * conso).toFixed(3) + " " + text_conso);
            }
        } else {
            //document.getElementById("conso").innerHTML = "buy pro";
            set_inner_html("conso", "buy pro");
        }
        //document.getElementById("estlaps").innerHTML = (donnees.f / conso).toFixed(1);
        if (donnees.estlaps != undefined && donnees.estlaps_bg1_pct != undefined) {
            if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                //document.getElementById("estlaps").innerHTML = donnees.estlaps.toFixed(1);
                tmp_estlaps = donnees.estlaps;
                if (tmp_estlaps == 0 && conso > 0) { // utile pour afficher le estlaps alors que la course n'est pas commencée
                    tmp_estlaps = donnees.f / conso;
                }
                set_inner_html("estlaps", tmp_estlaps.toFixed(estlaps_decimal));
            } else {
                //document.getElementById("estlaps").innerHTML = "buy pro";
                set_inner_html("estlaps", "buy pro");
            }
            estlaps_bg1_pct = donnees.estlaps_bg1_pct;
        }
        //estlaps_bg1_pct = 0.5;  // DEBUG ***
        document.getElementById("estlaps_bg1").style.width = (3 + Math.max(0, estlaps_decimal - 1))*h*estlaps_bg1_pct + "px";
        //if (donnees.f / conso < 2) {
        if (donnees.f_alert == 1) {
            //document.getElementById("estlaps").style.backgroundColor = "#ee0000";
            //document.getElementById("estlaps_bg0").style.backgroundColor = "#ee0000";
            set_style_bg("estlaps_bg0", "#ee0000");
            //document.getElementById("tank").style.backgroundColor = "#cc0000";
            set_style_bg("tank", "#cc0000");
            //document.getElementById("conso").style.backgroundColor = "#880000";
            set_style_bg("conso", "#880000");
        } else {
            //document.getElementById("estlaps").style.backgroundColor = "#00aa00";
            //document.getElementById("estlaps_bg0").style.backgroundColor = "#00aa00";
            set_style_bg("estlaps_bg0", "#00aa00");
            //document.getElementById("tank").style.backgroundColor = "#008800";
            set_style_bg("tank", "#008800");
            //document.getElementById("conso").style.backgroundColor = "#005500";
            set_style_bg("conso", "#005500");
        }
    } else {
        //document.getElementById("conso").innerHTML = "-- " + text_conso;
        if (disp_conso_bigger) {
            set_inner_html("conso_h", "Cons. " + text_conso);
            set_inner_html("conso", "--");
        } else {
            set_inner_html("conso", "-- " + text_conso);
        }
        //document.getElementById("estlaps").innerHTML = "--";
        set_inner_html("estlaps", "--");
    }

    if (donnees.tr != undefined && donnees.state != undefined) {
        if (donnees.state >= 4 && donnees.laps_l == 1 && donnees.tr != -1 && donnees.tr != -2 && donnees.tr != -3 && donnees.tr != "unlimited" && donnees.styp == "Race" && donnees.laps != "unlimited") {
            timeremain = "<div style='font-size: 0.75em; vertical-align: top; top: 25%;'>" + "Lap " + (donnees.lead_lc + 1) + "/" + donnees.laps + "</div>";
        } else {
            timeremain = reformat_timeremain(donnees.tr);
        }
        if (timeremain != timeremain_old) {  // on actualise que si la valeur a changé
            //document.getElementById("timeremain").innerHTML = timeremain;
            set_inner_html("timeremain", timeremain);
            timeremain_old = timeremain;
        }
    }

    //if (selected_idxjs in donnees.d && donnees.c in donnees.d)
    if (donnees.d != undefined && donnees.c in donnees.d) {
        //if (donnees.d[selected_idxjs].lr < 32767)
        if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
            //document.getElementById("lapsremain").innerHTML = reformat_lapsremain(donnees.d[donnees.c].lr);
            set_inner_html("lapsremain", reformat_lapsremain(donnees.d[donnees.c].lr));
            if (donnees.lapsremain_bg1_pct != undefined) {
                lapsremain_bg1_pct = donnees.lapsremain_bg1_pct;
            }
            //lapsremain_bg1_pct = 0.5;  // DEBUG ***
            document.getElementById("lapsremain_bg1").style.width = (4 + Math.max(0, lapsremain_decimal - 2)) * h * lapsremain_bg1_pct + "px";

            if (donnees.gap_pct_lastlap != undefined && donnees.lead_lap != undefined) {
                gap_pct_lastlap = donnees.gap_pct_lastlap;
                //gap_pct_lastlap = 0.5;  // DEBUG ***

                // REM : (4 + Math.max(0, lapsremain_decimal - 2)) * h est censé être la largeur du lapsremain
                tmp_x = Math.floor(Math.min((4 + Math.max(0, lapsremain_decimal - 2)) * h - 2, (4 + Math.max(0, lapsremain_decimal - 2)) * h * gap_pct_lastlap));
                document.getElementById("lapsremain_bg2").style.left = lapsremain_bg2_left + tmp_x + "px";
                if (gap_pct_lastlap == 0) {
                    //document.getElementById("lapsremain_bg2").style.width = 0 + "px";
                } else {
                    document.getElementById("lapsremain_bg2").style.width = 2 / dpi_factor + "px";
                }
                // Si on doit finir dans le même tour que le leader alors on n'affiche la gold line d'une autre couleur
                if (donnees.lead_lap == 1) {
                    //document.getElementById("lapsremain_bg2").style.backgroundColor = "#0088ff";
                    set_style_bg("lapsremain_bg2", "#0088ff");
                } else {
                    //document.getElementById("lapsremain_bg2").style.backgroundColor = "#ffd700";
                    set_style_bg("lapsremain_bg2", "#ffd700");
                }
            }

        } else {
            //document.getElementById("lapsremain").innerHTML = "buy pro";
            set_inner_html("lapsremain", "buy pro");
        }
    }
    // On affiche l'estimation du fuel requis uniquement si la conso a été calculée
    if (conso > 0.01 || refuel_mode == 1) {
        if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
            if (fuelfactor * coef_fuel * fuelneed > 9999) {
                //document.getElementById("fuelneed").innerHTML = "9999";
                set_inner_html("fuelneed", "9999");
            } else if (fuelfactor * coef_fuel * fuelneed > 999) {
                //document.getElementById("fuelneed").innerHTML = (fuelfactor * coef_fuel * fuelneed).toFixed(0);
                set_inner_html("fuelneed", (fuelfactor * coef_fuel * fuelneed).toFixed(0));
            } else {
                //document.getElementById("fuelneed").innerHTML = (fuelfactor * coef_fuel * fuelneed).toFixed(1);
                set_inner_html("fuelneed", fn_signe + (fuelfactor * coef_fuel * fuelneed).toFixed(1));
            }
        } else {
            //document.getElementById("fuelneed").innerHTML = "buy pro";
            set_inner_html("fuelneed", "buy pro");
        }
    } else {
        //document.getElementById("fuelneed").innerHTML = "--";
        set_inner_html("fuelneed", "--");
    }

    // Affichage du type de session
    //document.getElementById("sessioninfos").innerHTML = type_session + " @ " + donnees.trackname;
    if (type_session == "Race" && name_session != "RACE") {
        //document.getElementById("sessioninfos").innerHTML = name_session + ", ";
        tmp_sessioninfos = name_session + ", ";
    } else {
       // document.getElementById("sessioninfos").innerHTML = type_session + ", ";
        tmp_sessioninfos = type_session + ", ";
    }


    // Affichage de la météo

    tmp_sessioninfos += reformat_skies(donnees.skies);


    // On s'assure d'avoir des nombres pour éviter les erreurs
    donnees.windspeed = parseFloat(donnees.windspeed);
    donnees.airtemp = parseFloat(donnees.airtemp);
    donnees.tracktemp = parseFloat(donnees.tracktemp);
    donnees.winddir = parseFloat(donnees.winddir);
    donnees.humidity = parseFloat(donnees.humidity);
    donnees.fog = parseFloat(donnees.fog);
    var tmp_isNaN = false;
    if (isNaN(donnees.windspeed) || isNaN(donnees.airtemp) || isNaN(donnees.tracktemp) || isNaN(donnees.winddir) || isNaN(donnees.humidity) || isNaN(donnees.fog)) {
        tmp_isNaN = true;
    }

    if (!tmp_isNaN && (donnees.airtemp != undefined) && (donnees.tracktemp != undefined) && (donnees.winddir != undefined) && (donnees.humidity != undefined) && (donnees.fog != undefined)) {
        if (donnees.u == 1) {
            str_speed = (donnees.windspeed * 3.6).toFixed(1) + " km/h";
        } else {
            str_speed = (donnees.windspeed * 3.6 / 1.609344).toFixed(1) + " MPH";
        }
        if ((temperature_mode != 2) && ((donnees.u == 1 && temperature_mode == 0) || (temperature_mode == 1))) {  // systeme metric ou forcé en Celsius dans les options
            tmp_sessioninfos += " " + "<span style='font-style: italic; font-weight: bold'>" + donnees.airtemp.toFixed(1) + "&degC</span>";
            tmp_sessioninfos += ", track " + "<span style='font-style: italic; font-weight: bold'>" + donnees.tracktemp.toFixed(1) + "&degC</span>";
            tmp_sessioninfos += ", Winds " + "<span style='font-style: italic; font-weight: bold'>" + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + ((donnees.winddir / Math.PI * 180) % 360).toFixed(0) + "&deg</span>";
            tmp_sessioninfos += " " + "<span style='font-style: italic; font-weight: bold'>" + str_speed + "</span>";
        } else {
            tmp_sessioninfos += " " + "<span style='font-style: italic; font-weight: bold'>" + (donnees.airtemp * 1.8 + 32).toFixed(1) + "&degF</span>";
            tmp_sessioninfos += ", track " + "<span style='font-style: italic; font-weight: bold'>" + (donnees.tracktemp * 1.8 + 32).toFixed(1) + "&degF</span>";
            tmp_sessioninfos += ", Winds " + "<span style='font-style: italic; font-weight: bold'>" + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + ((donnees.winddir / Math.PI * 180) % 360).toFixed(0) + "&deg</span>";
            tmp_sessioninfos += " " + "<span style='font-style: italic; font-weight: bold'>" + str_speed + "</span>";
        }
        tmp_sessioninfos += ", RH " + "<span style='font-style: italic; font-weight: bold'>" + (donnees.humidity * 100).toFixed(0) + "%</span>";
        //tmp_sessioninfos += ", Pressure " + "<span style='font-style: italic; font-weight: bold'>" + donnees.airpress.toFixed(0) + " Hg</span>";
        //tmp_sessioninfos += ", Density " + "<span style='font-style: italic; font-weight: bold'>" + donnees.airdens.toFixed(3) + " kg/m<sup>3</sup></span>";
        tmp_sessioninfos += ", Fog " + "<span style='font-style: italic; font-weight: bold'>" + (donnees.fog * 100).toFixed(0) + "%</span>";
    }
    if (donnees.tod != undefined) tmp_sessioninfos += ", " + donnees.tod;

    //document.getElementById("sessioninfos").innerHTML = tmp_sessioninfos;
    set_inner_html("sessioninfos", tmp_sessioninfos);

    // ***
    //document.body.innerHTML = ", " + "<div style='color:#ffffff;font-style: italic; font-weight: bold'>" + donnees.weekendinfo + "</div>";

    // Affichage des SOF pour chaque classe et du SOF global
    if (donnees.sof != undefined && sof_displayed == 0) {
    //if (donnees.sof != undefined) {

        // ***.
        //console.log("SOF recalculated");

        sof_displayed = 1;
        if (responsive) {
            h = Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_));
            h2 = (disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_)) * Math.floor(window_innerWidth / reference_w * (ligne_h / dpi_factor_));
            fz = Math.floor(32 * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_) * window_innerWidth / reference_w * (ligne_h / dpi_factor_) / 40)
        } else {
            h = (ligne_h / dpi_factor_);
            h2 = (disp_sofbar * sofbar_h / dpi_factor_ / (ligne_h / dpi_factor_)) * (ligne_h / dpi_factor_);
            fz = Math.floor(32 * sofbar_h / dpi_factor_ / 40);
        }
        h_ = h * infosbar_coef;
        tmp_sof_cont = "<div onmousedown='class_selected="+0+";update_datas(-1);' style='z-index:6;color:#ffffff;padding-left:8px;padding-right:8px;" +
            "display:inline-block;position:relative;left:0;line-height:" + (2 * h_ - Math.floor(0.5 * h_)) + "px;background-color:#000000'>" +
            "<div style='text-align:center;font-size:" + 14 * h_ / 40 + "px;line-height:" + (Math.floor(0.5 * h_)) + "px'>ALL ("+ donnees.nb +")</div>" +
            "<div style='text-align:center;line-height:" + (2 * h_ - 1 * Math.floor(0.5 * h_)) + "px'>" + donnees.sof[0] +
            "</div></div>";

        tmp_sofbar = "<div onclick='class_selected="+0+";update_datas(-1);' style='z-index:6;font-size:" + fz + "px;padding-left:8px;" +
            "padding-right:8px;display:inline-block;position:relative;left:0;top:0;line-height:" + h2 + "px;" +
            "cursor: pointer; background-color:#000000'>ALL ("+ donnees.nb +") : " + donnees.sof[0] + "</div>";
        nb_classes = 0;
        for (c in donnees.classes) nb_classes += 1
        if (nb_classes > 1) {
            for (c in donnees.classes) {
                if (donnees.carclasscolor != undefined && (c in donnees.carclasscolor)) {
                    str = donnees.carclasscolor[c];
                    if (str == "0x0") str = "0xaaaaaa";
                    str = str.slice(2);
                    for (n = str.length; n < 6; n++) {
                        str = "0" + str
                    }


                    if (c in bg_by_classid) {  // si on a définit une class spécifique pour un numéros ainsi qu'un couleur
                        str = bg_by_classid[c].slice(1);
                    }


                    // On calcule la bonne couleur pour la font
                    var r = parseInt("0x" + str.substr(0, 2));
                    var g = parseInt("0x" + str.substr(2, 2));
                    var b = parseInt("0x" + str.substr(4, 2));
                    var moy = (r + g + b) / 3;
                    var font_coul = "000000";
                    if (moy < 150) {
                        font_coul = "ffffff";
                    }
                    if (c in col_by_classid) {  // si on a définit une class spécifique pour un numéros ainsi qu'un couleur
                        font_coul = col_by_classid[c].slice(1);
                    }

                    a1 = "";
                    a2 = "";
                    if (f3_box == 0) {
                        a1 += "<div onmousedown='class_selected=" + c + ";update_datas(-1);'";
                        a2 += "<div onclick='class_selected=" + c + ";update_datas(-1);'";
                    } else {
                        a1 += "<div ";
                        a2 += "<div ";
                    }
                    a1 += " style='z-index:6;padding-left:8px;padding-right:8px;" +
                        "display:inline-block;position:relative;left:0;top:0;line-height:" + (2 * h_ - Math.floor(0.5 * h_)) + "px;background-color:#" + str + "; color: #" + font_coul + " ;'>" +
                        "<div style='text-align:center;font-size:" + 14 * h_ / 40 + "px;line-height:" + Math.floor(0.5 * h_) + "px'>" + donnees.classname[c] +
                        " (" + donnees.nbcars_class[c] + ")</div>" +
                        "<div style='text-align:center;line-height:" + (2 * h_ - 1 * Math.floor(0.5 * h_)) + "px'>" + donnees.sof[c] + "</div></div>";
                    a2 += " style='z-index:6;color:#000000; font-size:" + fz + "px;padding-left:8px;" +
                        "cursor: pointer; padding-right:8px;display:inline-block;position:relative;left:0;top:0;line-height:" + h2 + "px;" +
                        "background-color:#" + str + "; color: #" + font_coul + " ;'>" + donnees.classname[c] + " (" + donnees.nbcars_class[c] + ") : " + donnees.sof[c] + "</div>";
                    tmp_sof_cont += a1;
                    tmp_sofbar += a2;
                }
            }
        }

        set_inner_html("sof_cont", tmp_sof_cont);
        set_inner_html("sofbar", tmp_sofbar);

    }


    // En fonction du système d'unité d'iRacing on passe de litre/kg à Gallon/livre
    // REM : plus utilisé
    /*if (donnees.u == 1) {
        document.getElementById("litre").innerHTML = "L";
        document.getElementById("kg").innerHTML = "Kg"
    } else {
        document.getElementById("litre").innerHTML = "Ga";
        document.getElementById("kg").innerHTML = "Lb"
    }*/

    // Couleurs des éléments dynamiques de la barre d'infos (L, Kg, Tank et Flag-typesession-sof-circuit
    /*if (coef_fuel ==1) {
        document.getElementById("litre").style.backgroundColor = "#dddddd";
        document.getElementById("litre").style.color = "#000000";
        document.getElementById("kg").style.backgroundColor = "#999999";
        document.getElementById("kg").style.color = "#555555";
    } else {
        document.getElementById("litre").style.backgroundColor = "#999999";
        document.getElementById("litre").style.color = "#555555";
        document.getElementById("kg").style.backgroundColor = "#dddddd";
        document.getElementById("kg").style.color = "#000000";
    }*/

    if (donnees.flag != undefined) {
        if (donnees.flag.slice(-4, -3) == "1") bg = "#ffff00";       // yellow
        else if (donnees.flag.slice(-9, -8) == "1") bg = "#ffff00";  // yellow waving
        else if (donnees.flag.slice(-15, -14) == "1") bg = "#ffff00";  // caution
        else if (donnees.flag.slice(-16, -15) == "1") bg = "#ffff00";  // caution waving
        else if (donnees.flag.slice(-6, -5) == "1") bg = "#0000ff";  // blue
        else if (donnees.flag.slice(-2, -1) == "1") bg = "#ffffff";  // white
        else if (donnees.flag.slice(-3, -2) == "1") bg = "#00ff00";  // green
        //else if (donnees.flag.slice(-11, -10) == "1") bg = "#008800";  // green held (fin d'une période de caution)
        else bg = "#999999";                                        // autres
    } else {
        bg = "#333333";
    }

    /*
    else if (donnees.flag == "0x00000002") bg = "#999999";  // checkered
    else if (donnees.flag == "0x00000008") bg = "#ff0000";  // red
    else if (donnees.flag == "0x00000100") bg = "#ffffff";  // one lap to green
    else if (donnees.flag == "0x00010000") bg = "#000000";  // black
    */

    //document.getElementById("sessioninfos").style.backgroundColor = bg;
    //document.getElementById("sof_cont").style.backgroundColor = bg;
    set_style_bg("sof_cont", bg);

    // Si on peut pitter sans risquer de devoir faire un pit de plus on met le fond en mauve
    // Estimation d'abord du nombre de pits restants
    if (fuelneed_p > 0 && donnees.tcap > 0) {
        //p = Math.floor((fuelneed - 1*conso) / donnees.tcap) + 1;
        p = ((fuelneed_p - 1*conso) / donnees.tcap) + 1;
        p = parseFloat(p).toFixed(2);
        if (p < 0)
            p = 0;
    } else {
        p = 0;
    }
    if (conso > 0) {
        //document.getElementById("fuelneed_h").innerHTML = "F2add " + text_fuelneed + " " + p + " pits";
        set_inner_html("fuelneed_h", "F2add " + text_fuelneed + " " + p + " pits");
    } else {
        //document.getElementById("fuelneed_h").innerHTML = "F2add " + text_fuelneed + " -- pits";
        set_inner_html("fuelneed_h", "F2add " + text_fuelneed + " -- pits");
    }

    if (fn_dont_change_colors == 0) {
        if (donnees.estim_status == 0) {
            //document.getElementById("fuelneed_bg0").style.backgroundColor = "#999999";
            set_style_bg("fuelneed_bg0", "#999999");
            //document.getElementById("fuelneed_bg1").style.backgroundColor = "#0099ff";
            set_style_bg("fuelneed_bg1", "#0099ff");
        } else {
            //document.getElementById("fuelneed_bg1").style.backgroundColor = "#0099ff";
            set_style_bg("fuelneed_bg1", "#0099ff");
            if (Math.floor(p) > 0 && fuelneed < donnees.tcap * Math.floor(p) - donnees.f) {  //
                //document.getElementById("fuelneed_bg0").style.backgroundColor = "#ff99ff";
                set_style_bg("fuelneed_bg0", "#ff99ff");
            } else {
                //document.getElementById("fuelneed_bg0").style.backgroundColor = "#ff9900";
                set_style_bg("fuelneed_bg0", "#ff9900");
            }
        }
    }

    if (donnees.estim_status == 2 && donnees.tr >= 0 && donnees.laps_l != 1) {
        //document.getElementById("timeremain").style.color = "#333333";
        set_style_color("timeremain", "#333333");
    } else {
        //document.getElementById("timeremain").style.color = "#ffffff";
        set_style_color("timeremain", "#ffffff");
    }

    // Mise à jour de la bannière
    if (banner_height != 0) {  // important car si c'est 0, ça rame
		if (type_session == "Race" && name_session != "RACE") {
			ban = name_session + ", ";
		} else {
			ban = type_session + ", ";
		}

		if (donnees.laps != "unlimited") {
			ban += donnees.laps + " laps";
		} else {
			ban += reformat_timeremain(donnees.time);
		}
		ban += " - " + donnees.date + "<br>";
		if (donnees.trackconfig != null) {
			ban += donnees.trackname + " - " + donnees.trackconfig + "<br>" + donnees.carscreenname;
		} else {
			ban += donnees.trackname + "<br>" + donnees.carscreenname;
		}

		decalage = (parseInt(Date.now()/1000) - donnees.tstamp);
		if (decalage > 120) {  // au-delà de 2 minutes de décalage on affiche OFFLINE
			//$("#banner_live").html("OFFLINE");
            set_inner_html("banner_live", "OFFLINE");
			$("#banner_live").css("background-color", "#dd0000");
		} else {
			//$("#banner_live").html("LIVE");
            set_inner_html("banner_live", "LIVE");
			$("#banner_live").css("background-color", "#00dd00");
		}

		//$("#banner_text").html(ban);
        set_inner_html("banner_text", ban);
	}

}
