// Joel Real Timing
// timing.js

function charge_official_results() {
    this.document.location.href = "http://members.iracing.com/membersite/member/EventResult.do?&subsessionid=" + donnees.sid;
}

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

function go_replay(event_id) {
    //console.log(Math.floor(sessiontime * 1000));
    if (broadcast == 0) {
        ws.send("go_replay;" + event_id)
    }
    /*if (broadcast == 1) {
        ws3.send("go_replay;" + event_id)
    }*/
}

function reformat_time(time) {
    if (time != "unlimited") {
        if (time < 167*3600) {
            heu = Math.floor(time / 3600);
            min = Math.floor((time - 3600 * heu) / 60);
            sec = Math.floor(time - 3600 * heu - 60 * min);
            if (min < 10) min = "0" + min;
            if (sec < 10) sec = "0" + sec;
            t = heu + ":" + min + ":" + sec;
            return t
        } else {
            return "--"
        }
    } else {
        return time
    }
}

function color(laptype) {
    var color = "#000000";
    if (laptype == 1)
        color = "#dd7700";
    if (laptype == 2)
        color = "#009900";
    if (laptype == 3)
        color = "#777777";
    if (laptype == 4)
        color = "#ffff00";
    return color;
}

// On ajoute un espace insécable si le lapnum est inférieur à 10
function pad_lapnum(lapnum) {
    if (lapnum < 10) {
        lapnum = "&nbsp;&nbsp;" + lapnum;
    }
    return lapnum;
}

function calc_avg(idx) {
    // Rappel des laptype :
    // 0 : valide
    // 2 : best
    // 1: PIT (ou OUT)
    // 3 : invalide
    // 4 : drapeau jaune
    // On recalcule les valeurs avg1 et avg2 s'il y a du nouveau

    //console.log("calc_avg", idx);

    if (tab_titres.indexOf("avg1") > -1 || tab_titres.indexOf("avg2") > -1 || tab_titres.indexOf("avg3") > -1) { // on ne calcule les averages que si les colonnes y sont

        if (donnees.d != undefined && idx in donnees.d) {
            // On corrige le lc s'il est resté à zéro
            if (donnees.d[idx]["lc"] != undefined && laptimes_maxlap[idx] != undefined && donnees.d[idx]["lc"] < laptimes_maxlap[idx]) {
                donnees.d[idx]["lc"] = laptimes_maxlap[idx];
            }

            aux_avg_best = 0;
            aux_startlap = 0;
            laptime_avg1_[idx] = 0;  // valeur par défaut
            if (donnees.d[idx]["lc"] >= avg1_nblaps) {
                for (var l = 1; l <= donnees.d[idx]["lc"] - avg1_nblaps + 1; l++) {
                    // Calcul de la moyenne de tours consécutifs
                    aux_sum = 0;
                    aux_valide = 1;
                    for (var n = 0; n < avg1_nblaps; n++) {
                        l2 = l + n;
                        //if ((l2 in laptime_type_[idx]) && (l2 in laptime_[idx]) && (laptime_type_[idx][l2] == 0 || laptime_type_[idx][l2] == 2) && (laptime_[idx][l2] != "--")) {
                        if ((l2 in laptime_type_[idx]) && (l2 in laptime_[idx]) && (laptime_type_[idx][l2] == 0 || laptime_type_[idx][l2] == 2) && laptime_[idx][l2] != "--") {
                            //console.log(laptime_[idx])
                            aux_sum += laptime_[idx][l2];
                        } else {
                            aux_valide = 0;
                            break;
                        }
                    }
                    if (aux_valide && avg1_nblaps > 0) {
                        laptime_avg1_[idx] = aux_sum / avg1_nblaps;
                        startlap_avg1_[idx] = l;
                        // On calcule le best
                        if (laptime_avg1_[idx] < aux_avg_best || aux_avg_best == 0) {
                            aux_avg_best = laptime_avg1_[idx];
                            aux_startlap = l;
                        }
                    }
                }
            }
            if (avg1_best) {
                laptime_avg1_[idx] = aux_avg_best;
                startlap_avg1_[idx] = aux_startlap;
            }

            aux_avg_best = 0;
            aux_startlap = 0;
            laptime_avg2_[idx] = 0;  // valeur par défaut
            if (donnees.d[idx]["lc"] >= avg2_nblaps) {
                for (var l = 1; l <= donnees.d[idx]["lc"] - avg2_nblaps + 1; l++) {
                    // Calcul de la moyenne de tours consécutifs
                    aux_sum = 0;
                    aux_valide = 1;
                    for (var n = 0; n < avg2_nblaps; n++) {
                        l2 = l + n;
                        if ((l2 in laptime_type_[idx]) && (l2 in laptime_[idx]) && (laptime_type_[idx][l2] == 0 || laptime_type_[idx][l2] == 2) && laptime_[idx][l2] != "--") {
                            aux_sum += laptime_[idx][l2];
                        } else {
                            aux_valide = 0;
                            break;
                        }
                    }
                    if (aux_valide && avg2_nblaps > 0) {
                        laptime_avg2_[idx] = aux_sum / avg2_nblaps;
                        startlap_avg2_[idx] = l;
                        // On calcule le best
                        if (laptime_avg2_[idx] < aux_avg_best || aux_avg_best == 0) {
                            aux_avg_best = laptime_avg2_[idx];
                            aux_startlap = l;
                        }
                    }
                }
            }
            if (avg2_best) {
                laptime_avg2_[idx] = aux_avg_best;
                startlap_avg2_[idx] = aux_startlap;
            }

            aux_avg_best = 0;
            aux_startlap = 0;
            laptime_avg3_[idx] = 0;  // valeur par défaut
            if (donnees.d[idx]["lc"] >= avg3_nblaps) {
                for (var l = 1; l <= donnees.d[idx]["lc"] - avg3_nblaps + 1; l++) {
                    // Calcul de la moyenne de tours consécutifs
                    aux_sum = 0;
                    aux_valide = 1;
                    for (var n = 0; n < avg3_nblaps; n++) {
                        l2 = l + n;
                        if ((l2 in laptime_type_[idx]) && (l2 in laptime_[idx]) && (laptime_type_[idx][l2] == 0 || laptime_type_[idx][l2] == 2) && laptime_[idx][l2] != "--") {
                            aux_sum += laptime_[idx][l2];
                        } else {
                            aux_valide = 0;
                            break;
                        }
                    }
                    if (aux_valide && avg3_nblaps > 0) {
                        laptime_avg3_[idx] = aux_sum / avg3_nblaps;
                        startlap_avg3_[idx] = l;
                        // On calcule le best
                        if (laptime_avg3_[idx] < aux_avg_best || aux_avg_best == 0) {
                            aux_avg_best = laptime_avg3_[idx];
                            aux_startlap = l;
                        }
                    }
                }
            }
            if (avg3_best) {
                laptime_avg3_[idx] = aux_avg_best;
                startlap_avg3_[idx] = aux_startlap;
            }
        }

    }

}

// On extrait le temps à partir du message de l'event laptime
function extract_laptime(message) {
    var tmp = message.split(" - ");
    if (tmp.length > 1 && tmp[1].includes(":")) {
        tmp = tmp[1].split(" ");
    } else if (tmp.length > 2 && tmp[2].includes(":")) {
        tmp = tmp[2].split(" ");
    } else if (tmp.length > 3 && tmp[3].includes(":")) {
        tmp = tmp[3].split(" ");
    } else {
        return "--"
    }
    tmp = tmp[0].split(":");
    var min = parseInt(tmp[0]);
    var sec = parseFloat(tmp[1]);
    return min * 60 + sec;
}

function init_laptimes(idx) {
    laptimes_idx = idx;
    //cont_html = "";
    //cont_html = '<div id="laptimes_close" onclick="disp_laptimes = 0; disp_laptimes_old = 0; toggle_laptimes(0);">- CLOSE -&nbsp</div>';
    cont_html = '';
    if (broadcast <= 1) {
        // Affichage les temps au tour pour le pilote sélectionné
        for (e = 0; e < events.length; e++) {
            if (events[e] != undefined && events[e].event_type == "laptime" && events[e].message.caridx == idx) {
                cont_html = "&nbsp;<span style='cursor:pointer' onclick = 'go_replay(" + events[e].id + ");'><b><i>GO</i></b></span> - <span style='color: " + color(events[e].message.laptype) + ";'>LAP " + pad_lapnum(events[e].message.lapnum) + " - " + events[e].message.laptime + "</span><br>" + cont_html;

                // On enregistre le temps dans un tableau
                if ("laptime_raw" in events[e].message) {
                    laptime_[idx][events[e].message.lapnum] = events[e].message.laptime_raw;
                } else {
                    laptime_[idx][events[e].message.lapnum] = extract_laptime(events[e].message.laptime);
                }
                laptime_type_[idx][events[e].message.lapnum] = events[e].message.laptype;

                if (events[e].message.lapnum > laptimes_maxlap[idx]) {
                    laptimes_maxlap[idx] = events[e].message.lapnum;
                }
            }
        }
        //console.log(laptimes_maxlap)
        document.getElementById("laptimes").innerHTML = cont_html;
    } else {
        for (e = 0; e < events.length; e++) {
            if (events[e] != undefined && events[e].event_type == "laptime" && events[e].message.caridx == idx) {
                cont_html += "&nbsp;<span style='color: " + color(events[e].message.laptype) + ";'>LAP " + pad_lapnum(events[e].message.lapnum) + " - " + events[e].message.laptime + "</span><br>";

                // On enregistre le temps dans un tableau
                if ("laptime_raw" in events[e].message) {
                    laptime_[idx][events[e].message.lapnum] = events[e].message.laptime_raw;
                } else {
                    laptime_[idx][events[e].message.lapnum] = extract_laptime(events[e].message.laptime);
                }
                laptime_type_[idx][events[e].message.lapnum] = events[e].message.laptype;

                if (events[e].message.lapnum > laptimes_maxlap[idx]) {
                    laptimes_maxlap[idx] = events[e].message.lapnum;
                }
            }
        }
        laptimes_maxlap[laptimes_idx] = 0;
        document.getElementById("laptimes").innerHTML = cont_html;
    }
    calc_avg(idx);
}

