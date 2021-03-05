function str_heure() {
    var dt = new Date();
    hrs=dt.getHours();
    min=dt.getMinutes();
    sec=dt.getSeconds();
    tm=(((hrs<10)?"0":"") +hrs)+":";
    tm+=((min<10)?"0":"")+min+":";
    tm+=((sec<10)?"0":"")+sec;
    return tm;
}

function update_dashboard() {

    //console.log(donnees.typ);

    disp_sel = "_" + advanced["display_selected"];

    if (donnees.fnman != fnman_old) {
        fnman_disp_temporary_tstamp = Date.now() / 1000;
        fnman_old = donnees.fnman;
    }
    if (donnees.fn_auto_offset != fn_auto_offset_old) {
        fn_auto_offset_disp_temporary_tstamp = Date.now() / 1000;
        fn_auto_offset_old = donnees.fn_auto_offset;
    }

    if (donnees["licence_str"] != undefined) {
        pro_expired_old = pro_expired;
        pro_expired = donnees["expired"];
        if (pro_expired != pro_expired_old) {
            if (pro_expired == 1) {
                $("#expired").css("display", "block");
                $("#expired").html("<br>" + donnees["licence_str"].replaceAll("\n", "<br>"));
            } else {
                $("#expired").css("display", "none");
            }
        }
    } else {
        $("#expired").css("display", "none");
    }

    if ((donnees.me_pos != undefined && donnees.me_pos == 1 && donnees.styp == "Race") || f3_mode_in_race_dashboard == 1) {  // si on est en tête on affiche devant le pilote sur lequel on revient comme si on était en mode f3
        f3_mode_for_pre = 1;
    } else {
        f3_mode_for_pre = 0;
    }

    // REM : _f3 est utilisé dans la fonction deltas_and_gapcolor()
    if (donnees.styp == "Race" && f3_mode_in_race_dashboard == 0) {
        _f3 = "";
        _f3_tag = "";
    } else {
        _f3 = "_f3";
        _f3_tag = ".";
    }

    if (donnees.styp == "Race" && (f3_mode_in_race_dashboard == 0 && f3_mode_for_pre == 0)) {
        _f3_pre = "";
        _f3_pre_tag = "";
    } else {
        _f3_pre = "_f3";
        _f3_pre_tag = ".";
    }
    if (donnees.styp == "Race" && f3_mode_in_race_dashboard == 0) {
        _f3_post = "";
        _f3_post_tag = "";
    } else {
        _f3_post = "_f3";
        _f3_post_tag = ".";
    }

    if (donnees.typ == 31 || donnees.typ == 1) {

        //
        if (advanced["disp_" + "sof" + disp_sel]) {
            if (donnees.sof_me != undefined) {
                //document.getElementById("sof").innerHTML = donnees.sof_me;
                set_inner_html("sof", donnees.sof_me);
            }
        }

        if (advanced["disp_" + "drs" + disp_sel]) {
            if ((carname in car_with_drs) && (carname != "formularenault35")) {
                //document.getElementById("drs").innerHTML = "DRS";
                set_inner_html("drs", "DRS");
            }
        }

        rpm_leds_N_red = donnees["rpm_leds_N_red"];
        rpm_leds_led1_pct = donnees["rpm_leds_led1_pct"];

    }

    // Toutes les secondes
    if (donnees.typ <= 32) {

        if (donnees.u != undefined) {
            speedfactor = donnees.u == 1 ? 1 : 1 / 1.609344;
            if (donnees.carname == "lotus79" || donnees.carname == "lotus49") {
                fuelfactor = donnees.u == 1 ? 1 : 1 / 4.54609;
            } else {
                fuelfactor = donnees.u == 1 ? 1 : 1 / 3.78541178;
            }
        }

        if (donnees["pre_cc" + _f3_pre] != undefined && advanced["disp_" + "pre_cpos" + disp_sel]) {
            //document.getElementById("pre_cpos").style.color = cc(donnees["pre_cc" + _f3_pre]);
            set_style_color("pre_cpos", cc(donnees["pre_cc" + _f3_pre], donnees["pre_num" + _f3_pre], donnees["pre_classid" + _f3_pre]));
        }
        if (donnees.me_cc != undefined && advanced["disp_" + "me_cpos" + disp_sel]) {
            //document.getElementById("me_cpos").style.color = cc(donnees.me_cc);
            set_style_color("me_cpos", cc(donnees.me_cc, donnees.me_num, donnees.me_classid));
        }
        if (donnees["post_cc" + _f3_post] != undefined && advanced["disp_" + "post_cpos" + disp_sel]) {
            //document.getElementById("post_cpos").style.color = cc(donnees["post_cc" + _f3_post]);
            set_style_color("post_cpos", cc(donnees["post_cc" + _f3_post], donnees["post_num" + _f3_post], donnees["post_classid" + _f3_post]));
        }

        cache_pre = 0;
        cache_post = 0;
        /*if (donnees["pre_rc" + _f3_pre] != undefined) {
            if (donnees["pre_rc" + _f3_pre] < 0) {
                cache_pre = 1;
            }
        }
        if (donnees["post_rc" + _f3_post] != undefined) {
            if (donnees["post_rc" + _f3_post] > 0) {
                cache_post = 1;
            }
        }*/
        if (donnees.styp == "Race" && (f3_mode_in_race_dashboard == 0 && f3_mode_for_pre == 0)) {
            if (donnees.pre_rc != undefined)
                if (donnees.pre_rc <= 0) {
                    cache_pre = 1;
                }
        } else {
            // En dehors des courses, on affiche l'écart sur la piste
            if (donnees["pre_rcf3" + _f3_pre] != undefined)
                if (donnees["pre_rcf3" + _f3_pre] <= 0) {
                    cache_pre = 1;
                }
        }
        if (donnees.styp == "Race" && f3_mode_in_race_dashboard == 0) {
            if (donnees.post_rc != undefined)
                if (donnees.post_rc >= 0) {
                    cache_post = 1;
                }
        } else {
            // En dehors des courses, on affiche l'écart sur la piste
            if (donnees["post_rcf3" + _f3_post] != undefined)
                if (donnees["post_rcf3" + _f3_post] >= 0) {
                    cache_post = 1;
                }
        }

        //console.log(donnees["pre_rcf3" + _f3])

        if (donnees["pre_eq_me" + _f3_pre] == 1 || cache_pre) {
            donnees["pre_ir" + _f3_pre] = "&nbsp;";
            donnees["pre_name" + _f3_pre] = "&nbsp;";
            donnees["pre_pos" + _f3_pre] = "&nbsp;";
            donnees["pre_posb" + _f3_pre] = "&nbsp;";
            donnees["pre_cpos" + _f3_pre] = "&nbsp;";
            donnees["pre_cposb" + _f3_pre] = "&nbsp;";
            donnees["pre_gain" + _f3_pre] = "&nbsp;";
            donnees["pre_cgain" + _f3_pre] = "&nbsp;";
            donnees["pre_b" + _f3_pre] = 0;
            donnees["pre_l" + _f3_pre] = 0;
            donnees["pre_rc" + _f3_pre] = 0;
            donnees["pre_rcf3" + _f3_pre] = 0;
            donnees["pre_lc" + _f3_pre] = "&nbsp;";
            donnees["pre_sti" + _f3_pre] = "&nbsp;";
        }
        if (donnees["post_eq_me" + _f3_post] == 1 || cache_post) {
            donnees["post_ir" + _f3_post] = "&nbsp;";
            donnees["post_name" + _f3_post] = "&nbsp;";
            donnees["post_pos" + _f3_post] = "&nbsp;";
            donnees["post_posb" + _f3_post] = "&nbsp;";
            donnees["post_cpos" + _f3_post] = "&nbsp;";
            donnees["post_cposb" + _f3_post] = "&nbsp;";
            donnees["post_gain" + _f3_post] = "&nbsp;";
            donnees["post_cgain" + _f3_post] = "&nbsp;";
            donnees["post_b" + _f3_post] = 0;
            donnees["post_l" + _f3_post] = 0;
            donnees["post_rc" + _f3_post] = 0;
            donnees["post_rcf3" + _f3_post] = 0;
            donnees["post_lc" + _f3_post] = "&nbsp;";
            donnees["post_sti" + _f3_post] = "&nbsp;";
        }

        if (advanced["disp_" + "weather" + disp_sel]) {
            tmp_weather = "&nbsp;";
            if (donnees.styp == "Race" && donnees.sname != "RACE") {
                tmp_weather += donnees.sname + ", ";
            } else {
                tmp_weather += donnees.styp + ", ";
            }
            tmp_weather += reformat_skies(donnees.skies);

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

            if (!tmp_isNaN && (donnees.airtemp != undefined) && (donnees.tracktemp != undefined) && (donnees.winddir != undefined) && (donnees.humidity != undefined)) {
                if (donnees.u == 1) {
                    str_speed = (donnees.windspeed * 3.6).toFixed(1) + " km/h";
                } else {
                    str_speed = (donnees.windspeed * 3.6 / 1.609344).toFixed(1) + " MPH";
                }
                if ((temperature_mode != 2) && ((donnees.u == 1 && temperature_mode == 0) || (temperature_mode == 1))) {  // systeme metric ou forcé en Celsius dans les options
                    tmp_weather += " " + "<span style='font-style: italic; font-weight: bold'>" + donnees.airtemp.toFixed(1) + "&degC</span>";
                    tmp_weather += ", tr " + "<span style='font-style: italic; font-weight: bold'>" + donnees.tracktemp.toFixed(1) + "&degC</span>";
                    tmp_weather += ", " + "<span style='font-style: italic; font-weight: bold'>" + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + ((donnees.winddir / Math.PI * 180) % 360).toFixed(0) + "&deg</span>";
                    tmp_weather += " " + "<span style='font-style: italic; font-weight: bold'>" + str_speed + "</span>";
                } else {
                    tmp_weather += " " + "<span style='font-style: italic; font-weight: bold'>" + (donnees.airtemp * 1.8 + 32).toFixed(1) + "&degF</span>";
                    tmp_weather += ", tr " + "<span style='font-style: italic; font-weight: bold'>" + (donnees.tracktemp * 1.8 + 32).toFixed(1) + "&degF</span>";
                    tmp_weather += ", " + "<span style='font-style: italic; font-weight: bold'>" + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + ((donnees.winddir / Math.PI * 180) % 360).toFixed(0) + "&deg</span>";
                    tmp_weather += " " + "<span style='font-style: italic; font-weight: bold'>" + str_speed + "</span>";
                }
                tmp_weather += ", " + "<span style='font-style: italic; font-weight: bold'>" + (donnees.humidity * 100).toFixed(0) + "%</span>";
            }
            //tmp_weather += ", Pressure " + "<span style='font-style: italic; font-weight: bold'>" + donnees.airpress.toFixed(0) + " Hg</span>";
            //tmp_weather += ", Density " + "<span style='font-style: italic; font-weight: bold'>" + donnees.airdens.toFixed(3) + " kg/m<sup>3</sup></span>";
            //tmp_weather += ", Fog " + "<span style='font-style: italic; font-weight: bold'>" + (donnees.fog * 100).toFixed(0) + "%</span>";

            //document.getElementById("weather").innerHTML = tmp_weather;
            set_inner_html("weather", tmp_weather);
        }

        if (advanced["disp_" + "time_of_day" + disp_sel]) {
            if (donnees.tod != undefined) {
                //document.getElementById("time_of_day").innerHTML = donnees.tod;
                set_inner_html("time_of_day", donnees.tod);
            } else {
                //document.getElementById("time_of_day").innerHTML = "--";
                set_inner_html("time_of_day", "--");
            }
        }

        if (donnees.tr != undefined && donnees.state != undefined && advanced["disp_" + "timeremain" + disp_sel]) {
            if (donnees.state >= 4 && donnees.laps_l == 1 && donnees.tr != -1 && donnees.tr != -2 && donnees.tr != -3 && donnees.tr != "unlimited" && donnees.styp == "Race" && donnees.laps != "unlimited") {
                //document.getElementById("timeremain").innerHTML = "<span style='font-size: 0.75em; vertical-align: top; top: 25%;'>" + "Lap " + (donnees.lead_lc + 1) + "/" + donnees.laps + "</span>";
                set_inner_html("timeremain", "<span style='font-size: 0.75em; vertical-align: top; top: 25%;'>" + "Lap " + (donnees.lead_lc + 1) + "/" + donnees.laps + "</span>");
            } else {
                //document.getElementById("timeremain").innerHTML = reformat_timeremain(donnees.tr);
                set_inner_html("timeremain", reformat_timeremain(donnees.tr));
            }
        }

        //if (donnees.f != undefined && advanced["disp_" + "tank" + disp_sel])
        //    document.getElementById("tank").innerHTML = (fuelfactor * coef_fuel * donnees.f).toFixed(2);


        conso = 0;
        conso1 = donnees.co;
        conso5 = donnees.co5;
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
            text_conso = "(Set)";
            text_fuelneed = "(Set-";
        } else {
            conso = donnees.co;
            fuelneed = donnees.fn;
            text_conso = "(1L)";
            text_fuelneed = "(1L-";
        }

        fuelneed_p = fuelneed;  // fuelneed pour le calcul des nbpits
        fn_dont_change_colors = 0;

        // On affiche la valeur 'fuel to add' entrée manuellement
        if (refuel_mode == 1) {
            //console.log(donnees.fnman_disp, fuelneed)
            if (donnees.fnman_disp || (Date.now() / 1000 - fnman_disp_temporary_tstamp <= 2) ) {  // en fonction de l'option choisie, on l'affiche tout le temps ou bien juste pendant 2 secondes
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

        fuelneed1 = donnees.fn;
        fuelneed5 = donnees.fn5;
        //document.getElementById("fuelneed_h").innerHTML = "F2add " + text_fuelneed;
        set_inner_html("fuelneed_h", "F2add " + text_fuelneed);

        // Si on peut pitter sans risquer de devoir faire un pit de plus on met le fond en mauve
        // Estimation d'abord du nombre de pits restants
        if (fuelneed_p > 0 && donnees.tcap > 0) {
            p = ((fuelneed_p - 1*conso) / donnees.tcap) + 1;
            if (p < 0)
                p = 0;
            p = parseFloat(p).toFixed(2);
        } else {
            p = 0;
        }
        nbpits = p;  // on enregistre la valeur pour pouvoir l'utiliser ensuite pour le calcul du nblaps_pit_window et pour l'affichage du "nbpits"
        if (advanced["disp_" + "fuelneed" + disp_sel]) {
            if (fn_dont_change_colors == 0) {
                if (donnees.estim_status == 0) {
                    //document.getElementById("fuelneed_bg0").style.backgroundColor = "#999999";
                    change_bg("fuelneed_bg0", "#999999", advanced["bg_" + "fuelneed" + "_" + advanced["display_selected"]]);
                    //document.getElementById("fuelneed_bg1").style.backgroundColor = "#999999"
                    change_bg("fuelneed_bg1", "#0099ff", advanced["bg_" + "fuelneed" + "_" + advanced["display_selected"]]);
                } else {
                    //document.getElementById("fuelneed_bg1").style.backgroundColor = "#0099ff";
                    change_bg("fuelneed_bg1", "#0099ff", advanced["bg_" + "fuelneed" + "_" + advanced["display_selected"]]);
                    if (Math.floor(p) > 0 && fuelneed < donnees.tcap * Math.floor(p) - donnees.f) {
                        //document.getElementById("fuelneed_bg0").style.backgroundColor = "#ff99ff"
                        change_bg("fuelneed_bg0", "#ff99ff", advanced["bg_" + "fuelneed" + "_" + advanced["display_selected"]]);
                    } else {
                        //document.getElementById("fuelneed_bg0").style.backgroundColor = "#ff9900"
                        change_bg("fuelneed_bg0", "#ff9900", advanced["bg_" + "fuelneed" + "_" + advanced["display_selected"]]);
                    }
                }
            }
        }
        if (fuelneed1 > 0 && donnees.tcap > 0) {
            p = ((fuelneed1 - 1*conso1) / donnees.tcap) + 1;
            if (p < 0)
                p = 0;
            p = parseFloat(p).toFixed(2);
        } else {
            p = 0;
        }
        if (advanced["disp_" + "fuelneed1" + disp_sel]) {
            if (donnees.estim_status == 0) {
                change_bg("fuelneed1_bg0", "#999999", advanced["bg_" + "fuelneed1" + "_" + advanced["display_selected"]]);
                change_bg("fuelneed1_bg1", "#0099ff", advanced["bg_" + "fuelneed1" + "_" + advanced["display_selected"]]);
            } else {
                change_bg("fuelneed1_bg1", "#0099ff", advanced["bg_" + "fuelneed1" + "_" + advanced["display_selected"]]);
                if (Math.floor(p) > 0 && fuelneed1 < donnees.tcap * Math.floor(p) - donnees.f) {
                    change_bg("fuelneed1_bg0", "#ff99ff", advanced["bg_" + "fuelneed1" + "_" + advanced["display_selected"]]);
                } else {
                    change_bg("fuelneed1_bg0", "#ff9900", advanced["bg_" + "fuelneed1" + "_" + advanced["display_selected"]]);
                }
            }
        }
        if (fuelneed5 > 0 && donnees.tcap > 0) {
            p = ((fuelneed5 - 1*conso5) / donnees.tcap) + 1;
            if (p < 0)
                p = 0;
            p = parseFloat(p).toFixed(2);
        } else {
            p = 0;
        }
        if (advanced["disp_" + "fuelneed5" + disp_sel]) {
            if (donnees.estim_status == 0) {
                change_bg("fuelneed5_bg0", "#999999", advanced["bg_" + "fuelneed5" + "_" + advanced["display_selected"]]);
                change_bg("fuelneed5_bg1", "#0099ff", advanced["bg_" + "fuelneed5" + "_" + advanced["display_selected"]]);
            } else {
                change_bg("fuelneed5_bg1", "#0099ff", advanced["bg_" + "fuelneed" + "_" + advanced["display_selected"]]);
                if (Math.floor(p) > 0 && fuelneed5 < donnees.tcap * Math.floor(p) - donnees.f) {
                    change_bg("fuelneed5_bg0", "#ff99ff", advanced["bg_" + "fuelneed5" + "_" + advanced["display_selected"]]);
                } else {
                    change_bg("fuelneed5_bg0", "#ff9900", advanced["bg_" + "fuelneed5" + "_" + advanced["display_selected"]]);
                }
            }
        }

        if (advanced["disp_" + "timeremain" + disp_sel]) {
            //console.log(donnees.estim_status, donnees.tr, donnees.laps_l);
            if (donnees.estim_status == 2 && donnees.tr >= 0 && donnees.laps_l != 1) {
                //document.getElementById("timeremain").style.color = "#333333";
                set_style_color("timeremain", "#333333");
            } else {
                //document.getElementById("timeremain").style.color = "#ffffff";
                set_style_color("timeremain", "#ffffff");
            }
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
        if (advanced["disp_" + "fuelneed" + disp_sel]) {
            if (fn_dont_change_colors == 0) {
                //set("fuelneed_bg1", 1024, 560 + Math.floor(fuelneed_bg1_pct * 96), 256, 96 - Math.floor(fuelneed_bg1_pct * 96), 0.075);
                set("fuelneed_bg1", advanced["x_" + "fuelneed" + disp_sel], advanced["y_" + "fuelneed" + disp_sel] + Math.floor(fuelneed_bg1_pct * advanced["h_" + "fuelneed" + disp_sel]), Math.floor(advanced["w_" + "fuelneed" + disp_sel]), advanced["h_" + "fuelneed" + disp_sel] - Math.floor(fuelneed_bg1_pct * advanced["h_" + "fuelneed" + disp_sel]), advanced["f_" + "fuelneed" + disp_sel] / dashboard_ref_w);

                if (donnees.estim_status == 0 || donnees.fuel_accurate != 1) {
                    //document.getElementById("fuelneed").style.color = "#666666";
                    set_style_color("fuelneed", "#666666");
                } else {
                    if (fuelneed_bg1_pct == 0) {
                        //document.getElementById("fuelneed").style.color = "#";
                        set_style_color("fuelneed", "#ffffff");
                    } else {
                        //document.getElementById("fuelneed").style.color = "#000000";
                        set_style_color("fuelneed", "#000000");
                    }
                }
            }
        }

        if (fuelneed1 >= 5*donnees.refuelspeed) {
            fuelneed1_bg1_pct = 1;
        } else if (fuelneed1 <= 0) {
            fuelneed1_bg1_pct = 0;
        } else {
            fuelneed1_bg1_pct = fuelneed1 / (5 * donnees.refuelspeed);
        }
        if (advanced["disp_" + "fuelneed1" + disp_sel]) {
            set("fuelneed1_bg1", advanced["x_" + "fuelneed1" + disp_sel], advanced["y_" + "fuelneed1" + disp_sel] + Math.floor(fuelneed1_bg1_pct * advanced["h_" + "fuelneed1" + disp_sel]), Math.floor(advanced["w_" + "fuelneed1" + disp_sel]), advanced["h_" + "fuelneed1" + disp_sel] - Math.floor(fuelneed1_bg1_pct * advanced["h_" + "fuelneed1" + disp_sel]), advanced["f_" + "fuelneed1" + disp_sel] / dashboard_ref_w);

            if (donnees.estim_status == 0 || donnees.fuel_accurate != 1) {
                //document.getElementById("fuelneed1").style.color = "#666666";
                set_style_color("fuelneed1", "#666666");
            } else {
                if (fuelneed1_bg1_pct == 0) {
                    //document.getElementById("fuelneed1").style.color = "#ffffff";
                    set_style_color("fuelneed1", "#ffffff");
                } else {
                    //document.getElementById("fuelneed1").style.color = "#000000";
                    set_style_color("fuelneed1", "#000000");
                }
            }
        }
        if (fuelneed5 >= 5*donnees.refuelspeed) {
            fuelneed5_bg1_pct = 1;
        } else if (fuelneed5 <= 0) {
            fuelneed5_bg1_pct = 0;
        } else {
            fuelneed5_bg1_pct = fuelneed5 / (5 * donnees.refuelspeed);
        }
        if (advanced["disp_" + "fuelneed5" + disp_sel]) {
            set("fuelneed5_bg1", advanced["x_" + "fuelneed5" + disp_sel], advanced["y_" + "fuelneed5" + disp_sel] + Math.floor(fuelneed5_bg1_pct * advanced["h_" + "fuelneed5" + disp_sel]), Math.floor(advanced["w_" + "fuelneed5" + disp_sel]), advanced["h_" + "fuelneed5" + disp_sel] - Math.floor(fuelneed5_bg1_pct * advanced["h_" + "fuelneed5" + disp_sel]), advanced["f_" + "fuelneed5" + disp_sel] / dashboard_ref_w);

            if (donnees.estim_status == 0 || donnees.fuel_accurate != 1) {
                //document.getElementById("fuelneed5").style.color = "#666666";
                set_style_color("fuelneed5", "#666666");
            } else {
                if (fuelneed5_bg1_pct == 0) {
                    //document.getElementById("fuelneed5").style.color = "#ffffff";
                    set_style_color("fuelneed5", "#ffffff");
                } else {
                    //document.getElementById("fuelneed5").style.color = "#000000";
                    set_style_color("fuelneed5", "#000000");
                }
            }
        }

        if (conso > 0) {
            // On rajoute les tours de marge
            //fuelneed += fuel_spare_nblaps * conso;

            if (advanced["disp_" + "conso" + disp_sel]) {
                if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                    //document.getElementById("conso").innerHTML = (fuelfactor * coef_fuel * conso).toFixed(3) + " " + "<span style='font-size:0.75em;  vertical-align: middle; line-height: 1em; font-weight:normal'>" + text_conso + "</span>";
                    set_inner_html("conso", (fuelfactor * coef_fuel * conso).toFixed(3) + " " + "<span style='font-size:0.75em;  vertical-align: middle; line-height: 1em; font-weight:normal'>" + text_conso + "</span>");
                } else {
                    //document.getElementById("conso").innerHTML = "buy pro";
                    set_inner_html("conso", "buy pro");
                }
                if (donnees.fuel_accurate != 1) {
                    //document.getElementById("conso").style.color = "#bbbbbb";
                    set_style_color("conso", "#bbbbbb");
                } else {
                    //document.getElementById("conso").style.color = "#ffffff";
                    set_style_color("conso", "#ffffff");
                }
            }

            if (advanced["disp_" + "estlaps" + disp_sel]) {
                if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                    //document.getElementById("estlaps").innerHTML = donnees.estlaps.toFixed(1);
                    tmp_estlaps = donnees.estlaps;
                    if (tmp_estlaps == 0 && conso > 0) { // utile pour afficher le estlaps alors que la course n'est pas commencée
                        tmp_estlaps = donnees.f / conso;
                    }
                    set_inner_html("estlaps", tmp_estlaps.toFixed(estlaps_decimal));
                } else {
                    //document.getElementById("estlaps").innerHTML = "buy pro"
                    set_inner_html("estlaps", "buy pro");
                }
                if (donnees.fuel_accurate != 1) {
                    //document.getElementById("estlaps").style.color = "#555555";
                    set_style_color("estlaps", "#555555");
                } else {
                    //document.getElementById("estlaps").style.color = "#000000";
                    set_style_color("estlaps", "#000000");
                }

                estlaps_bg1_pct = donnees.estlaps_bg1_pct;
                set("estlaps_bg1", advanced["x_" + "estlaps" + disp_sel], advanced["y_" + "estlaps" + disp_sel], Math.floor(advanced["w_" + "estlaps" + disp_sel] * estlaps_bg1_pct), advanced["h_" + "estlaps" + disp_sel], advanced["f_" + "estlaps" + disp_sel] / dashboard_ref_w);
            }

            //if (donnees.f / conso < 2) {
            if (donnees.f_alert == 1) {
                change_bg("estlaps_bg0", "#ee0000", advanced["bg_" + "estlaps" + "_" + advanced["display_selected"]]);
                change_bg("tank", "#cc0000", advanced["bg_" + "tank" + "_" + advanced["display_selected"]]);
                change_bg("conso", "#880000", advanced["bg_" + "conso" + "_" + advanced["display_selected"]]);
            } else {
                if (advanced["disp_" + "estlaps" + disp_sel]) {
                    change_bg("estlaps_bg0", "#00aa00", advanced["bg_" + "estlaps" + "_" + advanced["display_selected"]]);
                }
                if (advanced["disp_" + "tank" + disp_sel]) {
                    change_bg("tank", "#008800", advanced["bg_" + "tank" + "_" + advanced["display_selected"]]);
                }
                if (advanced["disp_" + "conso" + disp_sel]) {
                    change_bg("conso", "#005500", advanced["bg_" + "conso" + "_" + advanced["display_selected"]]);
                }
            }
            if (advanced["disp_" + "nbpits" + disp_sel]) {
                if (p > 1) {
                    //document.getElementById("nbpits").innerHTML = p + "";
                    set_inner_html("nbpits", nbpits + "");
                } else {
                    //document.getElementById("nbpits").innerHTML = p + "";
                    set_inner_html("nbpits", nbpits + "");
                }
                if (donnees.fuel_accurate != 1) {
                    //document.getElementById("nbpits").style.color = "#666666";
                    set_style_color("nbpits", "#666666");
                } else {
                    //document.getElementById("nbpits").style.color = "#ffbb00";
                    set_style_color("nbpits", "#ffbb00");
                }
            }
        } else {
            if (advanced["disp_" + "conso" + disp_sel]) {
                if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                    //document.getElementById("conso").innerHTML = "-- " + "<span style='font-size:0.75em; vertical-align: middle; line-height: 1em; font-weight:normal'>" + text_conso + "</span>";
                    set_inner_html("conso", "-- " + "<span style='font-size:0.75em; vertical-align: middle; line-height: 1em; font-weight:normal'>" + text_conso + "</span>");
                } else {
                    //document.getElementById("conso").innerHTML = "buy pro";
                    set_inner_html("conso", "buy pro");
                }
            }
            if (advanced["disp_" + "estlaps" + disp_sel]) {
                //document.getElementById("estlaps").innerHTML = "--";
                set_inner_html("estlaps", "--");
            }
            if (advanced["disp_" + "nbpits" + disp_sel]) {
                //document.getElementById("nbpits").innerHTML = "--";
                set_inner_html("nbpits", "--");
            }
        }

        if (advanced["disp_" + "lapsremain" + disp_sel]) {
            if (donnees.lr != undefined) {
                if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                    //document.getElementById("lapsremain").innerHTML = reformat_lapsremain(donnees.lr);
                    set_inner_html("lapsremain", reformat_lapsremain(donnees.lr));
                } else {
                    //document.getElementById("lapsremain").innerHTML = "buy pro";
                    set_inner_html("lapsremain", "buy pro");
                }
                /*if (donnees.fuel_accurate != 1) {
                    document.getElementById("lapsremain").style.color = "#666666";
                } else {
                    document.getElementById("lapsremain").style.color = "#ff9900";
                }*/
            }
            if (donnees.lapsremain_bg1_pct != undefined) {
                lapsremain_bg1_pct = donnees.lapsremain_bg1_pct;
                set("lapsremain_bg1", advanced["x_" + "lapsremain" + disp_sel], advanced["y_" + "lapsremain" + disp_sel], Math.floor(advanced["w_" + "lapsremain" + disp_sel] * lapsremain_bg1_pct), advanced["h_" + "lapsremain" + disp_sel], advanced["f_" + "lapsremain" + disp_sel] / dashboard_ref_w);
            }
            //donnees.gap_pct_lastlap = 0.001
            if (donnees.gap_pct_lastlap != undefined && donnees.lead_lap != undefined) {
                gap_pct_lastlap = donnees.gap_pct_lastlap;
                //gap_pct_lastlap = 0.0001
                tmp_x = Math.floor(advanced["w_" + "lapsremain" + disp_sel] * gap_pct_lastlap);
                // On évite de sortir du cadre sinon la gold barre devient invisible
                if (tmp_x > Math.floor(advanced["w_" + "lapsremain" + disp_sel] - 2)) {
                    tmp_x = Math.floor(advanced["w_" + "lapsremain" + disp_sel] - 2)
                }
                if (tmp_x < 0) {
                    tmp_x = 0;
                }
                //tmp_x = 128
                //console.log(tmp_x)
                set("lapsremain_bg2", advanced["x_" + "lapsremain" + disp_sel] + tmp_x, advanced["y_" + "lapsremain" + disp_sel], 1, advanced["h_" + "lapsremain" + disp_sel], advanced["f_" + "lapsremain" + disp_sel] / dashboard_ref_w);
                //if (gap_pct_lastlap == 0) {
                    //document.getElementById("lapsremain_bg2").style.width = 0 + "px";
                //} else {
                    document.getElementById("lapsremain_bg2").style.width = 2 + "px";
                //}
                // Si on doit finir dans le même tour que le leader alors on n'affiche la gold line d'une autre couleur
                if (donnees.lead_lap == 1) {
                    //document.getElementById("lapsremain_bg2").style.backgroundColor = "#0088ff";
                    set_style_bg("lapsremain_bg2", "#0088ff");
                } else {
                    //document.getElementById("lapsremain_bg2").style.backgroundColor = "#ffd700";
                    set_style_bg("lapsremain_bg2", "#ffd700");
                }
            }
        }

        if (advanced["disp_" + "fuelneed" + disp_sel]) {
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
        }
        if (advanced["disp_" + "fuelneed1" + disp_sel]) {
            if (conso1 > 0.01)
                if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                    if (fuelfactor * coef_fuel * fuelneed1 > 9999) {
                        //document.getElementById("fuelneed1").innerHTML = "9999";
                        set_inner_html("fuelneed1", "9999");
                    } else if (fuelfactor * coef_fuel * fuelneed1 > 999) {
                        //document.getElementById("fuelneed1").innerHTML = (fuelfactor * coef_fuel * fuelneed1).toFixed(0);
                        set_inner_html("fuelneed1", (fuelfactor * coef_fuel * fuelneed1).toFixed(0));
                    } else {
                        //document.getElementById("fuelneed1").innerHTML = (fuelfactor * coef_fuel * fuelneed1).toFixed(1);
                        set_inner_html("fuelneed1", (fuelfactor * coef_fuel * fuelneed1).toFixed(1));
                    }
                } else {
                    //document.getElementById("fuelneed1").innerHTML = "buy pro";
                    set_inner_html("fuelneed1", "buy pro");
                }
            else {
                //document.getElementById("fuelneed1").innerHTML = "--";
                set_inner_html("fuelneed1", "--");
            }
        }
        if (advanced["disp_" + "fuelneed5" + disp_sel]) {
            if (conso5 > 0.01)
                if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                    if (fuelfactor * coef_fuel * fuelneed5 > 9999) {
                        //document.getElementById("fuelneed5").innerHTML = "9999";
                        set_inner_html("fuelneed5", "9999");
                    } else if (fuelfactor * coef_fuel * fuelneed5 > 999) {
                        //document.getElementById("fuelneed5").innerHTML = (fuelfactor * coef_fuel * fuelneed5).toFixed(0);
                        set_inner_html("fuelneed5", (fuelfactor * coef_fuel * fuelneed5).toFixed(0));
                    } else {
                        //document.getElementById("fuelneed5").innerHTML = (fuelfactor * coef_fuel * fuelneed5).toFixed(1);
                        set_inner_html("fuelneed5", (fuelfactor * coef_fuel * fuelneed5).toFixed(1));
                    }
                } else {
                    //document.getElementById("fuelneed5").innerHTML = "buy pro"
                    set_inner_html("fuelneed5", "buy pro");
                }
            else {
                //document.getElementById("fuelneed5").innerHTML = "--";
                set_inner_html("fuelneed5", "--");
            }
        }
        if (advanced["disp_" + "refuel_min" + disp_sel]) {
            if (conso > 0.01)
                if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                    if (refuel_min > 0) {
                        //document.getElementById("refuel_min").innerHTML = (fuelfactor * coef_fuel * refuel_min).toFixed(1);
                        set_inner_html("refuel_min", (fuelfactor * coef_fuel * refuel_min).toFixed(1));
                    } else {
                        //document.getElementById("refuel_min").innerHTML = "--";
                        set_inner_html("refuel_min", "--");
                    }
                } else {
                    //document.getElementById("refuel_min").innerHTML = "buy pro";
                    set_inner_html("refuel_min", "buy pro");
                }
            else {
                //document.getElementById("refuel_min").innerHTML = "--";
                set_inner_html("refuel_min", "--");
            }
        }
        if (advanced["disp_" + "refuel_avg" + disp_sel]) {
            if (conso > 0.01)
                if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                    if (refuel_avg > 0) {
                        //document.getElementById("refuel_avg").innerHTML = (fuelfactor * coef_fuel * refuel_avg).toFixed(1);
                        set_inner_html("refuel_avg", (fuelfactor * coef_fuel * refuel_avg).toFixed(1));
                    } else {
                        //document.getElementById("refuel_avg").innerHTML = "--";
                        set_inner_html("refuel_avg", "--");
                    }
                } else {
                    //document.getElementById("refuel_avg").innerHTML = "buy pro";
                    set_inner_html("refuel_avg", "buy pro");
                }
            else {
                //document.getElementById("refuel_avg").innerHTML = "--";
                set_inner_html("refuel_avg", "--");
            }
        }
        if (advanced["disp_" + "refuel_avg_now" + disp_sel]) {
            if (conso > 0.01)
                if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                    if (refuel_avg_now > 0) {
                        //document.getElementById("refuel_avg_now").innerHTML = (fuelfactor * coef_fuel * refuel_avg_now).toFixed(1);
                        set_inner_html("refuel_avg_now", (fuelfactor * coef_fuel * refuel_avg_now).toFixed(1));
                    } else {
                        //document.getElementById("refuel_avg_now").innerHTML = "--";
                        set_inner_html("refuel_avg_now", "--");
                    }
                } else {
                    //document.getElementById("refuel_avg_now").innerHTML = "buy pro";
                    set_inner_html("refuel_avg_now", "buy pro");
                }
            else {
                //document.getElementById("refuel_avg_now").innerHTML = "--";
                set_inner_html("refuel_avg_now", "--");
            }
        }

        // On s'assure pour la suite que les valeurs sont bien des float pour éviter les erreurs
        donnees.oil = set_float(donnees.oil);
        donnees.w = set_float(donnees.w);

        if (advanced["disp_" + "oil" + disp_sel] || advanced["disp_" + "water" + disp_sel]) {
            if (donnees.oil != undefined && donnees.w != undefined) {
                if ((temperature_mode != 2) && ((donnees.u == 1 && temperature_mode == 0) || (temperature_mode == 1))) {  // systeme metric ou forcé en Celsius dans les options
                    //document.getElementById("oil").innerHTML = "O " + donnees.oil.toFixed(1) + "&degC";
                    set_inner_html("oil", "O " + donnees.oil.toFixed(1) + "&degC");
                    //document.getElementById("water").innerHTML = "W " + donnees.w.toFixed(1) + "&degC";
                    set_inner_html("water", "W " + donnees.w.toFixed(1) + "&degC");
                } else {
                    //document.getElementById("oil").innerHTML = "O " + (donnees.oil * 1.8 + 32).toFixed(1) + "&degF";
                    set_inner_html("oil", "O " + (donnees.oil * 1.8 + 32).toFixed(1) + "&degF");
                    //document.getElementById("water").innerHTML = "W " + (donnees.w * 1.8 + 32).toFixed(1) + "&degF";
                    set_inner_html("water", "W " + (donnees.w * 1.8 + 32).toFixed(1) + "&degF");
                }
            }
        }

        if (donnees.styp == "Race") {
            if (advanced["disp_" + "pre_pos" + disp_sel] || advanced["disp_" + "me_pos" + disp_sel] || advanced["disp_" + "post_pos" + disp_sel] || advanced["disp_" + "pre_cpos" + disp_sel] || advanced["disp_" + "me_cpos" + disp_sel] || advanced["disp_" + "post_cpos" + disp_sel]) {
                if (donnees["pre_pos" + _f3_pre] != undefined && donnees["pre_rc" + _f3_pre] != undefined) {
                    //document.getElementById("pre_pos").innerHTML = donnees["pre_pos" + _f3_pre] + ".";
                    set_inner_html("pre_pos", donnees["pre_pos" + _f3_pre] + ".");
                } else {
                    //document.getElementById("pre_pos").innerHTML = "";
                    set_inner_html("pre_pos", "");
                }
                if (donnees.me_pos != undefined) {
                    //document.getElementById("me_pos").innerHTML = donnees.me_pos + ".";
                    set_inner_html("me_pos", donnees.me_pos + ".");
                }
                if (donnees["post_pos" + _f3_post] != undefined && donnees["post_rc" + _f3_post] != undefined) {
                    //document.getElementById("post_pos").innerHTML = donnees["post_pos" + _f3_post] + ".";
                    set_inner_html("post_pos", donnees["post_pos" + _f3_post] + ".");
                } else {
                    //document.getElementById("post_pos").innerHTML = "";
                    set_inner_html("post_pos", "");
                }
                if (donnees["pre_cpos" + _f3_pre] != undefined && donnees["pre_rc" + _f3_pre] != undefined) {
                    //document.getElementById("pre_cpos").innerHTML = donnees["pre_cpos" + _f3_pre] + ".";
                    set_inner_html("pre_cpos", donnees["pre_cpos" + _f3_pre] + ".");
                } else {
                    //document.getElementById("pre_cpos").innerHTML = "";
                    set_inner_html("pre_cpos", "");
                }
                if (donnees.me_cpos != undefined) {
                    //document.getElementById("me_cpos").innerHTML = donnees.me_cpos + ".";
                    set_inner_html("me_cpos", donnees.me_cpos + ".");
                }
                if (donnees["post_cpos" + _f3_post] != undefined && donnees["post_rc" + _f3_post] != undefined) {
                    //document.getElementById("post_cpos").innerHTML = donnees["post_cpos" + _f3_post] + ".";
                    set_inner_html("post_cpos", donnees["post_cpos" + _f3_post] + ".");
                } else {
                    //document.getElementById("post_cpos").innerHTML = "";
                    set_inner_html("post_cpos", "");
                }
            }

            if (advanced["disp_" + "pre_gain" + disp_sel] || advanced["disp_" + "me_gain" + disp_sel] || advanced["disp_" + "post_gain" + disp_sel] || advanced["disp_" + "pre_cgain" + disp_sel] || advanced["disp_" + "me_cgain" + disp_sel] || advanced["disp_" + "post_cgain" + disp_sel]) {
                if (donnees["pre_gain" + _f3_pre] != undefined && donnees["pre_rc" + _f3_pre] != undefined) {
                    //document.getElementById("pre_gain").innerHTML = reformat_gain(donnees["pre_gain" + _f3_pre]);
                    set_inner_html("pre_gain", reformat_gain(donnees["pre_gain" + _f3_pre]));
                } else {
                    //document.getElementById("pre_gain").innerHTML = "";
                    set_inner_html("pre_gain", "");
                }
                if (donnees.me_gain != undefined) {
                    //document.getElementById("me_gain").innerHTML = reformat_gain(donnees.me_gain);
                    set_inner_html("me_gain", reformat_gain(donnees.me_gain));
                }
                if (donnees["post_gain" + _f3_post] != undefined && donnees["post_rc" + _f3_post] != undefined) {
                    //document.getElementById("post_gain").innerHTML = reformat_gain(donnees["post_gain" + _f3_post]);
                    set_inner_html("post_gain", reformat_gain(donnees["post_gain" + _f3_post]));
                } else {
                    //document.getElementById("post_gain").innerHTML = "";
                    set_inner_html("post_gain", "");
                }
                if (donnees["pre_cgain" + _f3_pre] != undefined && donnees["pre_rc" + _f3_pre] != undefined) {
                    //document.getElementById("pre_cgain").innerHTML = reformat_gain(donnees["pre_cgain" + _f3_pre]);
                    set_inner_html("pre_cgain", reformat_gain(donnees["pre_cgain" + _f3_pre]));
                } else {
                    //document.getElementById("pre_cgain").innerHTML = "";
                    set_inner_html("pre_cgain", "");
                }
                if (donnees.me_cgain != undefined) {
                    //document.getElementById("me_cgain").innerHTML = reformat_gain(donnees.me_cgain);
                    set_inner_html("me_cgain", reformat_gain(donnees.me_cgain));
                }
                if (donnees["post_cgain" + _f3_post] != undefined && donnees["post_rc" + _f3_post] != undefined) {
                    //document.getElementById("post_cgain").innerHTML = reformat_gain(donnees["post_cgain" + _f3_post]);
                    set_inner_html("post_cgain", reformat_gain(donnees["post_cgain" + _f3_post]));
                } else {
                    //document.getElementById("post_cgain").innerHTML = "";
                    set_inner_html("post_cgain", "");
                }
            }
        } else {
            if (advanced["disp_" + "pre_pos" + disp_sel] || advanced["disp_" + "me_pos" + disp_sel] || advanced["disp_" + "post_pos" + disp_sel] || advanced["disp_" + "pre_cpos" + disp_sel] || advanced["disp_" + "me_cpos" + disp_sel] || advanced["disp_" + "post_cpos" + disp_sel]) {
                // En dehors des courses, on affiche le classement en fonction du meilleur temps
                if (donnees["pre_pos" + _f3_pre] != undefined && donnees["pre_rc" + _f3_pre] != undefined) {
                    //document.getElementById("pre_pos").innerHTML = donnees["pre_posb" + _f3_pre] + ".";
                    set_inner_html("pre_pos", donnees["pre_posb" + _f3_pre] + ".");
                } else {
                    //document.getElementById("pre_pos").innerHTML = "";
                    set_inner_html("pre_pos", "");
                }
                if (donnees.me_pos != undefined) {
                    //document.getElementById("me_pos").innerHTML = donnees.me_posb + ".";
                    set_inner_html("me_pos", donnees.me_posb + ".");
                }
                if (donnees["post_pos" + _f3_post] != undefined && donnees["post_rc" + _f3_post] != undefined) {
                    //document.getElementById("post_pos").innerHTML = donnees["post_posb" + _f3_post] + ".";
                    set_inner_html("post_pos", donnees["post_posb" + _f3_post] + ".");
                } else {
                    //document.getElementById("post_pos").innerHTML = "";
                    set_inner_html("post_pos", "");
                }
                if (donnees["pre_cpos" + _f3_pre] != undefined && donnees["pre_rc" + _f3_pre] != undefined) {
                    //document.getElementById("pre_cpos").innerHTML = donnees["pre_cposb" + _f3_pre] + ".";
                    set_inner_html("pre_cpos", donnees["pre_cposb" + _f3_pre] + ".");
                } else {
                    //document.getElementById("pre_cpos").innerHTML = "";
                    set_inner_html("pre_cpos", "");
                }
                if (donnees.me_cpos != undefined) {
                    //document.getElementById("me_cpos").innerHTML = donnees.me_cposb + ".";
                    set_inner_html("me_cpos", donnees.me_cposb + ".");
                }
                if (donnees["post_cpos" + _f3_post] != undefined && donnees["post_rc" + _f3_post] != undefined) {
                    //document.getElementById("post_cpos").innerHTML = donnees["post_cposb" + _f3_post] + ".";
                    set_inner_html("post_cpos", donnees["post_cposb" + _f3_post] + ".");
                } else {
                    //document.getElementById("post_cpos").innerHTML = "";
                    set_inner_html("post_cpos", "");
                }
            }

            if (advanced["disp_" + "pre_gain" + disp_sel] || advanced["disp_" + "me_gain" + disp_sel] || advanced["disp_" + "post_gain" + disp_sel] || advanced["disp_" + "pre_cgain" + disp_sel] || advanced["disp_" + "me_cgain" + disp_sel] || advanced["disp_" + "post_cgain" + disp_sel]) {
                // En dehors des courses, on n'affiche pas le gain des positions
                //document.getElementById("pre_gain").innerHTML = "&nbsp";
                set_inner_html("pre_gain", "&nbsp;");
                //document.getElementById("me_gain").innerHTML = "&nbsp";
                set_inner_html("me_gain", "&nbsp;");
                //document.getElementById("post_gain").innerHTML = "&nbsp";
                set_inner_html("post_gain", "&nbsp;");
                //document.getElementById("pre_cgain").innerHTML = "&nbsp";
                set_inner_html("pre_cgain", "&nbsp;");
                //document.getElementById("me_cgain").innerHTML = "&nbsp";
                set_inner_html("me_cgain", "&nbsp;");
                //document.getElementById("post_cgain").innerHTML = "&nbsp";
                set_inner_html("post_cgain", "&nbsp;");
            }
        }

        if (advanced["disp_" + "pre_best" + disp_sel] || advanced["disp_" + "pre_last" + disp_sel] || advanced["disp_" + "me_best" + disp_sel] || advanced["disp_" + "me_last" + disp_sel] || advanced["disp_" + "post_best" + disp_sel] || advanced["disp_" + "post_last" + disp_sel]) {
            if (donnees["pre_b" + _f3_pre] != undefined && donnees["pre_rc" + _f3_pre] != undefined) {
                //document.getElementById("pre_best").innerHTML = reformat_laptime(donnees["pre_b" + _f3_pre]);
                set_inner_html("pre_best", reformat_laptime(donnees["pre_b" + _f3_pre]));
            } else {
                //document.getElementById("pre_best").innerHTML = "";
                set_inner_html("pre_best", "");
            }
            if (donnees["pre_l" + _f3_pre] != undefined && donnees["pre_rc" + _f3_pre] != undefined) {
                //document.getElementById("pre_last").innerHTML = reformat_laptime(donnees["pre_l" + _f3_pre]);
                set_inner_html("pre_last", reformat_laptime(donnees["pre_l" + _f3_pre]));
            } else {
                //document.getElementById("pre_last").innerHTML = "";
                set_inner_html("pre_last", "");
            }
            if (donnees.me_b != undefined) {
                //document.getElementById("me_best").innerHTML = reformat_laptime(donnees.me_b);
                set_inner_html("me_best", reformat_laptime(donnees.me_b));
            }
            if (donnees.me_l != undefined) {
                //document.getElementById("me_last").innerHTML = reformat_laptime(donnees.me_l);
                set_inner_html("me_last", reformat_laptime(donnees.me_l));
            }
            if (donnees["post_b" + _f3_post] != undefined && donnees["post_rc" + _f3_post] != undefined) {
                //document.getElementById("post_best").innerHTML = reformat_laptime(donnees["post_b" + _f3_post]);
                set_inner_html("post_best", reformat_laptime(donnees["post_b" + _f3_post]));
            } else {
                //document.getElementById("post_best").innerHTML = "";
                set_inner_html("post_best", "");
            }
            if (donnees["post_l" + _f3_post] != undefined && donnees["post_rc" + _f3_post] != undefined) {
                //document.getElementById("post_last").innerHTML = reformat_laptime(donnees["post_l" + _f3_post]);
                set_inner_html("post_last", reformat_laptime(donnees["post_l" + _f3_post]));
            } else {
                //document.getElementById("post_last").innerHTML = "";
                set_inner_html("post_last", "");
            }
        }

        if (advanced["disp_" + "pre_stint" + disp_sel] || advanced["disp_" + "me_stint" + disp_sel] || advanced["disp_" + "post_stint" + disp_sel]) {
            if (donnees["pre_sti" + _f3_pre] != undefined && donnees["pre_rc" + _f3_pre] != undefined) {
                //document.getElementById("pre_stint").innerHTML = donnees["pre_sti" + _f3_pre];
                set_inner_html("pre_stint", donnees["pre_sti" + _f3_pre]);
            } else {
                //document.getElementById("pre_stint").innerHTML = "";
                set_inner_html("pre_stint", "");
            }
            if (donnees.me_sti != undefined) {
                //document.getElementById("me_stint").innerHTML = donnees.me_sti;
                set_inner_html("me_stint", donnees.me_sti);
            }
            if (donnees["post_sti" + _f3_post] != undefined && donnees["post_rc" + _f3_post] != undefined) {
                //document.getElementById("post_stint").innerHTML = donnees["post_sti" + _f3_post];
                set_inner_html("post_stint", donnees["post_sti" + _f3_post]);
            } else {
                //document.getElementById("post_stint").innerHTML = "";
                set_inner_html("post_stint", "");
            }
        }

        if (donnees.me_lc != undefined && advanced["disp_" + "me_lc" + disp_sel]) {
            //document.getElementById("me_lc").innerHTML = donnees.me_lc;
            set_inner_html("me_lc", donnees.me_lc);
        }

        if (donnees["pre_name" + _f3_pre] != undefined && advanced["disp_" + "pre_name" + disp_sel] && donnees["pre_rc" + _f3_pre] != undefined) {
            //document.getElementById("pre_name").innerHTML = "&nbsp" + _f3_pre_tag + donnees["pre_name" + _f3_pre];
            set_inner_html("pre_name", "&nbsp;" + _f3_pre_tag + donnees["pre_name" + _f3_pre]);
        } else {
            //document.getElementById("pre_name").innerHTML = "&nbsp";
            set_inner_html("pre_name", "&nbsp;");
        }
        if (donnees["post_name" + _f3_post] != undefined && advanced["disp_" + "post_name" + disp_sel] && donnees["post_rc" + _f3_post] != undefined) {
            //document.getElementById("post_name").innerHTML = "&nbsp" + _f3_post_tag + donnees["post_name" + _f3_post];
            set_inner_html("post_name", "&nbsp;" + _f3_post_tag + donnees["post_name" + _f3_post]);
        } else {
            //document.getElementById("post_name").innerHTML = "&nbsp";
            set_inner_html("post_name", "&nbsp;");
        }

        if ( !((donnees["pre_eq_me" + _f3_pre] == 1 || cache_pre)) && donnees["pre_liccolor" + _f3_pre] != undefined && donnees["pre_licsub" + _f3_pre] != undefined && advanced["disp_" + "pre_lic" + disp_sel] && donnees["pre_rc" + _f3_pre] != undefined) {
            set_inner_html("pre_lic", reformat_lic_dashboard("pre_lic", donnees["pre_liccolor" + _f3_pre], donnees["pre_licsub" + _f3_pre]));
        } else {
            set_inner_html("pre_lic", "");
            set_style_bg("pre_lic", "#000000");
        }
        if ( !((donnees["post_eq_me" + _f3_post] == 1 || cache_post)) && donnees["post_liccolor" + _f3_post] != undefined && donnees["post_licsub" + _f3_post] != undefined && advanced["disp_" + "post_lic" + disp_sel] && donnees["post_rc" + _f3_post] != undefined) {
            set_inner_html("post_lic", reformat_lic_dashboard("post_lic", donnees["post_liccolor" + _f3_post], donnees["post_licsub" + _f3_post]));
        } else {
            set_inner_html("post_lic", "");
            set_style_bg("post_lic", "#000000");
        }

        if (donnees["pre_ir" + _f3_pre] != undefined && advanced["disp_" + "pre_ir" + disp_sel] && donnees["pre_rc" + _f3_pre] != undefined) {
            set_inner_html("pre_ir", donnees["pre_ir" + _f3_pre]);
        } else {
            set_inner_html("pre_ir", "");
        }
        if (donnees["post_ir" + _f3_post] != undefined && advanced["disp_" + "post_ir" + disp_sel] && donnees["post_rc" + _f3_post] != undefined) {
            set_inner_html("post_ir", donnees["post_ir" + _f3_post]);
        } else {
            set_inner_html("post_ir", "");
        }

        if (advanced["pitbox_bar_on"]) {  // on traite seulement si pitbar activée
            if (donnees.isontrack != 1 || donnees.cts > 2 || advanced["pitbox_bar_on"] == 0) {  // Si on est pas dans les pits on n'affiche pas l'indicateur de pits
                document.getElementById("pitbar8").style.display = "none";
                document.getElementById("pitbar16").style.display = "none";
                document.getElementById("pitbar32").style.display = "none";
                document.getElementById("pitbar64").style.display = "none";
            } else {
                document.getElementById("pitbar8").style.display = "block";
                document.getElementById("pitbar16").style.display = "block";
                document.getElementById("pitbar32").style.display = "block";
                document.getElementById("pitbar64").style.display = "block";
            }
        }

        if (donnees.f_sf != undefined && donnees.lr != undefined && donnees.lr != 0 && advanced["disp_" + "target_conso" + disp_sel]) {
            //document.getElementById("target_conso").innerHTML = (fuelfactor * coef_fuel * donnees.f_sf / (Math.floor(donnees.lr) + 1)).toFixed(3);
            set_inner_html("target_conso", (fuelfactor * coef_fuel * donnees.f_sf / (Math.floor(donnees.lr) + 1)).toFixed(3));
        }

        if (advanced["disp_" + "est_conso" + disp_sel]) {
            set_inner_html("est_conso", (fuelfactor * coef_fuel * donnees.est_co).toFixed(3));
        }

        if (donnees.f_sf != undefined && donnees.lr != undefined && advanced["disp_" + "fuel_end" + disp_sel]) {
            //document.getElementById("fuel_end").innerHTML = (fuelfactor * coef_fuel * (donnees.f_sf - conso * (Math.floor(donnees.lr) + 1))).toFixed(1);
            set_inner_html("fuel_end", (fuelfactor * coef_fuel * (donnees.f_sf - conso * (Math.floor(donnees.lr) + 1))).toFixed(1));
        }

        if (advanced["disp_" + "nblaps_per_tank" + disp_sel]) {
            if (conso > 0) {
                set_inner_html("nblaps_per_tank", (donnees.tcap / conso).toFixed(1));
            } else {
                set_inner_html("nblaps_per_tank", "--");
            }
        }

        if (advanced["disp_" + "nblaps_before_pit_window" + disp_sel]) {
            tmp_nbpits = Math.floor(nbpits);
            if (conso > 0 && donnees.f != undefined && donnees.tcap != undefined && tmp_nbpits > 0) {
                tmp_nblaps_before_pit_window = (fuelneed - donnees.tcap * tmp_nbpits + donnees.f) / conso;
                set_inner_html("nblaps_before_pit_window", (tmp_nblaps_before_pit_window).toFixed(1));
            } else {
                set_inner_html("nblaps_before_pit_window", "--");
            }
        }

        if (advanced["disp_" + "nblaps_to_equalize_stints" + disp_sel]) {
            if (conso > 0 && donnees.lr != undefined && donnees.f != undefined && donnees.tcap != undefined && donnees.me_sti != undefined && donnees.lr != undefined) {

                // REM : si on doit changer la méthode de calcul du tmp_nblaps ici, il faut le faire aussi dans le calcul.py

                tmp_nbpits = Math.floor(nbpits);

                tmp_nblaps_before_pit_window = (fuelneed - donnees.tcap * tmp_nbpits + donnees.f) / conso;
                if (tmp_nbpits == 0) {
                    // on compte au moins 1 pit restant si jamais on veut quand même pitter pour juste changer les pneus
                    tmp_nbpits = 1;
                    tmp_nblaps_before_pit_window = 0;
                }

                // Nombre de tours par stint (on arrondi à l'entier supérieur en mettant +0.4 au cas où on aurait N.05 tours par stint)
                //   REM : on enlève les tours sous drapeau jaune car on n'a pas usé les pneus à ce moment la
                tmp_nblaps_per_stint = Math.round(0.4 + (donnees.lr + donnees.me_sti - donnees.nblaps_under_yellow_since_pit)/(tmp_nbpits + 1));

                tmp_nblaps = donnees.lr % tmp_nblaps_per_stint;
                tmp_estlaps = donnees.estlaps;

                if ((tmp_nblaps_before_pit_window > tmp_nblaps) || (tmp_nblaps > tmp_estlaps)) {
                    // Si la fenêtre des pits est après, on va repousser le pit pour éviter de faire un pit de plus
                    if (tmp_nblaps_before_pit_window > tmp_nblaps) {
                        if (tmp_nblaps_before_pit_window <= tmp_estlaps) {
                            tmp_nblaps = tmp_nblaps_before_pit_window;
                        } else {
                            tmp_nblaps = tmp_estlaps;  // Si on ne peut pas faire le nombre de tour recommandé parce qu'on n'a pas assez d'essence on va pitter plus tôt
                        }
                    } else {  // if (tmp_nblaps > tmp_estlaps)
                        tmp_nblaps = tmp_estlaps;  // Si on ne peut pas faire le nombre de tour recommandé parce qu'on n'a pas assez d'essence on va pitter plus tôt
                    }
                }

                set_inner_html("nblaps_to_equalize_stints", (tmp_nblaps).toFixed(1));
            } else {
                set_inner_html("nblaps_to_equalize_stints", "--");
            }
        }

        if (advanced["disp_" + "time" + disp_sel]) {
            //document.getElementById("time").innerHTML = str_heure();
            set_inner_html("time", str_heure());
        }

        if (advanced["disp_" + "perfs" + disp_sel]) {
            if (donnees.pss != undefined) {
                //document.getElementById("perfs_dist").innerHTML = donnees.pss;
                set_inner_html("perfs_dist", donnees.pss);
            }
            if (donnees.p100 != undefined && donnees.p400 != undefined && donnees.p1000 != undefined) {
                //document.getElementById("perfs_100kmh").innerHTML = donnees.p100.toFixed(1);
                set_inner_html("perfs_100kmh", donnees.p100.toFixed(1));
                //document.getElementById("perfs_400m").innerHTML = donnees.p400.toFixed(1);
                set_inner_html("perfs_400m", donnees.p400.toFixed(1));
                //document.getElementById("perfs_1000m").innerHTML = donnees.p1000.toFixed(1);
                set_inner_html("perfs_1000m", donnees.p1000.toFixed(1));
                if (donnees.p100d != undefined && donnees.p400s != undefined && donnees.p1000s != undefined) {
                    //document.getElementById("perfs_100kmh_dist").innerHTML = donnees.p100d.toFixed(0) + " m";
                    set_inner_html("perfs_100kmh_dist", donnees.p100d.toFixed(0) + " m");
                    if (speedfactor == 1) {
                        tmp_unit = " km/h";
                    } else {
                        tmp_unit = " MPH";
                    }
                    //document.getElementById("perfs_400m_speed").innerHTML = (speedfactor * donnees.p400s * 3.6).toFixed(0) + tmp_unit;
                    set_inner_html("perfs_400m_speed", (speedfactor * donnees.p400s * 3.6).toFixed(0) + tmp_unit);
                    //document.getElementById("perfs_1000m_speed").innerHTML = (speedfactor * donnees.p1000s * 3.6).toFixed(0) + tmp_unit;
                    set_inner_html("perfs_1000m_speed", (speedfactor * donnees.p1000s * 3.6).toFixed(0) + tmp_unit);
                }
            }
        }

        if (advanced["disp_" + "inc" + disp_sel]) {
            if (donnees.inc_limit == "unlimited") {
                //document.getElementById("inc").innerHTML = donnees.inc + " / " + "&infin;";
                set_inner_html("inc", donnees.inc + " / " + "&infin;");
            } else {
                //document.getElementById("inc").innerHTML = donnees.inc + " / " + donnees.inc_limit;
                set_inner_html("inc", donnees.inc + " / " + donnees.inc_limit);
            }
        }
        if (advanced["disp_" + "nextpittimelost" + disp_sel]) {
            if (donnees.plost != undefined) {
                if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                    //document.getElementById("nextpittimelost").innerHTML = (donnees.plost).toFixed(1) + "s";
                    set_inner_html("nextpittimelost", (donnees.plost).toFixed(1) + "s");
                } else {
                    //document.getElementById("nextpittimelost").innerHTML = "buy pro";
                    set_inner_html("nextpittimelost", "buy pro");
                }
            }
        }

        if (advanced["disp_" + "conso1" + disp_sel]) {
            if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                //document.getElementById("conso1").innerHTML = (fuelfactor * coef_fuel * donnees.co).toFixed(3);
                set_inner_html("conso1", (fuelfactor * coef_fuel * donnees.co).toFixed(3));
            } else {
                //document.getElementById("conso1").innerHTML = "buy pro";
                set_inner_html("conso1", "buy pro");
            }
            if (donnees.fuel_accurate != 1) {
                //document.getElementById("conso1").style.color = "#bbbbbb";
                set_style_color("conso1", "#bbbbbb");
            } else {
                //document.getElementById("conso1").style.color = "#ffffff";
                set_style_color("conso1", "#ffffff");
            }
        }
        if (advanced["disp_" + "conso5" + disp_sel]) {
            if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                //document.getElementById("conso5").innerHTML = (fuelfactor * coef_fuel * donnees.co5).toFixed(3);
                set_inner_html("conso5", (fuelfactor * coef_fuel * donnees.co5).toFixed(3));
            } else {
                //document.getElementById("conso5").innerHTML = "buy pro";
                set_inner_html("conso5", "buy pro");
            }
            if (donnees.fuel_accurate != 1) {
                //document.getElementById("conso5").style.color = "#bbbbbb";
                set_style_color("conso5", "#bbbbbb");
            } else {
                //document.getElementById("conso5").style.color = "#ffffff";
                set_style_color("conso5", "#ffffff");
            }
        }
        if (advanced["disp_" + "points" + disp_sel]) {
            if (donnees.pts_me != undefined) {
                if (donnees.styp == "Race") {
                    //document.getElementById("points").innerHTML = donnees.pts_me;
                    set_inner_html("points", donnees.pts_me);
                }else {
                    //document.getElementById("points").innerHTML = "--";
                    set_inner_html("points", "--");
                }
            }
        }
        if (advanced["disp_" + "delta_avg" + disp_sel]) {
            if (donnees.d_a != undefined) {
                //document.getElementById("delta_avg").innerHTML = reformat_delta(donnees.d_a);
                set_inner_html("delta_avg", reformat_delta(donnees.d_a));
            } else {
                //document.getElementById("delta_avg").innerHTML = "--";
                set_inner_html("delta_avg", "--");
            }
        }
        if (advanced["disp_" + "delta_tot" + disp_sel]) {
            if (donnees.d_tot != undefined && donnees.st_avg != undefined && donnees.st_ref != undefined && donnees.tot_ref != undefined) {
                if (donnees.new_tot) {
                    tot_color = "#ff00ff";
                } else {
                    tot_color = "#000000";
                }
                //document.getElementById("delta_tot").innerHTML = reformat_delta(donnees.d_tot) + " <span style='vertical-align: top; color:#0088ff'>" + donnees.st_avg + "/" + donnees.st_ref + "</span> <span style='vertical-align: top; font-size:75%;color:" + tot_color + ";'>" + donnees.tot_ref + "</span>";
                set_inner_html("delta_tot", reformat_delta(donnees.d_tot) + " <span style='vertical-align: top; color:#0088ff'>" + donnees.st_avg + "/" + donnees.st_ref + "</span> <span style='vertical-align: top; font-size:75%;color:" + tot_color + ";'>" + donnees.tot_ref + "</span>");
            } else {
                //document.getElementById("delta_tot").innerHTML = "&nbsp;";
                set_inner_html("delta_tot", "&nbsp;;");
            }
        }
        if (advanced["disp_" + "delta_tot2" + disp_sel]) {
            if (donnees.d_tot != undefined && donnees.st_avg != undefined && donnees.st_ref != undefined && donnees.tot_ref != undefined) {
                if (donnees.new_tot) {
                    tot_color = "#ff00ff";
                } else {
                    tot_color = "#000000";
                }
                set_inner_html("delta_tot2", reformat_delta(donnees.d_tot) + " <span style='vertical-align: top; color:#0088ff'>" + donnees.st_avg + "/" + donnees.st_ref + "</span> <span style='vertical-align: top; font-size:75%;color:" + tot_color + ";'>" + (donnees.st_ref > 0 ? reformat_laptime(donnees.tot_ref / donnees.st_ref) : "--") + "</span>");
            } else {
                set_inner_html("delta_tot2", "&nbsp;");
            }
        }

        if (advanced["disp_" + "traffic" + disp_sel]) {
            if (donnees.catch_0 != undefined && donnees.catch_1 != undefined && donnees.catch_2 != undefined) {
                c0 = donnees.catch_0;
                c1 = donnees.catch_1;
                c2 = donnees.catch_2;
                if (donnees.cc_0.slice(0,1) == "+") ccs_0 = "";
                else ccs_0 = "<span style='color: #ff0000; vertical-align: top; '>'</span>";
                if (donnees.cc_1.slice(0,1) == "+") ccs_1 = "";
                else ccs_1 = "<span style='color: #ff0000; vertical-align: top; '>'</span>";
                if (donnees.cc_2.slice(0,1) == "+") ccs_2 = "";
                else ccs_2 = "<span style='color: #ff0000; vertical-align: top; '>'</span>";
                if (c0 < 10) c0 = c0.toFixed(1);
                if (c1 < 10) c1 = c1.toFixed(1);
                if (c2 < 10) c2 = c2.toFixed(1);
                if (c0 == 9999) c0 = ".";
                if (c1 == 9999) c1 = ".";
                if (c2 == 9999) c2 = ".";
                //document.getElementById("traffic").innerHTML = "<span class='shadow' style='color: " + donnees.cc_0.slice(1,8) + "; vertical-align: top; font-size:100%'> " + c0 + ccs_0 + "</span><span class='shadow' style='opacity:1; color: " + donnees.cc_1.slice(1,8) + "; vertical-align: top; font-size:75%'> " + c1 + ccs_1 + "</span><span class='shadow' style='opacity: 1; color: " + donnees.cc_2.slice(1,8) + "; vertical-align: top; font-size:50%'> " + c2 + ccs_2 + "</span>";
                set_inner_html("traffic", "<span class='shadow' style='color: " + donnees.cc_0.slice(1,8) + "; vertical-align: top; font-size:100%'> " + c0 + ccs_0 + "</span><span class='shadow' style='opacity:1; color: " + donnees.cc_1.slice(1,8) + "; vertical-align: top; font-size:75%'> " + c1 + ccs_1 + "</span><span class='shadow' style='opacity: 1; color: " + donnees.cc_2.slice(1,8) + "; vertical-align: top; font-size:50%'> " + c2 + ccs_2 + "</span>");
            }
        }
        if (advanced["disp_" + "traffic_pit" + disp_sel]) {
            if (donnees.catchpit_0 != undefined && donnees.catchpit_1 != undefined && donnees.catchpit_2 != undefined) {
                c0 = donnees.catchpit_0;
                c1 = donnees.catchpit_1;
                c2 = donnees.catchpit_2;
                if (donnees.ccpit_0.slice(0,1) == "+") ccs_0 = "";
                else ccs_0 = "<span style='color: #ff0000; vertical-align: top; '>'</span>";
                if (donnees.ccpit_1.slice(0,1) == "+") ccs_1 = "";
                else ccs_1 = "<span style='color: #ff0000; vertical-align: top; '>'</span>";
                if (donnees.ccpit_2.slice(0,1) == "+") ccs_2 = "";
                else ccs_2 = "<span style='color: #ff0000; vertical-align: top; '>'</span>";
                if (c0 < 10) c0 = c0.toFixed(1);
                if (c1 < 10) c1 = c1.toFixed(1);
                if (c2 < 10) c2 = c2.toFixed(1);
                if (c0 == 9999) c0 = ".";
                if (c1 == 9999) c1 = ".";
                if (c2 == 9999) c2 = ".";
                //document.getElementById("traffic_pit").innerHTML = "<span class='shadow' style='color: " + donnees.ccpit_0.slice(1,8) + "; vertical-align: top; font-size:100%'> " + c0 + ccs_0 + "</span><span class='shadow' style='opacity:1; color: " + donnees.ccpit_1.slice(1,8) + "; vertical-align: top; font-size:75%'> " + c1 + ccs_1 + "</span><span class='shadow' style='opacity:1; color: " + donnees.ccpit_2.slice(1,8) + "; vertical-align: top; font-size:50%'> " + c2 + ccs_2 + "</span>";
                set_inner_html("traffic_pit", "<span class='shadow' style='color: " + donnees.ccpit_0.slice(1,8) + "; vertical-align: top; font-size:100%'> " + c0 + ccs_0 + "</span><span class='shadow' style='opacity:1; color: " + donnees.ccpit_1.slice(1,8) + "; vertical-align: top; font-size:75%'> " + c1 + ccs_1 + "</span><span class='shadow' style='opacity:1; color: " + donnees.ccpit_2.slice(1,8) + "; vertical-align: top; font-size:50%'> " + c2 + ccs_2 + "</span>");
            }
        }

        if (advanced["disp_" + "regen_lap" + disp_sel]) {
            if (donnees.regen_lap != undefined) {
                signe = "";
                if (donnees.regen_lap >= 0) {
                    signe = "+";
                }
                //document.getElementById("regen_lap").innerHTML = signe + donnees.regen_lap.toFixed(hybrid_decimal);
                set_inner_html("regen_lap", signe + donnees.regen_lap.toFixed(hybrid_decimal));
                if (donnees.regen_status != regen_status_old) {
                    if (donnees.regen_status == 1) {
                        change_bg("regen_lap", "#ffffff", advanced["bg_" + "regen_lap" + "_" + advanced["display_selected"]]);
                        //document.getElementById("regen_lap").style.color = "#ff0000";
                        set_style_color("regen_lap", "#ff0000");
                    } else {
                        change_bg("regen_lap", "#999999", advanced["bg_" + "regen_lap" + "_" + advanced["display_selected"]]);
                        //document.getElementById("regen_lap").style.color = "#ff00ff";
                        set_style_color("regen_lap", "#ff00ff");
                    }
                }
                regen_status_old = donnees.regen_status;
            }
        }

        if (advanced["disp_" + "regen_turn" + disp_sel]) {
            if (donnees.regen_turn != undefined) {
                signe = "";
                if (donnees.regen_turn >= 0) {
                    signe = "+";
                }
                //document.getElementById("regen_turn").innerHTML = signe + donnees.regen_turn.toFixed(hybrid_decimal);
                set_inner_html("regen_turn", signe + donnees.regen_turn.toFixed(hybrid_decimal));
            }
        }

        // Mise à jour des Températures et pression des pneus
        // 1 : pressions
        // 0 : temperatures
        // 2 : wear
        var tmp_list_var = {
            'RRpressure': 1,
            'RFpressure': 1,
            'LFpressure': 1,
            'LRpressure': 1,
            'RRtempL': 0,
            'RRtempM': 0,
            'RRtempR': 0,
            'RFtempL': 0,
            'RFtempM': 0,
            'RFtempR': 0,
            'LFtempL': 0,
            'LFtempM': 0,
            'LFtempR': 0,
            'LRtempL': 0,
            'LRtempM': 0,
            'LRtempR': 0,
            'RRwearL': 2,
            'RRwearM': 2,
            'RRwearR': 2,
            'RFwearL': 2,
            'RFwearM': 2,
            'RFwearR': 2,
            'LFwearL': 2,
            'LFwearM': 2,
            'LFwearR': 2,
            'LRwearL': 2,
            'LRwearM': 2,
            'LRwearR': 2,
        };
        var suffixe = "";

        for (var name in tmp_list_var) {
            if (advanced["disp_" + name + disp_sel]) {
                if (donnees[name] != undefined) {
                    //suffixe = "&deg;C";
                    //if (name.substr(-8) == "pressure" ) suffixe = " kPa";
                    if (tmp_list_var[name] == 1) {  // s'il s'agit d'une pression
                        if (donnees.u == 1) {  // pressions en Kpa
                            //document.getElementById(name).innerHTML = donnees[name].toFixed(1);
                            set_inner_html(name, donnees[name].toFixed(1));
                        } else {  // pressions en Psi
                            //document.getElementById(name).innerHTML = (0.145038 * donnees[name]).toFixed(1);
                            set_inner_html(name, (0.145038 * donnees[name]).toFixed(1));
                        }
                    } else if (tmp_list_var[name] == 2) {  // s'il s'agit d'un de l'usure
                        set_inner_html(name, donnees[name].toFixed(1) + "%");
                    } else {  // s'il s'agit d'une température
                        if ((temperature_mode != 2) && ((donnees.u == 1 && temperature_mode == 0) || (temperature_mode == 1))) {  // systeme metric ou forcé en Celsius dans les options
                            //document.getElementById(name).innerHTML = donnees[name].toFixed(1);
                            set_inner_html(name, donnees[name].toFixed(1));
                        } else {
                            //document.getElementById(name).innerHTML = (donnees[name] * 1.8 + 32).toFixed(1);
                            set_inner_html(name, (donnees[name] * 1.8 + 32).toFixed(1));
                        }
                    }
                }
            }
        }


        if (advanced["disp_" + "iR_gain" + disp_sel]) {
            if (donnees.iR_gain != undefined) {
                var tmp_prefixe = "";
                if (donnees.iR_gain >= 0) tmp_prefixe = "+";
                //document.getElementById("iR_gain").innerHTML = tmp_prefixe + donnees.iR_gain;
                set_inner_html("iR_gain", tmp_prefixe + donnees.iR_gain);
            }
        }
        if (advanced["disp_" + "iR_proj" + disp_sel]) {
            if (donnees.iR_proj != undefined) {
                //document.getElementById("iR_proj").innerHTML = donnees.iR_proj;
                set_inner_html("iR_proj", donnees.iR_proj);
            }
        }
        if (advanced["disp_" + "apex_speed" + disp_sel]) {
            if (donnees.apex_speed != undefined) {
                //document.getElementById("apex_speed").innerHTML = donnees.apex_speed;
                set_inner_html("apex_speed", donnees.apex_speed);
            }
        }

    }


    if (donnees.typ <= 33) {

        conso = 0;
        conso1 = donnees.co;
        conso5 = donnees.co5;
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

        fuelneed1 = donnees.fn;
        fuelneed5 = donnees.fn5;
        //document.getElementById("fuelneed_h").innerHTML = "F2add <span style='font-size: 0.75em; vertical-align: middle; line-height: 1em;'>" + text_fuelneed + "</span>";
        set_inner_html("fuelneed_h", "F2add <span style='font-size: 0.75em; vertical-align: middle; line-height: 1em;'>" + text_fuelneed + "</span>");

        refuel_min = donnees.rf_m;
        refuel_avg = donnees.rf_a;
        refuel_avg_now = donnees.rf_an;

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

        if (fuelneed1 >= 5*donnees.refuelspeed) {
            fuelneed1_bg1_pct = 1;
        } else if (fuelneed1 <= 0) {
            fuelneed1_bg1_pct = 0;
        } else {
            fuelneed1_bg1_pct = fuelneed1 / (5 * donnees.refuelspeed);
        }

        if (fuelneed5 >= 5*donnees.refuelspeed) {
            fuelneed5_bg1_pct = 1;
        } else if (fuelneed5 <= 0) {
            fuelneed5_bg1_pct = 0;
        } else {
            fuelneed5_bg1_pct = fuelneed5 / (5 * donnees.refuelspeed);
        }

        if (donnees.f != undefined && advanced["disp_" + "tank" + disp_sel]) {
            //document.getElementById("tank").innerHTML = (fuelfactor * coef_fuel * donnees.f).toFixed(2);
            set_inner_html("tank", (fuelfactor * coef_fuel * donnees.f).toFixed(2));
            if (donnees.fuel_accurate != 1) {
                //document.getElementById("tank").style.color = "#bbbbbb";
                set_style_color("tank", "#bbbbbb");
            } else {
                //document.getElementById("tank").style.color = "#ffffff";
                set_style_color("tank", "#ffffff");
            }
        }

        if (advanced["disp_" + "conso" + disp_sel]) {
            if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
                //document.getElementById("conso").innerHTML = (fuelfactor * coef_fuel * conso).toFixed(3) + " " + "<span style='font-size:0.75em;  vertical-align: middle; line-height: 1em; font-weight:normal'>" + text_conso + "</span>";
                set_inner_html("conso", (fuelfactor * coef_fuel * conso).toFixed(3) + " " + "<span style='font-size:0.75em;  vertical-align: middle; line-height: 1em; font-weight:normal'>" + text_conso + "</span>");
            } else {
                //document.getElementById("conso").innerHTML = "buy pro";
                set_inner_html("conso", "buy pro");
            }
            if (donnees.fuel_accurate != 1) {
                //document.getElementById("conso").style.color = "#bbbbbb";
                set_style_color("conso", "#bbbbbb");
            } else {
                //document.getElementById("conso").style.color = "#ffffff";
                set_style_color("conso", "#ffffff");

            }
        }

        if (advanced["disp_" + "fuelneed" + disp_sel]) {
            if (fn_dont_change_colors == 0) {
                //set("fuelneed_bg1", 1024, 560 + Math.floor(fuelneed_bg1_pct * 96), 256, 96 - Math.floor(fuelneed_bg1_pct * 96), 0.075);
                set("fuelneed_bg1", advanced["x_" + "fuelneed" + disp_sel], advanced["y_" + "fuelneed" + disp_sel] + Math.floor(fuelneed_bg1_pct * advanced["h_" + "fuelneed" + disp_sel]), Math.floor(advanced["w_" + "fuelneed" + disp_sel]), advanced["h_" + "fuelneed" + disp_sel] - Math.floor(fuelneed_bg1_pct * advanced["h_" + "fuelneed" + disp_sel]), advanced["f_" + "fuelneed" + disp_sel] / dashboard_ref_w);

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
        }

        if (advanced["disp_" + "fuelneed1" + disp_sel]) {
            set("fuelneed1_bg1", advanced["x_" + "fuelneed1" + disp_sel], advanced["y_" + "fuelneed1" + disp_sel] + Math.floor(fuelneed1_bg1_pct * advanced["h_" + "fuelneed1" + disp_sel]), Math.floor(advanced["w_" + "fuelneed1" + disp_sel]), advanced["h_" + "fuelneed1" + disp_sel] - Math.floor(fuelneed1_bg1_pct * advanced["h_" + "fuelneed1" + disp_sel]), advanced["f_" + "fuelneed1" + disp_sel] / dashboard_ref_w);

            if (donnees.estim_status == 0 || donnees.fuel_accurate != 1) {
                //document.getElementById("fuelneed1").style.color = "#666666";
                set_style_color("fuelneed1", "#666666");
            } else {
                if (fuelneed1_bg1_pct == 0) {
                    //document.getElementById("fuelneed1").style.color = "#ffffff";
                    set_style_color("fuelneed1", "#ffffff");
                } else {
                    //document.getElementById("fuelneed1").style.color = "#000000";
                    set_style_color("fuelneed1", "#000000");
                }
            }
        }

        if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {
            if (advanced["disp_" + "fuelneed5" + disp_sel]) {
                set("fuelneed5_bg1", advanced["x_" + "fuelneed5" + disp_sel], advanced["y_" + "fuelneed5" + disp_sel] + Math.floor(fuelneed5_bg1_pct * advanced["h_" + "fuelneed5" + disp_sel]), Math.floor(advanced["w_" + "fuelneed5" + disp_sel]), advanced["h_" + "fuelneed5" + disp_sel] - Math.floor(fuelneed5_bg1_pct * advanced["h_" + "fuelneed5" + disp_sel]), advanced["f_" + "fuelneed5" + disp_sel] / dashboard_ref_w);

                if (donnees.estim_status == 0 || donnees.fuel_accurate != 1) {
                    //document.getElementById("fuelneed5").style.color = "#666666";
                    set_style_color("fuelneed5", "#666666");
                } else {
                    if (fuelneed5_bg1_pct == 0) {
                        //document.getElementById("fuelneed5").style.color = "#ffffff";
                        set_style_color("fuelneed5", "#ffffff");
                    } else {
                        //document.getElementById("fuelneed5").style.color = "#000000";
                        set_style_color("fuelneed5", "#000000");
                    }
                }
            }

            if (advanced["disp_" + "fuelneed" + disp_sel]) {
                if (conso > 0.01 || refuel_mode == 1) {
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
                    //document.getElementById("fuelneed").innerHTML = "--";
                    set_inner_html("fuelneed", "--");
                }
            }
            if (advanced["disp_" + "fuelneed1" + disp_sel]) {
                if (conso1 > 0.01)
                    if (fuelfactor * coef_fuel * fuelneed1 > 9999) {
                        //document.getElementById("fuelneed1").innerHTML = "9999";
                        set_inner_html("fuelneed1", "9999");
                    } else if (fuelfactor * coef_fuel * fuelneed1 > 999) {
                        //document.getElementById("fuelneed1").innerHTML = (fuelfactor * coef_fuel * fuelneed1).toFixed(0);
                        set_inner_html("fuelneed1", (fuelfactor * coef_fuel * fuelneed1).toFixed(0));
                    } else {
                        //document.getElementById("fuelneed1").innerHTML = (fuelfactor * coef_fuel * fuelneed1).toFixed(1);
                        set_inner_html("fuelneed1", (fuelfactor * coef_fuel * fuelneed1).toFixed(1));
                    }
                else {
                    //document.getElementById("fuelneed1").innerHTML = "--";
                    set_inner_html("fuelneed1", "--");
                }
            }
            if (advanced["disp_" + "fuelneed5" + disp_sel]) {
                if (conso5 > 0.01)
                    if (fuelfactor * coef_fuel * fuelneed5 > 9999) {
                        //document.getElementById("fuelneed5").innerHTML = "9999";
                        set_inner_html("fuelneed5", "9999");
                    } else if (fuelfactor * coef_fuel * fuelneed5 > 999) {
                        //document.getElementById("fuelneed5").innerHTML = (fuelfactor * coef_fuel * fuelneed5).toFixed(0);
                        set_inner_html("fuelneed5", (fuelfactor * coef_fuel * fuelneed5).toFixed(0));
                    } else {
                        //document.getElementById("fuelneed5").innerHTML = (fuelfactor * coef_fuel * fuelneed5).toFixed(1);
                        set_inner_html("fuelneed5", (fuelfactor * coef_fuel * fuelneed5).toFixed(1));
                    }
                else {
                    //document.getElementById("fuelneed5").innerHTML = "--";
                    set_inner_html("fuelneed5", "--");
                }
            }
        } else {
            //document.getElementById("fuelneed").innerHTML = "buy pro";
            set_inner_html("fuelneed", "buy pro");
            //document.getElementById("fuelneed1").innerHTML = "buy pro";
            set_inner_html("fuelneed1", "buy pro");
            //document.getElementById("fuelneed5").innerHTML = "buy pro";
            set_inner_html("fuelneed5", "buy pro");
        }

        if (donnees.b != undefined && advanced["disp_" + "brake2" + disp_sel]) {
            document.getElementById("brake2_").style.right = (100 - donnees.b) + "%";
            if (donnees.b == 0) {
                //document.getElementById("brake2_text").style.color = "#000000";
                set_style_color("brake2_text", "#000000");
            } else if (donnees.b == 100) {
                //document.getElementById("brake2_text").style.color = "#c80000";
                set_style_color("brake2_text", "#c80000");
            } else {
                //document.getElementById("brake2_text").style.color = "#ffffff";
                set_style_color("brake2_text", "#ffffff");
            }
        }
        if (donnees.b != undefined && advanced["disp_" + "brake3" + disp_sel]) {
            document.getElementById("brake3_").style.right = (100 - donnees.b) + "%";
            //document.getElementById("brake3_text").innerHTML = (100 - donnees.b).toFixed(1) + "%&nbsp;";
            set_inner_html("brake3_text", (donnees.b).toFixed(1) + "%&nbsp;");
            if (donnees.b == 0) {
                //document.getElementById("brake3_text").style.color = "#000000";
                set_style_color("brake3_text", "#000000");
            } else if (donnees.b == 100) {
                //document.getElementById("brake3_text").style.color = "#0000c8";
                set_style_color("brake3_text", "#c80000");
            } else {
                //document.getElementById("brake3_text").style.color = "#ffffff";
                set_style_color("brake3_text", "#ffffff");
            }
        }
        if (donnees.t != undefined && advanced["disp_" + "throttle2" + disp_sel]) {
            document.getElementById("throttle2_").style.right = (100 - donnees.t) + "%";
            if (donnees.t == 0) {
                //document.getElementById("throttle2_text").style.color = "#000000";
                set_style_color("throttle2_text", "#000000");
            } else if (donnees.t == 100) {
                //document.getElementById("throttle2_text").style.color = "#00a800";
                set_style_color("throttle2_text", "#00a800");
            } else {
                //document.getElementById("throttle2_text").style.color = "#ffffff";
                set_style_color("throttle2_text", "#ffffff");
            }
        }
        if (donnees.t != undefined && advanced["disp_" + "throttle3" + disp_sel]) {
            document.getElementById("throttle3_").style.right = (100 - donnees.t) + "%";
            //document.getElementById("throttle3_text").innerHTML = (100 - donnees.b).toFixed(1) + "%&nbsp;";
            set_inner_html("throttle3_text", (donnees.t).toFixed(1) + "%&nbsp;");
            if (donnees.t == 0) {
                //document.getElementById("throttle3_text").style.color = "#000000";
                set_style_color("throttle3_text", "#000000");
            } else if (donnees.t == 100) {
                //document.getElementById("throttle3_text").style.color = "#0000c8";
                set_style_color("throttle3_text", "#00a800");
            } else {
                //document.getElementById("throttle3_text").style.color = "#ffffff";
                set_style_color("throttle3_text", "#ffffff");
            }
        }
        if (donnees.clutch != undefined && advanced["disp_" + "clutch2" + disp_sel]) {
            document.getElementById("clutch2_").style.right = (donnees.clutch) + "%";
            //document.getElementById("clutch2_text").innerHTML = (100 - donnees.clutch).toFixed(1) + "%&nbsp;";
            set_inner_html("clutch2_text", (100 - donnees.clutch).toFixed(1) + "%&nbsp;");
            if (donnees.clutch == 100) {
                //document.getElementById("clutch2_text").style.color = "#000000";
                set_style_color("clutch2_text", "#000000");
            } else if (donnees.clutch == 0) {
                //document.getElementById("clutch2_text").style.color = "#0000c8";
                set_style_color("clutch2_text", "#0000c8");
            } else {
                //document.getElementById("clutch2_text").style.color = "#ffffff";
                set_style_color("clutch2_text", "#ffffff");
            }
        }
        if (donnees.ffb != undefined && donnees.ffbpct != undefined && advanced["disp_" + "ffb2" + disp_sel]) {
            document.getElementById("ffb2_").style.right = (100 - donnees.ffbpct) + "%";
            //document.getElementById("ffb2_text").innerHTML = donnees.ffb + " Nm&nbsp;";
            set_inner_html("ffb2_text", donnees.ffb + " Nm&nbsp;");
            if (donnees.ffbpct == 0) {
                //document.getElementById("ffb2_text").style.color = "#000000";
                set_style_color("ffb2_text", "#000000");
            } else if (donnees.ffbpct == 100) {
                //document.getElementById("ffb2_text").style.color = "#1757ee";
                set_style_color("ffb2_text", "#1757ee");
            } else {
                //document.getElementById("ffb2_text").style.color = "#ffffff";
                set_style_color("ffb2_text", "#ffffff");
            }
        }

        if (donnees.pss != undefined && advanced["disp_" + "perfs" + disp_sel]) {
            //document.getElementById("perfs_dist").innerHTML = donnees.pss;
            set_inner_html("perfs_dist", donnees.pss);
        }

        // Indication des pits
        if (advanced["pitbox_bar_on"]) {  // on traite seulement si pitbar activée
            if (donnees.pitpct != undefined) {
                dp_diff = (((donnees.dp + 2) % 1) - donnees.pitpct) * donnees.dtrack;
                //document.getElementById("pitbar8").style.top = (1 - 0.111 - 0.222) * window_innerHeight * (1 + dp_diff / 12.5) + "px";
                set_style_top("pitbar8", (1 - 0.111 - 0.222) * window_innerHeight * (1 + dp_diff / 12.5) + "px");
                //document.getElementById("pitbar16").style.top = (1 - 0.111 - 0.222) * window_innerHeight * (1 + dp_diff / 25) + "px";
                set_style_top("pitbar16", (1 - 0.111 - 0.222) * window_innerHeight * (1 + dp_diff / 25) + "px");
                //document.getElementById("pitbar32").style.top = (1 - 0.111 - 0.222) * window_innerHeight * (1 + dp_diff / 50) + "px";
                set_style_top("pitbar32", (1 - 0.111 - 0.222) * window_innerHeight * (1 + dp_diff / 50) + "px");
                //document.getElementById("pitbar64").style.top = (1 - 0.111 - 0.222) * window_innerHeight * (1 + dp_diff / 100) + "px";
                set_style_top("pitbar64", (1 - 0.111 - 0.222) * window_innerHeight * (1 + dp_diff / 100) + "px");
                //document.getElementById("pitbar64").innerHTML = dp_diff.toFixed(2);
                set_inner_html("pitbar64", dp_diff.toFixed(2));
            } else {
                //document.getElementById("pitbar8").style.top = window_innerHeight + 1 + "px";
                set_style_top("pitbar8", window_innerHeight + 1 + "px");
                //document.getElementById("pitbar16").style.top = window_innerHeight + 1 + "px";
                set_style_top("pitbar16", window_innerHeight + 1 + "px");
                //document.getElementById("pitbar32").style.top = window_innerHeight + 1 + "px";
                set_style_top("pitbar32", window_innerHeight + 1 + "px");
                //document.getElementById("pitbar64").style.top = window_innerHeight + 1 + "px";
                set_style_top("pitbar64", window_innerHeight + 1 + "px");
                //document.getElementById("pitbar64").innerHTML = "";
                set_inner_html("pitbar64", "");
            }
        }

        /*if (1 + dp_diff / 5 > 1) {
            document.getElementById("pitbar0").style.backgroundColor = "#ffff00"
        } else {
            document.getElementById("pitbar0").style.backgroundColor = "#ffffff"
        }
        if ((1 - 0.111 - 0.222) * (1 + dp_diff / 5) > 1 ) {
            document.getElementById("pitbar0").style.display = "none";
        } else {
            //document.getElementById("pitbar0").style.display = "block";
            document.getElementById("pitbar0").style.display = "none";
        }*/

        // Si on a changé de voiture, on réinitialise les données d'optimisations de rapport de boite
        // Et on affiche ou efface certains blocs en fonction de la voiture
        if (donnees.carname != carname) {
            carname = donnees.carname;
            gear_ = {};
            maxspeed_ = {};
            for (i in donnees.gear_) {
                gear_[i] = donnees.gear_[i]
            }

            if (carname in car_with_drs) {
                tmp_list = ["drs"];
                d = "_" + advanced["display_selected"];
                for (i in tmp_list) {
                    name = tmp_list[i];
                    if (advanced["disp_" + name + disp_sel]) {
                        document.getElementById(name).style.display = "inline-block";
                    }
                }
            } else {
                document.getElementById("drs").style.display = "none";
            }
            if (carname in car_with_ers_drs) {
                tmp_list = ["ers", "ersco", "ers_margin", "mgul", "mgu", "mgua", "mguf", "regen_lap", "regen_turn"];
                d = "_" + advanced["display_selected"];
                for (i in tmp_list) {
                    name = tmp_list[i];
                    if (advanced["disp_" + name + disp_sel]) {
                        document.getElementById(name).style.display = "inline-block";
                    }
                }
                document.getElementById("ers_bar").style.display = "inline-block";
                document.getElementById("ers_margin_min_bar").style.display = "inline-block";
                document.getElementById("mgu_margin_max_bar").style.display = "inline-block";
            } else {
                document.getElementById("ers").style.display = "none";
                document.getElementById("ers_bar").style.display = "none";
                document.getElementById("ersco").style.display = "none";
                document.getElementById("ers_margin").style.display = "none";
                document.getElementById("ers_margin_min_bar").style.display = "none";
                document.getElementById("mgu_margin_max_bar").style.display = "none";
                document.getElementById("mgul").style.display = "none";
                document.getElementById("mgu").style.display = "none";
                document.getElementById("mgua").style.display = "none";
                document.getElementById("mguf").style.display = "none";
                document.getElementById("regen_lap").style.display = "none";
                document.getElementById("regen_turn").style.display = "none";
            }

            responsive_dim();
        }

        // Engine Warnings
        water_warn = 0;
        oil_warn = 0;
        pit_speed_limiter = 0;
        if (donnees.warn != undefined) {
            //if (donnees.warn.slice(-1) == "1") water_warn = 1;
            //if (donnees.warn.slice(-3, -2) == "1") oil_warn = 1;
            if (donnees.warn.slice(-5, -4) == "1") pit_speed_limiter = 1;
        }
        // OIL > 140° C et WATER > 130° C
        if (donnees.oil >= 140 && (Date.now() % 500) <= 250) {
            oil_warn = 1;
        }
        if (donnees.w >= 130 && Math.abs((Date.now() % 500) - 375) <= 125) {
            water_warn = 1;
        }

        // Boussole
        compass_w = w * 128 / 1280;
        context_compass.clearRect(0, 0, compass_w, compass_w);

        if(donnees.north != 99 && advanced["disp_" + "compass" + disp_sel]) {
            // Dessin de la flèche indiquant la direction du nord
            compass = coord_compass(donnees.yaw + donnees.north, compass_w/2, "northL");
            draw(compass, "#ff0000", 0);
            compass = coord_compass(donnees.yaw + donnees.north, compass_w/2, "northR");
            draw(compass, "#ff0000", 0);

            // Dessin de la flèche indiquant la direction du vent
            compass = coord_compass(donnees.yaw + donnees.north + donnees.winddir, compass_w/2, "wind");
            draw(compass, "rgba(0,128,255,0.75)", 0);
        }

        if (advanced["disp_" + "delta_pre" + disp_sel] || advanced["disp_" + "delta_post" + disp_sel] || advanced["disp_" + "pre_rel" + disp_sel] || advanced["disp_" + "post_rel" + disp_sel]) {
            // Update des delta graphs
            deltas_and_gapcolor();
        }


        if (donnees.rpm != undefined && advanced["disp_" + "rpm" + disp_sel]) {
            //document.getElementById("rpm").innerHTML = donnees.rpm.toFixed(0);
            set_inner_html("rpm", donnees.rpm.toFixed(0));
        }


        if (donnees.gr != undefined && advanced["disp_" + "gear" + disp_sel]) {
            if (donnees.gr == -1)
                donnees.gr = "R";
            if (donnees.gr == 0)
                donnees.gr = "N";
            //document.getElementById("gear").innerHTML = donnees.gr;
            set_inner_html("gear", donnees.gr);
        }

        // Couleur du drapeau
        if (donnees.flag != undefined) {
            col_flag = "#ffffff";
            if (donnees.flag.slice(-4, -3) == "1") {
                bg = "#ffff00";  // yellow
                col_flag = "#000000"
            }
            else if (donnees.flag.slice(-9, -8) == "1") {
                bg = "#ffff00";  // yellow waving
                col_flag = "#000000"
            }
            else if (donnees.flag.slice(-15, -14) == "1") {
                bg = "#ffff00";  // caution
                col_flag = "#000000"
            }
            else if (donnees.flag.slice(-16, -15) == "1") {
                bg = "#ffff00";  // caution waving
                col_flag = "#000000"
            }
            else if (donnees.flag.slice(-6, -5) == "1") {
                bg = "#0000ff";  // blue
            }
            else if (donnees.flag.slice(-2, -1) == "1") {
                bg = "#ffffff";  // white
                col_flag = "#000000"
            }
            else if (donnees.flag.slice(-3, -2) == "1") {
                bg = "#00ff00";  // green
            }
            //else if (donnees.flag.slice(-11, -10) == "1") {
            //    bg = "#008800";  // green held (fin d'une période de caution)
            //}
            else {
                bg = "#bbbbbb";  // autres
            }

            if (bg != bg_flag_old) {  // si on a changé de couleur de drapeau
                bg_flag_start_time = Date.now() / 1000;
            }
            if (Date.now() / 1000 - bg_flag_start_time < 5) {
                bg_flag = bg;
            } else {
                bg_flag = "#bbbbbb";
            }
            bg_flag_old = bg;

            //document.getElementById("weather").style.backgroundColor = bg;
            if (advanced["disp_" + "weather" + disp_sel]) {
                change_bg("weather", bg, advanced["bg_" + "weather" + "_" + advanced["display_selected"]]);
            }
        }

        if (donnees.shift != undefined) {
            if (shiftlight_mode == 1) {
                shift = donnees.shift[1];
            } else {
                shift = donnees.shift[0];
            }

            // On détermine le rpm optimal pour chaque vitesse
            if (shift_old != 1 && donnees.shift[1] == 1 && donnees.gr == gear_old && donnees.rpm > rpm_old && donnees.s > speed_old) {
                gear_[donnees.gr] = rpm_old;
            }

            if (donnees.shift[1] == 1 || (donnees.shift[1] == 0 && donnees.s < speed_old)) {
                shift_old = donnees.shift[1];
            }
        }

        // On détermine la vitesse maximale atteinte dans un rapport
        if (donnees.gr in maxspeed_) {
            if (donnees.s > maxspeed_[donnees.gr]) {
                maxspeed_[donnees.gr] = donnees.s
            }
        } else {
            maxspeed_[donnees.gr] = donnees.s
        }

        rpm_old = donnees.rpm;
        gear_old = donnees.gr;
        if (shiftlight_mode == 1) {
            if (donnees.rpm >= gear_[donnees.gr]) {
                shift2 = 1;
            } else {
                shift2 = 0;
            }
        } else {
            shift2 = shift
        }


        if (donnees.rpm != undefined && advanced["disp_" + "rpm_leds" + disp_sel]) {
            //red_rpm = donnees.rpm_first;
            if (donnees.gear_ != undefined) {
                if(donnees.gr >= 1) {
                    red_rpm = donnees.gear_[donnees.gr];
                } else {
                    red_rpm = donnees.gear_[1];
                }
            }
            //console.log(red_rpm)
            // On vérifie que ce n'est pas trop bas par rapport au max
            //if (red_rpm / max_rpm < 0.8) {
            //    red_rpm = 0.8 * max_rpm;
            //}
            //rpm_coef_a = 4 / (max_rpm - red_rpm);

            if (donnees.rpm_redline != undefined) {
                max_rpm = donnees.rpm_redline;  // important de le mettre à jour tout le temps car sinon on peut avoir des valeurs absurdes quand le red_rpm est à 99999
            }
            if (red_rpm >= max_rpm && red_rpm < 20000) {  // on s'assure que le red_rpm n'était pas absurde
                max_rpm = red_rpm / 0.80;
            }

            // La 5ème led s'allume quand on atteint le red_rpm
            //rpm_coef_a = 7.5 / (max_rpm - red_rpm);
            //rpm_coef_b = 12 - rpm_coef_a * max_rpm;
            //rpm_coef_a = (12.5 - rpm_leds_N_red) / (max_rpm - red_rpm);
            //rpm_coef_b = 12 - rpm_coef_a * max_rpm;
            //num_led = (rpm_coef_a * donnees.rpm + rpm_coef_b).toFixed(0);

            // On élimine les valeurs incohérentes
            if (rpm_leds_N_red < 1) rpm_leds_N_red = 1;
            if (rpm_leds_N_red > 12) rpm_leds_N_red = 12;
            if (rpm_leds_led1_pct < 0) rpm_leds_led1_pct = 0;
            if (rpm_leds_led1_pct > 1) rpm_leds_led1_pct = 1;
            //console.log(rpm_leds_N_red, rpm_leds_led1_pct);

            var led1_rpm = rpm_leds_led1_pct * red_rpm
            if (donnees.rpm < led1_rpm) {
                //num_led = ( 1 / led1_rpm * donnees.rpm ).toFixed(0);
                num_led = 0;
            }
            //console.log(led1_rpm);
            if (led1_rpm <= donnees.rpm && donnees.rpm < red_rpm) {
                num_led = parseInt(( (rpm_leds_N_red - 0.5 - (1 - 0.5)) / (red_rpm -  led1_rpm) * (donnees.rpm - led1_rpm) + 1 - 0.5 ).toFixed(0));
            }
            if (red_rpm <= donnees.rpm) {
                num_led = parseInt(( (11.6 - (rpm_leds_N_red - 0.5)) / (max_rpm -  red_rpm) * (donnees.rpm - red_rpm) + rpm_leds_N_red - 0.5).toFixed(0));
            }
            //console.log(donnees.rpm, num_led)

            if (pit_speed_limiter == 1 && donnees.isontrack == 1) {
                // Si pit limiter activé
                if(donnees.p) {
                    for (i = 1; i <= 12; i++) {
                        //document.getElementById("led" + i).style.backgroundColor = "#ff0088";
                        set_style_bg("led" + i, "#ff0088");
                    }
                } else {  // Dès qu'on sort des pits on affiche les leds en vert
                    for (i = 1; i <= 12; i++) {
                        //document.getElementById("led" + i).style.backgroundColor = "#00ff00";
                        set_style_bg("led" + i, "#00ff00");
                    }
                }
            } else {
                if(donnees.p) {  // Dans les pits, on indique notre vitesse par rapport à la vitesse limite
                    tmp = 6 + (donnees.s - donnees.pitspeedlimit) * 3.6;
                    num_led = Math.floor(tmp);
                    led_col_intensite = tmp - num_led;
                    tmp = Math.floor(200 - led_col_intensite * 200);
                    for (i = 1; i <= 12; i++) {
                        if (num_led <= 6) {
                            if (i <= num_led) {
                                //document.getElementById("led" + i).style.backgroundColor = "#00ff00";
                                set_style_bg("led" + i, "#00ff00");
                            } else {
                                if (i <= 6) {
                                    if (i == num_led + 1) {
                                        //document.getElementById("led" + i).style.backgroundColor = 'rgb(' + tmp + ', 255,' + tmp + ')';
                                        set_style_bg("led" + i, 'rgb(' + tmp + ', 255,' + tmp + ')');
                                    } else {
                                        //document.getElementById("led" + i).style.backgroundColor = "#c8ffc8";
                                        set_style_bg("led" + i, "#c8ffc8");
                                    }
                                } else {
                                    if (i == num_led + 1) {
                                        //document.getElementById("led" + i).style.backgroundColor = 'rgb(255, ' + tmp + ',' + tmp + ')';
                                        set_style_bg("led" + i, 'rgb(255, ' + tmp + ',' + tmp + ')');
                                    } else {
                                        //document.getElementById("led" + i).style.backgroundColor = "#ffc8c8";
                                        set_style_bg("led" + i, "#ffc8c8");
                                    }
                                }
                            }
                        } else {
                            if (i <= num_led && i > 6) {
                                //document.getElementById("led" + i).style.backgroundColor = "#ff0000";
                                set_style_bg("led" + i, "#ff0000");
                            } else {
                                if (i <= 6) {
                                    //document.getElementById("led" + i).style.backgroundColor = "#00ff00";
                                    set_style_bg("led" + i, "#00ff00");
                                } else {
                                    if (i == num_led + 1) {
                                        //document.getElementById("led" + i).style.backgroundColor = 'rgb(255, ' + tmp + ',' + tmp + ')';
                                        set_style_bg("led" + i, 'rgb(255, ' + tmp + ',' + tmp + ')');
                                    } else {
                                        //document.getElementById("led" + i).style.backgroundColor = "#ffc8c8";
                                        set_style_bg("led" + i, "#ffc8c8");
                                    }
                                }
                            }
                        }

                    }
                /*} else if (bg_flag != "#bbbbbb") {
                    // Signalement du Drapeau
                    for (i = 1; i <= 12; i++) {
                        document.getElementById("led" + i).style.backgroundColor = bg_flag;
                    }
                } else if (oil_warn) {
                    for (i = 1; i <= 12; i++) {
                        document.getElementById("led" + i).style.backgroundColor = "#df49d8";
                    }
                } else if (water_warn) {
                    for (i = 1; i <= 12; i++) {
                        document.getElementById("led" + i).style.backgroundColor = "#3c9ffb";
                    }*/
                } else {
                    for (i = 1; i <= 12; i++) {
                        if (i < num_led) {
                            if (bg_flag != "#bbbbbb") {
                                //document.getElementById("led" + i).style.backgroundColor = bg_flag;
                                set_style_bg("led" + i, bg_flag);
                            } else if (oil_warn) {
                                //document.getElementById("led" + i).style.backgroundColor = "#df49d8";
                                set_style_bg("led" + i, "#df49d8");
                            } else if (water_warn) {
                                //document.getElementById("led" + i).style.backgroundColor = "#3c9ffb";
                                set_style_bg("led" + i, "#3c9ffb");
                            } else {
                                //document.getElementById("led" + i).style.backgroundColor = led_col_on[i - 1];
                                set_style_bg("led" + i, led_col_on[i - 1]);
                            }
                        } else if (i == num_led) {
                            //document.getElementById("led" + i).style.backgroundColor = led_col_on[i - 1];
                            set_style_bg("led" + i, led_col_on[i - 1]);
                        } else {
                            if (bg_flag != "#bbbbbb") {
                                //document.getElementById("led" + i).style.backgroundColor = bg_flag;
                                set_style_bg("led" + i, bg_flag);
                            } else if (oil_warn) {
                                //document.getElementById("led" + i).style.backgroundColor = "#df49d8";
                                set_style_bg("led" + i, "#df49d8");
                            } else if (water_warn) {
                                //document.getElementById("led" + i).style.backgroundColor = "#3c9ffb";
                                set_style_bg("led" + i, "#3c9ffb");
                            } else {
                                //document.getElementById("led" + i).style.backgroundColor = led_col_off[i - 1];
                                set_style_bg("led" + i, led_col_off[i - 1]);
                            }
                        }
                    }
                }
            }

        }
        // else
        if ((shift2 == 1 && donnees.gr > 0) || (pit_speed_limiter == 1 && donnees.isontrack == 1)) {
        //if (((shift2 == 1 && donnees.gr > 0) || pit_speed_limiter == 1) && (!advanced["disp_" + "rpm_leds" + disp_sel])) {  // On n'affiche pas le shiftlight si les leds sont utilisées
            if(donnees.p || pit_speed_limiter == 0) {
                light("#ff0088", "#ffffff");
            } else {
                light("#00ff00", "#ffffff");
            }
        } else {
            if (shift == 2 && donnees.gr > 1) {
            //    light("#00ff88", "#ffffff");
            } else if (bg_flag != "#bbbbbb") {
                light(bg_flag, col_flag);
            } else if (oil_warn) {
                light("#df49d8", "#ffffff");
            } else if (water_warn) {
                light("#3c9ffb", "#ffffff");
            } else if ((donnees.styp == "Open Qualify" || donnees.styp == "Lone Qualify") && (donnees.qinv)) {
                light("#ff0000", "#ffffff");  // On allume le dashboard en rouge si le temps de qualif est invalidé suite à un off-track
                // On indique qu'il faut passer le rapport supérieur pour l'étannolage
            } else if (donnees.gr > 1 && shiftlight_mode == 1) {
                if (donnees.s > maxspeed_[donnees.gr - 1]) {
                    //light("#00ff88", "#ffffff");
                } else {
                    light_off();
                }
            } else {
                light_off();
            }
        }

        if (advanced["disp_" + "oil" + disp_sel] || advanced["disp_" + "water" + disp_sel]) {
            if (oil_warn) {
                //document.getElementById("oil").style.backgroundColor = "#df49d8";
                change_bg("oil", "#df49d8", advanced["bg_" + "oil" + "_" + advanced["display_selected"]]);
                //document.getElementById("oil").style.color = "#000000";
                set_style_color("oil", "#000000");
            } else {
                //document.getElementById("oil").style.backgroundColor = "#6f0968";
                change_bg("oil", "#6f0968", advanced["bg_" + "oil" + "_" + advanced["display_selected"]]);
                //document.getElementById("oil").style.color = "#ffffff";
                set_style_color("oil", "#ffffff");
            }

            if (water_warn) {
                //document.getElementById("water").style.backgroundColor = "#3c9ffb";
                change_bg("water", "#3c9ffb", advanced["bg_" + "water" + "_" + advanced["display_selected"]]);
                //document.getElementById("water").style.color = "#000000";
                set_style_color("water", "#000000");
            } else {
                //document.getElementById("water").style.backgroundColor = "#0c4f8b";
                change_bg("water", "#0c4f8b", advanced["bg_" + "water" + "_" + advanced["display_selected"]]);
                //document.getElementById("water").style.color = "#ffffff";
                set_style_color("water", "#ffffff");
            }
        }

        if (donnees.s != undefined && advanced["disp_" + "speed" + disp_sel]) {
            //document.getElementById("speed").innerHTML = (speedfactor * donnees.s * 3.6).toFixed(0);
            tmp_speed = speedfactor * donnees.s * 3.6;
            tmp_diff = speedfactor * (donnees.s - donnees.pitspeedlimit) * 3.6;
            if (donnees.p && tmp_speed != 0 && Math.abs(tmp_diff) <= 3.3) {  // à moins de 3.3 km/h de différence avec la vitesse de pit on affiche la différence
                tmp_speed = tmp_diff;
                str_speed = Math.floor(Math.abs(tmp_speed)) + '<span style="display: inline-block; line-height: 100%; font-size: 0.75em;">.' + (Math.floor(Math.abs(tmp_speed * 10)) % 10) + '</span>';
                //str_speed = (Math.floor(tmp_speed * 10) / 10).toFixed(1);
                if (tmp_speed < 0) {
                    str_speed = "-" + str_speed;
                } else {
                    str_speed = "+" + str_speed;
                }
                // On rajoute un code couleur en fonction de la vitesse par rapport à la vitesse max dans les pits
                tmp_col = Math.round(((-donnees.s + donnees.pitspeedlimit) * 3.6 / 2.8) * 64) + 32;  // 2.8 pour une étendue de 2.8 km/h, -1.4km/h (bleu) -0.7 (vert) 0 (gris) +0.7 (rouge) +1.4hm/h (rose)
                if (tmp_col > 64) {
                    tmp_col = 64
                }
                if (tmp_col < 0) {
                    tmp_col = 0
                }
                if (tmp_col <= 0) {
                    change_bg("speed", "#ffff00", advanced["bg_" + "speed" + "_" + advanced["display_selected"]]);
                }
                tmp_col = couleurs2[tmp_col];
                str_speed = '<span style="color: ' + tmp_col + '">' +  str_speed + '</span>';
            } else {
                str_speed = tmp_speed.toFixed(0);
            }

            set_inner_html("speed", str_speed);

            // REM : speed_unit est utilisé juste pour le compteur donc pas défini ici
            /*if (donnees.u) {
                //$("#speed_unit").html("km/h");
                set_inner_html("speed_unit", "km/h");
            } else {
                //$("#speed_unit").html("m/h");
                set_inner_html("speed_unit", "m/h");
            }*/

        }

        /*if (donnees["pre_rc" + _f3_pre] != undefined)
            document.getElementById("pre_rel").innerHTML = reformat_gap(donnees["pre_rc" + _f3_pre]) ;
        if (donnees["post_rc" + _f3_post] != undefined)
            document.getElementById("post_rel").innerHTML = reformat_gap(donnees["post_rc" + _f3_post]) ;*/

        if (advanced["disp_" + "pre_rel" + disp_sel] || advanced["disp_" + "post_rel" + disp_sel]) {
            if (donnees.styp == "Race" && (f3_mode_in_race_dashboard == 0 && f3_mode_for_pre == 0)) {
                if (donnees.pre_rc != undefined) {
                    //document.getElementById("pre_rel").innerHTML = reformat_gap(donnees.pre_rc);
                    set_inner_html("pre_rel", reformat_gap(donnees.pre_rc));
                } else {
                    document.getElementById("pre_rel").innerHTML = "";
                    set_inner_html("pre_rel", "");
                }
            } else {
                // En dehors des courses, on affiche l'écart sur la piste
                if (donnees.pre_rcf3_f3 != undefined) {
                    //document.getElementById("pre_rel").innerHTML = reformat_gap(donnees.pre_rcf3_f3);
                    set_inner_html("pre_rel", reformat_gap(donnees.pre_rcf3_f3));
                } else {
                    //document.getElementById("pre_rel").innerHTML = "";
                    set_inner_html("pre_rel", "");
                }
            }
            if (donnees.styp == "Race" && f3_mode_in_race_dashboard == 0) {
                if (donnees.post_rc != undefined) {
                    //document.getElementById("post_rel").innerHTML = reformat_gap(donnees.post_rc);
                    set_inner_html("post_rel", reformat_gap(donnees.post_rc));
                } else {
                    //document.getElementById("post_rel").innerHTML = "";
                    set_inner_html("post_rel", "");
                }
            } else {
                if (donnees.post_rcf3_f3 != undefined) {
                    //document.getElementById("post_rel").innerHTML = reformat_gap(donnees.post_rcf3_f3);
                    set_inner_html("post_rel", reformat_gap(donnees.post_rcf3_f3));
                } else {
                    //document.getElementById("post_rel").innerHTML = "";
                    set_inner_html("post_rel", "");
                }
            }
        }

        if (donnees.d_b != undefined && advanced["disp_" + "delta_best" + disp_sel]) {
            //document.getElementById("delta_best").innerHTML = reformat_delta(donnees.d_b);
            set_inner_html("delta_best", reformat_delta(donnees.d_b));
        }
        if (donnees.d_l != undefined && advanced["disp_" + "delta_last" + disp_sel]) {
            //document.getElementById("delta_last").innerHTML = reformat_delta(donnees.d_l);
            set_inner_html("delta_last", reformat_delta(donnees.d_l));
        }

        if (donnees.bb != undefined && advanced["disp_" + "bb" + disp_sel]) {
            //document.getElementById("bb").innerHTML = donnees.bb;
            set_inner_html("bb", donnees.bb);
        }
        if (donnees.tc != undefined && advanced["disp_" + "tc" + disp_sel]) {
            //document.getElementById("tc").innerHTML = donnees.tc;
            set_inner_html("tc", donnees.tc);
        }
        if (donnees.tc2 != undefined && advanced["disp_" + "tc2" + disp_sel]) {
            //document.getElementById("tc2").innerHTML = donnees.tc2;
            set_inner_html("tc2", donnees.tc2);
        }
        if (donnees.ffb != undefined && advanced["disp_" + "ffb" + disp_sel]) {
            //document.getElementById("ffb").innerHTML = donnees.ffb;
            set_inner_html("ffb", donnees.ffb);
        }

        if (donnees.b != undefined && advanced["disp_" + "b_cont" + disp_sel]) {
            //document.getElementById("b").style.top = (100 - donnees.b) + "%";
            set_style_top("b", (100 - donnees.b) + "%");
        }
        if (donnees.t != undefined && advanced["disp_" + "t_cont" + disp_sel]) {
            //document.getElementById("t").style.top = (100 - donnees.t) + "%";
            set_style_top("t", (100 - donnees.t) + "%");
        }
        if (donnees.clutch != undefined && advanced["disp_" + "c_cont" + disp_sel]) {
            //document.getElementById("c").style.top = (donnees.clutch) + "%";
            set_style_top("c", (donnees.clutch) + "%");
        }
        if (donnees.ffbpct != undefined && advanced["disp_" + "ffbpct_cont" + disp_sel]) {
            //document.getElementById("ffbpct").style.top = (100 - donnees.ffbpct) + "%";
            set_style_top("ffbpct", (100 - donnees.ffbpct) + "%");
        }

        if (carname in car_with_ers_drs) {
            if (advanced["disp_" + "mgua" + disp_sel] || advanced["disp_" + "mguf" + disp_sel] || advanced["disp_" + "ers" + disp_sel] || advanced["disp_" + "ersco" + disp_sel] || advanced["disp_" + "ers_margin" + disp_sel] || advanced["disp_" + "mgul" + disp_sel] || advanced["disp_" + "mgu" + disp_sel] || advanced["disp_" + "drs" + disp_sel]) {
                //if (donnees.mgua != undefined && donnees.mguf != undefined) {
                if (donnees.mguf != undefined && advanced["disp_" + "mguf" + disp_sel]) {
                    //mgua = donnees.mgua;
                    mguf = donnees.mguf;
                    //if (mgua < 10) mgua = "0" + mgua;
                    //if (mguf < 10) mguf = "0" + mguf;
                    if (mguf != mguf_old) {
                        //document.getElementById("mguf").innerHTML = mguf;
                        set_inner_html("mguf", mguf);
                    }
                    if (donnees.mgum != mgum_old) {
                        if (donnees.mgum == 0) {  // on est en manuel
                            //document.getElementById("mgua").innerHTML = "Man.";
                            set_inner_html("mgua", "Man.");
                        } else if (donnees.mgum == 2) {  // on est en Qualy
                            //document.getElementById("mgua").innerHTML = "Qual";
                            set_inner_html("mgua", "Qual");
                        } else {  // on est en auto
                            //document.getElementById("mgua").innerHTML = "Auto";
                            set_inner_html("mgua", "Auto");
                        }
                        if (donnees.mgum != undefined) {
                            if (donnees.mgum == 0) {  // si on est en manuel
                                change_bg("mguf", "#ffffff", advanced["bg_" + "mguf" + "_" + advanced["display_selected"]]);
                            } else {  // si on est en auto
                                change_bg("mguf", "#555555", advanced["bg_" + "mguf" + "_" + advanced["display_selected"]]);
                            }
                        }
                    }
                    mguf_old = mguf;
                    mgum_old = donnees.mgum;
                }
                if (donnees.ers != undefined && advanced["disp_" + "ers" + disp_sel]) {
                    //document.getElementById("ers").innerHTML = donnees.ers.toFixed(hybrid_decimal);  //
                    set_inner_html("ers", donnees.ers.toFixed(hybrid_decimal));
                    //document.getElementById("ers_bar_").style.top = (100 - donnees.ers) + "%";
                    set_style_top("ers_bar_", (100 - donnees.ers) + "%");
                    if (donnees.ers != ers_old) {
                        if (donnees.nee) {  // si pas assez d'energie
                            ers_bg = "#888888";
                        } else if (donnees.s <= speed_old && donnees.nee == 0 && donnees.ers > 99.9) {
                            ers_bg = "#ff00ff";
                        } else {
                            ers_bg = "#ff0000";
                        }
                        if (ers_bg != ers_bg_old) {
                            //document.getElementById("ers").style.backgroundColor = ers_bg;
                            set_style_bg("ers", ers_bg);
                            if (ers_bg != "888888") {
                                regen_col = ers_bg;
                            } else {
                                regen_col = "#ff0000";
                            }
                            //document.getElementById("regen_turn").style.color = regen_col;
                            set_style_color("regen_turn", regen_col);
                        }
                        ers_bg_old = ers_bg;
                    }
                    ers_old = donnees.ers;
                }
                if (donnees.ersco != undefined) {
                    signe = "";
                    if (donnees.ersco >= 0) {
                        signe = "+";
                    }
                    //document.getElementById("ersco").innerHTML = signe + donnees.ersco.toFixed(hybrid_decimal);  //
                    set_inner_html("ersco", signe + donnees.ersco.toFixed(hybrid_decimal));
                }
                if (donnees.ers_margin != undefined && advanced["disp_" + "ers_margin" + disp_sel]) {
                    signe = "";
                    if (donnees.ers_delta >= 0) {
                        signe = "+";
                    }
                    //donnees.ers_margin = 50;
                    //donnees.ers_margin_free = 25;
                    //donnees.mgu_margin = 50;
                    //donnees.ers_delta = -99.9;
                    if (donnees.ers_margin > -100) {
                        // Cette mini barre indique à combien de % l'ers sera au mini par rapport au dernier tour
                        if (donnees.ers_margin_free > 0) {
                            tmp_ers_margin = donnees.ers_margin;
                            if (tmp_ers_margin < 0) tmp_ers_margin = 0;
                            tmp_ers_margin_tot = tmp_ers_margin + donnees.ers_margin_free;
                            if (tmp_ers_margin_tot > 100) tmp_ers_margin_tot = 100;
                            document.getElementById("ers_margin_free_bar_").style.left = tmp_ers_margin + "%";
                            document.getElementById("ers_margin_free_bar_").style.right = (100 - tmp_ers_margin_tot) + "%";
                        } else {
                            document.getElementById("ers_margin_free_bar_").style.left = 100 + "%";
                            document.getElementById("ers_margin_free_bar_").style.right = 0 + "%";
                        }
                        if (donnees.ers_margin < 0) {
                            document.getElementById("ers_margin_min_bar_").style.right = 0 + "%";
                            document.getElementById("ers_margin_min_bar_").style.left = (100 + donnees.ers_margin) + "%";
                            //document.getElementById("ers_margin_min_bar_").style.backgroundColor = "#ffff00";
                            set_style_bg("ers_margin_min_bar_", "#ffff00");
                        } else {
                            document.getElementById("ers_margin_min_bar_").style.left = 0 + "%";
                            document.getElementById("ers_margin_min_bar_").style.right = (100 - donnees.ers_margin) + "%";
                            //document.getElementById("ers_margin_min_bar_").style.backgroundColor = "#ff0000";
                            set_style_bg("ers_margin_min_bar_", "#ff0000");
                        }
                        if (donnees.mgu_margin < 0) {
                            document.getElementById("mgu_margin_max_bar_").style.right = 0 + "%";
                            document.getElementById("mgu_margin_max_bar_").style.left = (100 + donnees.mgu_margin) + "%";
                            //document.getElementById("mgu_margin_max_bar_").style.backgroundColor = "#ffffff";
                            set_style_bg("mgu_margin_max_bar_", "#ffffff");
                        } else {
                            document.getElementById("mgu_margin_max_bar_").style.left = 0 + "%";
                            document.getElementById("mgu_margin_max_bar_").style.right = (100 - donnees.mgu_margin) + "%";
                            //document.getElementById("mgu_margin_max_bar_").style.backgroundColor = "#00ff00";
                            set_style_bg("mgu_margin_max_bar_", "#00ff00");
                        }
                    } else {
                        document.getElementById("ers_margin_min_bar_").style.right = 100 + "%";
                        document.getElementById("mgu_margin_max_bar_").style.right = 100 + "%";
                        document.getElementById("ers_margin_free_bar_").style.left = 100 + "%";
                        document.getElementById("ers_margin_free_bar_").style.right = 0 + "%";
                    }
                    if (donnees.ers_delta > -100) {
                        //document.getElementById("ers_margin").innerHTML = signe + (donnees.ers_delta).toFixed(hybrid_decimal);
                        set_inner_html("ers_margin", signe + (donnees.ers_delta).toFixed(hybrid_decimal));
                    } else {
                        //document.getElementById("ers_margin").innerHTML = "--";
                        set_inner_html("ers_margin", "--");
                    }
                    if (donnees.boost_manu != boost_manu_old || donnees.ref_ok != ref_ok_old) {
                        if (donnees.ref_ok == 0) {
                            //document.getElementById("ers_margin").style.backgroundColor = "#000000";
                            set_style_bg("ers_margin", "#000000");
                        } else if (donnees.ref_ok == 2) {
                            //document.getElementById("ers_margin").style.backgroundColor = "#ffffff";
                            set_style_bg("ers_margin", "#ffffff");
                        } else if (donnees.boost_manu == 1) {  // boost activé manuellement en dehors du déployment normal du mode choisi
                            //document.getElementById("ers_margin").style.backgroundColor = "#ff8800";
                            set_style_bg("ers_margin", "#ff8800");
                            //document.getElementById("ers_margin").style.color = "#00d9ff";
                            set_style_color("ers_margin", "#00d9ff");
                        } else {
                            //document.getElementById("ers_margin").style.backgroundColor = "#0088ff";
                            set_style_bg("ers_margin", "#0088ff");
                            //document.getElementById("ers_margin").style.color = "#ffffff";
                            set_style_color("ers_margin", "#ffffff");
                        }
                    }
                    boost_manu_old = donnees.boost_manu;
                    ref_ok_old = donnees.ref_ok;
                }
                if (donnees.mgul != undefined) {
                    //document.getElementById("mgul").innerHTML = donnees.mgul.toFixed(hybrid_decimal);
                    set_inner_html("mgul", donnees.mgul.toFixed(hybrid_decimal));
                    // On change ensuite la couleur de fond si l'énergie est utilisée
                    // On ne change le fond que si la valeur a changée pour optimiser les performances graphiques
                    if (donnees.boost != boost_old) {
                        if (donnees.boost) {
                            //document.getElementById("mgul").style.backgroundColor = "#00d9ff";
                            set_style_bg("mgul", "#00d9ff");
                            //document.getElementById("mgul").style.color = "#ff8800";
                            set_style_color("mgul", "#ff8800");
                        } else {
                            //document.getElementById("mgul").style.backgroundColor = "#00ff00";
                            set_style_bg("mgul", "#00ff00");
                            //document.getElementById("mgul").style.color = "#000000";
                            set_style_color("mgul", "#000000");
                        }
                    }
                    if (donnees.boost_off != boost_off_old) {
                        if (donnees.boost_off) {
                            //document.getElementById("mgul").style.backgroundColor = "#666666";
                            set_style_bg("mgul", "#666666");
                            //document.getElementById("mgul").style.color = "#333333";
                            set_style_color("mgul", "#333333");
                        } else {
                            //document.getElementById("mgul").style.backgroundColor = "#00ff00";
                            set_style_bg("mgul", "#00ff00");
                            //document.getElementById("mgul").style.color = "#000000";
                            set_style_color("mgul", "#000000");
                        }
                    }
                    boost_old = donnees.boost;
                    boost_off_old = donnees.boost_off;
                }
                if (donnees.mgu != undefined) {
                    if (donnees.mgu != 0)
                        //document.getElementById("mgu").innerHTML = donnees.mgu.toFixed(hybrid_decimal);
                        set_inner_html("mgu", donnees.mgu.toFixed(hybrid_decimal));
                    else
                        //document.getElementById("mgu").innerHTML = "--";
                        set_inner_html("mgu", "--");
                }
            }
        }
        if (carname in car_with_drs) {
            if (advanced["disp_" + "drs" + disp_sel] || advanced["disp_" + "gear" + disp_sel]) {
                if (carname == "formularenault35" && donnees.drs_c != undefined) {
                    if (donnees.drs_c != drs_c_old) {
                        if (donnees.styp == "Race") {
                            //document.getElementById("drs").innerHTML = (8 - donnees.drs_c).toFixed(0);
                            set_inner_html("drs", (8 - donnees.drs_c).toFixed(0));
                        } else {
                            //document.getElementById("drs").innerHTML = (donnees.drs_c).toFixed(0);
                            set_inner_html("drs", (donnees.drs_c).toFixed(0));
                        }
                    }
                    drs_c_old = donnees.drs_c;
                }
                if (donnees.drs != undefined) {
                    if (donnees.drs == 0) {
                        //document.getElementById("drs").style.backgroundColor = "#000000";
                        change_bg("drs", "#000000", advanced["bg_" + "drs" + "_" + advanced["display_selected"]]);
                        //document.getElementById("drs").style.color = "#333333";
                        set_style_color("drs", "#333333");
                    }
                    if (donnees.drs == 1) {
                        //document.getElementById("drs").style.backgroundColor = "#000000";
                        change_bg("drs", "#000000", advanced["bg_" + "drs" + "_" + advanced["display_selected"]]);
                        //document.getElementById("drs").style.color = "#ffffff";
                        set_style_color("drs", "#ffffff");
                        //document.getElementById("gear").style.backgroundColor = "#000000";
                        change_bg("gear", "#000000", advanced["bg_" + "gear" + "_" + advanced["display_selected"]]);
                        //document.getElementById("gear").style.color = "#ffffff";
                        set_style_color("gear", "#ffffff");
                    }
                    if (donnees.drs == 2) {
                        //document.getElementById("drs").style.backgroundColor = "#ffffff";
                        change_bg("drs", "#ffffff", advanced["bg_" + "drs" + "_" + advanced["display_selected"]]);
                        //document.getElementById("drs").style.color = "#00dd00";
                        set_style_color("drs", "#00dd00");
                        //document.getElementById("gear").style.backgroundColor = "#ffffff";
                        change_bg("gear", "#ffffff", advanced["bg_" + "gear" + "_" + advanced["display_selected"]]);
                        //document.getElementById("gear").style.color = "#00dd00";
                        set_style_color("gear", "#00dd00");
                    }
                    if (donnees.drs == 3) {
                        //document.getElementById("drs").style.backgroundColor = "#00dd00";
                        change_bg("drs", "#00dd00", advanced["bg_" + "drs" + "_" + advanced["display_selected"]]);
                        //document.getElementById("drs").style.color = "#ee00aa";
                        set_style_color("drs", "#ee00aa");
                        //document.getElementById("gear").style.backgroundColor = "#00dd00";
                        change_bg("gear", "#00dd00", advanced["bg_" + "gear" + "_" + advanced["display_selected"]]);
                        //document.getElementById("gear").style.color = "#ee00aa";
                        set_style_color("gear", "#ee00aa");
                    }
                }
            }

        }


        tmp_list = [
            "arb_f",
            "arb_r",
            "powersteering",
            "regen_gain",
            "fuel_mixture",
            "eng_pw",
            "peak_bb",
            "diff_preload",
            "diff_entry",
            "wj",
            "abs",
            "boo",
            "t_sh",
        ];
        for (var i in tmp_list) {
            tmp_name = tmp_list[i];
            if (advanced["disp_" + tmp_name + disp_sel]) {
                if (donnees[tmp_name] != undefined) {
                    set_inner_html(tmp_name, donnees[tmp_name]);
                } else {
                    set_inner_html(tmp_name, "--");
                }
            }
        }


        if (advanced["disp_" + "me_p2p" + disp_sel] && donnees.me_p2p_count != undefined) {
            if (donnees.me_p2p_count != -1) {
                //document.getElementById("me_p2p").innerHTML = donnees.me_p2p_count;
                set_inner_html("me_p2p", donnees.me_p2p_count);
            } else {
                //document.getElementById("me_p2p").innerHTML = "--";
                set_inner_html("me_p2p", "--");
            }
            if (donnees.me_p2p_status != undefined && donnees.me_p2p_status == 1) {
                //document.getElementById("me_p2p").style.backgroundColor = '#bb77ff';
                set_style_bg("me_p2p", '#bb77ff');
            } else {
                //document.getElementById("me_p2p").style.backgroundColor = 'black';
                set_style_bg("me_p2p", 'black');
            }
        }
        if (donnees.styp == "Race" && (f3_mode_in_race_dashboard == 0 && f3_mode_for_pre == 0)) {
            if (advanced["disp_" + "pre_p2p" + disp_sel] && donnees.pre_p2p_count != undefined) {
                if (donnees.pre_p2p_count != -1) {
                    //document.getElementById("pre_p2p").innerHTML = donnees.pre_p2p_count;
                    set_inner_html("pre_p2p", donnees.pre_p2p_count);
                } else {
                    //document.getElementById("pre_p2p").innerHTML = "--";
                    set_inner_html("pre_p2p", "--");
                }
                if (donnees.pre_p2p_status != undefined && donnees.pre_p2p_status == 1) {
                    //document.getElementById("pre_p2p").style.backgroundColor = '#bb77ff';
                    set_style_bg("pre_p2p", '#bb77ff');
                } else {
                    //document.getElementById("pre_p2p").style.backgroundColor = 'black';
                    set_style_bg("pre_p2p", 'black');
                }
            }
        } else {
            if (advanced["disp_" + "pre_p2p" + disp_sel] && donnees.pre_p2p_count_f3 != undefined) {
                if (donnees.pre_p2p_count_f3 != -1) {
                    //document.getElementById("pre_p2p").innerHTML = donnees.pre_p2p_count_f3;
                    set_inner_html("pre_p2p", donnees.pre_p2p_count_f3);
                } else {
                    //document.getElementById("pre_p2p").innerHTML = "--";
                    set_inner_html("pre_p2p", "--");
                }
                if (donnees.pre_p2p_status_f3 != undefined && donnees.pre_p2p_status_f3 == 1) {
                    //document.getElementById("pre_p2p").style.backgroundColor = '#bb77ff';
                    set_style_bg("pre_p2p", '#bb77ff');
                } else {
                    //document.getElementById("pre_p2p").style.backgroundColor = 'black';
                    set_style_bg("pre_p2p", 'black');
                }
            }
        }
        if (donnees.styp == "Race" && f3_mode_in_race_dashboard == 0) {
            if (advanced["disp_" + "post_p2p" + disp_sel] && donnees.post_p2p_count != undefined) {
                if (donnees.post_p2p_count != -1) {
                    //document.getElementById("post_p2p").innerHTML = donnees.post_p2p_count;
                    set_inner_html("post_p2p", donnees.post_p2p_count);
                } else {
                    //document.getElementById("post_p2p").innerHTML = "--";
                    set_inner_html("post_p2p", "--");
                }
                if (donnees.post_p2p_status != undefined && donnees.post_p2p_status == 1) {
                    //document.getElementById("post_p2p").style.backgroundColor = '#bb77ff';
                    set_style_bg("post_p2p", '#bb77ff');
                } else {
                    //document.getElementById("post_p2p").style.backgroundColor = 'black';
                    set_style_bg("post_p2p", 'black');
                }
            }
        } else {
            if (advanced["disp_" + "post_p2p" + disp_sel] && donnees.post_p2p_count_f3 != undefined) {
                if (donnees.post_p2p_count_f3 != -1) {
                    //document.getElementById("post_p2p").innerHTML = donnees.post_p2p_count_f3;
                    set_inner_html("post_p2p", donnees.post_p2p_count_f3);
                } else {
                    //document.getElementById("post_p2p").innerHTML = "--";
                    set_inner_html("post_p2p", "--");
                }
                if (donnees.post_p2p_status_f3 != undefined && donnees.post_p2p_status_f3 == 1) {
                    //document.getElementById("post_p2p").style.backgroundColor = '#bb77ff';
                    set_style_bg("post_p2p", '#bb77ff');
                } else {
                    //document.getElementById("post_p2p").style.backgroundColor = 'black';
                    set_style_bg("post_p2p", 'black');
                }
            }
        }


        // On affiche les valeurs changées (TC, ABS, ...) pendant incar_set_change_delay secondes
        tmp_time = Date.now() / 1000;
        for (tmp_name in tab_setting) {
            if (donnees[tmp_name] != undefined) {
                if (donnees[tmp_name] != setting_[tmp_name]) {
                    if (setting_[tmp_name] != undefined) {
                        setting_changed_time = tmp_time;
                    }
                    setting_changed_name = tab_setting[tmp_name];
                    if (tmp_name == "mgum") {
                        if (donnees[tmp_name] == 0) {
                            setting_changed_value = "Man.";
                        } else if (donnees[tmp_name] == 1) {
                            setting_changed_value = "Auto";
                        } else if (donnees[tmp_name] == 2) {
                            setting_changed_value = "Qual";
                        }
                    } else if (tmp_name == "tc_tog") {
                        if (donnees[tmp_name] == 0) {
                            setting_changed_value = "OFF";
                        } else {
                            setting_changed_value = "ON";
                        }
                    } else if (tmp_name == "svfuel") {
                        setting_changed_value = (fuelfactor * coef_fuel * donnees[tmp_name]).toFixed(1);
                        if (donnees.u == 1) {  // L ou Kg
                            if (coef_fuel ==1) {  // Kg
                                setting_changed_name = "Fuel Add (L)"
                            } else {
                                setting_changed_name = "Fuel Add (Kg)"
                            }
                        } else {  // Ga ou Lb
                            if (coef_fuel ==1) {
                                setting_changed_name = "Fuel Add (Ga)"
                            } else {
                                setting_changed_name = "Fuel Add (Lb)"
                            }
                        }
                    } else {
                        setting_changed_value = donnees[tmp_name];
                    }
                    setting_[tmp_name] = donnees[tmp_name];
                }
            }
        }

        if (tmp_time - setting_changed_time < incar_set_change_delay) {
            document.getElementById("setting_changed_name").style.display = "block" ;
            document.getElementById("setting_changed_value").style.display = "block" ;
            //document.getElementById("setting_changed_name").innerHTML = setting_changed_name;
            set_inner_html("setting_changed_name", setting_changed_name);
            //document.getElementById("setting_changed_value").innerHTML = setting_changed_value;
            set_inner_html("setting_changed_value", setting_changed_value);
        } else {
            document.getElementById("setting_changed_name").style.display = "none" ;
            document.getElementById("setting_changed_value").style.display = "none" ;
        }

        // On change la couleur du texte des données des pneus en fonction du update_telemetry_status
        if (donnees.uts != update_telemetry_status) {
            update_telemetry_status = donnees.uts;
            for (var param1 in {"RR": 1, "RF": 1, "LF": 1, "LR": 1}) {
                for (var param2 in {"pressure": 1, "tempL": 1, "tempM": 1, "tempR": 1, "wearL": 1, "wearM": 1, "wearR": 1}) {
                    if (advanced["disp_" + param1 + param2 + disp_sel]) {
                        if (update_telemetry_status >= 11) {
                            //document.getElementById(param1 + param2).style.color = "#444444";
                            set_style_color(param1 + param2, "#444444");
                        } else {
                            //document.getElementById(param1 + param2).style.color = "white";
                            set_style_color(param1 + param2, "white");
                            if (donnees[param1 + param2] != undefined) {
                                //document.getElementById(param1 + param2).innerHTML = donnees[param1 + param2].toFixed(1);
                                set_inner_html(param1 + param2, donnees[param1 + param2].toFixed(1));
                            } else {
                                //document.getElementById(param1 + param2).innerHTML = "--";
                                set_inner_html(param1 + param2, "--");
                            }
                        }
                    }
                }
            }
        }

        speed_old = donnees.s;

    }

}


