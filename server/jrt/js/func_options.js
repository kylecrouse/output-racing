function button_events() {

    // Bouton pour scroller le timing vers le haut ou le bas
    if (donnees.up > scroll_up_nbrequest && broadcast == 0) {  // Pour les clients du broadcast, le mode ne changera pas si le pilote change son mode
        //console.log("scroll_up", scroll_up_nbrequest);
        document.getElementById("container").scrollTop += (donnees.up - scroll_up_nbrequest) * Math.floor(coef_ligne * ligne_h / dpi_factor_);
        scroll_up_nbrequest = donnees.up;
    }
    if (donnees.down > scroll_down_nbrequest && broadcast == 0) {  // Pour les clients du broadcast, le mode ne changera pas si le pilote change son mode
        //console.log("scroll_down", scroll_down_nbrequest);
        document.getElementById("container").scrollTop -= (donnees.down - scroll_down_nbrequest) * Math.floor(coef_ligne * ligne_h / dpi_factor_);
        scroll_down_nbrequest = donnees.down;
    }

    // Bouton pour switcher au mode F3 box
    if (donnees.f3 > switch_f3box_nbrequest && broadcast == 0) {  // Pour les clients du broadcast, le mode ne changera pas si le pilote change son mode
        if ((donnees.f3 - switch_f3box_nbrequest) % 2 != 0) { // On vérifie qu'on n'a pas appuyé un nombre pair de fois
            if (f3_box == 0) {
                f3_box = 1;
                document.getElementById("opt_f3_box").checked = true;
                //class_selected = 0;
                classement_old = classement;
                selected_idx_before_f3 = selected_idxjs;
                selected_idxjs = selected_idx;  // le mode f3 ne fonctionne que pour le pilote sélectionné dans le jeu
            } else {
                f3_box = 0;
                document.getElementById("opt_f3_box").checked = false;
                classement = classement_old;
                selected_idxjs = selected_idx_before_f3;
                sort(classement);
                for (k in donnees.d) clt_old[k] = clt[k]
            }
        }
        switch_f3box_nbrequest = donnees.f3;
    }

    // Bouton pour afficher la trackmap
    if (donnees.trm > trackmap_nbrequest && broadcast == 0) {  // Pour les clients du broadcast, le mode ne changera pas si le pilote change son mode
        if ((donnees.trm - trackmap_nbrequest) % 2 != 0) { // On vérifie qu'on n'a pas appuyé un nombre pair de fois
            if (disp_trackmap == 0) {
                disp_trackmap = 1;
                document.getElementById('trackmap').style.display='block';
                document.getElementById('trackmap_bg').style.display='block'
            } else {
                disp_trackmap = 0;
                document.getElementById('trackmap').style.display='none';
                document.getElementById('trackmap_bg').style.display='none'
            }
        }
        trackmap_nbrequest = donnees.trm;
    }
}


function scroll_to_selected_idxjs() {
    // Calcul du nombre de lignes affichées au-dessus du pilote sélectionné
    if (autoscroll && selected_idxjs_scrollpos != -1) {
        tmp_container_height = parseInt($("#container").css("height"));
        tmp_container_margin_top = parseInt($("#container").css("margin-top"));
        if (autoscroll_mode == 1 || autoscroll_mode == 3 || f3_box == 1) {
            n = Math.floor(( (tmp_container_height + tmp_container_margin_top) / Math.floor(coef_ligne * ligne_h / dpi_factor_)) / 2);
        } else {
            n = Math.floor(( (tmp_container_height + tmp_container_margin_top) / Math.floor(coef_ligne * ligne_h / dpi_factor_))) - 1;
        }
        //document.getElementById("container").scrollTop = selected_idxjs_scrollpos - n * Math.floor(coef_ligne * ligne_h);

        //$("#container").scrollTop(selected_idxjs_scrollpos - n * Math.floor(coef_ligne * ligne_h));
        tmp_container_top = selected_idxjs_scrollpos - n * Math.floor(coef_ligne * ligne_h / dpi_factor_);
        if (tmp_container_top < 0 && autoscroll_mode == 3) {
            $("#container").scrollTop(0);
            $("#container").css("margin-top", -tmp_container_top + "px");
        } else {
            $("#container").scrollTop(tmp_container_top);
            $("#container").css("margin-top", "0px");
        }
        //console.log(selected_idxjs_scrollpos, n, selected_idxjs_scrollpos - n * Math.floor(coef_ligne * ligne_h / dpi_factor_))
    } else {
        $("#container").css("margin-top", "0px");
    }
    //document.body.scrollLeft = 0;  // REM : gourmand en ressources
}