// Display the datas contained in text variable
function update_datas(text) {

    //console.log(text);
    if (disp_param == 0)
        disp_ = disp;
    else
        disp_ = disp_all;

    if (text != -1) {
        text_header_= text.split("??");
        text_header = text_header_[0];
    }
    else {
        text_header = ""
    }

    //console.log(text_header);

    //if (text == "-3" || text == "-2") {
    if (text_header == "-3" || text_header == "-2") {
        //document.getElementById("waitforiracing").style.display = "block"
    } else {
        //document.getElementById("waitforiracing").style.display = "none";
        set_style_display("waitforiracing", "none");
    }

    if (clock_disp == 1) {
        //document.getElementById("clock").innerHTML = "&nbsp;" + str_heure() + "&nbsp;";
        set_inner_html("clock", "&nbsp;" + str_heure() + "&nbsp;");
    }

    donnees_new = null;

    //if (text != -1 && text != "-2" && text != "-3") {
    if (text != -1 && text_header != "-2" && text_header != "-3") {

        donnees_new = JSON.parse(text);
        //console.log(donnees_new.typ)

        if (donnees_new["licence_str"] != undefined) {
            pro_expired_old = pro_expired;
            pro_expired = donnees_new["expired"];
            if (pro_expired != pro_expired_old) {
                if (pro_expired == 1) {
                    $("#expired").css("display", "block");
                    $("#expired").html("<br>" + donnees_new["licence_str"].replaceAll("\n", "<br>"));
                } else {
                    $("#expired").css("display", "none");
                }
            }
        } else {
            $("#expired").css("display", "none");
        }

        //if (donnees_new.hors_connexion == undefined) {

        // REM : faut le faire après avoir mis à jour les events de la page
        //console.log(nb_events)
        if ("nb_events" in donnees_new) {
            nb_events = donnees_new.nb_events;
        }
        //console.log("*", nb_events)

        for (var i = 0; i < 64; i++) {
            calc_avg_[i] = 0;
        }
        nb_e = 0;
        if (disable_all_events == 0) {
            if (broadcast <= 1) {
                nb_e = 0;
                cont_html = "";
                laptimes_html = "";
                for (e in donnees_new.events) {
                    events[e] = donnees_new.events[e];

                    if (events[e] != undefined) {
                        //if (donnees_new.events.length > 0) {
                        //console.log(e, "/", donnees_new.events.length);
                        //$("#loading").html("LOADING DATA ... " + (100 * e / donnees_new.events.length).toFixed(0) + "%");
                        //}
                        //document.getElementById("loading").innerHTML = "***";

                        tmp_return = calc_disp_col_for_events(e);
                        tmp_disp = tmp_return["disp"];
                        col_e = tmp_return["col_e"];
                        fw_e = tmp_return["fw_e"];
                        chrono_e = tmp_return["chrono_e"];

                        if (tmp_disp) {
                            nb_e++;
                            add_cont_html = "";
                            add_cont_html += "&nbsp;<span style='cursor:pointer' onclick ='go_replay(" + events[e].id + ");'><b><i>GO</i></b></span> - <span style='color:" + col_e + ";font-weight:" + fw_e + "'>" + reformat_time(Math.round(events[e].session_time)) + " - ";
                            add_cont_html += "<b>" + events[e].event_type + "</b> : ";
                            add_cont_html += events[e].message + chrono_e + "</span><br>";
                            cont_html = add_cont_html + cont_html;
                            //document.getElementById("events_ticker").innerHTML = cont_html + document.getElementById("events_ticker").innerHTML;
                        }

                        //console.log(events[e].message.caridx, laptimes_idx, events[e].event_type == "laptime", events[e].message.lapnum, events[e].message.laptime, laptimes_maxlap)
                        //if (events[e].event_type == "laptime" && events[e].message.caridx == laptimes_idx && events[e].message.lapnum > laptimes_maxlap[laptimes_idx]) {
                        //laptimes_idx = events[e].message.caridx;
                        //console.log("new lap", laptimes_idx, events[e].message.caridx, events[e].message.lapnum, laptimes_maxlap[events[e].message.caridx])
                        //console.log(laptimes_idx)
                        if (events[e].event_type == "laptime" && laptimes_idx >= 0 && events[e].message.lapnum > laptimes_maxlap[laptimes_idx]) {
                            //console.log("new lap", laptimes_idx, events[e].message.caridx, events[e].message.lapnum, events[e].message.laptime)
                            //if (broadcast == 0) {
                            go = "<span style='cursor:pointer' onclick = \'go_replay(" + events[e].id + ");\'><b><i>GO</i></b></span> - ";
                            //} else {
                            //    go = "";
                            //}
                            if (events[e].message.caridx == laptimes_idx) {
                                laptimes_html = "&nbsp;" + go + "<span style='color: " + color(events[e].message.laptype) + ";'>LAP " + pad_lapnum(events[e].message.lapnum) + " - " + events[e].message.laptime + "</span><br>" + laptimes_html;
                                laptimes_maxlap[laptimes_idx] = events[e].message.lapnum;
                            }

                            //document.getElementById("laptimes").innerHTML = "&nbsp;" + go + "<span style='color: " + color(events[e].message.laptype) + ";'>LAP " + pad_lapnum(events[e].message.lapnum) + " - " + events[e].message.laptime + "</span><br>" + document.getElementById("laptimes").innerHTML;
                        }

                        if (events[e].event_type == "laptime") {
                            // On enregistre le temps dans un tableau
                            if ("laptime_raw" in events[e].message) {
                                laptime_[events[e].message.caridx][events[e].message.lapnum] = events[e].message.laptime_raw;
                            } else {
                                laptime_[events[e].message.caridx][events[e].message.lapnum] = extract_laptime(events[e].message.laptime);
                            }
                            //console.log(events[e].message.caridx, laptime_[events[e].message.caridx][events[e].message.lapnum])
                            laptime_type_[events[e].message.caridx][events[e].message.lapnum] = events[e].message.laptype;
                            calc_avg_[events[e].message.caridx] = 1;
                        }
                    }
                }
                if (cont_html != "") {
                    document.getElementById("events_ticker").innerHTML = cont_html + document.getElementById("events_ticker").innerHTML;
                }
                if (laptimes_html != "") {
                    document.getElementById("laptimes").innerHTML = laptimes_html + document.getElementById("laptimes").innerHTML;
                }
            } else {
                cont_html = "";
                nb_e = 0;
                tmp_minlap = 999999;
                for (e = 0; e < events.length; e++) {
                    //for (e = 0; e < 250; e++) {  // on limite aux 250 derniers évènements pour ne pas planter le navigateur
                    if (e in events) {

                        if (events[e] != undefined) {
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

                            //if (events[e].event_type == "laptime" && events[e].message.caridx == laptimes_idx && events[e].message.lapnum > laptimes_maxlap[laptimes_idx]) {
                            if (events[e].event_type == "laptime" && events[e].message.caridx == laptimes_idx) {
                                //document.getElementById("laptimes").innerHTML = "&nbsp;<span style='color: " + color(events[e].message.laptype) + ";'>LAP " + events[e].message.lapnum + " - " + events[e].message.laptime + "</span><br>" + document.getElementById("laptimes").innerHTML;
                                if (events[e].message.lapnum < tmp_minlap) {
                                    tmp_minlap = events[e].message.lapnum;
                                }
                            }
                        }
                    }
                }
                //tmp_maxlap = laptimes_maxlap[laptimes_idx];
                cont_laptimes = '';
                //console.log(events.length)
                for (e = 0; e < events.length; e++) {
                    //for (e = 0; e < 250; e++) {  // on limite aux 250 derniers évènements pour ne pas planter le navigateur
                    if (e in events) {
                        if (events[e] != undefined) {
                            //if (events[e].event_type == "laptime" && events[e].message.caridx == laptimes_idx && events[e].message.lapnum > laptimes_maxlap[laptimes_idx]) {
                            //if (events[e].event_type == "laptime" && events[e].message.caridx == laptimes_idx) {
                            if (events[e].event_type == "laptime") {
                                //document.getElementById("laptimes").innerHTML = "&nbsp;<span style='color: " + color(events[e].message.laptype) + ";'>LAP " + events[e].message.lapnum + " - " + events[e].message.laptime + "</span><br>" + document.getElementById("laptimes").innerHTML;
                                if (events[e].message.caridx == laptimes_idx) {
                                    cont_laptimes += "&nbsp;<span style='color: " + color(events[e].message.laptype) + ";'>LAP " + pad_lapnum(events[e].message.lapnum) + " - " + events[e].message.laptime + "</span><br>";
                                }

                                // On enregistre le temps dans un tableau
                                if ("laptime_raw" in events[e].message) {
                                    laptime_[events[e].message.caridx][events[e].message.lapnum] = events[e].message.laptime_raw;
                                } else {
                                    laptime_[events[e].message.caridx][events[e].message.lapnum] = extract_laptime(events[e].message.laptime);
                                }
                                laptime_type_[events[e].message.caridx][events[e].message.lapnum] = events[e].message.laptype;
                                calc_avg_[events[e].message.caridx] = 1;

                                //if (events[e].message.lapnum > laptimes_maxlap[laptimes_idx]) {
                                //laptimes_maxlap[laptimes_idx] = events[e].message.lapnum;
                                //}
                                //console.log(tmp_minlap,tmp_maxlap,  laptimes_maxlap[laptimes_idx])
                            }
                        }
                    }
                }
                if (cont_laptimes != '') {
                    document.getElementById("laptimes").innerHTML = cont_laptimes;
                }
                //console.log(laptimes_idx, events.length)
                document.getElementById("events_ticker").innerHTML = cont_html;
            }
            // On recalcule les avg que s'il y a des nouvelles données
            for (var i = 0; i < 64; i++) {
                if (calc_avg_[i] == 1) {
                    calc_avg(i);
                }
            }
        }
        //console.log("nb events :", events.length);
        //console.log(nb_e)

        if (donnees_new.hors_connexion == undefined) {

            text_save = text;  // pour pouvoir recharger les données si on fait des changements de config

            if (broadcast <= 1) {
                // Lorsqu'il y a des nouveaux events et qu'on n'est pas en scrollé en haut, on fait en sorte que ce qu'on voit ne bouge pas
                if (document.getElementById("events_ticker").scrollTop > 0 && nb_e > 0) {
                    document.getElementById("events_ticker").scrollTop += nb_e * ticker_lineheight;
                    //console.log("***", document.getElementById("events_ticker").scrollTop, nb_e, ticker_nb_events)
                }
                //document.getElementById("events_ticker").scrollTop += ticker_lineheight;
                ticker_nb_events += nb_e;
            } else {
                // Lorsqu'il y a des nouveaux events et qu'on n'est pas en scrollé en haut, on fait en sorte que ce qu'on voit ne bouge pas
                if (document.getElementById("events_ticker").scrollTop > 0 && nb_e > ticker_nb_events) {
                    document.getElementById("events_ticker").scrollTop += (nb_e - ticker_nb_events) * ticker_lineheight;
                }
                ticker_nb_events = nb_e;
            }

            if (ticker_nb_events > 0) {
                //ticker_lineheight = Math.floor(document.getElementById("events_ticker").scrollHeight / ticker_nb_events + 0.5);  // REM finalement calculé dans le responsive.js
                //console.log(document.getElementById("events_ticker").scrollHeight, nb_e, ticker_lineheight)
            }

            for (nom in var_sent_every_second) {
                if (donnees_new[nom] != undefined) {
                    save_donnees_new[nom] = donnees_new[nom];
                } else {
                    donnees_new[nom] = save_donnees_new[nom];
                }
            }

            // Rechargement de la page si le serveur nous le demande lors d'un changement de session (uniquement en local)
            /*
             if (broadcast == 0)
             if (donnees_new.reload == 1) {
             console.log("rechargement de la page demandée par le seveur ...");
             ws.send("rechargement de la page demandée par le seveur ...");
             setTimeout(function () {
             location.reload()
             }, 3000)
             }
             */

            if (donnees_new.styp != undefined) {
                type_session = donnees_new.styp;
            }
            if (donnees_new.sname != undefined) {
                name_session = donnees_new.sname;
            }

            /* Empêche le trier le timing mais permet d'avoir le bon classement hors connexion
                if (type_session != "Race") {
                    classement = "best";
                } else {
                    classement = "pos";
                }
            */

            if (donnees_new.trackname != undefined)
                trackname_new = donnees_new.trackname;
            else
                trackname_new = trackname;

            if (trackname_new != trackname && trackname != "init") {
                console.log("Chargement du nouveau circuit ...");
                //console.log(trackname_new, trackname);
                //location.reload();
                // On efface les anciens virages
                donnees.turn_num = donnees_new.turn_num;
                donnees.turn_ldp = donnees_new.turn_ldp;
                donnees.turn_side = donnees_new.turn_side;
                donnees.turn_info = donnees_new.turn_info;
                responsive_dim(disp_param);
            }

            if (trackname_new != trackname && trackname == "init") {
                console.log("Chargement du circuit ...");
                responsive_dim(disp_param);
            }

            // Servira ici à ne pas recharger les données de type 1 si elles sont trop anciennes
            decalage = (parseInt(Date.now() / 1000) - donnees_new.tstamp);

            if (donnees.jrt_session_start_time != undefined) {
                jrt_session_duration = donnees_new.tstamp - donnees.jrt_session_start_time;  // Temps écoulé depuis le démarrage de JRT
            }

            // On recharge la page si on a détecté une nouvelle session par rapport à la liste _liste_sessions.js enregistrée dans init_sessions.py
            //console.log(last_sessionid, last_sessionnum, donnees_new.sid, donnees_new.sn);
            /*if (donnees_new.offline == undefined) {  // pour vérifier que c'est bien du live, sinon on ne recharge pas la page
                if ((last_sessionid != 0 || last_sessionnum != 0) && (donnees_new.sn != 0 || donnees_new.sid != 0)) {  // si on est pas en test session
                    if (donnees_new.sn != last_sessionnum || (donnees_new.sid != last_sessionid)) {
                        location.reload();
                    }
                }
            }*/ // Ca fou la merde de recharge la page
            if (donnees_new.st != undefined) {
                tmp_st = donnees_new.st;
            } else {
                tmp_st = 0;
            }
            if ( (decalage > 60 && donnees_defined == 1) || ((trackname_new == trackname) && (donnees_new.styp == type_session) && (donnees_new.sname == name_session) && (donnees_new.sn == sessionnum) && (donnees_new.sid == sessionid) && (tmp_st == 0 || (tmp_st >= sessiontime || donnees_new.is_live != 1)))) {     // If we are still in the same session, we don't delete the old datas
                //if ((trackname_new == trackname) && (donnees_new.styp == type_session) && (donnees_new.sn == sessionnum) && (donnees_new.sid == sessionid)) {     // If we are still in the same session, we don't delete the old datas
                //if ((donnees_new.typ == 1) || ((trackname_new == trackname) && (donnees_new.styp == type_session) && (donnees_new.sn == sessionnum) && (donnees_new.sid == sessionid))) {     // If we are still in the same session, we don't delete the old datas

                //console.log(text);
                $.extend(true, donnees, donnees_new);     // Merge donnees_new into donnees, recursively
                //text_save = text;  // pour pouvoir recharger les données si on fait des changements de config

                change_classid(donnees);

                if (donnees_new.nb != nb_drivers) { // Si le nombre de pilotes a changé il faudra recalculer le SOF
                    sof_displayed = 0;
                    nb_drivers = donnees_new.nb;
                    colorize_drivers_init = 2;  // il faudra aussi coloriser éventuellement les nouveaux pilotes
                    timing_menu(1);
                }

                /*if (broadcast >= 2 && load_track_data == 1) {
                 if (type_session != "Race") {
                 classement = "best";
                 } else {
                 classement = "pos";
                 }
                 }*/
                if (broadcast >= 2 && decalage > 60) {
                    type_session = donnees_new.styp;
                    name_session = donnees_new.sname;
                }

                // On réaffiche les colonnes cpos et scpos éventuellement au cas où elles auraient été enlevées car il n'y avait que des voitures de même classe
                //if (donnees.nbclass != undefined && donnees.nbclass > 1 && maj_aff == 0) {
                //if (donnees.nbclass != undefined && maj_aff2 == 1) {

                // On met à jour les colonnes si ça n'a pas déjà été fait
                if (maj_aff2 == 1) {
                    disp = {};
                    for (j = 0; j < tab_titres.length; j++) {
                        t = tab_titres[j];
                        disp[t] = 1;
                    }
                    update_aff(disp_param);
                    maj_aff2 = 0;
                }

            } else {
                load_track_data = 1;
                console.log("New session, we are reloading init session data ...");

                donnees_reform_car = {};

                donnees_defined = 1;

                switch_f3box_nbrequest = donnees_new.f3;
                send_trackmap_nbrequest = donnees_new.stm;
                trackmap_nbrequest = donnees_new.trm;
                scroll_up_nbrequest = donnees_new.up;
                scroll_down_nbrequest = donnees_new.down;

                sof_displayed = 0;
                teamracing_received = 0;
                selected_idxjs = -1;
                sessionnum = donnees_new.sn;
                carname = donnees_new.carname;
                sessionid = donnees_new.sid;
                type_session = donnees_new.styp;
                name_session = donnees_new.sname;
                donnees = JSON.parse(text);

                change_classid(donnees);

                if (broadcast == 0 && photo_processing == 0 && photo_processing_old == 0) {
                    console.log("send_statics (1)");
                    ws.send("send_statics");    // we want to collect the statics datas (name, num, ir)
                }
                if (broadcast == 1) {
                    ws3.send("send_statics");    // we want to collect the statics datas (name, num, ir)
                }
                effacer_tableau();
                if (type_session != "Race") {
                    classement = "best";
                } else {
                    classement = "pos";
                }
                if (getParamValue('sort') != '') {
                    classement = getParamValue('sort');
                }
                classement_old = classement;

                reload_clublogos = {};
                reload_carlogos = {};

                maj_aff = 1;
                maj_aff2 = 1;

                cars_list = {};

                if (colorize_drivers_init == 0) {
                    colorize_drivers_init = 1;
                }

                if(donnees_new.offline == undefined) {  // pour éviter que les events soient effacés si on lit une session hors ligne
                    nb_events = 0;
                    nb_events_loaded = 0;
                    events = [];
                    events_fix = [];
                    events_loaded = true;
                    disp_laptimes = 0;
                    laptimes_idx = -1;
                    for (var i=0;i<64;i++) {
                        laptimes_maxlap[i] = 0;
                    }
                    toggle_laptimes(0);
                    document.getElementById("events_ticker").innerHTML = "";
                }

                // On réinitialise le tableau des temps
                laptime_ = {};
                laptime_type_ = {};
                // On réinitialise les valeurs avg1, avg2 et avg3
                laptime_avg1_ = {};
                laptime_avg2_ = {};
                laptime_avg3_ = {};
                startlap_avg1_ = {};
                startlap_avg2_ = {};
                startlap_avg3_ = {};
                calc_avg_ = {};  // servira à savoir qu'il faut recalculer les moyennes
                for (var i = 0; i < 64; i++) {
                    laptime_[i] = {};
                    laptime_type_[i] = {};
                    laptime_avg1_[i] = 0;
                    laptime_avg2_[i] = 0;
                    laptime_avg3_[i] = 0;
                    startlap_avg1_[i] = 0;
                    startlap_avg2_[i] = 0;
                    startlap_avg3_[i] = 0;
                    calc_avg_[i] = 0;
                }

                if (broadcast <= 1) {
                    $("#loading").css("display", "none");
                }
                //$("#loading").html(broadcast);

                timing_menu(1);

                laptimes_idx_old = laptimes_idx;  // on enregistre l'ancienne valeur pour la restituer après
                // On lit les données de temps
                for (var i = 0; i < 64; i++) {
                    if ( (donnees.d != undefined) && (i in donnees.d) ) {
                        init_laptimes(i);
                    }
                }
                laptimes_idx = laptimes_idx_old;
                //console.log(laptimes_idx)

                // On réaffiche les colonnes cpos et scpos éventuellement au cas où elles auraient été enlevées dans une précédente session
                if (donnees.nbclass != undefined && donnees.nbclass > 1) {
                    disp = {};
                    for (j = 0; j < tab_titres.length; j++) {
                        t = tab_titres[j];
                        disp[t] = 1;
                    }
                    update_aff(disp_param);
                }

            }

            if (tmp_st > 0) {
                sessiontime = tmp_st;
            }

            //timing_menu(1);  !!! Attention : si les fps sont supérieures à 1 on ne peut pas cocher les cases

            //if (donnees.nbclass != undefined && maj_aff == 1) {
            // On met à jour les colonnes si ça n'a pas déjà été fait
            if (maj_aff == 1) {
                // S'il n'y a qu'une seule class on n'affiche pas les colonnes de position des class C et sC
                // A condition qu'on affiche déjà la colonne pos
                if (donnees.nbclass == 1) {
                    if (disp["pos"] == 1) {
                        disp["cpos"] = 0;
                    }
                    if (disp["spos"] == 1) {
                        disp["scpos"] = 0;
                    }
                    update_aff(disp_param);
                    maj_aff = 0;
                }
            }

            if (donnees_new.nb != undefined) {
                nb_drivers = donnees_new.nb;
            }

            if (donnees.carname != undefined) {
                // On met en kg les voitures qui utilisent kg comme la fw31 ou la hpd
                if (donnees.carname in car_in_kg) {
                    disp_kg_livre = 1
                } else {
                    disp_kg_livre = 0
                }
            }

            if (trackname_new != undefined)
                trackname = trackname_new;

            donnees_reform = {};

            $.extend(true, donnees_reform, donnees);

        } else {
            timing_menu(0);
        }

    //} else if (text == "-3") {
    } else if (text_header == "-3") {
        trackname = "none";  // utile pour savoir qu'il faudra recharger la page si c'est la première fois qu'on charge un circuit
    }

    // Si la trackmap a changée on demande au serveur de nous envoyer les données
    if (text != -1 && text_header != "-2" && text_header != "-3") {
        if (donnees.stm != send_trackmap_nbrequest) {
            if (broadcast == 0 && photo_processing == 0 && photo_processing_old == 0) {
                console.log("send_statics (2)");
                ws.send("send_statics");
            }
            if (broadcast == 1) {
                ws3.send("send_statics");
            }
            //else
            //    ws3.send("send_statics");
            send_trackmap_nbrequest = donnees.stm
        }
        loaded = 1;
    } else {
        //console.log(loaded)
        if (loaded < 1 && last_sessionnum != -1) {
            if (loaded == -1) {
                setTimeout(function () {load_session(last_sessionid, last_sessionnum, 1); loaded = 1;},700);  // on met un delai si les settings ont changés pour éviter le rechargement infini
            } else {
                setTimeout(function () {load_session(last_sessionid, last_sessionnum, 1); loaded = 2;},0);
            }
        }
    }

    // On calcule les coefficient d'essence en fonction des options
    if (disp_kg_livre == 1) {
        if (donnees.u == 1) {  // systeme metric
            coef_fuel = 0.75
        } else {
            coef_fuel = 1 / (0.45359237 / 0.75 / 3.78541178);        //  1 Ga = 3.78541178 L     1 livre = 0.45359237 kg
        }
    } else {
        coef_fuel = 1;
    }

    // IMPORTANT de l'executer tout le temps du processing photo
    if ( (photo_wait == 0) && (photo_processing == 1 || (photo_processing == 0 && photo_processing_old == 1)) ) {
        if (photo_stop == 0) {
            ws.send("update_photo");
        } else {
            ws.send("photo_stop");
            photo_processing_old = 0;
        }
    }
    if (donnees.photo_favoris != undefined && donnees.photo_favoris != -1) {
        shutter = donnees.photo_favoris.nb_images;
        photo_w = donnees.photo_favoris.width;
        photo_h = donnees.photo_favoris.height;
        photo_x0 = donnees.photo_favoris.photo_x0;
        photo_y0 = donnees.photo_favoris.photo_y0;
        photo_smooth = donnees.photo_favoris.smooth;
        photo_bracketting = donnees.photo_favoris.bracketting;
        photo_cuda_level = donnees.photo_favoris.cuda_level;
        photo_display = donnees.photo_favoris.photo_display;
        photo_hide_watermark = donnees.photo_favoris.photo_hide_watermark;
        photo_AA2 = donnees.photo_favoris.photo_AA2;
        photo_check = donnees.photo_favoris.photo_check;
        fix_4K = donnees.photo_favoris.fix_4K;
        fix_4K_coef = donnees.photo_favoris.fix_4K_coef;
        opt_charge_photo_favoris(0);
        donnees.photo_favoris = -1;
    }

    if (donnees.free_ram != undefined && donnees.free_ram != -1) {
        free_ram = donnees.free_ram;
        calcul_photo_memory();
        donnees.free_ram = -1;
    }

    if (donnees.photo_not_possible != undefined && donnees.photo_not_possible >= 1) {
        if (donnees.photo_not_possible == 1) {
            document.getElementById("photo_progression").innerHTML = "This resolution is not possible for some reasons because you will get a black screen. You can use only resolutions under or equal your desktop ones.";
        } else if (donnees.photo_not_possible == 2) {
            document.getElementById("photo_progression").innerHTML = "iRacing is not started !";
        } else if (donnees.photo_not_possible == 3) {
            document.getElementById("photo_progression").innerHTML = "You can't take a photo while driving !";
        }
        photo_processing_old = 1;
        photo_processing = 0;
        document.getElementById('opt_iracing_photo').innerHTML = "<b>TAKE PHOTO(S)</b>";
        photo_stop = 1;
        donnees.photo_not_possible = -1
    }

    if (donnees.d != undefined) {

        // Dès qu'on reçoit toutes les données on dessine le circuit et on définit notre classe
        if (donnees_new != null && donnees_new.typ == 1) {
            //draw_track("rgba(90,90,90,0.8)", 1, 2, 1);
            //console.log("DRAWING TRACK ...")
            //draw_track("#2c2c2c", 1, 1, 1);
            draw_track();
            //console.log("DONE.")

            change_classid(donnees_new);

            // On définit aussi notre class
            if (donnees_new.d[donnees_new.me] != undefined) {
                class_me = donnees_new.d[donnees_new.me].classid;
                if (class_selected_me) {
                    class_selected = class_me;  // On affichera seulement les voitures de notre class
                }
            }

            //dpi_factor = donnees_new.dpi_factor;
            //dpi_factor = window.devicePixelRatio;  // c'est mieux d'utiliser cette valeur qui est dépend du device sur lequel on lit la page. REM : elle tient aussi compte du zoom du navigateur
            //console.log(window.devicePixelRatio, "*");
            //console.log(dpi_factor);
            //dpi_factor = 1;  // DEBUG : on force le dpi_factor à 1
            if (responsive) {
                dpi_factor_ = 1;
            } else {
                //dpi_factor_ = dpi_factor;
                dpi_factor_ = 1;
            }
        }

        update_infosbar();

        button_events();

        // Update photo progression
        if (donnees_new != null && donnees_new.cuda_ok != undefined) {
            if(donnees_new.cuda_ok == 0) {
                document.getElementById('cuda_level_title').innerHTML = "CUDA is not available ! You need a Nvidia card with CUDA 10.0 Runtime installed";
                photo_cuda_level = 0;
                document.getElementById('opt_iracing_cuda_level').value = 0;
            } else if (donnees_new.cuda_ok == 1) {
                document.getElementById('cuda_level_title').innerHTML = "CUDA level (It improves the quality. Higher is slower but better quality)) :";
            }
        }
        if(donnees_new != null && donnees_new.photo_capt_pct != undefined && donnees_new.photo_proc_pct != undefined && donnees_new.photo_save != undefined) {
            photo_progression_html = "";
            if(donnees_new.photo_capt_pct >= 0) {
                photo_progression_html += "Capturing ... ";
                if(donnees_new.photo_capt_pct == 100) {
                    photo_progression_html += "DONE"
                }
                photo_progression_html += "<br>"
            }
            if(donnees_new.photo_proc_pct >= 0) {
                if (donnees_new.process_type == 0) {
                    process_txt = "CUDA processing " + donnees_new.bande_num + "/" + donnees_new.bande_nb + " ... "
                } else {
                    process_txt = "Images blending processing " + donnees_new.bande_num + "/" + donnees_new.bande_nb + " ... "
                }
                photo_progression_html += process_txt + donnees_new.photo_proc_pct + "% ";
                if(donnees_new.photo_proc_pct == 100) {
                    photo_progression_html += "DONE"
                }
                photo_progression_html += "<br>"
            }
            if(donnees_new.photo_save >= 0) {
                photo_progression_html += "Saving ... ";
                if(donnees_new.photo_save == 1) {
                    photo_processing = 0;
                    photo_processing_old = 0;
                    if (donnees_new.photo_aborted == 1) {
                        photo_progression_html += "ABORTED";
                    } else {
                        photo_progression_html += "DONE";
                    }
                    document.getElementById('opt_iracing_photo').innerHTML = "<b>TAKE PHOTO(S)</b>";
                } else {
                    photo_progression_html += "PRESS A KEY";
                }
                photo_progression_html += "<br>"
            }
            document.getElementById("photo_progression").innerHTML = photo_progression_html;
            //if(donnees_new.photo_proc_pct >= 0 && donnees_new.photo_proc_pct < 100) {
                /*if (photo_stop == 0) {
                    ws.send("update_photo");
                } else {
                    ws.send("photo_stop");
                }*/
            //}

        }

        /*
        if (donnees_new != null && donnees_new.typ == 1 && type_session != "Race" && liste_donnees["best"] != undefined) {
            classement = "best";
            classement_old = classement;
        }
        */

        if (text != -1) { // IMPORTANT Pour éviter la récursivité

            sort(classement);   // Sort the datas

            if (filter_colorized == 1) {
                // On calcule maintenant la position des pilotes colorisés filtrés dans le tableau
                for (k in donnees.d) {
                    pos = 1;
                    if (document.getElementById('opt_colorize_drivers_' + k).checked && filter_colorized == 1) {
                        for (j in donnees.d) {
                            if (document.getElementById('opt_colorize_drivers_' + j).checked && filter_colorized == 1) {
                                if (clt[j] < clt[k]) {
                                    pos +=1;
                                }
                            }
                        }
                        clt_filter_colorized[k] = pos;
                    }
                }
            }

        }

        selected_idx = donnees.c;
        if (donnees_new != null && selected_idxjs == -1) {
            // Verifie que le selected index n'est pas indéfinie (si c'est le spectateur ou le pace car par exemple)
            if (selected_idx in donnees_new.d)
                selected_idxjs = selected_idx; // possibilité de modifier le pilote sélectionné
            else
                selected_idxjs = 1;  // on pointe sur le caridx 1

            selected_idxjsold = selected_idxjs
        }
        // En mode F3 box on sélectionne automatiquement le pilote sélectionné dans iRacing
        if (f3_box == 1) {
            selected_idxjsold = selected_idxjs;
            selected_idxjs = selected_idx;
        }

        if (selected_driver_mode == 2) {  // mode auto-select the focused car
            selected_idxjs = selected_idx;
        }

        if (selected_driver_mode == 0) {  // pas de pilote sélectionné mais on doit quand même en sélectionner un pour avoir les gaps
            selected_idxjs = selected_idx;
        }

        clt_filtered_tmp = {};
        idx_filtered = {};

        filtered = false;
        for (c in cars_list) {
            if (cars_list[c] == 0) {  // Si on a filtré les voiture
                filtered = true;
            }
        }

        sf_top = -999; // index du pilote après lequel est affichée la ligne de départ/arrivée
        ldp_min = 1;

        for (var i = 0; i < 64; i++) {

            // Permet d'accéder une fois dans la boucle en cas de redimensionnement pour notamment avoir le bon coef_ligne si on est en mode f3 et responsive
            if ( (do_resize == 1) && (donnees_new == null || donnees_new.d == undefined) && (donnees != null && donnees.d != undefined) ) {
                donnees_new = donnees;
                do_resize = 0;
            }

            if (donnees_new != null && donnees_new.d != undefined && (i != donnees.me || donnees.me_is_spectator == 0)) {
                if (i in donnees_new.d) {
                    if (fond_blanc != undefined && fond_blanc == 1) {
                        donnees.d[i].fr = 1;  // Pour avoir le fond blanc tout le temps comme à la fin de la course
                    }
                    if (fond_blanc != undefined && (fond_blanc == 2 || fond_blanc == 3)) {
                        donnees.d[i].fr = 0;  // Pour ne pas avoir le fond blanc à la fin de la course
                    }

                    // IMPORTANT! We reformat only new datas

                    if (donnees.d[i].spos == 0) donnees_reform.d[i].spos = "--";
                    if (donnees.d[i].scpos == 0) donnees_reform.d[i].scpos = "--";

                    // On calcul lapdistpct par rapport au selected_idxjs (compris entre -0.5 et +0.5)
                    dp = donnees.d[i].dp;
                    donnees.d[i].ldp = dp - Math.floor(dp);

                    // On n'affiche les points qu'en course
                    if (type_session != "Race") {
                        donnees_reform.d[i].pts = "--"
                    }

                    // On calcule les places gagnées en course (sinon on affiche rien)
                    donnees.d[i].gain = donnees.d[i].spos - donnees.d[i].pos;
                    donnees.d[i].cgain = donnees.d[i].scpos - donnees.d[i].cpos;
                    donnees_reform.d[i].gain = reformat_gain(donnees.d[i].gain);
                    donnees_reform.d[i].cgain = reformat_gain(donnees.d[i].cgain);

                    //***
                    //donnees_reform.d[i].pos = donnees.d[i].posf3

                    if ((donnees.d[i].name != undefined)) {
                        //if (i == donnees.vW && donnees.estim_status != 2 && type_session == "Race") {
                        if (i == donnees.vW && type_session == "Race") {
                            donnees_reform.d[i].name = reformat_name(donnees.d[i].name, donnees.d[i].tn, display_virtual_winner, i);
                        } else {
                            donnees_reform.d[i].name = reformat_name(donnees.d[i].name, donnees.d[i].tn, 0, i);
                        }
                    }

                    // En dehors des courses on recalcule le gap par rapport au meilleur temps
                    class_id = donnees.d[i].classid;
                    if (type_session != "Race") {
                        if ((i in donnees.d) && (clt_idxp1 in donnees.d)) {
                            if (donnees.d[i].b != undefined && donnees.d[clt_idxp1].b != undefined && donnees.d[i].b && donnees.d[clt_idxp1].b > 0)
                                donnees.d[i].g = donnees.d[i].b - donnees.d[clt_idxp1].b;
                            else donnees.d[i].g = ""
                        }
                        if ((i in donnees.d) && (donnees.leader[class_id] in donnees.d)) {
                            if (donnees.d[i].b != undefined && donnees.d[donnees.leader[class_id]].b != undefined && donnees.d[i].b && donnees.d[donnees.leader[class_id]].b > 0) {
                                donnees.d[i].cg = donnees.d[i].b - donnees.d[donnees.leader[class_id]].b;
                                //console.log(class_id, donnees.d[donnees.leader[class_id]].num)
                            } else donnees.d[i].cg = ""
                        }
                        if ((i in donnees.d) && (selected_idxjs in donnees.d)) {
                            if (donnees.d[i].b != undefined && donnees.d[selected_idxjs].b != undefined && donnees.d[i].b > 0 && donnees.d[selected_idxjs].b > 0) {
                                donnees.d[i].rc = donnees.d[i].b - donnees.d[selected_idxjs].b;
                            } else donnees.d[i].rc = ""
                        }
                    }
                    if (donnees.d[i].g != undefined) {
                        if (donnees.d[i].pos != 1 || type_session != "Race") {
                            donnees_reform.d[i].g = reformat_gap(donnees.d[i].g);
                            if (donnees_reform.d[donnees.p1] != undefined && donnees_reform.d[i] != undefined) {
                                tmp_dp_i = donnees_reform.d[i].dp;
                                if (tmp_dp_i < 0) tmp_dp_i = 0;
                                nbl = parseInt(donnees_reform.d[donnees.p1].dp - tmp_dp_i);
                                // On se met en gap_mode 2 si l'écart est supérieur ou égal à 5 tours ou si le gap est 0 ce qui veut dire que si c'est pas le leader, le pilote n'a pas passé la ligne
                                if ((Math.abs(nbl) >= 5 || gap_mode == 2 || donnees.d[i].g == 0) && (type_session == "Race")) {
                                    if (nbl > 0) {
                                        nbl = "+" + nbl;
                                    }
                                    if (nbl != 0) {
                                        donnees_reform.d[i].g = nbl + "L";
                                    } else {
                                        nbl = (donnees_reform.d[donnees.p1].dp - tmp_dp_i - 0.5).toFixed(0);
                                    }
                                }
                            }
                        } else {
                            if (donnees.time_e != undefined) {
                                if (i in donnees.time_e) {
                                    if (i in donnees.time_e && donnees.time_e[i] != 0) {
                                        donnees_reform.d[i].g = donnees.time_e[i];
                                    } else {
                                        donnees_reform.d[i].g = "";
                                    }
                                } else {
                                    donnees_reform.d[i].g = "";
                                }
                            }
                        }
                    }

                    //if (donnees.d[i].num == "32")  console.log(i, donnees.d[i].num, donnees.d[i].cpos, donnees.d[i].cg);
                    if (donnees.d[i].cg != undefined) {
                        if (donnees.d[i].cpos != 1 || type_session != "Race") {
                            donnees_reform.d[i].cg = reformat_gap(donnees.d[i].cg);
                            if (donnees_reform.d[donnees.leader[class_id]] != undefined && donnees_reform.d[i] != undefined) {
                                tmp_dp_i = donnees_reform.d[i].dp;
                                if (tmp_dp_i < 0) tmp_dp_i = 0;
                                nbl = parseInt(donnees_reform.d[donnees.leader[class_id]].dp - tmp_dp_i);
                                // On se met en cgap_mode 2 si l'écart est supérieur ou égal à 5 tours ou si le cgap est 0 ce qui veut dire que si c'est pas le leader, le pilote n'a pas passé la ligne
                                if ((Math.abs(nbl) >= 5 || cgap_mode == 2 || donnees.d[i].cg == 0) && (type_session == "Race")) {
                                    if (nbl > 0) {
                                        nbl = "+" + nbl;
                                    }
                                    if (nbl != 0) {
                                        donnees_reform.d[i].cg = nbl + "L";
                                    } else {
                                        nbl = (donnees_reform.d[donnees.leader[class_id]].dp - tmp_dp_i - 0.5).toFixed(0);
                                    }
                                }
                            }
                        } else {
                            if (donnees.time_e != undefined) {
                                //console.log(i, donnees.d[i].name, donnees.time_e[i])
                                if (i in donnees.time_e) {
                                    if (i in donnees.time_e && donnees.time_e[i] != 0) {
                                        donnees_reform.d[i].cg = donnees.time_e[i];
                                    } else {
                                        donnees_reform.d[i].cg = "";
                                    }
                                } else {
                                    donnees_reform.d[i].cg = "";
                                }
                            }
                        }
                    }

                    if (filtered) {
                        if (i in clt_filtered) {
                            donnees_reform.d[i].pos = clt_filtered[i];
                        }
                    } else {
                        // En dehors des courses, on recalcule la position en fonction du meilleur temps
                        if (type_session != "Race") {
                            if (donnees.d[i].pos != undefined) donnees_reform.d[i].pos = clt[i];
                            if (donnees.d[i].cpos != undefined) donnees_reform.d[i].cpos = clt_class[i];
                        }
                    }

                    if (donnees.d[i].l != undefined) donnees_reform.d[i].l = reformat_laptime(donnees.d[i].l);
                    if (donnees.d[i].b != undefined) donnees_reform.d[i].b = reformat_laptime(donnees.d[i].b);

                    if (donnees.d[i].qualy != undefined) {
                        if (donnees.d[i].qualy < 9999) {
                            donnees_reform.d[i].qualy = reformat_laptime(donnees.d[i].qualy);
                        } else {
                            donnees_reform.d[i].qualy = "--";
                        }
                    }

                    rc = 0;
                    nrc = "";
                    if (donnees.d[i].rc != undefined) {
                        rc = donnees.d[i].rc;
                        if (donnees_reform.d[selected_idxjs] != undefined && donnees_reform.d[i] != undefined) {
                            tmp_dp_i = donnees_reform.d[i].dp;
                            if (tmp_dp_i < 0) tmp_dp_i = 0;
                            nbl = parseInt(donnees_reform.d[selected_idxjs].dp - tmp_dp_i);
                            // On se met en rel_mode 2 si l'écart est supérieur ou égal à 5 tours ou si le cgap est 0 ce qui veut dire que si c'est pas le leader, le pilote n'a pas passé la ligne
                            if ((Math.abs(nbl) >= 5 || rel_mode == 2 || donnees.d[i].rc == 0) && (type_session == "Race")) {
                                if (nbl > 0) {
                                    nbl = "+" + nbl;
                                }
                                if (nbl != 0) {
                                    nrc = nbl + "L";
                                }
                            }
                        }
                    }

                    // We recalculate the relative gap if the client changed the selected driver (only in race)
                    if (type_session == "Race" && selected_idxjs != selected_idx && f3_box == 0) {
                        if (selected_idxjs in donnees_new.d) {
                            if (donnees.d[selected_idxjs].g != undefined && donnees.d[i].g != undefined)
                                rc = donnees.d[selected_idxjs].g - donnees.d[i].g;
                            else rc = ""
                        }
                    }

                    // En mode F3 box on remplace le relative gap par celui de la F3 box
                    //if (f3_box == 1 || type_session != "Race") {
                    if (f3_box == 1) {
                        rc = donnees.d[i].rcf3;
                        nrc = "";
                    }
                    if (nrc == "") {
                        donnees_reform.d[i].rc = reformat_gap(rc);
                    } else {
                        donnees_reform.d[i].rc = nrc;
                    }
                    donnees.d[i].rc = rc;

                    if (donnees.d[i].lc != undefined) donnees_reform.d[i].lc = reformat_lc(donnees.d[i].lc);
                    if (donnees.d[i].np != undefined) donnees_reform.d[i].np = reformat_lc(donnees.d[i].np);
                    if (donnees.d[i].ni != undefined) donnees_reform.d[i].ni = reformat_lc(donnees.d[i].ni);
                    if (donnees.d[i].sti != undefined) donnees_reform.d[i].sti = reformat_lc((donnees.d[i].sti).toFixed(1));
                    if (donnees.d[i].rt != undefined) donnees_reform.d[i].rt = reformat_pit_time(donnees.d[i].rt);
                    if (donnees.d[i].tow == 0 || donnees.d[i].tow == undefined) {
                        if (donnees.d[i].st != undefined) donnees_reform.d[i].st = reformat_pit_time(donnees.d[i].st);
                    } else {
                        if (donnees.d[i].st != undefined) donnees_reform.d[i].st = reformat_pit_time(donnees.d[i].tow);
                    }
                    if (donnees.d[i].dp != undefined) donnees_reform.d[i].dp = donnees.d[i].dp.toFixed(4);
                    if (donnees.d[i].s != undefined) donnees_reform.d[i].s = reformat_speed(donnees.d[i].s);
                    if (donnees.d[i].tops != undefined) donnees_reform.d[i].tops = reformat_speed(donnees.d[i].tops);
                    if (donnees.d[i].as != undefined) donnees_reform.d[i].as = reformat_speed(donnees.d[i].as);
                    if (donnees.d[i].ms != undefined) donnees_reform.d[i].ms = reformat_speed(donnees.d[i].ms);
                    if (donnees.d[i].a != undefined) donnees_reform.d[i].a = reformat_accel(donnees.d[i].a);
                    if (donnees.d[i].lic != undefined) donnees_reform.d[i].lic = reformat_lic(donnees.d[i].lic, donnees.d[i].licsub);
                    if (donnees.d[i].clubname != undefined) donnees_reform.d[i].clubname = reformat_clubname(donnees.d[i].clubname);
                    if (startlap_avg1_[i] != 0) {
                        //donnees_reform.d[i].avg1 = reformat_laptime(laptime_avg1_[i]) + " [" + startlap_avg1_[i] + "-" + (startlap_avg1_[i] + avg1_nblaps - 1) + "]";
                        donnees_reform.d[i].avg1 = reformat_avg(1, i);
                    } else {
                        donnees_reform.d[i].avg1 = "--";
                    }
                    if (startlap_avg2_[i] != 0) {
                        //donnees_reform.d[i].avg2 = reformat_laptime(laptime_avg2_[i]) + " [" + startlap_avg2_[i] + "-" + (startlap_avg2_[i] + avg2_nblaps - 1) + "]";
                        donnees_reform.d[i].avg2 = reformat_avg(2, i);
                    } else {
                        donnees_reform.d[i].avg2 = "--";
                    }
                    if (startlap_avg3_[i] != 0) {
                        //donnees_reform.d[i].avg3 = reformat_laptime(laptime_avg3_[i]) + " [" + startlap_avg3_[i] + "-" + (startlap_avg3_[i] + avg3_nblaps - 1) + "]";
                        donnees_reform.d[i].avg3 = reformat_avg(3, i);
                    } else {
                        donnees_reform.d[i].avg3 = "--";
                    }
                    //if (donnees.d[i].sec != undefined && donnees.nb_sec != undefined) {
                    if (donnees.d[i].sec != undefined) {
                        var s = 1;
                        var col_def = "#ffffff";
                        var line_white = 0
                        if ((i == selected_idxjs && selected_driver_mode != 0 && fond_blanc != 3) || (donnees.d[i].fr == 1 && transparence_lignes >= 0.2)) {
                            col_def = "#000000";
                            line_white = 1
                        }
                        var col = col_def;
                        var wgt = "normal";
                        donnees_reform.d[i].sec = "";
                        while (("S" + s) in donnees.d[i].sec) {
                            if (("S" + s + "t") in donnees.d[i].sec) {
                                if (donnees.d[i].sec["S" + s + "t"] >= 10) {
                                    wgt = "bold";
                                }
                                if (donnees.d[i].sec["S" + s + "t"] % 10 == 0) {
                                    if (line_white) {
                                        col = "#bbbbbb";
                                    } else {
                                        col = "#888888";
                                    }
                                    wgt = "normal";
                                }
                                if (donnees.d[i].sec["S" + s + "t"] % 10 == 1) {
                                    col = col_def;
                                }
                                if (donnees.d[i].sec["S" + s + "t"] % 10 == 2) {
                                    if (line_white) {
                                        col = "#00dd00";
                                    } else {
                                        col = "#00ff00";
                                    }
                                }
                                if (donnees.d[i].sec["S" + s + "t"] % 10 == 3) {
                                    col = "#ff00ff";
                                }
                            }
                            donnees_reform.d[i].sec += "<span style='color: #888888;font-size: 66%;'>" + s + " </span><span style='color: " + col + ";font-weight: " + wgt + "'>" + reformat_laptime(donnees.d[i].sec["S" + s]) + "</span> ";
                            s += 1;
                        }
                        if (s == 1) {
                            donnees_reform.d[i].sec = "--";
                        }
                    }

                    // Si le clubname a changé on recharge le logo
                    if (donnees.d[i].clubname_old != donnees.d[i].clubname) {
                        delete reload_clublogos[i];
                    }
                    donnees.d[i].clubname_old = donnees.d[i].clubname;

                    if (donnees.d[i].car != undefined) donnees_reform.d[i].car = reformat_car(donnees.d[i].car, i);

                    if (donnees.d[i].tire_compound != undefined) donnees_reform.d[i].tire_compound = reformat_tire_compound(donnees.d[i].car, donnees.d[i].tire_compound);
                    if (donnees.d[i].tires_stints != undefined) donnees_reform.d[i].tires_stints = reformat_tires_stints(donnees.d[i].car, donnees.d[i].tires_stints, i);
                    if (donnees.d[i].tires_nb_changes != undefined) donnees_reform.d[i].tires_nb_changes = donnees.d[i].tires_nb_changes;  // REM : j'ai toFixed(0) car je sais pas pourquoi sinon il n'affiche pas la valeur 0

                    if (ir_mode >= 3) {
                        if (donnees.d[i].ir != undefined && donnees.d[i].ir_gain != undefined) {
                            if (type_session == "Race") {
                                if (donnees.d[i].ir_gain >= 0) {
                                    donnees_reform.d[i].ir = donnees.d[i].ir + donnees.d[i].ir_gain + " <span style='font-weight:normal'>(+" + donnees.d[i].ir_gain + ")</span>";
                                } else {
                                    donnees_reform.d[i].ir = donnees.d[i].ir + donnees.d[i].ir_gain + " <span style='font-weight:normal'>(" + donnees.d[i].ir_gain + ")</span>";
                                }
                            } else {
                                    donnees_reform.d[i].ir = donnees.d[i].ir + " <span style='font-weight:normal'>(--)</span>";
                            }
                        }
                    }

                    // Ici on reforme la colonne p2p en fonction du p2p_status et du p2p_count
                    // REM : les couleurs sont gérées dans le fichier animations.js
                    if (donnees.d[i].p2p_count != undefined) {
                        if (donnees.d[i].p2p_count != -1) {
                            donnees_reform.d[i].p2p = donnees.d[i].p2p_count;
                        } else {
                            donnees_reform.d[i].p2p = "--";
                        }
                    }

                    for (var j = 0; j < tab_titres_all.length; j++) {
                        t = tab_titres_all[j];
                        if (disp_[t]) {
                            // We update the html only if there is new datas
                            //if (donnees.d[i][liste_donnees[t]["shortname"]] != undefined)
                            if (t in liste_donnees && donnees_reform.d[i][liste_donnees[t]["shortname"]] != undefined) {
                                // On ne charge les logos qu'une fois
                                if ((t != "clubname" && t != "car" && t != "line_num") || (t == "clubname" && !(i in reload_clublogos)) || (t == "car" && !(i in reload_carlogos))) {
                                    //document.getElementById(t + i).innerHTML = donnees_reform.d[i][liste_donnees[t]["shortname"]];
                                    set_inner_html(t + i, donnees_reform.d[i][liste_donnees[t]["shortname"]]);
                                    if (t == "clubname" && !(i in reload_clublogos)) {
                                        reload_clublogos[i] = 0;
                                    }
                                    if (t == "car" && !(i in reload_carlogos)) {
                                        reload_carlogos[i] = 0;
                                    }
                                }
                            }
                        }
                    }

                    // On affiche que les pilotes qui ont parcourus au moins 0 m en course
                    if (type_session == "Race" && donnees.d[i].dp < 0 && donnees.d[i].dp > -4 && donnees.s_init == 0) {
                        document.getElementById("p" + i).style.display = "none";
                        set_style_display("p" + i, "none");
                    } else {
                        document.getElementById("p" + i).style.display = "block";
                        set_style_display("p" + i, "block");
                    }

                    if (f3_box == 0)
                        cl = clt[i];
                    else
                        cl = donnees.d[i].posf3;

                    if (filtered == false && filter_colorized == 0) {
                        if (class_selected == 0 || f3_box != 0) {  // REM : on ne filtre pas les class en f3 box mode
                            if (donnees.d[i].dp % 1 < ldp_min && donnees.d[i].ts == 3) {
                                ldp_min = donnees.d[i].dp % 1;
                                sf_top = (cl - 1 + 1) * (Math.floor(coef_ligne * (ligne_h / dpi_factor_)));
                            }

                            //document.getElementById("p" + i).style.top = (cl - 1) * (Math.floor(coef_ligne * (ligne_h / dpi_factor_))) + "px";
                            set_style_top("p" + i, (cl - 1) * (Math.floor(coef_ligne * (ligne_h / dpi_factor_))) + "px");
                            set_inner_html("line_num" + i, cl);
                            if (i == selected_idxjs && selected_driver_mode != 0) {
                                selected_idxjs_scrollpos = (cl - 1) * Math.floor(coef_ligne * (ligne_h / dpi_factor_))
                            }
                        } else {
                            // Affichage par class
                            c = donnees.d[i].classid;
                            if (c == class_selected) {
                                if (donnees.d[i].dp % 1 < ldp_min && donnees.d[i].ts == 3) {
                                    ldp_min = donnees.d[i].dp % 1;
                                    sf_top = (clt_class[i] - 1 + 1) * Math.floor(coef_ligne * (ligne_h / dpi_factor_));
                                }

                                //document.getElementById("p" + i).style.top = (clt_class[i] - 1) * Math.floor(coef_ligne * (ligne_h / dpi_factor_)) + "px";
                                set_style_top("p" + i, (clt_class[i] - 1) * Math.floor(coef_ligne * (ligne_h / dpi_factor_)) + "px");
                                //console.log("#" + donnees.d[i].num, clt_class[i]);
                                set_inner_html("line_num" + i, clt_class[i]);
                                set_style_display("p" + i, "block");
                                if (i == selected_idxjs && selected_driver_mode != 0) {
                                    selected_idxjs_scrollpos = (clt_class[i] - 1) * Math.floor(coef_ligne * (ligne_h / dpi_factor_))
                                }
                            } else {
                                //document.getElementById("p" + i).style.display = "none";
                                set_style_display("p" + i, "none");
                                if (i == selected_idxjs && selected_driver_mode != 0) {
                                    selected_idxjs_scrollpos = -1
                                }
                            }
                        }
                    }

                    //console.log("****", selected_idxjs, selected_idxjs_scrollpos, selected_driver_mode)
                    // Filtrage par voitures
                    if (filtered == true && filter_colorized == 0) {
                        if (donnees.d[i].car in cars_list) {
                            if (cars_list[donnees.d[i].car] == 0) {
                                //document.getElementById("p" + i).style.display = "none";
                                set_style_display("p" + i, "none");
                            } else {
                                //document.getElementById("p" + i).style.display = "block";
                                set_style_display("p" + i, "block");
                                idx_filtered[cl] = i;
                            }
                        }
                    }

                    // On n'affiche que les voitures sélectionnées dans "Colorize Drivers"
                    if (filter_colorized == 1) {
                        if (document.getElementById('opt_colorize_drivers_' + i).checked) {
                            //document.getElementById("p" + i).style.display = "block";
                            set_style_display("p" + i, "block");
                            //document.getElementById("p" + i).style.top = (clt_filter_colorized[i] - 1) * Math.floor(coef_ligne * (ligne_h / dpi_factor_)) + "px";
                            set_style_top("p" + i, (clt_filter_colorized[i] - 1) * Math.floor(coef_ligne * (ligne_h / dpi_factor_)) + "px");
                            set_inner_html("line_num" + i, clt_filter_colorized[i]);
                        } else {
                            //document.getElementById("p" + i).style.display = "none";
                            set_style_display("p" + i, "none");
                        }
                    }

                    // On met en évidence les packs de voitures
                    if ( ((type_session == "Race" && classement == "pos") || f3_box == 1) && pack_disp == 1 && (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined)) {
                        pack_start = -1;
                        pack_end = -1;

                        if (f3_box == 0) {
                            p = donnees.d[i].pos;
                            if (p != undefined && donnees.idx_pos != undefined) {
                                i_pre = donnees.idx_pos[p - 1];
                                i_post = donnees.idx_pos[p + 1];

                                if (i_pre >= 0) {
                                    if (donnees.d[i].g > 0 && donnees.d[i_pre].g > 0 && (jrt_session_duration > donnees.d[i].g || jrt_session_duration == 0) ) {
                                        gap_pre = donnees.d[i].g - donnees.d[i_pre].g;
                                    } else {
                                        // Autre méthode avec les écarts distance et la vitesse si on ne dispose pas des gaps
                                        speed = donnees.d[i].s;
                                        if (speed < 50) {
                                            speed = 50;
                                        }
                                        gap_pre = (donnees.d[i_pre].dp - donnees.d[i].dp) * donnees.dtrack / (1000 * speed / 3600);
                                    }
                                    if (gap_pre < pack_gap) {
                                        pack_start = 0;
                                    } else {
                                        pack_start = 1;
                                    }
                                }
                                if (p == 1) {
                                    pack_start = 1;
                                }

                                if (i_post >= 0) {
                                    if (donnees.d[i].g > 0 && donnees.d[i_post].g > 0 && (jrt_session_duration > donnees.d[i].g || jrt_session_duration == 0) ) {
                                        gap_post = donnees.d[i_post].g - donnees.d[i].g;
                                    } else {
                                        // Autre méthode avec les écarts distance et la vitesse si on ne dispose pas des gaps
                                        speed_post = donnees.d[i_post].s;
                                        if (speed_post < 50) {
                                            speed_post = 50;
                                        }
                                        gap_post = (donnees.d[i].dp - donnees.d[i_post].dp) * donnees.dtrack / (1000 * speed_post / 3600);
                                    }
                                    if (gap_post < pack_gap) {
                                        pack_end = 0
                                    } else {
                                        pack_end = 1;
                                    }
                                } else {
                                    pack_end = 1;
                                }
                            }
                        } else {
                            p = donnees.d[i].posf3;
                            if (p != undefined && donnees.idx_posf3 != undefined) {
                                i_pre = donnees.idx_posf3[p - 1];
                                i_post = donnees.idx_posf3[p + 1];

                                if (i_pre >= 0) {
                                    if (donnees.d[i].rcf3 != undefined && donnees.d[i_pre].rcf3 != undefined) {
                                        gap_pre = donnees.d[i_pre].rcf3 - donnees.d[i].rcf3;
                                        if (gap_pre < pack_gap && gap_pre > 0) {
                                            pack_start = 0;
                                        } else {
                                            pack_start = 1;
                                        }
                                    }
                                }
                                if (p == 1) {
                                    pack_start = 1;
                                }

                                if (i_post >= 0) {
                                    if (donnees.d[i].rcf3 != undefined && donnees.d[i_post].rcf3 != undefined) {
                                        gap_post = donnees.d[i].rcf3 - donnees.d[i_post].rcf3;
                                        if (gap_post < pack_gap && gap_post > 0) {
                                            pack_end = 0
                                        } else {
                                            pack_end = 1;
                                        }
                                    }
                                } else {
                                    pack_end = 1;
                                }
                            }
                        }

                        /*tmp_1 = 1;
                        tmp_2 = 2;
                        tmp_3 = 3;
                        tmp_4 = 4;
                        tmp_8 = 8;*/
                        tmp_1 = 1 / dpi_factor;
                        tmp_2 = 2 / dpi_factor;
                        tmp_3 = 3 / dpi_factor;
                        tmp_4 = 4 / dpi_factor;
                        tmp_8 = 8 / dpi_factor;
                        if (i != mouse_over_idx) {
                            if (pack_start == 1 && pack_end == 0) {  // début du pack
                                RGBA(jQuery('#pPr' + i), pack_transparency);
                                $("#pP" + i).css("margin-top", "0px");
                                $("#pP" + i).css("border-left", tmp_3 + "px solid " + pack_color);
                                $("#pP" + i).css("border-right", tmp_1 + "px solid " + pack_color);
                                $("#pP" + i).css("border-top", tmp_1 + "px solid " + pack_color);
                                $("#pP" + i).css("border-bottom", "0px");
                                $("#pP" + i).css("height", ligneP_height - tmp_1 + tmp_4 + "px");

                                $("#pPr" + i).css("display", "block");
                                $("#pP" + i).css("display", "block");
                            } else if (pack_start == 0 && pack_end == 1) {  // fin du pack
                                RGBA(jQuery('#pPr' + i), pack_transparency);
                                $("#pP" + i).css("margin-top", "-" + tmp_4 + "px");
                                $("#pP" + i).css("border-left", tmp_3 + "px solid " + pack_color);
                                $("#pP" + i).css("border-right", tmp_1 + "px solid " + pack_color);
                                $("#pP" + i).css("border-top", "0px");
                                $("#pP" + i).css("border-bottom", tmp_1 + "px solid " + pack_color);
                                $("#pP" + i).css("height", ligneP_height - tmp_2 + tmp_4 + "px");

                                $("#pPr" + i).css("display", "block");
                                $("#pP" + i).css("display", "block");
                            } else if (pack_start == 0 && pack_end == 0) {  // milieu du pack
                                RGBA(jQuery('#pPr' + i), pack_transparency);
                                $("#pP" + i).css("margin-top", "-" + tmp_4 + "px");
                                $("#pP" + i).css("border-left", tmp_3 + "px solid " + pack_color);
                                $("#pP" + i).css("border-right", tmp_1 + "px solid " + pack_color);
                                $("#pP" + i).css("border-top", "0px");
                                $("#pP" + i).css("border-bottom", "0px");
                                $("#pP" + i).css("height", ligneP_height + tmp_8 + "px");

                                $("#pPr" + i).css("display", "block");
                                $("#pP" + i).css("display", "block");
                            } else {  // pas de pack
                                RGBA(jQuery('#pPr' + i), 0.0);
                                $("#pP" + i).css("margin-top", "0px");
                                $("#pP" + i).css("border-left", "0px");
                                $("#pP" + i).css("border-right", "0px");
                                $("#pP" + i).css("border-top", "0px");
                                $("#pP" + i).css("border-bottom", "0px");
                                $("#pP" + i).css("height", ligneP_height + "px");

                                $("#pPr" + i).css("display", "none");
                                $("#pP" + i).css("display", "none");
                            }
                        } else {
                            RGBA(jQuery('#pPr' + i), 0.0);
                            $("#pP" + i).css("margin-top", "0px");
                            $("#pP" + i).css("border-left", "0px");
                            $("#pP" + i).css("border-right", "0px");
                            $("#pP" + i).css("border-top", "0px");
                            $("#pP" + i).css("border-bottom", "0px");
                            $("#pP" + i).css("height", ligneP_height + "px");

                            $("#pPr" + i).css("display", "none");
                            $("#pP" + i).css("display", "none");
                        }

                    } else {
                        RGBA(jQuery('#pPr' + i), 0.0);
                        $("#pP" + i).css("margin-top", "0px");
                        $("#pP" + i).css("border-left", "0px");
                        $("#pP" + i).css("border-right", "0px");
                        $("#pP" + i).css("border-top", "0px");
                        $("#pP" + i).css("border-bottom", "0px");
                        $("#pP" + i).css("height", ligneP_height + "px");

                        $("#pPr" + i).css("display", "none");
                        $("#pP" + i).css("display", "none");
                    }

                } else {
                    //document.getElementById("p" + i).style.display = "none";
                    set_style_display("p" + i, "none");
                }
            } else if (i == donnees.me && donnees.me_is_spectator) {
                //document.getElementById("p" + i).style.display = "none";
                set_style_display("p" + i, "none");
            }
        }

        // Position de la ligne de départ/arrivée
        if (sf_line_disp) {
            //document.getElementById("sf_line").style.top = sf_top - 2 + "px";
            set_style_display("sf_line", "block");
            set_style_top("sf_line", sf_top - 2 + "px");
        } else {
            set_style_display("sf_line", "none");
        }

        if (filtered) {
            // On renumérote le classement filtré par voitures
            cl_filtered = 1;
            for (cl in idx_filtered) {
                i = idx_filtered[cl];
                clt_filtered_tmp[i] = cl_filtered;
                //document.getElementById("p" + i).style.top = (cl_filtered - 1) * (Math.floor(coef_ligne * (ligne_h / dpi_factor_))) + "px";
                set_style_top("p" + i, (cl_filtered - 1) * (Math.floor(coef_ligne * (ligne_h / dpi_factor_))) + "px");
                set_inner_html("line_num" + i, cl_filtered);
                cl_filtered++;
            }
        }

        // Défilement automatique des pilotes sélectionnés dans le menu "Corolize Drivers"
        if (filter_colorized == 1 && change_drivers_delay > 0) {
            if (parseInt(Date.now() / 1000) > change_drivers_delay_init + change_drivers_delay) {
                i = selected_idx + 1;
                new_idx = selected_idx;
                tmp_found = false;
                tmp_nb = 0; // pour éviter de faire plusieurs fois la boucle
                while(tmp_found == false && tmp_nb < 64) {
                    if (donnees_new != null && donnees_new.d != undefined && (i != donnees.me || donnees.me_is_spectator == 0)) {
                        if (i in donnees_new.d) {
                            if (document.getElementById('opt_colorize_drivers_' + i).checked) {
                                new_idx = i;
                                tmp_found = true;
                            }
                        }
                    }
                    i++;
                    if (i >= 64) {
                        i = 0;
                    }
                    tmp_nb++;
                }
                //console.log("changement automatique -> " + new_idx);
                change_idxsel(new_idx);
                if (broadcast == 0) {
                    ws.send("focus_replay;" + new_idx);
                }
                change_drivers_delay_init = parseInt(Date.now() / 1000);
            }
        }

    }

    // Wind alert
    if (wind_alert) {
        if (winddir_old != null && windspeed_old != null) {
            winddir_changed = Math.abs((winddir_old - donnees.winddir) / Math.PI * 180) > 45;
            winddir_changed = winddir_changed && Math.abs((winddir_old - donnees.winddir - Math.PI * 2) / Math.PI * 180) > 45;
            winddir_changed = winddir_changed && Math.abs((winddir_old - donnees.winddir + Math.PI * 2) / Math.PI * 180) > 45;
            windspeed_changed = Math.abs(windspeed_old - donnees.windspeed)*3.6 > 5;
            if (winddir_changed) {  // Si le vent a changé de direction
                $("#wind_alert").css("display", "block");
                winddir_old = Math.floor(donnees.winddir / Math.PI * 180 / 45 + 0.5) * Math.PI / 180 * 45;
                document.getElementById("wind_alert").innerHTML = "<br>Wind <i>DIRECTION</i> changed<br><span style = 'font-size: 2em;'><i>" + reformat_winddir(winddir_old / Math.PI * 180) + "</i></span>";
                setTimeout(function () {
                    $("#wind_alert").css("display", "none");
                }, 3000);
            }
            if (windspeed_changed) {  // Si le vent a changé de direction
                $("#wind_alert").css("display", "block");
                windspeed_old = Math.floor(donnees.windspeed * 3.6 / 5 + 0.5) * 5 / 3.6;
                if (donnees.u == 1) {
                    str_speed = (windspeed_old * 3.6).toFixed(1) + " km/h";
                } else {
                    str_speed = (windspeed_old * 3.6 / 1.609344).toFixed(1) + " MPH";
                }
                document.getElementById("wind_alert").innerHTML = "<br>Wind <i>SPEED</i> changed<br><span style = 'font-size: 2em;'><i>" + str_speed + "</i></span>";
                setTimeout(function () {
                    $("#wind_alert").css("display", "none");
                }, 3000);
            }
        } else {
            if (donnees.winddir != undefined && donnees.windspeed != undefined) {
                winddir_old = Math.floor(donnees.winddir / Math.PI * 180 / 45 + 0.5) * Math.PI / 180 * 45;
                windspeed_old = Math.floor(donnees.windspeed * 3.6 / 5 + 0.5) * 5 / 3.6;
            }
        }
    }

    clt_filtered = {};
    for (i in clt_filtered_tmp) {
        clt_filtered[i] = clt_filtered_tmp[i];
    }

    scroll_to_selected_idxjs();
    animations();
    lic_class_color();
    //if (type_session == "Race" || f3_box == 1)

    //if(donnees_new.offline == undefined) {
        deltas_and_gapcolor();
    //}

    if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) {  // On affiche la trackmap que pour les utilisateurs possédant une licence pro
        if (disp_trackmap)
            trackmap();
        //document.getElementById("buy_paypal").style.display = "none";
        set_style_display("buy_paypal", "none");
        if (donnees.pro_v == 1)  // On n'affiche pas la barre paypal pour la version pro
            disp_paypal = 0;
    }
    if (donnees.pro_v == 0 && donnees.try_v == 0) { // On affiche le bouton BUY de Paypal et on efface les infos de fuel
        //document.getElementById("buy_paypal").style.display = "block";
        if (try_expired == 0) {
            try_expired = 1;
            disp_fuelinfos = 0;
            responsive_dim(disp_param);
        }
    }


    // On indique si c'est la version pro
    if (donnees_new != null && donnees_new.pro_v != undefined) {
        //console.log(donnees_new.pro_v);
        if (donnees_new.pro_v != pro_v_old) {
            if (donnees_new.pro_v <= 0) {
                prefixe_pro = "";
            } else {
                prefixe_pro = "PRO ";
            }

            document.getElementById("app_name").innerHTML = prefixe_pro + "v" + version;
            // S'il y a une nouvelle version on le signale
            //if (lastversion != version)
            //    document.getElementById("app_name").innerHTML += " <span style='font-weight:bold;color:#ff0000;'>!!!</span>";
        }
        pro_v_old = donnees_new.pro_v;
    } else {
        if (ask_ispro == 1 && photo_processing == 0 && photo_processing_old == 0) {
            if (broadcast == 0) {
                ws.send("ispro");
            } else if (broadcast == 1) {
                ws3.send("ispro");
            }
            ask_ispro = 0;
        }
    }


    if (teamracing_received != undefined) {
        // Dès qu'on reçoit les infos teamracing pour connaitre le type de course on remet en forme
        if (teamracing_received == 0 && donnees.teamracing != undefined) {
            responsive_dim(disp_param);
            teamracing_received = 1
        }
    } else {
        teamracing_received = 0
    }

    // On efface le timing si le paramètre disp_timing est égal à 0
    if (disp_timing_under_trackmap == 0 && disp_trackmap == 1) {
        //document.getElementById('container').style.display = 'none';
        set_style_display("container", "none");
        //document.getElementById('p00').style.display = 'none';
        set_style_display("p00", "none");
    }
    if (disp_trackmap == 0) {
        //document.getElementById('container').style.display = 'block';
        set_style_display("container", "block");
        if (disp_titres) {
            //document.getElementById('p00').style.display = 'block';
            set_style_display("p00", "block");
        }
    }

    selected_idxold = selected_idx;


    if (text_header == "-3" || text_header == "-2") {
        send_config = JSON.parse(text_header_[1]);
    } else if (donnees_new != null) {
        send_config = donnees_new.s_c;
    } else {
        send_config = null;
    }

    //console.log(send_config.tstamp)
    // Changement de configuration
    window_shortname = get_window_shortname(window_name);
    if (send_config != undefined && window_shortname in send_config) {
        send_config = send_config[window_shortname];
    } else {
        send_config = {};
    }
    if (send_config != null && send_config != undefined && broadcast <= 1 && text != -1) {
        if ("tstamp" in send_config) {
            if (send_config_tstamp != send_config.tstamp && send_config != "") {
                send_config_tstamp = send_config.tstamp;
                //console.log(send_config);
                change_config(send_config);
                /*init_var();
                init_aff(disp_param);
                update_aff(disp_param);
                update_datas(-1);
                responsive_dim(disp_param);*/
            }
        }
    }

}


