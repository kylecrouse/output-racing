
function opt_turn_edit(elt) {
    if (elt.checked) {
        turn_edit = 1;
        north_edit = 0;
        document.getElementById("lapdistpct").style.display = "block"
        document.getElementById("north").style.display = "none"
        //document.getElementById("opt_north_edit").checked = false
    } else {
        turn_edit = 0;
        document.getElementById("lapdistpct").style.display = "none"
        //draw_track("#2c2c2c", 1, 1, 1);
        draw_track();
    }
    change_turn_edit_ldp()
}


// Permet de faire bouger le nord ou la position sur la piste avec la roulette de la souris
function change_turn_edit_ldp(event) {
    //mouseX = event.clientX;
    //mouseY = event.clientY;
    //console.log(event.wheelDelta);

    //d = event.wheelDelta;
    if (event != undefined) {
        event = event.originalEvent;
        d = event.wheelDelta > 0 || event.detail < 0 ? 1 : -1;
    }

    if (turn_edit == 1) {
        //ldp = (mouseX - 0.05 * window_innerWidth) / window_innerWidth / 0.9;
        if (event != undefined) {
            //turn_edit_ldp += d / 120 / 1000;
            if (event.buttons == 1) {
                turn_edit_ldp += d / 100;
            } else {
                turn_edit_ldp += d / 1000;
            }
        }
        if (turn_edit_ldp > 1) turn_edit_ldp = 0;
        if (turn_edit_ldp < 0) turn_edit_ldp = 0.999;
        document.getElementById("lapdistpct").innerHTML = "<span style='padding-left:0.25em;color:#ff0000;" +
            "font-weight:bold;font-size:2em;'>" +
            "lapdistpct = " + turn_edit_ldp.toFixed(3) + "</span>";
        trackmap_context.clearRect(0, 0, (container_w - ttl) * devicePixelRatio, container_h * devicePixelRatio);
        draw_turn_edit("#00ccff", "13", turn_edit_ldp, -1,"Lucky Turn (left: -1)");
        draw_turn_edit("#ff6666", "13", turn_edit_ldp, 1,"Lucky Turn (right : 1)")
    }

    if (north_edit == 1) {
        //ldp = (mouseX - 0.05 * window_innerWidth) / window_innerWidth / 0.9;
        if (event != undefined) {
            //north_edit_rad += d / 120 * Math.PI / 240;
            north_edit_rad += d * Math.PI / 300;
        }
        if (north_edit_rad > Math.PI) north_edit_rad = - Math.PI;
        if (north_edit_rad < - Math.PI) north_edit_rad = Math.PI;
        //console.log(north_edit_rad);
        document.getElementById("north").innerHTML = "<span style='padding-left:0.25em;color:#ff0000;" +
            "font-weight:bold;font-size:2em;'>" +
            "north (in rad) = " + north_edit_rad.toFixed(2) + "</span>";
        trackmap_context.clearRect(0, 0, (container_w - ttl) * devicePixelRatio, container_h * devicePixelRatio);
        draw_north_edit(north_edit_rad)
    }
}


// Calcule des coefficient de la fonction permettant de lisser les mouvements des voitures
function calc_coef(x0, x1, y0, y1, coef_old) {
    var coef = {}
    a = coef_old["a"];
    b = coef_old["b"];
    c = coef_old["c"];
    /*var alpha0 = 3 * a * x0*x0 + 2 * b * x0 + c;
    var alpha1 = 0;
    if (x1 - x0 != 0)
        alpha1 = (y1 - y0)/(x1 - x0);
    coef["a"] = 2*(alpha1-alpha0)/(alpha1-alpha0-2*x0*x1-(x0+x1)*(x0+x1));
    coef["b"] = (alpha1-alpha0-3*(x1-x0)*(x1+x0)*coef["a"])/(2*(x1-x0));
    coef["c"] = alpha0 - 3*coef["a"]*x0*x0-3*coef["b"]*x0;
    coef["d"] = y0-coef["a"]*x0*x0*x0-coef["b"]*x0*x0-coef["c"]*x0;*/

    // Interpolation linéaire
    if (x0 - x1 != 0) {
        coef["a"] = (y0 - y1) / (x0 - x1);
    } else {
        coef["a"] = 0;
    }
    coef["b"] = y0 - coef["a"] * x0;
    return coef
}
//JSON.parse(JSON.stringify(coef_[i]));  // copie de l'objet