function coord_compass(angle, rayon, type) {


    if (type == "wind") {
        coord = {
            1: {'x': -0.25, 'y': -1},
            2: {'x': -0.25, 'y': 0.5},
            3: {'x': -0.5, 'y': 0.5},
            4: {'x': 0, 'y': 1},
            5: {'x': 0.5, 'y': 0.5},
            6: {'x': 0.25, 'y': 0.5},
            7: {'x': 0.25, 'y': -1}
        };
    }
    if (type == "northL") {
        coord = {
            1: {'x': 0, 'y': -1},
            2: {'x': 0.625, 'y': 0.75},
            3: {'x': 0.25, 'y': 0.625},
            4: {'x': 0, 'y': -0.125}
        };
    }
    if (type == "northR") {
        coord = {
            1: {'x': 0, 'y': -1},
            2: {'x': -0.625, 'y': 0.75},
            3: {'x': -0.25, 'y': 0.625},
            4: {'x': 0, 'y': -0.125}
        };
    }

    // On fait la rotation
    coord2 = {};
    for (i in coord) {
        coord2[i] = {};
        coord2[i].x = (coord[i].x * Math.cos(angle) - coord[i].y * Math.sin(angle) + 1) * rayon;
        coord2[i].y = (coord[i].x * Math.sin(angle) + coord[i].y * Math.cos(angle) + 1) * rayon;
    }

    return coord2;
}