function opt_standing_filter2(car) {
    if (car =="all") {
        for (c in cars_list) {
            cars_list[c] = 1;
            document.getElementById("opt_" + c).checked = true
        }
    } else {
        for (c in cars_list) {
            if (c == car) {
                cars_list[c] = 1;
                document.getElementById("opt_" + c).checked = true
            } else {
                cars_list[c] = 0;
                document.getElementById("opt_" + c).checked = false
            }
        }
    }
    var filtered = false;
    for (c in cars_list) {
        if (cars_list[c] == 0) {  // Si on a filtré les voiture
            filtered = true;
        }
    }
    if (filtered) {
        document.getElementById("opt_all").checked = false;
        // On désactive l'autoscroll
        autoscroll = 0;
        document.getElementById("opt_autoscroll").checked = false;
        $("#container").scrollTop(0);
    } else {
        document.getElementById("opt_all").checked = true;
    }
    update_datas(-1);
}


function opt_standing_filter(elt, car) {
    if (car =="all") {
        if (elt.checked) {
            for (c in cars_list) {
                cars_list[c] = 1;
                document.getElementById("opt_" + c).checked = true
            }
        }
    } else {
        if (elt.checked) {
            cars_list[car] = 1
        } else {
            cars_list[car] = 0;
        }
    }
    var filtered = false;
    for (c in cars_list) {
        if (cars_list[c] == 0) {  // Si on a filtré les voiture
            filtered = true;
        }
    }
    if (filtered) {
        document.getElementById("opt_all").checked = false;
        // On désactive l'autoscroll
        autoscroll = 0;
        document.getElementById("opt_autoscroll").checked = false;
        $("#container").scrollTop(0);
    } else {
        document.getElementById("opt_all").checked = true;
    }
    update_datas(-1);
}


function opt_autoscroll(elt) {
    if (elt.checked) {
        autoscroll = 1
    } else {
        autoscroll = 0;
        if (f3_box == 1) { // autoscroll obligatoire en mode f3
            autoscroll = 1;
            document.getElementById("opt_autoscroll").checked = true;
        }
    }
}


function opt_tires_buttons(elt) {
    if (elt.checked) {
        tires_buttons = 1;
        document.getElementById("tires").style.display = "block"
    } else {
        tires_buttons = 0;
        document.getElementById("tires").style.display = "none"
    }
}


function opt_f3_box(elt) {
    if (elt.checked) {
        f3_box = 1;
        selected_idx_before_f3 = selected_idxjs;
        autoscroll = 1; // autoscroll obligatoire
        document.getElementById("opt_autoscroll").checked = true;
        //class_selected = 0;
        update_datas(-1);
        classement_old = classement;
        selected_idxjs = selected_idx;  // le mode f3 ne fonctionne que pour le pilote sélectionné dans le jeu
    } else {
        f3_box = 0;
        classement = classement_old;
        selected_idxjs = selected_idx_before_f3;
        sort(classement);
        for (k in donnees.d) clt_old[k] = clt[k]
    }
}