// Affiche tous les pilotes sur la trackmap
function trackmap() {

    if (donnees.d != undefined) {
        // On rend le circuit en forme circulaire si l l'option est activée
        // REM : on refait la transformation qu'une fois en détectant si le k_max et le coef_k n'étaient pas à 360
        if (trackmap_circular == 1 && (donnees.k_max != 360 || donnees.coef_k != 360)) {
            donnees.k_max = 360;
            donnees.coef_k = donnees.k_max;
            donnees.x = [];
            donnees.y = [];
            for (k = 0; k < donnees.k_max; k++) {
                alpha = k / donnees.coef_k * 2 * Math.PI;
                if (trackmap_circular_reverse == 1) {
                    alpha = -alpha;
                }
                donnees.x[k] = Math.cos(alpha);
                donnees.y[k] = Math.sin(alpha);
            }
        }

        // on évite de faire tout le temps appel à jquery qui est demandeur en ressources
        if (trackmap_canvas_w == -1 || trackmap_canvas_h == -1) {
            var w = parseInt($("#trackmap_canvas").css("width"));
            var h = parseInt($("#trackmap_canvas").css("height"));
            trackmap_canvas_w = w;
            trackmap_canvas_h = h;
        } else {
            var w = trackmap_canvas_w;
            var h = trackmap_canvas_h;
        }

        init_colorize();

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

        me = donnees.me;

        //document.getElementById("pexit").innerHTML = "Projected track position after pit : " + (donnees.pexit).toFixed(4);

        // On efface les pilotes avant de les redessiner
        if (turn_edit == 0 && north_edit == 0) {
            trackmap_context.clearRect(0, 0, w * devicePixelRatio, h * devicePixelRatio);
        }

        // Affichage de quelques particularité du pilote selectionné et calcul du pexit
        //
        ldp_selected_idxjs = null;
        if (selected_idxjs != undefined && donnees.d != undefined && selected_idxjs in donnees.d && turn_edit == 0 && north_edit == 0) {

            dp = donnees.d[selected_idxjs].dp;

            i = selected_idxjs;
            ldp = dp - Math.floor(dp);
            ldp_selected_idxjs = ldp;

            trackmap_context.globalAlpha = 1;
            if (donnees.d[selected_idxjs].fr == 0) {
                //driver_on_trackmap("rgba(255,255,255,0.75)", ldp, selected_idxjs, 2.5, 1, 1);
                if (trackmap_car_ring_selected) {
                    driver_on_trackmap("rgba(255,255,255,0.75)", ldp, selected_idxjs, 2.5, 0, 2.5);
                }
            }

            //*** DEBUG (pour afficher le rond orange (predicted postition after the pits)
            //donnees.co = 4;
            //donnees.plost = 62.3;
            //donnees.pexit = 34.42;

            tmp_no_disp_timelost = true
            if (donnees.pexit != undefined && selected_idxjs == me && donnees.co > 0 && donnees.d[selected_idxjs].fr == 0) {
                dp_exit = donnees.pexit;
                ldp_exit = dp_exit - Math.floor(dp_exit);
                ldp_exit_raw = ldp_exit;
                if (dp_freeze != null && ldp_exit_raw_old != null && ldp_exit_raw == ldp_exit_raw_old) {
                    ldp_exit += dp - dp_freeze;
                } else {
                    dp_freeze = dp;
                }
                ldp_exit_raw_old = ldp_exit_raw;
                if (selected_idxjs == me && donnees.co > 0 && donnees.d[selected_idxjs].fr == 0) {  // On affiche l'estimation après la sortie des pits que pour le pilote local et s'il on a les infos de fuel
                    if (donnees.plost != undefined) {
                        if (trackmap_disp_timelost) {
                            //document.getElementById("plost").innerHTML = "<span style='-webkit-filter: drop-shadow(1px 1px 1px black);filter: drop-shadow(1px 1px 1px black);" +
                            //    "padding:0.5em;" +
                            //    "font-weight:bold;color:#ff8800; margin-left:0.0em'>Time Lost Next PIT : " + (donnees.plost).toFixed(1) + "s</span>";
                            //set_inner_html("plost", "<span style='font-size: " + trackmap_plost_coef + "em; -webkit-filter: drop-shadow(1px 1px 1px black);filter: drop-shadow(1px 1px 1px black);padding:0.5em;font-weight:bold;color:#ff8800; margin-left:0.0em'>Time Lost Next PIT : " + (donnees.plost).toFixed(1) + "s</span>");
                            set_inner_html("plost", "<div style='font-size: " + trackmap_plost_coef + "em; line-height: " + 1 + "em; -webkit-filter: drop-shadow(1px 1px 1px black);filter: drop-shadow(1px 1px 1px black); font-weight:bold; color:#ff8800; margin-left:0.5em; margin-top: 0.5em;'>Time Lost Next PIT : " + (donnees.plost).toFixed(1) + "s</div>");
                            tmp_no_disp_timelost = false;
                            //console.log(donnees.pexit)
                        }
                        if (donnees.pexit != 0 && donnees.plost > 15 && trackmap_disp_predicted) { // on n'affiche le point orange que si le plost est supérieur à 15 s et si l'option est activée
                            driver_on_trackmap("rgba(255,128,0,0.75)", ldp_exit, selected_idxjs, 2.5, 1, 1);
                        } else {
                            dp_exit = -1;
                        }
                    }
                }
            } else {
                dp_exit = -1;
            }
            if (tmp_no_disp_timelost) {
                set_inner_html("plost", "");
            }

            // Si je suis dans les pits, on change ma couleur en rajoutant une couche grise dessus
            trackmap_context.globalAlpha = 0.666;
            if (donnees.d[selected_idxjs].p && trackmap_car_ring_selected) {
                driver_on_trackmap("#666666", ldp, selected_idxjs, 2.95, 1, 1);
            }
        } else {
            dp_exit = -1;  // en dernier recours on donne une valeur à dp_exit si jamais on n'accède pas aux données
        }


        // Affichage de tous les pilotes

        // On les range d'abord dans l'ordre inverse de leur position sur la piste pour que le premier d'une file soit toujours au-dessus de ceux qui le suivent
        ordonner_pilotes_ldp = [];
        for (var i in donnees.d) {
            if (i != selected_idxjs) {
                dp = donnees.d[i].dp;
                ldp = dp - Math.floor(dp);
                ordonner_pilotes_ldp.push([parseInt(i), ldp]);
            }
        }
        ordonner_pilotes_ldp.sort(function (a, b) {
            return a[1] - b[1];
        });
        // On cherche une voiture avec personne devant pour qu'on puisse décider que c'est elle qu'on affichera en dernier sans risque de masquer une voiture devant elle
        voiture_personne_devant_idx = 0;  // index de la voiture avec le plus grand écart devant
        voiture_personne_devant_j = 0;  // index dans le tableau ordonner_pilotes_ldp
        ecart_voiture_devant = 0;
        ecartmax_voiture_devant = 0;
        ordonner_pilotes_ldp_length = ordonner_pilotes_ldp.length;
        for (var j = 0; j < ordonner_pilotes_ldp_length; j++) {
            j_plus_1 = j + 1;
            if (j_plus_1 >= ordonner_pilotes_ldp_length) {
                j_plus_1 = 0;
            }
            ldp_voiture = ordonner_pilotes_ldp[j][1];
            ldp_voiture_devant = ordonner_pilotes_ldp[j_plus_1][1];
            if (ldp_voiture_devant < ldp_voiture) ldp_voiture_devant += 1;
            ecart_voiture_devant = ldp_voiture_devant - ldp_voiture;
            if (ecart_voiture_devant > ecartmax_voiture_devant) {
                ecartmax_voiture_devant = ecart_voiture_devant;
                voiture_personne_devant_idx = ordonner_pilotes_ldp[j][0];
                voiture_personne_devant_j = j;
            }
        }
        // On met la voiture_personne_devant en dernier dans le tableau
        ordonner_pilotes_ldp_final = [];
        if (ordonner_pilotes_ldp.length > 0) {
            for (var j = voiture_personne_devant_j + 1; j < ordonner_pilotes_ldp_length; j++) {
                i = ordonner_pilotes_ldp[j][0];
                if (i != selected_idxjs) {
                    ordonner_pilotes_ldp_final.push(i);
                }
            }
            for (var j = 0; j <= voiture_personne_devant_j; j++) {
                i = ordonner_pilotes_ldp[j][0];
                if (i != selected_idxjs) {
                    ordonner_pilotes_ldp_final.push(i);
                }
            }
        }
        // On ajoute le pilote sélectionné à la fin pour qu'il soit au-dessus des autres
        if (selected_idxjs != undefined && selected_idxjs != -1) {
            //ordonner_pilotes_ldp.push([parseInt(selected_idxjs), ldp_selected_idxjs]);
            ordonner_pilotes_ldp_final.push(selected_idxjs);
        }

        var col_;
        //for (var i in donnees.d) {
        for (var j = 0; j < ordonner_pilotes_ldp_final.length; j++) {
            //i = ordonner_pilotes_ldp[j][0];
            i = ordonner_pilotes_ldp_final[j];

            if (donnees.d != undefined && i in donnees.d) {
                // On affiche les autres pilotes encore en piste si la course est terminée
                if ((donnees.d[i].fr == 0) && (donnees.d[i].pr == 1 || donnees.d[i].s > 1 || donnees.d[i].cts != -1) && turn_edit == 0 && north_edit == 0) {

                    dp = donnees.d[i].dp;

                    ldp = dp - Math.floor(dp);
                    //if (i == me) console.log(ldp);

                    //coul = "rgba(255,56,211,0.5)"; // couleur de base s'il n'y a qu'une seule class

                    if (donnees.teamracing) {
                        nom = donnees.d[i].tn;
                        id = donnees.d[i].tid;
                    } else {
                        nom = donnees.d[i].name;
                        id = donnees.d[i].uid;
                    }

                    col_ = null;
                    for (var idx_ in colorize_) {
                        if (nom != undefined && nom.toUpperCase().includes(idx_.toUpperCase())) {
                            col_ = colorize_[idx_];
                        }
                    }

                    // On colorize le pilote avec les données du fichier _colorize.js (même couleur que dans le timing)
                    if (id in colorize_) {
                        trackmap_context.globalAlpha = 0.80;
                        if (trackmap_car_ring_colorized) {
                            driver_on_trackmap(colorize_[id], ldp, i, 2.5, 0, 2.5);
                        }
                    } else if (col_ !== null) {
                        trackmap_context.globalAlpha = 0.80;
                        if (trackmap_car_ring_colorized) {
                            driver_on_trackmap(col_, ldp, i, 2.5, 0, 2.5);
                        }
                    }

                    // Si on n'a pas pu calculer le dp_exit auparavant on prend la position du pilote sélectionné
                    if ((me != selected_idxjs || dp_exit < 0) && selected_idxjs in donnees.d) {
                        dp_exit = donnees.d[selected_idxjs].dp
                    }

                    if (donnees.d[i].cts != -1 || donnees.d[i].pr != 1) {  // si un pilote est aux pits et a quitté le jeu on ne l'affiche pas

                        if (i != selected_idxjs) {
                            trackmap_context.globalAlpha = 0.75;
                            // Si le pilote a un tour de retard on rajoute du bleu, et s'il a un tour d'avance on met du rouge
                            if (trackmap_car_ring_lapper) {
                                if (donnees.d[i].dp - dp_exit > 0.5)
                                    driver_on_trackmap("#ff4444", ldp, i, 1.5, 0, 1.5);
                                if (donnees.d[i].dp - dp_exit < -0.5)
                                    driver_on_trackmap("#0099ff", ldp, i, 1.5, 0, 1.5);
                            }
                        }

                        // Couleur de la class du pilote
                        str = donnees.d[i].cc;
                        var tmp_num = donnees.d[i].num;
                        if (tmp_num in bg_by_num) {
                            str = "0x" + bg_by_num[tmp_num].slice(1);
                        }
                        if (donnees.d[i].classid in bg_by_classid) {
                            str = "0x" + bg_by_classid[donnees.d[i].classid].slice(1);
                        }

                        //if (str == "0xffffff" || str == "0x0") str = "0xbbeeff"; // couleur de base si une seule class
                        if (str != undefined) {
                            //if (str != "0xffffff" && str != "0x0") {
                            str = str.slice(2);
                            for (n = str.length; n < 6; n++) {
                                str = "0" + str
                            }
                            //}
                        }
                        trackmap_context.globalAlpha = trackmap_car_color_transparency;
                        coul = "#" + str;

                        if (!trackmap_car_color_auto) {  // si on n'est pas en couleur automatique on remplace par la couleur spécifiée
                            coul = trackmap_car_color;
                        }
                        if (!trackmap_car_me_color_auto && i == selected_idxjs && trackmap_car_me_specify) {  // si on n'est pas en couleur automatique pour la voiture sélectionnée on remplace par la couleur spécifiée
                            coul = trackmap_car_me_color;
                        }

                        driver_on_trackmap(coul, ldp, i, 1, 1, 1);
                        // on dessine un bord autour de la voiture

                        if (i == selected_idxjs && trackmap_car_me_specify) {
                            tmp_trackmap_car_border_disp = trackmap_car_me_border_disp;
                            tmp_trackmap_car_border_color = trackmap_car_me_border_color;
                            tmp_trackmap_car_border_coef = trackmap_car_me_border_coef;
                        } else {
                            tmp_trackmap_car_border_disp = trackmap_car_border_disp;
                            tmp_trackmap_car_border_color = trackmap_car_border_color;
                            tmp_trackmap_car_border_coef = trackmap_car_border_coef;
                        }

                        if (tmp_trackmap_car_border_disp) {
                            trackmap_context.globalAlpha = 1;
                            //driver_on_trackmap(tmp_trackmap_car_border_color, ldp, i, 1 - 0.1 * tmp_trackmap_car_border_coef, 0, 1.414 * tmp_trackmap_car_border_coef);
                            tmp_r = 1 - 0.1 * tmp_trackmap_car_border_coef;
                            driver_on_trackmap(tmp_trackmap_car_border_color, ldp, i, tmp_r, 0, 7 / 10 * 2 / tmp_r * tmp_trackmap_car_border_coef * 1);
                        }

                        if (trackmap_disp_mode == 0) {
                            if (selected_idxjs in donnees.d) {
                                trackmap_context.globalAlpha = 1;
                                // Si le pilote a pitté plus tard on le marque d'un petit point noir (seulement si plus d'un tour d'écart)
                                // A condition qu'on soit dans la même class
                                if (donnees.d[selected_idxjs].cc == donnees.d[i].cc && donnees.d[i].sti < donnees.d[selected_idxjs].sti - 1) {
                                    if (trackmap_car_black_dot) {
                                        driver_on_trackmap("#000000", ldp, i, 0.33, 1, 1);
                                    }
                                }
                            }
                        }

                        if (donnees.d[i].s < 20 && !(donnees.d[i].pr)) {  // Les pilotes quasiments arrêtés sur la piste on les met en jaune
                            coul = "rgba(255,255,0,0.75)";
                            if (trackmap_car_ring_yellow) {
                                driver_on_trackmap(coul, ldp, i, 2.5, 0, 2.5);
                            }
                        }

                        if (donnees.d[i].cts == -1 && i != selected_idxjs) {  // On indique les pilotes déconnectés en les grisant
                            coul = "rgba(32,32,32,0.5)";
                            driver_on_trackmap(coul, ldp, i, 1.65, 1, 1);
                        }

                    }
                }
            }
        }


        // REM : il faut redessiner les turns si on est en mode trackmap_circular_centered_on_driver = 1
        if (trackmap_circular_centered_on_driver == 1 && trackmap_disp_turns == 1) {
            draw_turns();
        }
        // Il faut aussi redessiner le start/finish line et la flèche
        if (trackmap_circular_centered_on_driver == 1) {
            draw_fleche_start_finish();
        }

        draw_winddir(donnees.north, donnees.winddir);
    }
}


