
// Display the datas contained in text variable
function update_datas(text) {

    if (text != -1) {
        text_header_= text.split("??");
        text_header = text_header_[0];
    }
    else {
        text_header = ""
    }

    //if (text == "-3" || text == "-2") {
    if (text_header == "-3" || text_header == "-2") {
        //document.getElementById("waitforiracing").style.display = "block"
    } else {
        document.getElementById("waitforiracing").style.display = "none"
    }

    //if (text != -1 && text != "-2" && text != "-3") {
    if (text != -1 && text_header != "-2" && text_header != "-3") {
        donnees_new = JSON.parse(text);

        for (nom in var_sent_every_second) {
            if (donnees_new[nom] != undefined) {
                save_donnees_new[nom] = donnees_new[nom];
            } else {
                donnees_new[nom] = save_donnees_new[nom];
            }
        }

        if (donnees_new.trackname != undefined)
            trackname_new = donnees_new.trackname;
        else
            trackname_new = trackname;

        /*if (trackname_new != trackname && trackname != "init") {
            console.log("Chargement du nouveau circuit ...");
            console.log(trackname_new, trackname);
            location.reload();
        }*/
        if (trackname_new != trackname && trackname == "init") {
            console.log("Chargement du circuit ...");
        }

        if ((trackname_new == trackname) && (donnees_new.styp == type_session) && (donnees_new.sname == name_session) && (donnees_new.sn == sessionnum) && (donnees_new.sid == sessionid)) {     // If we are still in the same session, we don't delete the old datas
            $.extend(true, donnees, donnees_new);     // Merge donnees_new into donnees, recursively
            if (donnees_new.nb != nb_drivers) { // Si le nombre de pilotes a changé il faudra recalculer le SOF
                sof_displayed = 0;
                nb_drivers = donnees_new.nb;
            }
        } else {

            donnees_defined = 1;

            switch_f3box_nbrequest = donnees_new.f3;
            send_trackmap_nbrequest = donnees_new.stm;
            trackmap_nbrequest = donnees_new.trm;

            sof_displayed = 0;
            teamracing_received = 0;
            selected_idxjs = -1;
            sessionnum = donnees_new.sn;
            sessionid = donnees_new.sid;
            type_session = donnees_new.styp;
            name_session = donnees_new.sname;
            donnees = JSON.parse(text);
            ws.send("send_statics");    // we want to collect the statics datas (name, num, ir)
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

    } else if (text == -3) {
        trackname = "none";  // utile pour savoir qu'il faudra recharger la page si c'est la première fois qu'on charge un circuit
    }

    if (donnees != null) {
        // Si la trackmap a changée on demande au serveur de nous envoyer les données
        if (donnees.stm != send_trackmap_nbrequest) {
            if (broadcast == 0)
                ws.send("send_statics");
            if (broadcast == 1)
                ws3.send("send_statics");
            send_trackmap_nbrequest = donnees.stm
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

        if (donnees.d != undefined) {

            if (donnees.u != undefined) {
                speedfactor = donnees.u == 1 ? 1 : 1 / 1.609344;
                if (donnees.carname == "lotus79" || donnees.carname == "lotus49") {
                    fuelfactor = donnees.u == 1 ? 1 : 1 / 4.54609;
                } else {
                    fuelfactor = donnees.u == 1 ? 1 : 1 / 3.78541178;
                }
            }

            document.getElementById("timeremain").innerHTML = reformat_timeremain(donnees.tr);

        }
    }

}

function reformat_timeremain(time) {
    if (time != "unlimited") {
        if (time < 167*3600 && time >= 0) {
            heu = Math.floor(time / 3600);
            min = Math.floor((time - 3600 * heu) / 60);
            sec = Math.floor(time - 3600 * heu - 60 * min);
            if (min < 10) min = "0" + min;
            if (sec < 10) sec = "0" + sec;
            t = heu + ":" + min + ":" + sec;
            return t
        } else {
            if (time == -1) {
                return "<span style='font-size: 0.75em;'>Last lap</span>"
            } else if (time == -2) {
                return "<span style='font-size: 0.75em;'>Finishing</span>"
            } else if (time == -3) {
                return "<span style='font-size: 0.75em;'>Official</span>"
            } else {
                return "--"
            }
        }
    } else {
        return time
    }
}

function reformat_lapsremain(laps) {
    if (donnees.estim_status == 0) {
        document.getElementById("lapsremain").style.color = "#666666"
    } else {
        document.getElementById("lapsremain").style.color = "#ff9900"
    }

    if (laps < 0) return "--";
    if (laps > 32000) return "&infin;";
    if (laps > 9999) {
        return "9999"
    } else if(laps > 999) {
        return (laps - 0.05).toFixed(0)
    } else {
        return (laps - 0.05).toFixed(1)
    }
}

disp_kg_livre = 0;
// Define the cars that use kg
car_in_kg = {"williamsfw31": 1, "hpdarx01c": 1, "mclarenmp430": 1, "nissangtpzxt": 1};

fps_perso = 1;
trackname = "init";

// Démarrage de la connection websocket
window.onload = function() {
    init_ws();
};