function opt_events_filter2(event_type) {
    if (event_type =="all") {
        for (c in type_events_list) {
            type_events_list[c] = 1;
            document.getElementById("opt_events_filter_" + c).checked = true
        }
    } else {
        for (c in type_events_list) {
            if (c == event_type) {
                type_events_list[c] = 1;
                document.getElementById("opt_events_filter_" + c).checked = true
            } else {
                type_events_list[c] = 0;
                document.getElementById("opt_events_filter_" + c).checked = false
            }
        }
    }
    var filtered = false;
    for (c in type_events_list) {
        if (type_events_list[c] == 0) {  // Si on a filtré les voiture
            //console.log(c)
            filtered = true;
        }
    }
    if (filtered) {
        document.getElementById("opt_events_filter_all").checked = false;
    } else {
        document.getElementById("opt_events_filter_all").checked = true;
    }

    events_ticker_disp_pits = type_events_list["PIT Entry or Exit"];
    events_ticker_disp_pits_me = type_events_list["PIT Entry or Exit (only selected driver)"];
    events_ticker_disp_newbest = type_events_list["New Best Laptime in a Class"];
    events_ticker_disp_newleader = type_events_list["New Leader in a Class"];
    events_ticker_disp_driverswap = type_events_list["Driver Swap"];
    events_ticker_disp_driverswap_me = type_events_list["Driver Swap (only selected driver)"];
    events_ticker_disp_overtake = type_events_list["Overtake"];
    events_ticker_disp_flags = type_events_list["Flags"];
    events_ticker_disp_custom = type_events_list["Custom Events"];
    events_ticker_disp_overtake_me = type_events_list["Overtake (only selected driver)"];
    events_ticker_disp_incidents = type_events_list["Incidents"];
    events_ticker_disp_incidents_me = type_events_list["My incidents"];
    events_ticker_disp_three_wide = type_events_list["3-wide & 4-wide"];

    // On recharge les events pour le ticker
    reload_ticker_events();
}


function opt_events_filter(elt, event_type) {
    if (event_type =="all") {
        if (elt.checked) {
            for (c in type_events_list) {
                type_events_list[c] = 1;
                document.getElementById("opt_events_filter_" + c).checked = true
            }
        }
    } else {
        if (elt.checked) {
            type_events_list[event_type] = 1
        } else {
            type_events_list[event_type] = 0;
        }
    }
    var filtered = false;
    for (c in type_events_list) {
        if (type_events_list[c] == 0) {  // Si on a filtré les voiture
            filtered = true;
        }
    }
    if (filtered) {
        document.getElementById("opt_events_filter_all").checked = false;
    } else {
        document.getElementById("opt_events_filter_all").checked = true;
    }

    events_ticker_disp_pits = type_events_list["PIT Entry or Exit"];
    events_ticker_disp_pits_me = type_events_list["PIT Entry or Exit (only selected driver)"];
    events_ticker_disp_newbest = type_events_list["New Best Laptime in a Class"];
    events_ticker_disp_newleader = type_events_list["New Leader in a Class"];
    events_ticker_disp_driverswap = type_events_list["Driver Swap"];
    events_ticker_disp_driverswap_me = type_events_list["Driver Swap (only selected driver)"];
    events_ticker_disp_overtake = type_events_list["Overtake"];
    events_ticker_disp_flags = type_events_list["Flags"];
    events_ticker_disp_custom = type_events_list["Custom Events"];
    events_ticker_disp_overtake_me = type_events_list["Overtake (only selected driver)"];
    events_ticker_disp_incidents = type_events_list["Incidents"];
    events_ticker_disp_incidents_me = type_events_list["My incidents"];
    events_ticker_disp_three_wide = type_events_list["3-wide & 4-wide"];

    // On recharge les events pour le ticker
    reload_ticker_events();
}