// Calcul des coordonnées d'un point sur la trackmap en fonction du ldp ou du k s'il est donnée
// REM : si le k est défini et que le ldp est différent de 0, on va décaler du ldp
function calc_x_y(ldp, k) {

    if (k == null) {
        k = Math.floor(donnees.coef_k * ldp);
        var d = donnees.coef_k * ldp;
    } else {
        if (ldp > 0 && ldp < 1 &&  donnees.coef_k != 0) {
            ldp += k / donnees.coef_k;
            if (ldp >= 1) {
                ldp -= 1;
            }
            var d = donnees.coef_k * ldp;
            k = Math.floor(donnees.coef_k * ldp);
        } else {
            var d = k;
        }
    }

    // REM : le k ne doit être égale ni à k_max, ni à 0 pour éviter un mouvement saccadé sur la ligne
    if (k >= donnees.k_max || k == 0) k = donnees.k_max - 1;
    var k2 = k + 1;
    if (k2 >= donnees.k_max || k2 == 0) k2 = 1;

    if (k2 > k) {
        var k2_minus_k = k2 - k;
    } else {
        var k2_minus_k = k2 - 0 + donnees.coef_k - k;
    }
    if (d >= k) {
        var d_minus_k = d - k;
    } else {
        var d_minus_k = d - 0 + donnees.coef_k - k;
    }

    var x = 0;
    var y = 0;

    if (k in track.x && k in track.y && donnees.k_max > 0) {  // normalement c'est toujorus à true
        var x1 = (-track.x[k] + track_max_x) * track_mult;
        var y1 = (-track.y[k] + track_max_y) * track_mult;
        var x2 = (-track.x[k2] + track_max_x) * track_mult;
        var y2 = (-track.y[k2] + track_max_y) * track_mult;

        // On fait une interpolation
        x = (container_w - ttl - track_w - 17) / 2 + x1 + (x2 - x1) * (d_minus_k) / k2_minus_k;
        y = (container_h - track_h) / 2 + y1 + (y2 - y1) * (d_minus_k) / k2_minus_k;
    }

    //return [x, y];
    return [x * devicePixelRatio, y * devicePixelRatio];

}