function effacer_tableau() {
    // ATTENTION ! on efface pas le delta
    for(var i=0;i<64;i++) {
        for (var j = 0; j < tab_titres_all.length; j++) {
            t = tab_titres_all[j];
            if (t in liste_donnees) {
                if (t != "delta") {
                    //document.getElementById(t + i).innerHTML = "";
                    set_inner_html(t + i, "");
                }
            }
        }
    }

    // On efface les infos de fuel et de session
    //document.getElementById("tank").innerHTML = "--";
    set_inner_html("tank", "--");
    //document.getElementById("conso").innerHTML = "--";
    set_inner_html("conso", "--");
    //document.getElementById("estlaps").innerHTML = "--";
    set_inner_html("estlaps", "--");
    //document.getElementById("timeremain").innerHTML = "--";
    set_inner_html("timeremain", "--");
    timeremain_old = "--";
    //document.getElementById("lapsremain").innerHTML = "--";
    set_inner_html("lapsremain", "--");
    //document.getElementById("fuelneed").innerHTML = "--";
    set_inner_html("fuelneed", "--");
    //document.getElementById("sessioninfos").innerHTML = "--";
    set_inner_html("sessioninfos", "--");
    //document.getElementById("sof_cont").innerHTML = "--"
    set_inner_html("sof_cont", "--");
}