function draw(compass, coul, ombrage) {

    if (ombrage == 1) {
        // On met l'Ombrage
        context_compass.shadowColor = "black";
        context_compass.shadowOffsetX = compass_w / 6 / 10;
        context_compass.shadowOffsetY = compass_w / 6 / 10;
        context_compass.shadowBlur = compass_w / 2 / 10;
    }

    context_compass.beginPath(); //On démarre un nouveau tracé.
    context_compass.fillStyle = coul;
    //context_compass.globalCompositeOperation = "destination-out";
    for (i in compass) {
        if (i == 0) {
            context_compass.moveTo(compass[0].x, compass[0].y);
        } else {
            context_compass.lineTo(compass[i].x, compass[i].y);
        }
    }
    context_compass.fill(); //On trace seulement les lignes.
    context_compass.closePath();

    if (ombrage == 1) {
        // On enlève l'ombrage
        context_compass.shadowOffsetX = 0;
        context_compass.shadowOffsetY = 0;
        context_compass.shadowBlur = 0;
        context_compass.inset = 1;
    }

}

function light(bg, col) {
    if (advanced["shiftlight_on"]) {  // Que si le shiftlight est actif
        //document.getElementById("shift").style.backgroundColor = bg;
        set_style_bg("shift", bg);
        //document.getElementById("shift_bg").style.backgroundColor = bg;
        set_style_bg("shift_bg", bg);
        //document.getElementById("gear").style.backgroundColor = bg;
        change_bg("gear", bg, advanced["bg_" + "gear" + "_" + advanced["display_selected"]]);
        //document.getElementById("rpm").style.backgroundColor = bg;
        change_bg("rpm", bg, advanced["bg_" + "rpm" + "_" + advanced["display_selected"]]);
        //document.getElementById("speed").style.backgroundColor = bg;
        change_bg("speed", bg, advanced["bg_" + "speed" + "_" + advanced["display_selected"]]);
        //document.getElementById("gear").style.color = col;
        set_style_color("gear", col);
        //document.getElementById("rpm").style.color = col;
        set_style_color("rpm", col);
        //document.getElementById("speed").style.color = col;
        set_style_color("speed", col);
        document.getElementById("shift").style.zIndex = 10;
    }
}