function driver_on_trackmap(coul, ldp, caridx, taille, plein, epaisseur_trait) {

    // Si le driver est dans les stands, on ne l'affiche que si l'option trackmap_car_inpits_disp est activée
    if (!(donnees.d[caridx].pr) || (trackmap_car_inpits_disp == 1 || caridx == selected_idxjs) ) {

        if (trackmap_circular_centered_on_driver == 1 && trackmap_circular == 1 && ldp_selected_idxjs != -1) {
            ldp = (ldp - ldp_selected_idxjs) % 1;
            if (ldp < 0) ldp += 1;
        }

        k = Math.floor(donnees.coef_k * ldp);
        d = donnees.coef_k * ldp;

        // REM : le k ne doit être égale ni à k_max, ni à 0 pour éviter un mouvement saccadé sur la ligne
        if (k >= donnees.k_max || k == 0) k = donnees.k_max - 1;
        k2 = k + 1;
        if (k2 >= donnees.k_max || k2 == 0) k2 = 1;

        if (k in track.x && k in track.y && donnees.k_max > 0) {

            rayon = taille * track_epaisseur / 2;
            /*if (trackmap_disp_mode != 0) {  // on double le rayon si on affiche le n° ou les 3 premières lettres
             rayon = 2 * rayon;
             }*/

            if (caridx == selected_idxjs && trackmap_car_me_specify) {
                tmp_trackmap_car_coef = trackmap_car_me_coef;
            } else {
                tmp_trackmap_car_coef = trackmap_car_coef;
            }

            rayon = tmp_trackmap_car_coef * rayon;

            // On fait une interpolation
            [x, y] = calc_x_y(ldp, null);
            [x1, y1] = calc_x_y(0, k);
            [x2, y2] = calc_x_y(0, k2);

            l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

            // Indication du premier de la classe
            if (donnees.styp == "Race") {
                classpos = donnees.d[caridx].cpos;
            } else {
                classpos = donnees.d[caridx].cposbest;
            }

            // Dessin du panneau P1
            if (plein != 0 && taille == 1 && classpos == 1 && trackmap_car_P1) {
                //if (trackmap_disp_mode != 0) {
                rayon2 = rayon / 2;
                tmp_coef1 = 4 / 3;
                tmp_coef2 = 1.92;
                tmp_coef3 = 1.64;
                /*} else {
                 rayon2 = rayon;
                 tmp_coef1 = 1;
                 tmp_coef2 = 1;
                 tmp_coef3 = 1;
                 }*/

                var x_ = x;
                var y_ = y;

                // Si le driver est dans les stands, on le décale sur le côté de la piste
                if (donnees.d[caridx].pr && l != 0) {
                    decale_x = -(y2 - y1) / l * track_epaisseur * 1.5 * (trackmap_circular == 1 && trackmap_circular_reverse == 1 ? -1:1);
                    decale_y = (x2 - x1) / l * track_epaisseur * 1.5 * (trackmap_circular == 1 && trackmap_circular_reverse == 1 ? -1:1);
                } else {
                    decale_x = 0;
                    decale_y = 0
                }
                x_ += decale_x;
                y_ += decale_y;

                //xp1 = x + 1.5*(y2 - y1) / l * track_epaisseur * 1.5 * tmp_coef1;
                //yp1 = y - 1.5*(x2 - x1) / l * track_epaisseur * 1.5 * tmp_coef1;
                xp1 = x_ + 1.5 * (y2 - y1) / l * rayon * 2 * (trackmap_circular == 1 && trackmap_circular_reverse == 1 ? 1:-1);
                yp1 = y_ - 1.5 * (x2 - x1) / l * rayon * 2 * (trackmap_circular == 1 && trackmap_circular_reverse == 1 ? 1:-1);
                //xt1 = x + 0.35*(y2 - y1) / l * track_epaisseur * 1.5 * tmp_coef2;
                //yt1 = y - 0.35*(x2 - x1) / l * track_epaisseur * 1.5 * tmp_coef2;
                //xt2 = x + 0.75*(y2 - y1) / l * track_epaisseur * 1.5 * tmp_coef3;
                //yt2 = y - 0.75*(x2 - x1) / l * track_epaisseur * 1.5 * tmp_coef3;
                xt1 = x_ + 0.5 * (y2 - y1) / l * rayon * 2 * (trackmap_circular == 1 && trackmap_circular_reverse == 1 ? 1:-1);
                yt1 = y_ - 0.5 * (x2 - x1) / l * rayon * 2 * (trackmap_circular == 1 && trackmap_circular_reverse == 1 ? 1:-1);
                xt2 = x_ + 1 * (y2 - y1) / l * rayon * 2 * (trackmap_circular == 1 && trackmap_circular_reverse == 1 ? 1:-1);
                yt2 = y_ - 1 * (x2 - x1) / l * rayon * 2 * (trackmap_circular == 1 && trackmap_circular_reverse == 1 ? 1:-1);
                trackmap_context.beginPath(); //On démarre un nouveau tracé.
                trackmap_context.strokeStyle = "#000000";
                trackmap_context.lineWidth = 3 * rayon2 / 7 * epaisseur_trait;
                trackmap_context.moveTo(xt1, yt1);//On se déplace au coin inférieur gauche
                trackmap_context.lineTo(xt2, yt2);
                trackmap_context.stroke(); //On trace seulement les lignes.
                trackmap_context.closePath();
                trackmap_context.beginPath(); //On démarre un nouveau tracé.
                if (rayon2 >= 0) {
                    trackmap_context.arc(xp1, yp1, 2 * rayon2, 0, Math.PI * 2); //On trace la courbe délimitant notre forme
                }
                trackmap_context.fillStyle = coul;
                trackmap_context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
                trackmap_context.closePath();
                trackmap_context.beginPath(); //On démarre un nouveau tracé.
                if (rayon2 >= 0) {
                    trackmap_context.arc(xp1, yp1, 2.1 * rayon2, 0, Math.PI * 2); //On trace la courbe délimitant notre forme
                }
                trackmap_context.strokeStyle = "#000000";
                trackmap_context.lineWidth = 3 * rayon2 / 7 * epaisseur_trait;
                trackmap_context.stroke(); //On utilise la méthode fill(); si l'on veut une forme pleine
                trackmap_context.closePath();
                trackmap_context.fillStyle = "#000000";
                trackmap_context.font = "bold " + 2.5 * rayon2 * 0.9 + "px Arial";
                trackmap_context.textAlign = "center";
                trackmap_context.fillText("P1", xp1, yp1 + 0.75 * rayon2 * 0.9);
            }


            // Si le driver est dans les stands, on le décale sur le côté de la piste
            if (donnees.d[caridx].pr && l != 0) {
                decale_x = -(y2 - y1) / l * track_epaisseur * 1.5 * (trackmap_circular == 1 && trackmap_circular_reverse == 1 ? -1:1);
                decale_y = (x2 - x1) / l * track_epaisseur * 1.5 * (trackmap_circular == 1 && trackmap_circular_reverse == 1 ? -1:1);
            } else {
                decale_x = 0;
                decale_y = 0
            }
            x += decale_x;
            y += decale_y;

            if (caridx == selected_idxjs && trackmap_car_me_specify) {
                tmp_trackmap_car_border_disp = trackmap_car_me_border_disp;
            } else {
                tmp_trackmap_car_border_disp = trackmap_car_border_disp;
            }

            trackmap_context.beginPath(); //On démarre un nouveau tracé.
            if (plein && tmp_trackmap_car_border_disp && rayon - 1 >= 0) {
                trackmap_context.arc(x, y, rayon - 1, 0, Math.PI * 2);  // on enlève 1px au rayon pour éviter que le cercle plein déborde de la bordure
            } else if (rayon >= 0) {
                trackmap_context.arc(x, y, rayon, 0, Math.PI * 2);
            }
            trackmap_context.fillStyle = coul;
            trackmap_context.strokeStyle = coul;
            trackmap_context.lineWidth = rayon / 7 * epaisseur_trait;
            if (plein)
                trackmap_context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
            else
                trackmap_context.stroke(); //On utilise la méthode fill(); si l'on veut une forme pleine
            trackmap_context.closePath();

            // Si le driver est dans les stands, on le grise
            if (donnees.d[caridx].pr && l != 0 && caridx != selected_idxjs && plein != 0 && taille == 1) {
                trackmap_context.beginPath(); //On démarre un nouveau tracé.
                if (rayon >= 0) {
                    trackmap_context.arc(x, y, rayon * 1.65, 0, Math.PI * 2);  //On trace la courbe délimitant notre forme
                }
                trackmap_context.fillStyle = "#666666";
                trackmap_context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
                trackmap_context.closePath();
            }

            // On écrit le numéros du pilote ou son nom en fonction du mode choisi
            if (plein != 0 && taille == 1 && trackmap_disp_mode != 0) {
                trackmap_context.globalAlpha = 1;

                // On calcule la bonne couleur pour la font
                // REM : normalement, coul est forcément au format #xxxxxx car taille = 1
                var str = coul.slice(1)
                var r = parseInt("0x" + str.substr(0, 2));
                var g = parseInt("0x" + str.substr(2, 2));
                var b = parseInt("0x" + str.substr(4, 2));
                var moy = (r + g + b) / 3;
                var font_coul = "000000";
                if (moy < 150) {
                    font_coul = "ffffff";
                }
                var tmp_num = donnees.d[caridx].num;
                if (tmp_num in col_by_num) {
                    font_coul = col_by_num[tmp_num].slice(1);  // REM : on enlève le #
                }
                if (donnees.d[caridx].classid in col_by_classid) {
                    font_coul = col_by_classid[donnees.d[caridx].classid].slice(1);
                }
                font_coul = "#" + font_coul;

                if (!trackmap_car_font_color_auto) {  // si on n'est pas en couleur automatique on remplace par la couleur spécifiée
                    font_coul = trackmap_car_font_color;
                }
                if (!trackmap_car_me_font_color_auto && caridx == selected_idxjs && trackmap_car_me_specify) {  // si on n'est pas en couleur automatique on remplace par la couleur spécifiée
                    font_coul = trackmap_car_me_font_color;
                }

                trackmap_context.fillStyle = font_coul;

                trackmap_context.textAlign = "center";
                // Ombrage
                /*trackmap_context.shadowColor = "black";
                trackmap_context.shadowOffsetX = 0;
                trackmap_context.shadowOffsetY = 0;
                trackmap_context.shadowBlur = rayon / 3;*/
                //

                if (caridx == selected_idxjs && trackmap_car_me_specify) {
                    tmp_trackmap_carnum_coef = trackmap_carnum_me_coef;
                } else {
                    tmp_trackmap_carnum_coef = trackmap_carnum_coef;
                }

                if (trackmap_disp_mode == 1) {
                    trackmap_context.font = "bold " + 1.5 * rayon * tmp_trackmap_carnum_coef + "px Arial";
                    if (donnees.d[caridx].num != undefined) {
                        trackmap_context.fillText(donnees.d[caridx].num, x, y + 0.5 * rayon * tmp_trackmap_carnum_coef);
                    }
                }
                if (trackmap_disp_mode == 2) {
                    name = donnees.d[caridx].name;
                    nom_ = name.split(" ");
                    nom = nom_[nom_.length - 1].toUpperCase();
                    name = "";
                    for (var i = 0; i < 3; i++) {
                        if (nom[i] != undefined) {
                            name += nom[i];
                        }
                    }
                    trackmap_context.font = "bold " + 1 * rayon * tmp_trackmap_carnum_coef + "px Arial";
                    trackmap_context.fillText(name, x, y + 0.4 * rayon * tmp_trackmap_carnum_coef);
                }
                if (trackmap_disp_mode == 3) {
                    trackmap_context.font = "bold " + 1.5 * rayon * tmp_trackmap_carnum_coef + "px Arial";
                    if (classpos != undefined) {
                        trackmap_context.fillText(classpos, x, y + 0.5 * rayon * tmp_trackmap_carnum_coef);
                    }
                }
                trackmap_context.globalAlpha = trackmap_car_color_transparency;
                // On enlève l'ombrage
                trackmap_context.shadowOffsetX = 0;
                trackmap_context.shadowOffsetY = 0;
                trackmap_context.shadowBlur = 0;
            }

        }

    }
}