// Create elements to display
function aff_titres(param) {
    aff = '';
    //for(t in liste_donnees) if (liste_donnees[t].disp) {
    for (j = 0; j < tab_titres_all.length; j++) {
        t = tab_titres_all[j];
        if (t in liste_donnees) {
            aff += '<div ';
            aff += 'onclick="sort_or_switch(\'' + t + '\');" ';
            aff += 'class="' + t + '" id="' + t + '00">' + liste_donnees[t].titre + '</div>';
        }
    }
    document.getElementById('p00').innerHTML = aff;
    document.getElementById('p00').style.lineHeight = (ligne_h / dpi_factor_) + "px";
    document.getElementById('p00').style.height = (ligne_h / dpi_factor_) + "px";
    if (disp_titres == 0) {
        //document.getElementById('p00').style.display = 'none';
        set_style_display("p00", "none");
    }
}


function aff_ligne_pilote(idx) {
    aff = '';
    for (j=0; j < tab_titres_all.length; j++) {
        t = tab_titres_all[j];
        if (t in liste_donnees) {
            aff += '<div ';
            aff += 'class="' + t + '" id="' + t + idx + '"></div>';
        }
    }
    return aff;
}


function change_idxsel(i) {
    if (disp_laptimes) {
        change_laptime_idx(i);
    }
    if (f3_box == 0) {
        if (selected_driver_mode == 1) {  // On ne peut sélectionner le pilote qu'en mode 1
            selected_idxjsold = selected_idxjs;
            selected_idxjs = i;
            for (i = 1; i <= 64; i++) {
                init_delta[i] = 1
            }
            update_datas(-1);
            // On recharge les events pour le ticker
            reload_ticker_events();
        }
    }
}