function calc_disp_col_for_events(e) {
    // Couleur par défaut
    col_e = "#d9d9d9";
    fw_e = "normal";
    // chrono par default
    chrono_e = 0;
    // On vérifie si le type d'event doit être affiché
    tmp_disp = false;

    if ((events[e].event_type == "Pit Entry" || events[e].event_type == "Pit Exit") && events_ticker_disp_pits) {
        tmp_disp = true;
        col_e = "#ff8800";
    }
    if (donnees.d != undefined) {
        if (selected_idxjs in donnees.d) {
            if ((events[e].event_type == "Pit Entry" || events[e].event_type == "Pit Exit") && (events_ticker_disp_pits_me || events_ticker_disp_pits) && events[e].message.includes("#" + donnees.d[selected_idxjs].num + " ")) {
                tmp_disp = true;
                col_e = "#ff8800";
                if (events[e].event_type == "Pit Exit") {
                    if (session_time_pit_exit_me != 0) {
                        chrono_e = events[e].session_time - session_time_pit_exit_me;
                    }
                    session_time_pit_exit_me = events[e].session_time;
                }
                if (events[e].event_type == "Pit Entry") {
                    if (session_time_pit_entry_me != 0) {
                        chrono_e = events[e].session_time - session_time_pit_entry_me;
                    }
                    session_time_pit_entry_me = events[e].session_time;
                }
            }
        } else if (donnees.me in donnees.d) {
            if ((events[e].event_type == "Pit Entry" || events[e].event_type == "Pit Exit") && (events_ticker_disp_pits_me || events_ticker_disp_pits) && events[e].message.includes("#" + donnees.d[donnees.me].num + " ")) {
                tmp_disp = true;
                col_e = "#ff8800";
                if (events[e].event_type == "Pit Exit") {
                    if (session_time_pit_exit_me != 0) {
                        chrono_e = events[e].session_time - session_time_pit_exit_me;
                    }
                    session_time_pit_exit_me = events[e].session_time;
                }
                if (events[e].event_type == "Pit Entry") {
                    if (session_time_pit_entry_me != 0) {
                        chrono_e = events[e].session_time - session_time_pit_entry_me;
                    }
                    session_time_pit_entry_me = events[e].session_time;
                }
            }
        }
    }
    if (events[e].event_type == "Best Lap" && events_ticker_disp_newbest) {
        tmp_disp = true;
        col_e = "#ff66ff";
    }
    if (events[e].event_type == "New Leader" && events_ticker_disp_newleader) {
        tmp_disp = true;
        col_e = "#ffffff";
    }
    if (events[e].event_type == "Driver Swap" && events_ticker_disp_driverswap) {
        tmp_disp = true;
    }
    if (donnees.d != undefined) {
        if (selected_idxjs in donnees.d) {
            if ((events[e].event_type == "Driver Swap") && (events_ticker_disp_driverswap_me || events_ticker_disp_driverswap) && events[e].message.includes("#" + donnees.d[selected_idxjs].num + ":")) {
                tmp_disp = true;
                if (session_time_driverswap_me != 0) {
                    chrono_e = events[e].session_time - session_time_driverswap_me;
                }
                session_time_driverswap_me = events[e].session_time;
            }
        } else if (donnees.me in donnees.d) {
            if ((events[e].event_type == "Driver Swap") && (events_ticker_disp_driverswap_me || events_ticker_disp_driverswap) && events[e].message.includes("#" + donnees.d[donnees.me].num + ":")) {
                tmp_disp = true;
                if (session_time_driverswap_me != 0) {
                    chrono_e = events[e].session_time - session_time_driverswap_me;
                }
                session_time_driverswap_me = events[e].session_time;
            }
        }
    }
    if (events[e].event_type == "Overtake" && events_ticker_disp_overtake) {
        tmp_disp = true;
    }
    if (events[e].event_type == "Checkered Flag" && events_ticker_disp_flags) {
        tmp_disp = true;
        col_e = "#ffffff";
    }
    if (events[e].event_type == "Green Flag" && events_ticker_disp_flags) {
        tmp_disp = true;
        col_e = "#00ff00";
    }
    if (events[e].event_type == "Yellow Flag" && events_ticker_disp_flags) {
        tmp_disp = true;
        col_e = "#ffff00";
    }
    if (events[e].event_type == "Custom Event" && events_ticker_disp_custom) {
        tmp_disp = true;
        col_e = "#ff0000";
        fw_e = "bold";
        if (session_time_custom != 0) {
            chrono_e = events[e].session_time - session_time_custom;
        }
        session_time_custom = events[e].session_time;
    }
    if ((events[e].event_type == "3-wide" || events[e].event_type == "4-wide") && events_ticker_disp_three_wide) {
        tmp_disp = true;
        col_e = "#00bbff";
    }
    if (donnees.d != undefined) {
        if (selected_idxjs in donnees.d) {
            if (events[e].event_type == "Overtake" && events_ticker_disp_overtake_me && events[e].message.includes("#" + donnees.d[selected_idxjs].num + " ")) {
                tmp_disp = true;
            }
        } else if (donnees.me in donnees.d) {
            if (events[e].event_type == "Overtake" && events_ticker_disp_overtake_me && events[e].message.includes("#" + donnees.d[donnees.me].num + " ")) {
                tmp_disp = true;
            }
        }
    }
    if (events[e].event_type == "Incident" && events_ticker_disp_incidents) {
        tmp_disp = true;
        col_e = "#00b300";
    }
    if (donnees.d != undefined) {
        if (donnees.me in donnees.d) {
            if (events[e].event_type == "Incident" && events_ticker_disp_incidents_me && events[e].message.includes("#" + donnees.d[donnees.me].num + " ")) {
                tmp_disp = true;
                col_e = "#00b300";
            }
        }
    }

    tmp_return = {
        "disp": tmp_disp,
        "col_e": col_e,
        "fw_e": fw_e,
        "chrono_e": " <b>" + reformat_chrono(chrono_e) + "</b> since previous " + events[e].event_type
    }
    if (chrono_e == 0) tmp_return["chrono_e"] = "";

    return tmp_return;

}