//function draw_track(coul, opac, epaisseur, efface) {
function draw_track() {

    coul = trackmap_color;
    opac = 1;
    epaisseur = 1;
    efface = 1;

    var w = 0;
    var h = 0;
    cv_w = (container_w - ttl - 17) * 0.82;
    cv_h = container_h * 0.82;
    if (efface) {
        trackmap_fond_context.clearRect(0, 0, (container_w - ttl) * devicePixelRatio, container_h * devicePixelRatio);
    }
    trackmap_fond_context.globalAlpha = opac;

    // On rend le circuit en forme circulaire si l l'option est activée
    // REM : on refait la transformation qu'une fois en détectant si le k_max et le coef_k n'étaient pas à 360
    if (trackmap_circular == 1) {
        angle = trackmap_circular_angle * Math.PI / 180;
        donnees.k_max = 360;
        donnees.coef_k = donnees.k_max;
        donnees.x = [];
        donnees.y = [];
        for (k = 0; k < donnees.k_max; k++) {
            alpha = k / donnees.coef_k * 2 * Math.PI;
            if (trackmap_circular_reverse == 1) {
                alpha = -alpha;
            }
            donnees.x[k] = Math.cos(alpha);
            donnees.y[k] = Math.sin(alpha);
        }
    }

    if (donnees.k_max > 0) {

        if (trackmap_circular != 1) {
            if (donnees.orientation == "auto" || donnees.orientation == undefined) {
                angle = optimize_track_angle();
            } else {
                angle = donnees.orientation * Math.PI / 180;
            }
        }

        // ***
        //angle = 0

        // Caractéristiques du circuit à dessiner
        for (k = 0; k < donnees.k_max; k++) {

            track.x[k] = donnees.x[k] * Math.cos(angle) - donnees.y[k] * Math.sin(angle);
            track.y[k] = donnees.x[k] * Math.sin(angle) + donnees.y[k] * Math.cos(angle);
            if (k == 0) {
                track_max_x = track.x[0];
                track_min_x = track.x[0];
                track_max_y = track.y[0];
                track_min_y = track.y[0]
            } else {
                if (track.x[k] < track_min_x)
                    track_min_x = track.x[k];
                if (track.y[k] < track_min_y)
                    track_min_y = track.y[k];
                if (track.x[k] > track_max_x)
                    track_max_x = track.x[k];
                if (track.y[k] > track_max_y)
                    track_max_y = track.y[k]
            }
        }

        w = track_max_x - track_min_x;
        h = track_max_y - track_min_y;
        if (w == 0 || h == 0) {
            w = 1;
            h = 1
        }
        mult = cv_w / w;
        mult_h = cv_h / h;
        if (mult_h < mult) mult = mult_h;

        track_w = (track_max_x - track_min_x) * mult;
        track_h = (track_max_y - track_min_y) * mult;

        //track_maxlength = track_w;
        //if (track_h > track_w)
        //    track_maxlength = track_h;
        track_maxlength = Math.sqrt(cv_w*cv_w + cv_h*cv_h);  // L'épaisseur de la trackmap dépend de la longueur de la diagonale

        track_epaisseur = trackmap_thickness_coef * epaisseur * track_maxlength / 60 * devicePixelRatio;
        track_mult = mult;
        outline_epaisseur = 0.1 * trackmap_outline_coef;

        rayon = track_maxlength / 75;


        // Ombrage du circuit
        trackmap_fond_context.shadowColor = "black";
        trackmap_fond_context.shadowOffsetX = rayon/6;
        trackmap_fond_context.shadowOffsetY = rayon/6;
        trackmap_fond_context.shadowBlur = rayon/2;


        // On dessine l'outline qui est en fait le circuit dessiné en-dessous.
        if (trackmap_outline_coef > 0 && trackmap_outline_disp == 1) {
            trackmap_fond_context.beginPath(); //On démarre un nouveau tracé.
            if (trackmap_outline_disp) {
                trackmap_fond_context.lineWidth = track_epaisseur;  // on enlève Xpx pour éviter que la trackmap déborde de la bordure
            } else {
                trackmap_fond_context.lineWidth = track_epaisseur;
            }
            trackmap_fond_context.lineJoin = "round";
            trackmap_fond_context.strokeStyle = trackmap_outline_color;
            for (k = 0; k < donnees.k_max; k++) {
                k2 = k + 1;
                if (k2 >= donnees.k_max) k2 = 0;
                if (k in track.x && k in track.y && donnees.k_max > 0) {
                    [x, y] = calc_x_y(0, k);
                    [x_2, y_2] = calc_x_y(0, k2);
                    if (k == 0) {
                        trackmap_fond_context.moveTo(x, y);//On se déplace au coin inférieur gauche
                        x0 = x;
                        y0 = y;
                    } else if (k == 1) {
                        x1 = x;
                        y1 = y
                    }
                    //trackmap_fond_context.lineTo(x, y);
                    l = Math.sqrt((x_2 - x) * (x_2 - x) + (y_2 - y) * (y_2 - y));
                    trackmap_fond_context.arcTo(x, y, x_2, y_2, l * 1.25);
                }
            }
            trackmap_fond_context.lineTo(x0, y0);
            trackmap_fond_context.lineTo(x1, y1);
            trackmap_fond_context.stroke(); //On trace seulement les lignes.
            trackmap_fond_context.closePath();

            // On enlève l'ombrage pour pas qu'il y en ai sur le circuit intérieur
            trackmap_fond_context.shadowOffsetX = 0;
            trackmap_fond_context.shadowOffsetY = 0;
            trackmap_fond_context.shadowBlur = 0;
        }


        // Dessine du circuit (intérieur)
        trackmap_fond_context.beginPath(); //On démarre un nouveau tracé.
        if (trackmap_outline_disp) {
            trackmap_fond_context.lineWidth = track_epaisseur - track_epaisseur * outline_epaisseur;  // on enlève Xpx pour éviter que la trackmap déborde de la bordure
        } else {
            trackmap_fond_context.lineWidth = track_epaisseur;
        }
        trackmap_fond_context.lineJoin = "round";
        trackmap_fond_context.strokeStyle = coul;
        for (k = 0; k < donnees.k_max; k++) {
            k2 = k + 1;
            if (k2 >= donnees.k_max) k2 = 0;
            if (k in track.x && k in track.y && donnees.k_max > 0) {
                [x, y] = calc_x_y(0, k);
                [x_2, y_2] = calc_x_y(0, k2);
                if (k == 0) {
                    trackmap_fond_context.moveTo(x, y);//On se déplace au coin inférieur gauche
                    x0 = x;
                    y0 = y;
                } else if (k == 1) {
                    x1 = x;
                    y1 = y
                }
                //trackmap_fond_context.lineTo(x, y);
                l = Math.sqrt((x_2 - x) * (x_2 - x) + (y_2 - y) * (y_2 - y));
                trackmap_fond_context.arcTo(x, y, x_2, y_2, l * 1.25);
            }
        }
        trackmap_fond_context.lineTo(x0, y0);
        trackmap_fond_context.lineTo(x1, y1);
        trackmap_fond_context.stroke(); //On trace seulement les lignes.
        trackmap_fond_context.closePath();


        // On remet l'ombrage
        trackmap_fond_context.shadowColor = "black";
        trackmap_fond_context.shadowOffsetX = rayon / 6;
        trackmap_fond_context.shadowOffsetY = rayon / 6;
        trackmap_fond_context.shadowBlur = rayon / 2;

        rayon_draw_turns_shadow = rayon;
        if (trackmap_disp_turns == 1) {
            draw_turns();
        }
        draw_fleche_start_finish();

        draw_north(donnees.north);

        // On enlève l'ombrage
        trackmap_fond_context.shadowOffsetX = 0;
        trackmap_fond_context.shadowOffsetY = 0;
        trackmap_fond_context.shadowBlur = 0;

        trackmap_loaded = 1;




        // *** Tracé des secteurs MM ***
        /*for (k = 0; k < donnees.k_max; k++) {
            trackmap_fond_context.beginPath(); //On démarre un nouveau tracé.
            trackmap_fond_context.lineWidth = track_epaisseur;
            trackmap_fond_context.lineJoin = "round";
            //trackmap_fond_context.strokeStyle = coul;
            if (k % 2 == 0)
                trackmap_fond_context.strokeStyle = "#000000";
            else
                trackmap_fond_context.strokeStyle = "#00ff00";
            k2 = k + 1;
            if (k2 >= donnees.k_max) k2 = 0;


            if (k in track.x && k in track.y && donnees.k_max > 0 && k2 in track.x && k2 in track.y && donnees.k_max > 0) {
                [x, y] = calc_x_y(0, k);
                [x2, y2] = calc_x_y(0, k2)
                trackmap_fond_context.moveTo(x, y);
                trackmap_fond_context.lineTo(x2, y2);
            }
            trackmap_fond_context.stroke(); //On trace seulement les lignes.
            trackmap_fond_context.closePath();
        }*/
        //





    }
}