function change_kg_livre() {
    disp_kg_livre = 1;
    if (donnees.u == 1) {  // systeme metric
        coef_fuel = 0.75
    } else {
        coef_fuel = 1 / (0.45359237 / 0.75 / 3.78541178);        //  1 Ga = 3.78541178 L     1 livre = 0.45359237 kg
    }
    update_datas(-1)
}


function change_litre_gallon() {
    disp_kg_livre = 0;
    coef_fuel = 1;
    update_datas(-1)
}


// Param = 0 : on affiche que les colonnes indiquées dans le fichier de config
// Param = 1 : on affiche toutes les colonnes
function init_aff(param) {

    // On lit les changements de titres indiqués dans le fichier template.txt
    for (t in set_title) {
        if (t in liste_donnees) {
            liste_donnees[t]["titre"] = set_title[t];
        }
    }

    aff_titres(param);
    aff = "<div id='timing'>";
    for (var i=0;i<64;i++) {
        aff += '<div class="ligne" ';
		if( /Android|webOS|iPhone|iPad/i.test(navigator.userAgent) ) {
			// Pas de double click sur les tablettes
			aff += "onclick = 'change_idxsel("+i+");' id='p"+i+"'>";
            delai_change_laptimes = 0; // on réduit le délai à 0
		} else {
			aff += "ondblclick = 'change_idxsel("+i+");' id='p"+i+"'>";
		}

        aff += '<div class="ligneB" onmouseover=\'mouse_over_idx ='+i+'; \' onmouseout=\'mouse_over_idx = -1;\'  id="pB'+i+'">';
        aff += '<div class="ligneH" id="pH'+i+'">';

        //aff += '<div class="ligneP" onmouseover=\'this.style.display="none"\' id="pP'+i+'">&nbsp;</div>';
        // REM : j'ai enlevé le onmouseover qui causait des ralentissements avec l'oculus
        aff += '<div class="ligneP" id="pP'+i+'">&nbsp;</div>';

        //aff += '<div class="lignePr"  onmouseover=\'this.style.display="none"\' id="pPr'+i+'">&nbsp;</div>';
        // REM : j'ai enlevé le onmouseover qui causait des ralentissements avec l'oculus
        aff += '<div class="lignePr" id="pPr'+i+'">&nbsp;</div>';

        //aff += '<div class="ligneM" onmouseover=\'this.style.backgroundColor = "rgba(0,0,0,0)";this.style.zIndex="-1";\' id="pM'+i+'"></div>'; // Sert à masquer partiellement les pilotes hors piste
        // REM : j'ai enlevé le onmouseover qui causait des ralentissements avec l'oculus
        aff += '<div class="ligneM" id="pM'+i+'"></div>'; // Sert à masquer partiellement les pilotes hors piste

        aff += aff_ligne_pilote(i);
        aff += '</div></div></div>'
    }
    aff+="</div>";

    aff += "<div id='sf_line'>&nbsp;</div>";

    document.getElementById('tableau').innerHTML = aff;

    for (var i = 0; i < 64; i++) {
        document.getElementById("delta" + i).style.visibility = "visible";
        document.getElementById("p" + i).style.visibility = "visible";

        document.getElementById("p" + i).originalindex = i;  // astuce pour passer un parametre à la fonction

		if( /Android|webOS|iPhone|iPad/i.test(navigator.userAgent) ) {
            document.getElementById("p" + i).ontouchend = function (event) {
                if (Date.now() - click_status.start > focus_replay_delay) {
                    if (broadcast == 0) {
                        ws.send("focus_replay;" + click_status.caridx);
                    }
                }
                click_status = {'start': 0, 'caridx': -2};

            };
        } else {
            // Si on fait un clic long sur une ligne, on fait le focus sur le pilote
            document.getElementById("p" + i).onmousedown = function (e) {
                e = e || window.event;
                button = e.which || e.button;
                if (button == 1) { // On limite au click gauche
                    click_status = {'start': Date.now(), 'caridx': this.originalindex}
                }
            };
            document.getElementById("p" + i).onmouseup = function (e) {
                e = e || window.event;
                button = e.which || e.button;
                if (button == 1) { // On limite au click gauche
                    if (Date.now() - click_status.start > focus_replay_delay) {
                        if (broadcast == 0) {
                            ws.send("focus_replay;" + click_status.caridx);
                        }
                    }
                    click_status = {'start': 0, 'caridx': -2};
                }
            };
        }

		if( /Android|webOS|iPhone|iPad/i.test(navigator.userAgent) ) {
            // Pour les tablettes, on remplace le click droit par 2 doigts
            document.getElementById("p" + i).ontouchstart = function (event) {
                var i = this.originalindex;
                if (event.changedTouches.length >= 2) {
                    change_laptime_idx(i)
                } else {
                    // Si on fait un touch long sur une ligne, on fait le focus sur le pilote
                    click_status = {'start': Date.now(), 'caridx': this.originalindex}
                }
            };
        } else {
            // si click droit
            document.getElementById("p" + i).oncontextmenu = function (event) {
                var i = this.originalindex;
                change_laptime_idx(i);
                return false; // pour empêcher l'affichage du menu contextuel
            };
        }

    }


    // on définit les canvas comme enfant des deltas pour pouvoir défnir leur position en relatif
    for (var i = 0; i < 64; i++) {
        document.getElementById("delta" + i).appendChild(document.getElementById("canvas" + i));
        document.getElementById("delta" + i).appendChild(document.getElementById("canvasB" + i));
    }

    // On force le mode autoscroll si le mode f3 est choisi
    if (f3_box == 1) {
        autoscroll = 1;
        document.getElementById("opt_autoscroll").checked = true;
    }

    // Gestion de la scrollbar pour le timing
    if (disp_scrollbar && !(/Android|webOS|iPhone|iPad/i.test(navigator.userAgent))) {
        $("#container").css("right", "0px");
        $("#display_options").css("right", "17px");
        $("#laptimes").css("right", "17px");
        $("#colorize_drivers_menu").css("right", "17px");
    } else {
        //$("#container").css("right", "-17px");
        $("#container").css("right", "-25px");  // pour corriger l'apparition d'un bout de la scrollbar
        $("#display_options").css("right", "0px");
        $("#laptimes").css("right", "0px");
        $("#colorize_drivers_menu").css("right", "0px");
    }

    // Un click droit sur le laptimes history permet de le fermer
    if( /Android|webOS|iPhone|iPad/i.test(navigator.userAgent) ) {
        // Pour les tablettes, on remplace le click droit par 2 doigts
        document.getElementById("laptimes").ontouchstart = function (event) {
            if (event.changedTouches.length >= 2) {
                disp_laptimes = 0;
                toggle_laptimes(0)
            }
        };
    } else {
        // si click droit
        document.getElementById("laptimes").oncontextmenu = function (event) {
            disp_laptimes = 0;
            toggle_laptimes(0)
            return false; // pour empêcher l'affichage du menu contextuel
        };
    }

}