function reload_ticker_events() {

    // On réinitialise le session_time pour les chronos
    init_session_time_event();

    if (broadcast <= 1) {
        nb_e = 0;
        cont_html = "";
        for (var e in events) {

            tmp_return = calc_disp_col_for_events(e);
            tmp_disp = tmp_return["disp"];
            col_e = tmp_return["col_e"];
            fw_e = tmp_return["fw_e"];
            chrono_e = tmp_return["chrono_e"];

            if (tmp_disp) {
                nb_e++;
                cont_html = events[e].message + chrono_e + "</span><br>" + cont_html;
                cont_html = "<b>" + events[e].event_type + "</b> : " + cont_html;
                cont_html = "&nbsp;<span style='cursor:pointer' onclick ='go_replay(" + events[e].id + ");'><b><i>GO</i></b></span> - <span style='color:" + col_e + ";font-weight:" + fw_e + "'>" + reformat_time(Math.round(events[e].session_time)) + " - " + cont_html;
            }
        }
        document.getElementById("events_ticker").innerHTML = cont_html;
    } else {
        cont_html = "";
        nb_e = 0;
        for (e = 0; e < events.length; e++) {
            //for (e = 0; e < 250; e++) {  // on limite aux 250 derniers évènements pour ne pas planter le navigateur
            if (e in events) {
                //nb_e += 1;
                /*if (nb_e >= 250) {  // on limite aux 250 derniers évènements pour ne pas planter le navigateur
                 break;
                 }*/

                tmp_return = calc_disp_col_for_events(e);
                tmp_disp = tmp_return["disp"];
                col_e = tmp_return["col_e"];
                fw_e = tmp_return["fw_e"];
                chrono_e = tmp_return["chrono_e"];

                if (tmp_disp) {
                    nb_e++;
                    cont_html += "&nbsp;<span style='color:" + col_e + ";font-weight:" + fw_e + "'>" + reformat_time(Math.round(events[e].session_time)) + " - ";
                    cont_html += "<b>" + events[e].event_type + "</b> : ";
                    cont_html += events[e].message + chrono_e + "</span><br>";
                }
            }
        }
        document.getElementById("events_ticker").innerHTML = cont_html;
    }


}