// Affiche une flèche indiquant le sens du circuit
function draw_fleche_start_finish() {

    // Décalage du ldp pour le mode circulaire fixe
    var ldp_decal = 0;
    var dessine_ok = true;
    if (trackmap_circular_centered_on_driver == 1 && trackmap_circular == 1) {
        if (ldp_selected_idxjs != -1 && ldp_selected_idxjs != null) {
            ldp_decal = (0 - ldp_selected_idxjs) % 1;
            if (ldp_decal < 0) ldp_decal += 1;
        } else {
            dessine_ok = false;  // on ne dessine pas car il y a un problème
        }
    }

    if(dessine_ok) {
        // On dessine la ligne d'arrivée
        if (trackmap_start_finish_line_disp == 1) {

            [x0, y0] = calc_x_y(ldp_decal, 0);
            [x2, y2] = calc_x_y(ldp_decal, 1);

            l = Math.sqrt((x2 - x0) * (x2 - x0) + (y2 - y0) * (y2 - y0));
            if (l != 0) {
                x1 = x0 + (x2 - x0) / l * track_epaisseur / 2.5 * trackmap_start_finish_line_thickness_coef;
                y1 = y0 + (y2 - y0) / l * track_epaisseur / 2.5 * trackmap_start_finish_line_thickness_coef;
                trackmap_fond_turns_context.beginPath(); //On démarre un nouveau tracé.
                trackmap_fond_turns_context.strokeStyle = trackmap_start_finish_color; // couleur de la ligne d'arrivée
                trackmap_fond_turns_context.lineWidth = track_epaisseur * trackmap_start_finish_line_length_coef;
                trackmap_fond_turns_context.moveTo(x0, y0);
                trackmap_fond_turns_context.lineTo(x1, y1);
                trackmap_fond_turns_context.stroke(); //On trace seulement les lignes.
                trackmap_fond_turns_context.closePath();
            }
        }

        // On dessine la flèche indiquant le sens du circuit
        if (trackmap_start_finish_arrow_disp == 1) {
            rayon = track_maxlength / 75 * devicePixelRatio * trackmap_thickness_coef;

            [x0, y0] = calc_x_y(ldp_decal, 0);
            [x2, y2] = calc_x_y(ldp_decal, 1);

            l = Math.sqrt((x2 - x0) * (x2 - x0) + (y2 - y0) * (y2 - y0));
            if (l != 0) {
                dx = (x2 - x0) / l;
                dy = (y2 - y0) / l;
                side = -1;

                decale_x = -dy * track_epaisseur * side / 2;
                decale_y = dx * track_epaisseur * side / 2;

                x0 = x0 + decale_x * 3 * trackmap_start_finish_arrow_distance_coef;
                y0 = y0 + decale_y * 3 * trackmap_start_finish_arrow_distance_coef;

                arrow_thickness = 0.5 * trackmap_start_finish_arrow_thickness_coef;

                x1 = x0 - decale_x * arrow_thickness;
                y1 = y0 - decale_y * arrow_thickness;
                x2 = x1 + dx * rayon * 2 * trackmap_start_finish_arrow_length_coef;
                y2 = y1 + dy * rayon * 2 * trackmap_start_finish_arrow_length_coef;
                x3 = x2 - decale_x * 1.4 * arrow_thickness;
                y3 = y2 - decale_y * 1.4 * arrow_thickness;
                x4 = x0 + dx * (rayon * 2 * trackmap_start_finish_arrow_length_coef + 1.6 * track_epaisseur * arrow_thickness);
                y4 = y0 + dy * (rayon * 2 * trackmap_start_finish_arrow_length_coef + 1.6 * track_epaisseur * arrow_thickness);
                x5 = x2 + decale_x * 3.4 * arrow_thickness;
                y5 = y2 + decale_y * 3.4 * arrow_thickness;
                x6 = x5 - decale_x * 1.4 * arrow_thickness;
                y6 = y5 - decale_y * 1.4 * arrow_thickness;
                x7 = x0 + decale_x * arrow_thickness;
                y7 = y0 + decale_y * arrow_thickness;

                trackmap_context.globalAlpha = 1;

                trackmap_fond_turns_context.beginPath(); //On démarre un nouveau tracé.
                trackmap_fond_turns_context.fillStyle = trackmap_start_finish_arrow_color;
                trackmap_fond_turns_context.moveTo(x1, y1);//On se déplace au coin inférieur gauche
                trackmap_fond_turns_context.lineTo(x2, y2);
                trackmap_fond_turns_context.lineTo(x3, y3);
                trackmap_fond_turns_context.lineTo(x4, y4);
                trackmap_fond_turns_context.lineTo(x5, y5);
                trackmap_fond_turns_context.lineTo(x6, y6);
                trackmap_fond_turns_context.lineTo(x7, y7);
                trackmap_fond_turns_context.fill(); //On trace seulement les lignes.
                trackmap_fond_turns_context.closePath();
            }
        }
    }
}


// Affiche la direction du nord
function draw_north(north) {
    if (trackmap_disp_north && (trackmap_circular_centered_on_driver == 0 || trackmap_circular == 0)) {
        if (north != 99) {  // si c'est 99 ça veut dire qu'il n'est pas défini
            north = north + angle - Math.PI/2;
            x0 = (container_w - ttl - 17 - trackmap_north_coef * track_maxlength / 20) * devicePixelRatio;
            y0 = trackmap_north_coef * track_maxlength / 20 * devicePixelRatio;

            dx = 0 * Math.cos(north) - (-1) * Math.sin(north);
            dy = 0 * Math.sin(north) + (-1) * Math.cos(north);

            rayon = trackmap_north_coef * track_maxlength / 25 * 1.75 * devicePixelRatio;

            trackmap_fond_context.globalAlpha = 1;

            x1 = x0 - dx * rayon * 0.3;
            y1 = y0 - dy * rayon * 0.3;
            x2 = x0 + dx * rayon * 0.5;
            y2 = y0 + dy * rayon * 0.5;
            x3 = x0 - dx * rayon * 0.5 - dy * rayon * 0.35;
            y3 = y0 - dy * rayon * 0.5 + dx * rayon * 0.35;
            x4 = x0 - dx * rayon * 0.5 + dy * rayon * 0.35;
            y4 = y0 - dy * rayon * 0.5 - dx * rayon * 0.35;
            trackmap_fond_context.beginPath(); //On démarre un nouveau tracé.
            trackmap_fond_context.fillStyle = "#ff0000";
            trackmap_fond_context.moveTo(x1, y1);//On se déplace au coin inférieur gauche
            trackmap_fond_context.lineTo(x4, y4);
            trackmap_fond_context.lineTo(x2, y2);
            trackmap_fond_context.lineTo(x3, y3);
            trackmap_fond_context.fill(); //On trace seulement les lignes.
            trackmap_fond_context.closePath();

            // On enlève l'ombrage
            trackmap_fond_context.shadowOffsetX = 0;
            trackmap_fond_context.shadowOffsetY = 0;
            trackmap_fond_context.shadowBlur = 0;
            trackmap_fond_context.inset = 1;

            x1 = x0 - dx * rayon * 0.2;
            y1 = y0 - dy * rayon * 0.2;
            x2 = x0 + dx * rayon * 0.35;
            y2 = y0 + dy * rayon * 0.35;
            x4 = x0 - dx * rayon * 0.35 + dy * rayon * 0.25;
            y4 = y0 - dy * rayon * 0.4 - dx * rayon * 0.25;
            trackmap_fond_context.beginPath(); //On démarre un nouveau tracé.
            trackmap_fond_context.fillStyle = "#000000";
            trackmap_fond_context.globalCompositeOperation = "destination-out";
            trackmap_fond_context.moveTo(x1, y1);//On se déplace au coin inférieur gauche
            trackmap_fond_context.lineTo(x4, y4);
            trackmap_fond_context.lineTo(x2, y2);
            trackmap_fond_context.fill(); //On trace seulement les lignes.
            trackmap_fond_context.closePath();

            trackmap_fond_context.globalCompositeOperation = "source-over";

            /*x1 = x0 - dx * rayon * 0.3;
             y1 = y0 - dy * rayon * 0.3;
             x2 = x0 + dx * rayon * 0.5;
             y2 = y0 + dy * rayon * 0.5;
             x3 = x0 - dx * rayon * 0.5 + dy * rayon * 0.35;
             y3 = y0 - dy * rayon * 0.5 - dx * rayon * 0.35;
             trackmap_fond_context.beginPath(); //On démarre un nouveau tracé.
             trackmap_fond_context.fillStyle = "#ff0000";
             trackmap_fond_context.moveTo(x1, y1);//On se déplace au coin inférieur gauche
             trackmap_fond_context.lineTo(x2, y2);
             trackmap_fond_context.lineTo(x3, y3);
             trackmap_fond_context.fill(); //On trace seulement les lignes.
             trackmap_fond_context.closePath();*/

            // On remet l'Ombrage
            trackmap_fond_context.shadowColor = "black";
            trackmap_fond_context.shadowOffsetX = rayon / 6;
            trackmap_fond_context.shadowOffsetY = rayon / 6;
            trackmap_fond_context.shadowBlur = rayon / 2;
        }
    }
}