function change_laptime_idx(i) {
    disp_laptimes_old = disp_laptimes;
    if (i == laptimes_idx || disp_laptimes == 0) {
    //if (disp_laptimes == 0) {
        disp_laptimes = Math.abs(disp_laptimes - 1);
    } else {
        disp_laptimes = 1;
    }
    //if (i != laptimes_idx) {
        if (disp_laptimes) {
            toggle_laptimes(1);
            if (disp_laptimes_old) {
                setTimeout(function () {
                    init_laptimes(i);
                }, delai_change_laptimes);
            } else {
                init_laptimes(i);
            }
        } else {
            toggle_laptimes(0);
        }
    //}
}

function toggle_laptimes(val) {

    if (force_inner_w) {
        window_innerWidth = inner_width;
    } else {
        window_innerWidth = window.innerWidth;
    }

    if (val == 1) {
        //console.log(disp_laptimes_old)
        if (disp_laptimes_old) {
            $('#laptimes').transition({x: 0.67 * window_innerWidth, y: 0}, delai_change_laptimes, 'ease');
        }
        $('#laptimes').transition({x: 0.67 * window_innerWidth, y: 0}, 0);
        document.getElementById("laptimes").style.display = "block";
        $('#laptimes').transition({x: 0, y: 0}, delai_change_laptimes, 'ease');
    } else {
        setTimeout(function() { document.getElementById('laptimes').style.display = 'none'}, delai_change_laptimes);
        $('#laptimes').transition({x: 0.67 * window_innerWidth, y: 0}, delai_change_laptimes, 'ease');
    }
}

