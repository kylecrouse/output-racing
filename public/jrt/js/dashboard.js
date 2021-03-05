// Display the datas contained in text variable
function update_datas(text) {

    if (text != -1) {
        text_header_= text.split("??");
        text_header = text_header_[0];
    }
    else {
        text_header = ""
    }

    //if (text != -1 && text != "-2" && text != "-3") {
    if (text != -1 && text_header != "-2" && text_header != "-3" && text != "") {
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
            location.reload();
        }*/
        if (trackname_new != trackname && trackname == "init") {
            console.log("Chargement du circuit ...");
            responsive_dim();
        }

        if ((trackname_new == trackname) && (donnees_new.styp == type_session) && (donnees_new.sname == name_session) && (donnees_new.sn == sessionnum) && (donnees_new.sid == sessionid)) {     // If we are still in the same session, we don't delete the old datas
            $.extend(true, donnees, donnees_new);     // Merge donnees_new into donnees, recursively
            if (donnees_new.nb != nb_drivers) { // Si le nombre de pilotes a changé il faudra recalculer le SOF
                sof_displayed = 0;
                nb_drivers = donnees_new.nb;
            }
        } else {
            donnees_defined = 1;

            sof_displayed = 0;
            sessionnum = donnees_new.sn;
            sessionid = donnees_new.sid;
            type_session = donnees_new.styp;
            name_session = donnees_new.sname;
            donnees = JSON.parse(text);
            if (broadcast == 0) {
                ws.send("31");    // we want to collect the statics datas (name, num, ir)
            } else if (broadcast == 1) {
                ws3.send("31");    // we want to collect the statics datas (name, num, ir)
            }

            setting_ = {};  // On réinitialise le tableau des valeurs de setting à afficher en plein écran pour éviter un affichage inutile

            //document.getElementById("wj").innerHTML = "--";
            set_inner_html("wj", "--");
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
    //} else if (text == "-3") {
    } else if (text_header == "-3") {
        trackname = "none";  // utile pour savoir qu'il faudra recharger la page si c'est la première fois qu'on charge un circuit
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

        // Put here the data updates
        update_dashboard();

    }

    if (text_header == "-3" || text_header == "-2") {
        // On met au moins l'heure à jour
        //document.getElementById("time").innerHTML = str_heure();
        set_inner_html("time", str_heure());
        send_config = JSON.parse(text_header_[1]);
    } else {
        send_config = donnees_new.s_c;
    }

    // Changement de configuration
    window_shortname = get_window_shortname(window_name);
    if (send_config != undefined && window_shortname in send_config) {
        send_config = send_config[window_shortname];
    } else {
        send_config = {};
    }
    if (send_config != undefined && broadcast <= 1 && text != -1) {
        if ("tstamp" in send_config) {
            if (send_config_tstamp != send_config.tstamp && send_config != "") {
                send_config_tstamp = send_config.tstamp;
                //console.log(send_config);
                change_config(send_config);
            }
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


// ************************ MAIN PROGRAM *************************


function init() {
    responsive_dim();
    window.onresize = function() {
        responsive_dim()
    };
}


// Démarrage de la connection websocket
window.onload = function() {
    console.log("page chargée");
    init_var();
    init();
    init_ws();

    setInterval(function() {
        var tmp_html = "- CLOSE -<br><br>";
        //for (i in gear_) {
        for (i in maxspeed_) {
            if (i != "N") {
                if (i in gear_) {
                    tmp_html += "GEAR " + i + " : " + gear_[i].toFixed(0) + " Max speed : " + (speedfactor * maxspeed_[i] * 3.6).toFixed(1) + "<br>"
                } else {
                    tmp_html += "GEAR " + i + " : -- Max speed : " + (speedfactor * maxspeed_[i] * 3.6).toFixed(1) + "<br>"
                }
            }
        }
        //document.getElementById("display_rpmshift").innerHTML = tmp_html;
        set_inner_html("display_rpmshift", tmp_html);
    }, 1000);


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

    if (!document.fullscreenElement &&    // alternative standard method
          !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
        // On n'est pas en fullscreen
        if (fullscreen_button == 1) {
            $("#fullscreen").css("display", "block");
            if (fullscreen_button_timeout > 0) {
                setTimeout(function () {
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