// Affiche la direction du nord dans le mode edition
function draw_north_edit(north) {
    north = north + angle;
    x0 = (container_w - ttl - 17 - track_maxlength / 20) * devicePixelRatio;
    y0 = track_maxlength / 20 * devicePixelRatio;

    dx = 0 * Math.cos(north) - (-1) * Math.sin(north);
    dy = 0 * Math.sin(north) + (-1) * Math.cos(north);

    rayon = track_maxlength / 25 * 1.75 * devicePixelRatio;

    trackmap_context.globalAlpha = 1;

    x1 = x0 - dx * rayon * 0.3;
    y1 = y0 - dy * rayon * 0.3;
    x2 = x0 + dx * rayon * 0.5;
    y2 = y0 + dy * rayon * 0.5;
    x3 = x0 - dx * rayon * 0.5 - dy * rayon * 0.35;
    y3 = y0 - dy * rayon * 0.5 + dx * rayon * 0.35;
    trackmap_context.beginPath(); //On démarre un nouveau tracé.
    trackmap_context.fillStyle = "#444444";
    trackmap_context.moveTo(x1, y1);//On se déplace au coin inférieur gauche
    trackmap_context.lineTo(x2, y2);
    trackmap_context.lineTo(x3, y3);
    trackmap_context.fill(); //On trace seulement les lignes.
    trackmap_context.closePath();

    x1 = x0 - dx * rayon * 0.3;
    y1 = y0 - dy * rayon * 0.3;
    x2 = x0 + dx * rayon * 0.5;
    y2 = y0 + dy * rayon * 0.5;
    x3 = x0 - dx * rayon * 0.5 + dy * rayon * 0.35;
    y3 = y0 - dy * rayon * 0.5 - dx * rayon * 0.35;
    trackmap_context.beginPath(); //On démarre un nouveau tracé.
    trackmap_context.fillStyle = "#ffffff";
    trackmap_context.moveTo(x1, y1);//On se déplace au coin inférieur gauche
    trackmap_context.lineTo(x2, y2);
    trackmap_context.lineTo(x3, y3);
    trackmap_context.fill(); //On trace seulement les lignes.
    trackmap_context.closePath();
}


//function draw_turns(opac) {
function draw_turns() {

    var opac = 1;

    if (rayon_draw_turns_shadow != null) {
        trackmap_fond_turns_context.clearRect(0, 0, (container_w - ttl) * devicePixelRatio, container_h * devicePixelRatio);
        trackmap_fond_turns_context.globalAlpha = opac;

        // Ombrage des noms des virages du circuit
        trackmap_fond_turns_context.shadowColor = "black";
        trackmap_fond_turns_context.shadowOffsetX = rayon_draw_turns_shadow / 6;
        trackmap_fond_turns_context.shadowOffsetY = rayon_draw_turns_shadow / 6;
        trackmap_fond_turns_context.shadowBlur = rayon_draw_turns_shadow / 2;

        // On place les noms des virages
        var i = 0;
        for (y in donnees.turn_num) {
            if (i >= donnees.nb_turns) break; // on sort car sinon on risque de garder les virages en mémoire d'anciens circuits
            if (y in donnees.turn_info) {
                info = donnees.turn_info[y]
            } else {
                info = ""
            }
            draw_turn(donnees.turn_num[y], donnees.turn_ldp[y], donnees.turn_side[y], info);
            i++;
        }

        // On enlève l'ombrage des turns
        trackmap_fond_turns_context.shadowOffsetX = 0;
        trackmap_fond_turns_context.shadowOffsetY = 0;
        trackmap_fond_turns_context.shadowBlur = 0;
    }
}

function draw_turn(turn, ldp, side, info) {

    if (trackmap_circular_centered_on_driver == 1 && trackmap_circular == 1 && ldp_selected_idxjs != -1) {
        ldp = (ldp - ldp_selected_idxjs) % 1;
        if (ldp < 0) ldp += 1;
    }

    if (trackmap_circular == 1) {
        if (trackmap_circular_reverse == 0) {
            side = -1;
        } else {
            side = 1;
        }
    }

    k = Math.floor(donnees.coef_k * ldp);
    d = donnees.coef_k * ldp;

    // REM : le k ne doit être égale ni à k_max, ni à 0 pour éviter un mouvement saccadé sur la ligne
    if (k >= donnees.k_max || k == 0) k = donnees.k_max - 1;
    k2 = k + 1;
    if (k2 >= donnees.k_max || k2 == 0) k2 = 1;

    // On fait une interpolation
    [x, y] = calc_x_y(ldp, null);
    [x1, y1] = calc_x_y(0, k);
    [x2, y2] = calc_x_y(0, k2);

    rayon = track_maxlength / 75 * devicePixelRatio;

    // On décale le nom du virage à gauche ou à droite
    l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    if (l != 0) {
        decale_x = -(y2 - y1) / l * (rayon + track_epaisseur * 1 * trackmap_turn_distance_coef) * side;
        decale_y = (x2 - x1) / l * (rayon + track_epaisseur * 1 * trackmap_turn_distance_coef) * side;
        x += decale_x;
        y += decale_y;

        //trackmap_context.globalAlpha = 1;

        trackmap_fond_turns_context.fillStyle = trackmap_turn_num_color;
        trackmap_fond_turns_context.strokeStyle = trackmap_turn_num_color;
        trackmap_fond_turns_context.font = "bold " + trackmap_turn_num_coef * 2 * rayon + "px Arial";
        trackmap_fond_turns_context.textAlign = "center";
        trackmap_fond_turns_context.fillText(turn, x, y + rayon / 1.5);

        if (trackmap_circular == 0) {  // on n'affiche pas les noms des virage en mode trackmap circulaire
            trackmap_fond_turns_context.fillStyle = trackmap_turn_info_color;
            trackmap_fond_turns_context.font = "bold " + trackmap_turn_info_coef * 1 * rayon + "px Arial";
            trackmap_fond_turns_context.textAlign = "left";
            trackmap_fond_turns_context.fillText(" " + info, x + trackmap_turn_num_coef * (turn.length / 2 + 0.5) * 2 * rayon / 2, y + rayon / 1.52);
        }
    }
}


function draw_turn_edit(coul, turn, ldp, side, info) {
    if (trackmap_loaded) {
        k = Math.floor(donnees.coef_k * ldp);
        d = donnees.coef_k * ldp;

        // REM : le k ne doit être égale ni à k_max, ni à 0 pour éviter un mouvement saccadé sur la ligne
        if (k >= donnees.k_max || k == 0) k = donnees.k_max - 1;
        k2 = k + 1;
        if (k2 >= donnees.k_max || k2 == 0) k2 = 1;

        // On fait une interpolation
        [x, y] = calc_x_y(ldp, null);
        [x1, y1] = calc_x_y(0, k);
        [x2, y2] = calc_x_y(0, k2);

        rayon = track_maxlength / 75 * devicePixelRatio;

        // On décale le nom du virage à gauche ou à droite
        l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        if (l != 0) {
            decale_x = -(y2 - y1) / l * (rayon + track_epaisseur * 1 * trackmap_turn_distance_coef) * side;
            decale_y = (x2 - x1) / l * (rayon + track_epaisseur * 1 * trackmap_turn_distance_coef) * side;
            x += decale_x;
            y += decale_y;

            trackmap_context.globalAlpha = 1;

            // Ombrage du texte
            trackmap_context.shadowColor = "black";
            trackmap_context.shadowOffsetX = rayon / 6;
            trackmap_context.shadowOffsetY = rayon / 6;
            trackmap_context.shadowBlur = rayon / 2;

            trackmap_context.fillStyle = coul;
            trackmap_context.strokeStyle = coul;
            trackmap_context.font = "bold " + trackmap_turn_num_coef * 2 * rayon + "px Arial";
            trackmap_context.textAlign = "center";
            trackmap_context.fillText(turn, x, y + rayon / 1.5);

            trackmap_context.fillStyle = coul;
            trackmap_context.font = "bold " + trackmap_turn_info_coef * 1 * rayon + "px Arial";
            trackmap_context.textAlign = "left";
            trackmap_context.fillText(" " + info, x + trackmap_turn_num_coef * (turn.length / 2 + 0.5) * 2 * rayon / 2, y + rayon / 1.52);

            // On enlève l'ombrage
            trackmap_context.shadowOffsetX = 0;
            trackmap_context.shadowOffsetY = 0;
            trackmap_context.shadowBlur = 0;
        }
    }
}


function optimize_track_angle() {
    var w = 0;
    var h = 0;
    track = {x: [], y: []};
    angle_optimized = 0;
    track_mult = 0;

    for (angle = Math.PI / 2 ; angle > -Math.PI/800 - Math.PI / 2 ; angle -= Math.PI / 400) {

        // On fait une rotation et on cherche les valeurs min et max
        for (var k = 0; k < donnees.k_max; k++) {
            track.x[k] = donnees.x[k] * Math.cos(angle) - donnees.y[k] * Math.sin(angle);
            track.y[k] = donnees.x[k] * Math.sin(angle) + donnees.y[k] * Math.cos(angle);
            if (k == 0) {
                track_max_x = track.x[0];
                track_min_x = track.x[0];
                track_max_y = track.y[0];
                track_min_y = track.y[0]
            } else {
                if (track.x[k] < track_min_x)
                    track_min_x = track.x[k];
                if (track.y[k] < track_min_y)
                    track_min_y = track.y[k];
                if (track.x[k] > track_max_x)
                    track_max_x = track.x[k];
                if (track.y[k] > track_max_y)
                    track_max_y = track.y[k]
            }
        }

        w = track_max_x - track_min_x;
        h = track_max_y - track_min_y;
        if (w == 0 || h == 0) {
            w = 1;
            h = 1
        }
        mult = cv_w / w;
        mult_h = cv_h / h;
        if (mult_h < mult) mult = mult_h;

        if (mult * 0.98 > track_mult) {
            track_mult = mult;
            angle_optimized = angle
        }
    }

    return angle_optimized
}