function update_aff(param) {

    for (j=0; j < tab_titres_all.length; j++) {
        t = tab_titres_all[j];
		if (document.getElementById(t + "00") != null) {
            if (disp[t] || (param == 1)) {
                if (param == 1)
                    if (disp[t]) document.getElementById(t + "00").style.backgroundColor = "rgba(180,0,0,1)";
                    else document.getElementById(t + "00").style.backgroundColor = "#000000";
                else document.getElementById(t + "00").style.backgroundColor = "rgba(0,0,0,0)";
            }
            var tab = document.getElementsByClassName(t);
            for (i = 0; i < tab.length; i++) {
                if (disp[t]) {
                    tab[i].style.display = "inline-block";
                    tab[i].style.visibility = "visible";
                } else {
                    if (param == 1) {
                        tab[i].style.display = "inline-block";
                        tab[i].style.visibility = "hidden";
                    } else {
                        tab[i].style.display = "none";
                    }
                }
            }
            if (param == 1) {
                document.getElementById(t + "00").style.display = "inline-block";
                document.getElementById(t + "00").style.visibility = "visible"
            } else {
                if (disp[t]) {
                    document.getElementById(t + "00").style.display = "inline-block";
                    document.getElementById(t + "00").style.visibility = "visible"
                } else {
                    document.getElementById(t + "00").style.display = "none";
                }
            }
        }
    }

    responsive_dim(param);
}