function light_off() {
    document.getElementById("shift").style.zIndex = -1;
    if (transparency_OBS) {
        //document.getElementById("shift").style.backgroundColor = "rgba(0,0,0,0)";
        set_style_bg("shift", "rgba(0,0,0,0)");
        //document.getElementById("shift_bg").style.backgroundColor = "rgba(0,0,0,0)";
        set_style_bg("shift_bg", "rgba(0,0,0,0)");
    } else {
        //document.getElementById("shift").style.backgroundColor = "#000000";
        set_style_bg("shift", "#000000");
        //document.getElementById("shift_bg").style.backgroundColor = "#000000";
        set_style_bg("shift_bg", "#000000");
    }
    //document.getElementById("gear").style.backgroundColor = "#cccccc";
    change_bg("gear", "#cccccc", advanced["bg_" + "gear" + "_" + advanced["display_selected"]]);
    //document.getElementById("rpm").style.backgroundColor = "#cccccc";
    change_bg("rpm", "#cccccc", advanced["bg_" + "rpm" + "_" + advanced["display_selected"]]);
    //document.getElementById("speed").style.backgroundColor = "#444444";
    change_bg("speed", "#444444", advanced["bg_" + "speed" + "_" + advanced["display_selected"]]);
    //document.getElementById("speed").style.color = "#ffffff";
    set_style_color("speed", "#ffffff");
    //document.getElementById("gear").style.color = "#000000";
    set_style_color("gear", "#000000");
    //document.getElementById("rpm").style.color = "#000000";
    set_style_color("rpm", "#000000");
}

function display_rpm() {
    if (display_rpmshift == 0) {
        document.getElementById("display_rpmshift").style.display = "block";
        display_rpmshift = 1;
        /*document.getElementById("display_rpmshift").innerHTML = "";
        for (i in gear_) {
            if (i != "N") {
                document.getElementById("display_rpmshift").innerHTML += "GEAR " + i + " : " + gear_[i].toFixed(0) + "<br>"
            }
        }*/
    } else {
        document.getElementById("display_rpmshift").style.display = "none";
        display_rpmshift = 0;
    }
}