// Affiche la direction du vent et les infos météo
function draw_winddir(north, winddir) {

    var w = parseInt($("#trackmap_canvas").css("width"));
    var h = parseInt($("#trackmap_canvas").css("height"));
    //rayon2 = track_maxlength / 75;
    rayon2 = w / 102;

    trackmap_context.globalAlpha = 1;

    if (north != 99 && trackmap_disp_wind && (trackmap_circular_centered_on_driver == 0 || trackmap_circular == 0)) {  // si c'est 99 ça veut dire qu'il n'est pas défini
        winddir = angle + north + winddir + Math.PI - Math.PI/2;
        //x0 = track_maxlength / 20;
        //y0 = container_h - track_maxlength / 20;
        x0 = trackmap_winddir_coef * w / 30 * devicePixelRatio;
        y0 = (h - trackmap_winddir_coef * w / 30) * devicePixelRatio;

        dx = 0 * Math.cos(winddir) - (-1) * Math.sin(winddir);
        dy = 0 * Math.sin(winddir) + (-1) * Math.cos(winddir);

        //rayon = track_maxlength / 25 * 1.75;
        rayon = trackmap_winddir_coef * w / 30 * 1.5 * devicePixelRatio;

        // On remet l'Ombrage
        trackmap_context.shadowColor = "black";
        trackmap_context.shadowOffsetX = rayon2 / 6;
        trackmap_context.shadowOffsetY = rayon2 / 6;
        trackmap_context.shadowBlur = rayon2 / 2;

        x1 = x0 - dx * rayon * 0.3;
        y1 = y0 - dy * rayon * 0.3;
        x2 = x0 + dx * rayon * 0.5;
        y2 = y0 + dy * rayon * 0.5;
        x3 = x0 - dx * rayon * 0.5 - dy * rayon * 0.35;
        y3 = y0 - dy * rayon * 0.5 + dx * rayon * 0.35;
        x4 = x0 - dx * rayon * 0.5 + dy * rayon * 0.35;
        y4 = y0 - dy * rayon * 0.5 - dx * rayon * 0.35;
        trackmap_context.beginPath(); //On démarre un nouveau tracé.
        trackmap_context.fillStyle = "#0077ff";
        trackmap_context.moveTo(x1, y1);//On se déplace au coin inférieur gauche
        trackmap_context.lineTo(x4, y4);
        trackmap_context.lineTo(x2, y2);
        trackmap_context.lineTo(x3, y3);
        trackmap_context.fill(); //On trace seulement les lignes.
        trackmap_context.closePath();

        // On enlève l'ombrage
        trackmap_context.shadowOffsetX = 0;
        trackmap_context.shadowOffsetY = 0;
        trackmap_context.shadowBlur = 0;
        trackmap_context.inset = 1;

        x1 = x0 - dx * rayon * 0.2;
        y1 = y0 - dy * rayon * 0.2;
        x2 = x0 + dx * rayon * 0.35;
        y2 = y0 + dy * rayon * 0.35;
        x4 = x0 - dx * rayon * 0.35 + dy * rayon * 0.25;
        y4 = y0 - dy * rayon * 0.4 - dx * rayon * 0.25;
        trackmap_context.beginPath(); //On démarre un nouveau tracé.
        trackmap_context.fillStyle = "#000000";
        trackmap_context.globalCompositeOperation = "destination-out";
        trackmap_context.moveTo(x1, y1);//On se déplace au coin inférieur gauche
        trackmap_context.lineTo(x4, y4);
        trackmap_context.lineTo(x2, y2);
        trackmap_context.fill(); //On trace seulement les lignes.
        trackmap_context.closePath();

        trackmap_context.globalCompositeOperation = "source-over";
    }

    // On remet l'Ombrage
    /*trackmap_context.shadowColor = "white";
     trackmap_context.shadowOffsetX = rayon2 / 6;
     trackmap_context.shadowOffsetY = rayon2 / 6;
     trackmap_context.shadowBlur = rayon2 / 2;*/

    trackmap_context.fillStyle = "#0077ff";
    trackmap_context.font = "bold " + 1.7 * rayon2 + "px Arial";
    trackmap_context.textAlign = "left";

    weather = reformat_skies(donnees.skies);

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

    if (!tmp_isNaN) {
        if (donnees.u == 1) {
            str_speed = (donnees.windspeed * 3.6).toFixed(1) + " km/h";
        } else {
            str_speed = (donnees.windspeed * 3.6 / 1.609344).toFixed(1) + " MPH";
        }
        if ((temperature_mode != 2) && ((donnees.u == 1 && temperature_mode == 0) || (temperature_mode == 1))) {  // systeme metric ou forcé en Celsius dans les options
            weather += " " + donnees.airtemp.toFixed(1) + String.fromCharCode(176) + "C";
            weather += ", track " + donnees.tracktemp.toFixed(1) + String.fromCharCode(176) + "C";
            if (north == 99)  // si c'est 99 ça veut dire qu'il n'est pas défini
                weather += ", Winds " + (donnees.winddir / Math.PI * 180).toFixed(0) + String.fromCharCode(176) + " " + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + (donnees.windspeed * 3.6).toFixed(1) + " km/h";
            else
                weather += ", Winds " + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + str_speed;
        } else {
            weather += " " + (donnees.airtemp * 1.8 + 32).toFixed(1) + String.fromCharCode(176) + "F";
            weather += ", track " + (donnees.tracktemp * 1.8 + 32).toFixed(1) + String.fromCharCode(176) + "F";
            if (north == 99)  // si c'est 99 ça veut dire qu'il n'est pas défini
                weather += ", Winds " + (donnees.winddir / Math.PI * 180).toFixed(0) + String.fromCharCode(176) + " " + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + (donnees.windspeed * 3.6 / 1.609344).toFixed(1) + " MPH";
            else
                weather += ", Winds " + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + str_speed;
        }
        weather += ", RH " + (donnees.humidity * 100).toFixed(0) + "%";
        weather += ", Fog " + (donnees.fog * 100).toFixed(0) + "%";
    }

    if (trackmap_disp_weather_infos) {
        //trackmap_context.fillText(weather, track_maxlength / 10, container_h - 1.5* rayon2);
        /*if (north == 99) {  // si c'est 99 ça veut dire qu'il n'est pas défini
            trackmap_context.fillText(weather, w / 75, h - 1.5 * rayon2);
        } else {
            trackmap_context.fillText(weather, w / 13, h - 1.5 * rayon2);
        }*/
        if (document.getElementById("weather") !== null) {
            //document.getElementById("weather").innerHTML = "<div style='-webkit-filter: drop-shadow(1px 1px 1px black);filter: drop-shadow(1px 1px 1px black);" +
            //    "padding:0.0em;" +
            //    "margin-left: " + w / 13 + "px'>" + weather + "</div>";
            set_inner_html("weather", "<div style='font-size: " + trackmap_weather_info_coef + "em; line-height: " + 1 + "em; -webkit-filter: drop-shadow(1px 1px 1px black);filter: drop-shadow(1px 1px 1px black);padding:0.0em; margin-bottom: 0.5em; margin-left: " + trackmap_winddir_coef * w / 13 + "px'>" + weather + "</div>");
        }
    } else {
        if (document.getElementById("weather") !== null) {
            //document.getElementById("weather").innerHTML = "";
            set_inner_html("weather", "");
        }
    }

    // On enlève l'ombrage
    trackmap_context.shadowColor = "black";
    trackmap_context.shadowOffsetX = 0;
    trackmap_context.shadowOffsetY = 0;
    trackmap_context.shadowBlur = 0;
    trackmap_context.inset = 1;
}


// On initialize les couleurs
function init_colorize() {
    if (colorize_drivers_init == 3) {
        var nom;
        if (donnees.teamracing) {
            colorize_ = colorize_team_;
        } else {
            colorize_ = colorize_driver_;
        }
        for (var i = 0; i < 64; i++) {
            if (donnees.d != undefined && i in donnees.d) {
                nom = donnees.d[i].name;
                id = donnees.d[i].uid;
                if (donnees.teamracing) {
                    nom = donnees.d[i].tn;
                    id = donnees.d[i].tid;
                }
            }
        }
        colorize_drivers_init = 0;
    }
}