// Fonction appelée quand on click sur un titre
function sort_or_switch(t) {
    if (disp_param == 0) {
        if (f3_box == 0) {
            sort(t);
            for (k in donnees.d) clt_old[k] = clt[k]
        }
    } else {
        switch_disp(t)
    }
}


// Sort the drivers by 't'
function sort(t) {
    if (name_mode >= 4 && t == "name") {
        t = "teamname"
    }
    if (t in liste_donnees && liste_donnees[t].ordre) {  // If we are authorized to sort by 't'
        classement = t;
        classpos = {};
        for (k in donnees.d) {
            pos = 1;
            classid_k = donnees.d[k].classid;
            classpos[classid_k] = 1;
            if (t == "num") t_k = parseInt(donnees.d[k][liste_donnees[t]["shortname"]]);
            else if (t == "avg1") t_k = laptime_avg1_[k];
            else if (t == "avg2") t_k = laptime_avg2_[k];
            else if (t == "avg3") t_k = laptime_avg3_[k];
            else t_k = donnees.d[k][liste_donnees[t]["shortname"]];
            if ((t_k == undefined) || ((k == donnees.me) && (donnees.me_is_spectator != 0))) {
                if (liste_donnees[t].ordre == 1) t_k = 9999;
                else t_k = -9999;
                if ((k == donnees.me) && (donnees.me_is_spectator != 0)) {
                    t_k = t_k*1.1
                }
            }
            if (t == "qualy" || t == "best" || t == "last" || t == "pitroadtime" || t == "pitstalltime" || t == "avg1" || t == "avg2" || t == "avg3") {
                if (t_k <= 0) t_k = 9999
            }
            for (j in donnees.d) {
                classid_j = donnees.d[j].classid;
                if (t == "num") t_j = parseInt(donnees.d[j][liste_donnees[t]["shortname"]]);
                else if (t == "avg1") t_j = laptime_avg1_[j];
                else if (t == "avg2") t_j = laptime_avg2_[j];
                else if (t == "avg3") t_j = laptime_avg3_[j];
                else t_j = donnees.d[j][liste_donnees[t]["shortname"]];
                if ((t_j == undefined) || ((j == donnees.me) && (donnees.me_is_spectator != 0))) {
                    if (liste_donnees[t].ordre == 1) t_j = 9999;
                    else t_j = -9999
                    if ((j == donnees.me) && (donnees.me_is_spectator != 0)) {
                        t_j = t_j*1.1
                    }
                }
                if (t == "qualy" || t == "best" || t == "last" || t == "pitroadtime" || t == "pitstalltime" || t == "avg1" || t == "avg2" || t == "avg3") {
                    if (t_j <= 0) t_j = 9999
                }
                if (liste_donnees[t].ordre == 2) {
                    if (t_j > t_k) {
                        pos += 1;
                        if (classid_j == classid_k)
                            classpos[classid_k] += 1
                    }
                } else if (t_j < t_k) {
                    pos += 1;
                    if (classid_j == classid_k)
                        classpos[classid_k] += 1
                }
                if (t_j == t_k && j > k) {
                    pos += 1;
                    if (classid_j == classid_k)
                        classpos[classid_k] += 1
                }
            }
            clt[k] = pos;
            clt_class[k] = classpos[classid_k];
            //console.log(k, "#" + donnees.d[k].num, clt_class[k]);
            if (pos == 1) {
                clt_idxp1 = k
            }
        }
    }

    // On met à jour l'affichage immédiatement (REM : ne fonctionne pas bien si on est hors connection)
    if (f3_box == 0) {
        //change_classid(donnees)
        if (filtered == false && filter_colorized == 0) {
            if (class_selected == 0) {
                for (var i = 0; i < 64; i++) {
                    if (i in donnees.d) {
                        set_style_top("p" + i, (clt[i] - 1) * Math.floor(coef_ligne * (ligne_h / dpi_factor_)) + "px");
                        set_inner_html("line_num" + i, clt[i]);
                        set_style_display("p" + i, "block");
                    }
                }
            } else {
                for (var i = 0; i < 64; i++) {
                    // Affichage par class
                    if (donnees.d != undefined && i in donnees.d && "classid" in donnees.d[i]) {
                        c = donnees.d[i].classid;
                        if (c == class_selected) {
                            set_style_top("p" + i, (clt_class[i] - 1) * Math.floor(coef_ligne * (ligne_h / dpi_factor_)) + "px");
                            set_inner_html("line_num" + i, clt_class[i]);
                            set_style_display("p" + i, "block");
                        } else {
                            set_style_display("p" + i, "none");
                        }
                    }
                }
            }
        }
    }

}


// ************************ MAIN PROGRAM *************************

// Liste des titres de colonnes (ATTENTION ! Laisser cette liste dans ce fichier javascript sinon ça bug !!! )
// ordre : 0 -> none, 1 -> ascending, 2 -> descending
liste_donnees = {
    pos: {titre: "P", shortname: "pos", ordre: 1},
    line_num: {titre: "P", shortname: "line_num", ordre: 0},
    cpos: {titre: "C", shortname: "cpos", ordre: 1},
    spos: {titre: "sP", shortname: "spos", ordre: 1},
    scpos: {titre: "sC", shortname: "scpos", ordre: 1},
    gain: {titre: "PG", shortname: "gain", ordre: 2},
    cgain: {titre: "CG", shortname: "cgain", ordre: 2},
    num: {titre: "#", shortname: "num", ordre: 1},
    name: {titre: "NAME", shortname: "name", ordre: 1},
    teamname: {titre: "TEAM", shortname: "tn", ordre: 1},
    ir: {titre: "iR", shortname: "ir", ordre: 2},
    lic: {titre: "Lic", shortname: "lic", ordre: 0},
    rel: {titre: "REL", shortname: "rc", ordre: 2},
    delta: {titre: "Δ", shortname: "delta", ordre: 0},
    gap: {titre: "GAP", shortname: "g", ordre: 1},
    cgap: {titre: "CGAP", shortname: "cg", ordre: 1},
    gap_dist: {titre: "m", shortname: "gd", ordre: 1},
    last: {titre: "LAST", shortname: "l", ordre: 1},
    best: {titre: "BEST", shortname: "b", ordre: 1},
    lc: {titre: "LC", shortname: "lc", ordre: 2},
    distpct: {titre: "distpct", shortname: "dp", ordre: 2},
    lapdistpct: {titre: "lapdist", shortname: "ldp", ordre: 2},
    posf3: {titre: "posf3", shortname: "posf3", ordre: 1},
    speed: {titre: "SPD", shortname: "s", ordre: 0},
    topspeed: {titre: "TOP", shortname: "tops", ordre: 2},
    apex_speed: {titre: "Apex", shortname: "as", ordre: 0},
    max_speed: {titre: "Max", shortname: "ms", ordre: 0},
    accel: {titre: "Accel", shortname: "a", ordre: 0},
    stint: {titre: "St", shortname: "sti", ordre: 2},
    pit: {titre: "PIT", shortname: "np", ordre: 1},
    pitroadtime: {titre: "lane", shortname: "rt", ordre: 1},
    pitstalltime: {titre: "Stop", shortname: "st", ordre: 1},
    inc: {titre: "INC", shortname: "ni", ordre: 1},
    clubname: {titre: "Club", shortname: "clubname", ordre: 1},
    car: {titre: "car", shortname: "car", ordre: 1},
    qualy: {titre: "qualy", shortname: "qualy", ordre: 1},
    points : {titre: "Pts", shortname: "pts", ordre: 2},
    avg1: {titre: "AVG5", shortname: "avg1", ordre: 1},
    avg2: {titre: "AVG10", shortname: "avg2", ordre: 1},
    avg3: {titre: "AVG15", shortname: "avg3", ordre: 1},
    sectors: {titre: "Sectors", shortname: "sec", ordre: 0},
    p2p: {titre: "P2P", shortname: "p2p", ordre: 0},
    tire_compound: {titre: "tire_compound", shortname: "tire_compound", ordre: 1},
    tires_stints: {titre: "tires_stints", shortname: "tires_stints", ordre: 1},
    tires_nb_changes: {titre: "tires_nb_changes", shortname: "tires_nb_changes", ordre: 1},
    empty: {titre: "empty", shortname: "empty", ordre: 1},
    // NOTE : some datas don't appear here because they aren't displayed
};

function init() {

    init_aff(disp_param);
    update_aff(disp_param);
    window.onresize = function() {
        sof_displayed = 0;
        do_resize = 1;
        responsive_dim(disp_param);
        document.getElementById('opt_window_x').value = window.screenLeft;
        document.getElementById('opt_window_y').value = window.screenTop;
        document.getElementById('opt_window_w').value = window.outerWidth;
        document.getElementById('opt_window_h').value = window.outerHeight;
    };

    // Pour switcher du mode normal au mode édition
    /*document.getElementById("click_infos").onclick = function() {
        disp_param = Math.abs(disp_param - 1);
        update_aff(disp_param);
        update_datas(-1)
    };*/

    // On regarde si on veut afficher la trackmap dès le démarrage
    if (disp_trackmap == 1) {
        document.getElementById('trackmap').style.display = 'block';
        document.getElementById('trackmap_bg').style.display = 'block'
    }
}


// Démarrage de la connection websocket
window.onload = function() {

    console.log("page chargée");
    init_var(1);
    init();
    init_ws();

    // On recharche la page si on double click
    var touchtime = 0;
    /// position de la souris
    var touch_mx = -1;
    var touch_my = -1;
    $('body').on('click', function(e) {
        if (reload_on_dblclick == 1) {
            if (touchtime == 0 || (((new Date().getTime()) - touchtime) >= 400)) {
                touchtime = new Date().getTime();
                touch_mx = e.clientX;
                touch_my = e.clientY;
            } else {
                if (((new Date().getTime()) - touchtime) < 400 && (Math.abs(e.clientX - touch_mx) < 5) && (Math.abs(e.clientY - touch_my) < 5) && (photo_processing == 0)) {
                    location.reload();
                    touchtime = 0;
                } else {
                    touchtime = 0;
                }
            }
        }
    });

    //document.onmousemove = change_turn_edit_ldp;

    //document.onmousewheel = change_turn_edit_ldp;
    $("body").bind("mousewheel DOMMouseScroll", change_turn_edit_ldp);

    var elem = document.documentElement;
    $("#fullscreen").click(function () {
        if (!document.fullscreenElement &&    // alternative standard method
              !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
            $("#fullscreen").css("display", "none");
        }
    });

    fullscreen_button_settimeout = setTimeout(function () {}, 0);
    if (!document.fullscreenElement &&    // alternative standard method
          !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
        // On n'est pas en fullscreen
        if (fullscreen_button == 1) {
            $("#fullscreen").css("display", "block");
            if (fullscreen_button_timeout > 0) {
                fullscreen_button_settimeout = setTimeout(function () {
                    $("#fullscreen").css("display", "none");
                }, 1000*fullscreen_button_timeout)
            }
        }
    } else {
        // On est déjà en fullscreen donc on cache le bouton
        $("#fullscreen").css("display", "none");
    }

    // On cache le bouton pour les spectateurs
    if (broadcast >= 2) {
        $("#fullscreen").css("display", "none");
    }
    if( /iPhone|iPad/i.test(navigator.userAgent)) {  //Si c'est un iPad ou iPhone
        $("#fullscreen").css("display", "none");
    }

};
