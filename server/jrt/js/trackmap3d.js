

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

    objet_disp_test = (objet_disp_test + 2) % 2 + 1;  // alterne de 1 à 2 pour tester s'il faut effacer l'objet ou pas

    // On place les noms des virages et on les réoriente à chaque fois
    var i = 0;
    for (var turn_id in donnees.turn_num) {
        if (i >= donnees.nb_turns) break; // on sort car sinon on risque de garder les virages en mémoire d'anciens circuits
        if (turn_id in donnees.turn_info) {
            info = donnees.turn_info[turn_id]
        } else {
            info = ""
        }
        draw_turn("#ffffff", turn_id, donnees.turn_ldp[turn_id], donnees.turn_side[turn_id], info);
        // Affichage des ombres
        draw_turn("#ffffff", turn_id + 999, donnees.turn_ldp[turn_id], donnees.turn_side[turn_id], info);
        i++;
    }

    if (donnees.d != undefined && selected_idxjs != undefined && selected_idxjs in donnees.d) {

        dp = donnees.d[selected_idxjs].dp;

        i = selected_idxjs;
        ldp = dp - Math.floor(dp);

        // Mode caméra embarquée
        if (trackmap_camera_mode == 1) {
            camera_onboard(ldp);
        }

        if (donnees.d[selected_idxjs].fr == 0) {
            if (trackmap_camera_mode != 1) {
                if (trackmap_car_ring_selected) {
                    driver_on_trackmap("anneau", "rgb(255,255,255)", 1, ldp, selected_idxjs, 2.5, 0, 2.5);
                }
            }
        }

        //***
        //donnees.co = 4;
        //donnees.plost = 62.3;
        //donnees.pexit = 34.42;

        if (donnees.pexit != undefined && selected_idxjs == me && donnees.co > 0 && donnees.d[selected_idxjs].fr == 0) {
            dp_exit = donnees.pexit;
            ldp_exit = dp_exit - Math.floor(dp_exit);
            if (selected_idxjs == me && donnees.co > 0 && donnees.d[selected_idxjs].fr == 0) {  // On affiche l'estimation après la sortie des pits que pour le pilote local et s'il on a les infos de fuel
                if (donnees.plost != undefined) {
                    /*if (trackmap_disp_timelost) {
                        document.getElementById("plost").innerHTML = "<span style='-webkit-filter: drop-shadow(1px 1px 1px black);filter: drop-shadow(1px 1px 1px black);" +
                            "padding:0.5em;" +
                            "font-weight:bold;color:#ff8800; margin-left:0.0em'>Time Lost Next PIT : " + (donnees.plost).toFixed(1) + "s</span>";
                    }*/
                    if (donnees.pexit != 0 && donnees.plost > 15 && trackmap_disp_predicted) { // on n'affiche le point orange que si le plost est supérieur à 15 s et si l'option est activée
                        driver_on_trackmap("sphere_orange", "rgb(255,128,0)", 0.75, ldp_exit, selected_idxjs, 2.5, 1, 1);
                        //driver_on_trackmap("sphere_orange", "rgb(255,128,0)", 1, ldp_exit, selected_idxjs, 2.5, 1, 1);
                    } else {
                        dp_exit = -1;
                    }
                }
            }
        } else {
            dp_exit = -1;
        }

        // Si je suis dans les pits, on change ma couleur en rajoutant une couche grise dessus
        //trackmap_context.globalAlpha=0.666;
        if (donnees.d[selected_idxjs].p) {
            //driver_on_trackmap("sphere_big", "#666666", 0.666, ldp, selected_idxjs, 2.95, 1, 1);
        }
    } else {
        dp_exit = -1;  // en dernier recours on donne une valeur à dp_exit si jamais on n'accède pas aux données
    }

    // Affichage des autres pilotes
    var col_;
    if (donnees.d != undefined) {
        for (i in donnees.d) {
            // On affiche les autres pilotes encore en piste
            if ((donnees.d[i].fr == 0) && (donnees.d[i].pr == 1 || donnees.d[i].s > 1 || donnees.d[i].cts != -1)) {

                dp = donnees.d[i].dp;

                ldp = dp - Math.floor(dp);
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
                    //trackmap_context.globalAlpha = 0.80;
                    if (trackmap_car_ring_colorized) {
                        driver_on_trackmap("anneau", colorize_[id], 1, ldp, i, 2.5, 0, 2.5);
                    }
                } else if (col_ !== null) {
                    //trackmap_context.globalAlpha = 0.80;
                    if (trackmap_car_ring_colorized) {
                        driver_on_trackmap("anneau", col_, 1, ldp, i, 2.5, 0, 2.5);
                    }
                }

                // Si on n'a pas pu calculer le dp_exit auparavant on prend la position du pilote sélectionné
                if ((me != selected_idxjs || dp_exit < 0) && selected_idxjs in donnees.d) {
                    dp_exit = donnees.d[selected_idxjs].dp
                }

                if (donnees.d[i].cts != -1 || donnees.d[i].pr != 1) {  // si un pilote est aux pits et a quitté le jeu on ne l'affiche pas

                    if (i != selected_idxjs) {
                        //trackmap_context.globalAlpha = 0.75;
                        // Si le pilote a un tour de retard on rajoute du bleu, et s'il a un tour d'avance on met du rouge
                        if (trackmap_car_ring_lapper) {
                            if (donnees.d[i].dp - dp_exit > 0.5) {
                                driver_on_trackmap("anneau_small", "#ff4444", 1, ldp, i, 1.5, 0, 1.5);
                            }
                            if (donnees.d[i].dp - dp_exit < -0.5) {
                                driver_on_trackmap("anneau_small", "#0099ff", 1, ldp, i, 1.5, 0, 1.5);
                            }
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
                    //trackmap_context.globalAlpha = 0.65;
                    coul = "#" + str;

                    if (!trackmap_car_color_auto) {  // si on n'est pas en couleur automatique on remplace par la couleur spécifiée
                        coul = trackmap_car_color;
                    }

                    //driver_on_trackmap("sphere_car", coul, 0.85, ldp, i, 1, 1, 1);
                    if (i != selected_idxjs || trackmap_camera_mode != 1) {
                        driver_on_trackmap("sphere_car", coul, 1, ldp, i, 1, 1, 1);
                    }

                    //if (trackmap_disp_mode == 0) {
                    if (selected_idxjs in donnees.d) {
                        //trackmap_context.globalAlpha = 1;
                        // Si le pilote a pitté plus tard on le marque d'un petit point noir (seulement si plus d'un tour d'écart)
                        // A condition qu'on soit dans la même class
                        if (donnees.d[selected_idxjs].cc == donnees.d[i].cc && donnees.d[i].sti < donnees.d[selected_idxjs].sti - 1) {
                            if (trackmap_car_black_dot) {
                                driver_on_trackmap("point_noir", "#333333", 1, ldp, i, 0.33, 1, 1);
                            }
                        }
                    }
                    //}

                    if (donnees.d[i].s < 20 && !(donnees.d[i].pr)) {  // Les pilotes quasiments arrêtés sur les piste on les met en jaune
                        coul = "rgb(255,255,0)";
                        //driver_on_trackmap("anneau", coul, 0.75, ldp, i, 2.5, 0, 2.5);
                        if (trackmap_car_ring_yellow) {
                            driver_on_trackmap("anneau", coul, 1, ldp, i, 2.5, 0, 2.5);
                        }
                    }

                    if (donnees.d[i].cts == -1 && i != selected_idxjs) {  // On indique les pilotes déconnectés en les grisant (REM : on ne peut pas le faire en 3D
                        coul = "rgb(32,32,32)";
                        //driver_on_trackmap("sphere_big", coul, 0.5, ldp, i, 1.65, 1, 1);
                    }

                }
            }

            // On efface les objets à ne plus afficher
            for (type in objet_is_disp) {
                if (type != "text_mode3" && type != "sphere_p1" && type != "line_p1" && type != "text_p1" && type != "text_turns") {
                    if (objet_is_disp[type][i] != objet_disp_test && objet_is_disp[type][i] != 0) {
                        scene.remove(objet[type][i]);
                        objet_is_disp[type][i] = 0;
                    }
                }
            }
        }
    }

    for (var c in objet_is_disp["text_mode3"]) {
        for (var i = 0; i < 64; i++) {
            if (c in objet["text_mode3"]) {
                if (objet_is_disp["text_mode3"][c][i + 1] != objet_disp_test && objet_is_disp["text_mode3"][c][i + 1] != 0) {
                    scene.remove(objet["text_mode3"][c][i + 1]);
                    objet_is_disp["text_mode3"][c][i + 1] = 0;
                }
            }
        }
        for (type in {"sphere_p1": 0, "line_p1": 0, "text_p1": 0}) {
            if (objet[type] != undefined) {
                if (c in objet[type]) {
                    if (objet_is_disp[type][c] != objet_disp_test && objet_is_disp[type][c] != 0) {
                        scene.remove(objet[type][c]);
                        objet_is_disp[type][c] = 0;
                    }
                }
            }
        }
    }

    draw_winddir(donnees.north, donnees.winddir);



}


function camera_onboard(ldp) {

    k = Math.floor(donnees.coef_k * ldp);
    d = donnees.coef_k * ldp;
    if (k >= donnees.k_max) k = 0;
    k2 = k + 1;
    if (k2 >= donnees.k_max) k2 = 0;
    k3 = k2 + 1;
    if (k3 >= donnees.k_max) k3 = 0;

    if (k in track.x && k in track.y && donnees.k_max > 0) {
        var hauteur_pilote = 0.8;  // hauteur des yeux du pilote en mètres
        x1 = ((container_w - track_w) / 2 + (-track.x[k] + track_max_x) * track_mult - container_w / 2);
        z1 = ((container_h - track_h) / 2 + (-track.y[k] + track_max_y) * track_mult - container_h / 2);
        y1 = (track.z[k] - track_min_z + hauteur_pilote) * track_mult * trackmap_elevation_factor;
        x2 = ((container_w - track_w) / 2 + (-track.x[k2] + track_max_x) * track_mult - container_w / 2);
        z2 = ((container_h - track_h) / 2 + (-track.y[k2] + track_max_y) * track_mult - container_h / 2);
        y2 = (track.z[k2] - track_min_z + hauteur_pilote) * track_mult * trackmap_elevation_factor;
        x3 = ((container_w - track_w) / 2 + (-track.x[k3] + track_max_x) * track_mult - container_w / 2);
        z3 = ((container_h - track_h) / 2 + (-track.y[k3] + track_max_y) * track_mult - container_h / 2);
        y3 = (track.z[k3] - track_min_z + hauteur_pilote) * track_mult * trackmap_elevation_factor;

        // On fait une interpolation
        x = x1 + (x2 - x1) * (d - k);
        z = z1 + (z2 - z1) * (d - k);
        y = y1 + (y2 - y1) * (d - k);
        x_2 = x2 + (x3 - x2) * (d - k);
        z_2 = z2 + (z3 - z2) * (d - k);
        y_2 = y2 + (y3 - y2) * (d - k);
        r = donnees.r[k] + (donnees.r[k2] - donnees.r[k]) * (d - k);

        camera.position.x = x;
        camera.position.y = y;
        camera.position.z = z;
        camera.lookAt(new THREE.Vector3(x + (x_2 - x)*10000, y + (y_2 - y) * 10000,z + (z_2 - z) * 10000));
        camera.rotateZ(-r * trackmap_banking_factor);
        camera.updateProjectionMatrix();
    }
}


function driver_on_trackmap(type, coul, opac, ldp, caridx, taille, plein, epaisseur_trait) {

    var w = 0;
    k = Math.floor(donnees.coef_k * ldp);
    d = donnees.coef_k * ldp;

    // REM : le k ne doit être égale ni à k_max, ni à 0 pour éviter un mouvement saccadé sur la ligne
    if (k >= donnees.k_max || k == 0) k = donnees.k_max - 1;
    k2 = k + 1;
    if (k2 >= donnees.k_max || k2 == 0) k2 = 1;
    if (k2 > k) {
        k2_minus_k = k2 - k;
    } else {
        k2_minus_k = k2 - 0 + donnees.coef_k - k;
    }
    if (d > k) {
        d_minus_k = d - k;
    } else {
        d_minus_k = d - 0 + donnees.coef_k - k;
    }

    if (k in track.x && k in track.y && donnees.k_max > 0) {

        var c = donnees.d[caridx].classid;

        //rayon = taille * track_epaisseur / 2;
        rayon = 1 * track_epaisseur / 2;
        /*if (trackmap_disp_mode != 0) {  // on double le rayon si on affiche le n° ou les 3 premières lettres
            rayon = 2 * rayon;
        }*/
        rayon = trackmap_car_coef * rayon;

        x1 = ((container_w - track_w) / 2 + (-track.x[k] + track_max_x) * track_mult - container_w / 2);
        z1 = ((container_h - track_h) / 2 + (-track.y[k] + track_max_y) * track_mult - container_h / 2);
        y1 = (track.z[k] - track_min_z) * track_mult * trackmap_elevation_factor;
        x2 = ((container_w - track_w) / 2 + (-track.x[k2] + track_max_x) * track_mult - container_w / 2);
        z2 = ((container_h - track_h) / 2 + (-track.y[k2] + track_max_y) * track_mult - container_h / 2);
        y2 = (track.z[k2] - track_min_z) * track_mult * trackmap_elevation_factor;

        // On fait une interpolation
        x = x1 + (x2 - x1) * (d_minus_k) / k2_minus_k;
        z = z1 + (z2 - z1) * (d_minus_k) / k2_minus_k;
        y = y1 + (y2 - y1) * (d_minus_k) / k2_minus_k + rayon;

        l = Math.sqrt((x2 - x1)*(x2 - x1) + (z2 - z1)*(z2 - z1));

        // Calcul de la pente et de l'altitude :
        //track_l = Math.sqrt((track.x[k2] - track.x[k])*(track.x[k2] - track.x[k]) + (track.y[k2] - track.y[k]) * (track.y[k2] - track.y[k]) + (track.z[k2] - track.z[k]) * (track.z[k2] - track.z[k]));
        //console.log("Altitude : ", (track.z[k] - track_min_z).toFixed(2), "m", "Pente : ", (100 * Math.tan(Math.asin((track.z[k2] - track.z[k]) / track_l ))).toFixed(2), "%");

        // Indication du premier de la classe
        if (donnees.styp == "Race") {
            classpos = donnees.d[caridx].cpos;
        } else {
            classpos = donnees.d[caridx].cposbest;
        }

        // Si le driver est dans les stands, on le décale sur le côté de la piste
        if (donnees.d[caridx].pr && l != 0) {
            decale_x = -(z2 - z1) / l * track_epaisseur * 1.5;
            decale_z = (x2 - x1) / l * track_epaisseur * 1.5;
        } else {
            decale_x = 0;
            decale_z = 0
        }
        x += decale_x;
        z += decale_z;

        // pré-calculs utile pour l'affichage des textes
        v_cam2.x = camera.position.x - x;
        v_cam2.y = camera.position.y - y;
        v_cam2.z = camera.position.z - z;
        d_cam2 = Math.sqrt(v_cam2.x * v_cam2.x + v_cam2.y * v_cam2.y + v_cam2.z * v_cam2.z);
        camera.getWorldDirection(v_cam);
        d2_cam = Math.sqrt(v_cam.x * v_cam.x + v_cam.z * v_cam.z);
        d_cam = Math.sqrt(v_cam.x * v_cam.x + v_cam.y * v_cam.y + v_cam.z * v_cam.z);

        if (plein != 0 && taille == 1 && classpos == 1 && trackmap_car_P1) {
            // Dessin d'un panneau indiquant P1
            if (objet["sphere_p1"][c] != undefined) {
                objet["sphere_p1"][c].position.set(x, y, z);
                objet["sphere_p1"][c].scale.set(2 * rayon, 2 * rayon, 2 * rayon);
                objet["sphere_p1"][c].material = new THREE.MeshLambertMaterial({
                    color: "#ffd700",
                    transparent: false,
                    side: THREE.DoubleSide
                });
            }
            if (objet["line_p1"][c] != undefined) {
                objet["line_p1"][c].position.set(x, y, z);
                objet["line_p1"][c].scale.set(2 * rayon, 2 * rayon, 2 * rayon);
                objet["line_p1"][c].material = new THREE.LineBasicMaterial({color: "#ffd700"});
            }
            // On regarde si l'objet est déjà rendue ou pas
            if (objet_is_disp["sphere_p1"][c] == 0) {
                scene.add(objet["sphere_p1"][c]);
            }
            objet_is_disp["sphere_p1"][c] = objet_disp_test;
            if (objet_is_disp["line_p1"][c] == 0) {
                scene.add(objet["line_p1"][c]);
            }
            objet_is_disp["line_p1"][c] = objet_disp_test;

            if (objet["text_p1"][c] != undefined) {  // si l'objet text est défini
                if (objet_is_disp["text_p1"][c] == 0) {
                    scene.add(objet["text_p1"][c]);
                }
                // On oriente le numéros dans la même direction que la caméra
                if (d2_cam != 0) {
                    objet["text_p1"][c].rotation.z = -Math.PI / 2 + Math.atan(-v_cam.y / d2_cam);
                }
                if (v_cam.z < 0) {
                    objet["text_p1"][c].rotation.y = Math.atan(v_cam.x / v_cam.z) - Math.PI / 2;
                } else if (v_cam.z != 0) {
                    objet["text_p1"][c].rotation.y = Math.atan(v_cam.x / v_cam.z) - Math.PI / 2 + Math.PI;
                }
                objet["text_p1"][c].position.set(x + v_cam2.x / d_cam2 * rayon * 1.5, y + (1 + 0.4 + 0.6) * rayon + v_cam2.y / d_cam2 * rayon * 1.5, z + v_cam2.z / d_cam2 * rayon * 1.5);
                objet["text_p1"][c].scale.set( 2*rayon*0.9, 2*rayon*0.9, 2*rayon*0.9 );
                objet_is_disp["text_p1"][c] = objet_disp_test;
            }

        }

        // On place le pilote avec la couleur définie
        objet[type][caridx].position.set(x, y, z);
        objet[type][caridx].scale.set( 2*rayon, 2*rayon, 2*rayon );
        if (opac < 1) {
            objet[type][caridx].material = new THREE.MeshLambertMaterial( {color: coul, transparent: true, opacity: opac, side: THREE.DoubleSide} );
        } else {
            objet[type][caridx].material = new THREE.MeshLambertMaterial( {color: coul, transparent: false, side: THREE.DoubleSide} );
        }
        // On regarde si la sphere est déjà rendue ou pas
        if (objet_is_disp[type][caridx] == 0) {
            scene.add(objet[type][caridx]);
        }
        objet_is_disp[type][caridx] = objet_disp_test;

// ...

        // Si le driver est dans les stands, on le grise
        /*if (donnees.d[caridx].pr && l != 0 && caridx != selected_idxjs && plein != 0 && taille == 1) {
            trackmap_context.beginPath(); //On démarre un nouveau tracé.
            trackmap_context.arc(x, y, rayon*1.65, 0, Math.PI * 2); //On trace la courbe délimitant notre forme
            trackmap_context.fillStyle = "#666666";
            trackmap_context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
            trackmap_context.closePath();
        }*/

        // On écrit le numéros du pilote ou son nom en fonction du mode choisi
        if (plein != 0 && taille == 1 && trackmap_disp_mode != 0) {

            // On calcule la bonne couleur pour la font
            // REM : normalement, coul est forcément au format #xxxxxx car taille = 1
            var str = coul.slice(1)
            var r = parseInt("0x" + str.substr(0,2));
            var g = parseInt("0x" + str.substr(2,2));
            var b = parseInt("0x" + str.substr(4,2));
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

            if (trackmap_disp_mode == 1) {
                //trackmap_context.font = "bold " + 1.5 * rayon + "px Arial";
                if (donnees.d[caridx].num != undefined) {
                    //trackmap_context.fillText(donnees.d[caridx].num, x, y + 0.5 * rayon);
                    if (objet["text_mode1"][caridx] != undefined) {  // si l'objet text est défini
                        if (objet_is_disp["text_mode1"][caridx] == 0) {
                            scene.add(objet["text_mode1"][caridx]);
                        }
                        // On oriente le texte dans la même direction que la caméra
                        if (d2_cam != 0) {
                            objet["text_mode1"][caridx].rotation.z = -Math.PI / 2 + Math.atan(-v_cam.y / d2_cam);
                        }
                        if (v_cam.z < 0) {
                            objet["text_mode1"][caridx].rotation.y = Math.atan(v_cam.x / v_cam.z) - Math.PI / 2;
                        } else if (v_cam.z != 0) {
                            objet["text_mode1"][caridx].rotation.y = Math.atan(v_cam.x / v_cam.z) - Math.PI / 2 + Math.PI;
                        }
                        //objet["text_mode1"][caridx].position.set(x - rayon * donnees.d[caridx].num.toString().length / 2 * 0.75 , y + 1.5 * rayon, z);
                        objet["text_mode1"][caridx].position.set(x + v_cam2.x / d_cam2 * rayon * 1.5, y + 0*2 * rayon + v_cam2.y / d_cam2 * rayon * 1.5, z + v_cam2.z / d_cam2 * rayon * 1.5);
                        objet["text_mode1"][caridx].scale.set( 2*rayon * trackmap_carnum_coef, 2*rayon * trackmap_carnum_coef, 2*rayon * trackmap_carnum_coef );
                        objet["text_mode1"][caridx].material = new THREE.MeshLambertMaterial( {color: font_coul, transparent: false, side: THREE.DoubleSide} );
                        objet_is_disp["text_mode1"][caridx] = objet_disp_test;
                    }
                }
            }
            if (trackmap_disp_mode == 2) {
                if (objet["text_mode2"][caridx] != undefined) {  // si l'objet text est défini
                    if (objet_is_disp["text_mode2"][caridx] == 0) {
                        scene.add(objet["text_mode2"][caridx]);
                    }
                    // On oriente le numéros dans la même direction que la caméra
                    if (d2_cam != 0) {
                        objet["text_mode2"][caridx].rotation.z = -Math.PI / 2 + Math.atan(-v_cam.y / d2_cam);
                    }
                    if (v_cam.z < 0) {
                        objet["text_mode2"][caridx].rotation.y = Math.atan(v_cam.x / v_cam.z) - Math.PI / 2;
                    } else if (v_cam.z != 0) {
                        objet["text_mode2"][caridx].rotation.y = Math.atan(v_cam.x / v_cam.z) - Math.PI / 2 + Math.PI;
                    }
                    objet["text_mode2"][caridx].position.set(x + v_cam2.x / d_cam2 * rayon * 1.5, y + 0*2 * rayon + v_cam2.y / d_cam2 * rayon * 1.5, z + v_cam2.z / d_cam2 * rayon * 1.5);
                    objet["text_mode2"][caridx].scale.set( 2*rayon * trackmap_carnum_coef, 2*rayon * trackmap_carnum_coef, 2*rayon * trackmap_carnum_coef );
                    objet["text_mode2"][caridx].material = new THREE.MeshLambertMaterial( {color: font_coul, transparent: false, side: THREE.DoubleSide} );
                    objet_is_disp["text_mode2"][caridx] = objet_disp_test;
                }
            }
            if (trackmap_disp_mode == 3) {
                if (classpos != undefined) {
                    if (c in objet["text_mode3"]) {
                        if (objet["text_mode3"][c][classpos] != undefined) {  // si l'objet text est défini
                            if (objet_is_disp["text_mode3"][c][classpos] == 0) {
                                scene.add(objet["text_mode3"][c][classpos]);
                            }
                            // On oriente le numéros dans la même direction que la caméra
                            if (d2_cam != 0) {
                                objet["text_mode3"][c][classpos].rotation.z = -Math.PI / 2 + Math.atan(-v_cam.y / d2_cam);
                            }
                            if (v_cam.z < 0) {
                                objet["text_mode3"][c][classpos].rotation.y = Math.atan(v_cam.x / v_cam.z) - Math.PI / 2;
                            } else if (v_cam.z != 0) {
                                objet["text_mode3"][c][classpos].rotation.y = Math.atan(v_cam.x / v_cam.z) - Math.PI / 2 + Math.PI;
                            }
                            objet["text_mode3"][c][classpos].position.set(x + v_cam2.x / d_cam2 * rayon * 1.5, y + 0 * 2 * rayon + v_cam2.y / d_cam2 * rayon * 1.5, z + v_cam2.z / d_cam2 * rayon * 1.5);
                            objet["text_mode3"][c][classpos].scale.set(2 * rayon * trackmap_carnum_coef, 2 * rayon * trackmap_carnum_coef, 2 * rayon * trackmap_carnum_coef);
                            objet["text_mode3"][c][classpos].material = new THREE.MeshLambertMaterial( {color: font_coul, transparent: false, side: THREE.DoubleSide} );
                            objet_is_disp["text_mode3"][c][classpos] = objet_disp_test;
                        }
                    }
                }
            }

        }

    }

}


function draw_track(coul, opac, epaisseur, efface) {

    // NOTE : in iRacing altitude is z-axis whereas for webGL, altitude is y-axis


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

    // Chargement du logo et du fond (après avoir vérifié qu'ils existent)
    document.getElementById("trackmap_3d_logo").style.backgroundSize = container_w*logo_pct + "px";

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
                    $("#trackmap_3d_logo").css("background-image", "url('" + imgurl + "')");
                })
                .error(function () {
                    imgurl = "url('./img - default/trackmap_logo.png')";
                    $("#trackmap_3d_logo").css("background-image", "url('" + imgurl + "')");
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
                    $("#trackmap_3d_bg").css("background-image", "url('" + imgurl + "')");
                })
                .error(function () {
                    imgurl = "url('./img - default/trackmap_bg.png')";
                    $("#trackmap_3d_bg").css("background-image", "url('" + imgurl + "')");
                });
            img2 = null;
        } else {
            $("#trackmap_3d_bg").css("background-color", trackmap_bg_color);
            $("#trackmap_3d_bg").css("background-image", "url('')");
        }
    }
    if (trackmap_disp_logo == 0) {
        $("#trackmap_3d_logo").css("background-image", "url('./img - default/trackmap_nologo.png')");
    }


    coul = trackmap_color;

    var w = 0;
    var h = 0;
    cv_w = (container_w - 17*0) * 0.82;
    cv_h = container_h * 0.82;
    //if (efface)
    //    trackmap_fond_context.clearRect(0, 0, container_w, container_h);
    //trackmap_fond_context.globalAlpha = opac;

    if (donnees.k_max > 0) {

        //if (donnees.camera_position_x == "auto") {
        //    angle = optimize_track_angle();
        //} else {
            angle = 0;
        //}
        //console.log(angle);

        // Caractéristiques du circuit à dessiner
        for (k = 0; k < donnees.k_max; k++) {
            track.x[k] = donnees.x[k] * Math.cos(angle) - donnees.y[k] * Math.sin(angle);
            track.y[k] = donnees.x[k] * Math.sin(angle) + donnees.y[k] * Math.cos(angle);
            track.z[k] = donnees.z[k] + 1;
            if (k == 0) {
                track_max_x = track.x[0];
                track_min_x = track.x[0];
                track_max_y = track.y[0];
                track_min_y = track.y[0];
                track_min_z = track.z[0];
            } else {
                if (track.x[k] < track_min_x)
                    track_min_x = track.x[k];
                if (track.y[k] < track_min_y)
                    track_min_y = track.y[k];
                if (track.x[k] > track_max_x)
                    track_max_x = track.x[k];
                if (track.y[k] > track_max_y)
                    track_max_y = track.y[k];
                if (track.z[k] < track_min_z)
                    track_min_z = track.z[k];
            }
        }

        w = track_max_x - track_min_x;
        h = track_max_y - track_min_y;
        if (w == 0 || h == 0) {
            w = 1;
            h = 1
        }
        if (donnees.camera_position_x == "auto") {
            mult = cv_w / w;
            mult_h = cv_h / h;
            if (mult_h < mult) mult = mult_h;
        } else {
            mult = donnees.camera_mult;
        }
        camera_mult = mult;

        track_w = (track_max_x - track_min_x) * mult;
        track_h = (track_max_y - track_min_y) * mult;
        track_maxlength = track_w;
        if (track_h > track_w)
            track_maxlength = track_h;

        if (mult != 0) {
            track_epaisseur_raw = trackmap_thickness_coef * epaisseur * track_maxlength / 60 / mult;  // Epaisseur sans tenir compte du coef multiplicateur
        } else {
            track_epaisseur_raw = 0;
        }
        // On recalcule track_min_z en fonction du banking et de la largeur du circuit
        for (k = 0; k < donnees.k_max; k++) {
            z1 = track.z[k] + Math.sin(donnees.r[k]) * track_epaisseur_raw / 2 * trackmap_banking_factor;
            z2 = track.z[k] - Math.sin(donnees.r[k]) * track_epaisseur_raw / 2 * trackmap_banking_factor;
            if (k == 0) {
                track_min_z = Math.min(z1, z2);
            } else {
                if (z1 < track_min_z)
                    track_min_z = z1;
                if (z2 < track_min_z)
                    track_min_z = z2;
            }
        }


        track_epaisseur = trackmap_thickness_coef * epaisseur * track_maxlength / 60;
        track_mult = mult;

        //rayon = track_maxlength / 75 ;

        if (trackmap_loaded == 0) {  // On initialise la position de la caméra que si le circuit n'a pas déjà été chargé

            // Charger ici la caméra sauvegardée en fonction du circuit
            if (donnees.camera_position_x != "auto") {
                camera.position.x = donnees.camera_position_x;
                camera.position.y = donnees.camera_position_y;
                camera.position.z = donnees.camera_position_z;
                camera.rotation.x = donnees.camera_rotation_x;
                camera.rotation.y = donnees.camera_rotation_y;
                camera.rotation.z = donnees.camera_rotation_z;
            } else {
                camera.position.x = 0;
                camera.position.z = (w + h) * h / w * track_mult * 40 / trackmap_camera_fov;
                camera.position.y = camera.position.z / 2;
                camera.lookAt(new THREE.Vector3(0,0,0));
            }
            camera.fov = trackmap_camera_fov;
            camera.updateProjectionMatrix();
        }

        if (animate_started == 1) {
            cancelAnimationFrame( mon_animation );
        }
        scene.remove(mesh_lat);
        mesh_lat = undefined;  // on vide la mémoire
        scene.remove(mesh_top);
        mesh_top = undefined;  // on vide la mémoire
        scene.remove(plane);
        plane = undefined;  // on vide la mémoire


        // On efface les anciens objets
        for (var i = 0; i < 64; i++) {
            for (var type in objet) {
                if (type != "text_mode3" && type != "sphere_p1" && type != "line_p1" && type != "text_p1" && (i in objet[type]) && type != "text_turns") {
                    scene.remove(objet[type][i]);
                    objet[type][i] = undefined;
                }
            }
        }
        for (var c in objet["text_mode3"]) {
            for (var i = 0; i < 64; i++) {
                scene.remove(objet["text_mode3"][c][i + 1]);
                objet["text_mode3"][c][i + 1] = undefined;
            }
        }
        for (var type in {"sphere_p1": 0, "line_p1": 0, "text_p1": 0}) {
            for (var c in objet[type]) {
                if (objet[type] != undefined) {
                    scene.remove(objet[type][c]);
                    objet[type][c] = undefined;
                }
            }
        }
        for (var turn_id in objet["text_turns"]) {
            if (objet["text_turns"][turn_id] != undefined) {
                scene.remove(objet["text_turns"][turn_id]);
                objet["text_turns"][turn_id] = undefined;
            }
        }


        // On réinitialise le tableau des objets
        var sphere_big = new THREE.SphereGeometry( 1.65, 16, 16 );
        var sphere_car = new THREE.SphereGeometry( 0.5, 16, 16 );
        var sphere_orange = new THREE.SphereGeometry( 1, 16, 16 );
        sphere_orange.translate(0, 0.5, 0);
        var point_noir = new THREE.SphereGeometry( 0.2, 16, 16 );
        point_noir.translate(0, 0.35, 0);
        var anneau = new THREE.RingGeometry( 1, 1.5, 32 );
        var anneau_small = new THREE.RingGeometry( 0.6, 0.7, 32 );
        var material = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
        objet = {
            "anneau" : [],
            "sphere_big": [],
            "anneau_small": [],
            "sphere_car": [],
            "point_noir": [],
            "sphere_orange": [],
            "text_mode1": [],
            "text_mode2": [],
            "text_mode3": {},
            "sphere_p1": {},
            "line_p1": {},
            "text_p1": {},
            "text_turns": {},
        };
        objet_is_disp = {
            "anneau" : [],
            "sphere_big": [],
            "anneau_small": [],
            "sphere_car": [],
            "point_noir": [],
            "sphere_orange": [],
            "text_mode1": [],
            "text_mode2": [],
            "text_mode3": {},
            "sphere_p1": {},
            "line_p1": {},
            "text_p1": {},
        };
        for (i = 0; i < 64; i++) {
            objet["sphere_big"][i] = new THREE.Mesh( sphere_big, material );
            objet["sphere_big"][i].renderOrder = 2;
            objet_is_disp["sphere_big"][i] = 0;
            objet["sphere_car"][i] = new THREE.Mesh( sphere_car, material );
            objet["sphere_car"][i].renderOrder = 1;
            objet_is_disp["sphere_car"][i] = 0;
            objet["point_noir"][i] = new THREE.Mesh( point_noir, material );
            objet_is_disp["point_noir"][i] = 0;
            objet["anneau"][i] = new THREE.Mesh( anneau, material );
            objet["anneau"][i].rotation.x = -Math.PI / 2;
            objet_is_disp["anneau"][i] = 0;
            objet["anneau_small"][i] = new THREE.Mesh( anneau_small, material );
            objet["anneau_small"][i].rotation.x = -Math.PI / 2;
            objet_is_disp["anneau_small"][i] = 0;
            objet["sphere_orange"][i] = new THREE.Mesh( sphere_orange, material );
            objet["sphere_orange"][i].renderOrder = 2;
            objet_is_disp["sphere_orange"][i] = 0;
            objet_is_disp["text_mode1"][i] = 0;
            objet_is_disp["text_mode2"][i] = 0;
        }

        geom_lat = new THREE.Geometry();
        geom_top = new THREE.Geometry();

        track.x[donnees.k_max] = track.x[0];
        track.y[donnees.k_max] = track.y[0];
        track.z[donnees.k_max] = track.z[0];
        donnees.r[donnees.k_max] = donnees.r[0];
        for (k = 0; k <= donnees.k_max; k++) {
            if (k == 0) {
                x0 = ((container_w - track_w) / 2 + (-track.x[donnees.k_max-1] + track_max_x) * track_mult - container_w / 2);
                z0 = ((container_h - track_h) / 2 + (-track.y[donnees.k_max-1] + track_max_y) * track_mult - container_h / 2);
                y0 = (track.z[donnees.k_max-1] - track_min_z) * track_mult * trackmap_elevation_factor;
            } else {
                x0 = ((container_w - track_w) / 2 + (-track.x[k-1] + track_max_x) * track_mult - container_w / 2);
                z0 = ((container_h - track_h) / 2 + (-track.y[k-1] + track_max_y) * track_mult - container_h / 2);
                y0 = (track.z[k-1] - track_min_z) * track_mult * trackmap_elevation_factor;
            }
            x1 = ((container_w - track_w) / 2 + (-track.x[k] + track_max_x) * track_mult - container_w / 2);
            z1 = ((container_h - track_h) / 2 + (-track.y[k] + track_max_y) * track_mult - container_h / 2);
            y1 = (track.z[k] - track_min_z) * track_mult * trackmap_elevation_factor;

            l = Math.sqrt((x1-x0)*(x1-x0) + (z1-z0)*(z1-z0));
            if (l != 0) {
                perp_x = (z1 - z0) / l;
                perp_z = -(x1 - x0) / l;
            }

            xA = x1 + perp_x * track_epaisseur / 2;
            zA = z1 + perp_z * track_epaisseur / 2;
            yA = y1 + Math.sin(donnees.r[k]) * track_epaisseur / 2 * trackmap_banking_factor;
            xB = x1 - perp_x * track_epaisseur / 2;
            zB = z1 - perp_z * track_epaisseur / 2;
            yB = y1 - Math.sin(donnees.r[k]) * track_epaisseur / 2 * trackmap_banking_factor;

            geom_lat.vertices.push(new THREE.Vector3(xA,yA,zA));
            geom_lat.vertices.push(new THREE.Vector3(xB,yB,zB));
            geom_lat.vertices.push(new THREE.Vector3(xA,0,zA));
            geom_lat.vertices.push(new THREE.Vector3(xB,0,zB));

            geom_top.vertices.push(new THREE.Vector3(xA,yA,zA));
            geom_top.vertices.push(new THREE.Vector3(xB,yB,zB));
            geom_top.vertices.push(new THREE.Vector3(xA,0,zA));
            geom_top.vertices.push(new THREE.Vector3(xB,0,zB));

            /*var geometry = new THREE.BoxGeometry( 100, 50, 20 );
            var material = new THREE.MeshLambertMaterial( {color: 0xff0000} );
            var cube = new THREE.Mesh( geometry, material );
            cube.position.x = x1;
            cube.position.y = y1;
            cube.position.z = 50;
            cube.castShadow = true;
            scene.add( cube );*/
        }

        // Côtés du circuit (lat)
        for (k = 1; k < donnees.k_max; k++) {
            if (k == 1) {  // pour résoudre un bug insolvable ??
            	// partie latérale gauche
                geom_lat.faces.push( new THREE.Face3( 0 + 1 * 4, 2 + 1 * 4, 2 + (donnees.k_max - 1) * 4, null, new THREE.Color(trackmap_lateral_color) ) );
                geom_lat.faces.push( new THREE.Face3( 2 + (donnees.k_max - 1) * 4, 0 + (donnees.k_max - 1) * 4, 0 + (1) * 4, null, new THREE.Color(trackmap_lateral_color) ) );
                // partie latérale droite
                geom_lat.faces.push( new THREE.Face3( 1 + 1 * 4, 1 + (donnees.k_max - 1) * 4, 3 + (donnees.k_max - 1) * 4, null, new THREE.Color( trackmap_lateral_color) ) );
                geom_lat.faces.push( new THREE.Face3( 3 + (donnees.k_max - 1) * 4, 3 + 1 * 4, 1 + 1 * 4, null, new THREE.Color( trackmap_lateral_color) ) );
            } else {
            	// partie latérale gauche
                geom_lat.faces.push( new THREE.Face3( 0 + k * 4, 2 + k * 4, 2 + (k - 1) * 4, null, new THREE.Color( trackmap_lateral_color) ) );
                geom_lat.faces.push( new THREE.Face3( 2 + (k - 1) * 4, 0 + (k - 1) * 4, 0 + k * 4, null, new THREE.Color( trackmap_lateral_color) ) );
                // partie latérale droite
                geom_lat.faces.push( new THREE.Face3( 1 + k * 4, 1 + (k - 1) * 4, 3 + (k - 1) * 4, null, new THREE.Color( trackmap_lateral_color) ) );
                geom_lat.faces.push( new THREE.Face3( 3 + (k - 1) * 4, 3 + k * 4, 1 + k * 4, null, new THREE.Color( trackmap_lateral_color) ) );
            }
        }
        geom_lat.computeFaceNormals();
        geom_lat.computeVertexNormals();

        // Circuit en lui-même (top)
        for (k = 1; k < donnees.k_max; k++) {
            if (k == 1) {
                geom_top.faces.push( new THREE.Face3( 0 + 1 * 4, 1 + 1 * 4, 0 + (donnees.k_max - 1) * 4, null, new THREE.Color( coul) ) );
                geom_top.faces.push( new THREE.Face3( 0 + (donnees.k_max - 1) * 4, 1 + 1 * 4, 1 + (donnees.k_max - 1) * 4, null, new THREE.Color( coul) ) );
            } else {
                geom_top.faces.push( new THREE.Face3( 0 + k * 4, 1 + k * 4, 0 + (k - 1) * 4, null, new THREE.Color( coul) ) );
                geom_top.faces.push( new THREE.Face3( 0 + (k - 1) * 4, 1 + k * 4, 1 + (k - 1) * 4, null, new THREE.Color( coul) ) );
            }
        }
        geom_top.computeFaceNormals();
        geom_top.computeVertexNormals();

        material = new THREE.MeshLambertMaterial( { vertexColors: THREE.FaceColors, side: THREE.DoubleSide } );
        mesh_lat = new THREE.Mesh( geom_lat, material );
        mesh_top = new THREE.Mesh( geom_top, material );
        //mesh.castShadow = true;
        scene.add(mesh_lat);
        scene.add(mesh_top);

        // Dessine le sol
        //var geometry = new THREE.PlaneGeometry( container_w, container_h);
        //var material = new THREE.MeshLambertMaterial( {color: 0x448800, side: THREE.DoubleSide} );
        //plane = new THREE.Mesh( geometry, material );
        //plane.receiveShadow = true;
        //scene.add( plane );

        animate();

        draw_fleche();
        draw_north(donnees.north);

        trackmap_loaded = 1;

    }

    // On prépare les objets text à afficher au-dessus des voitures ainsi que le nom des virages
    loader.load('fonts/helvetiker_regular.typeface.json', function (response) {

        // On crée les objets text pour le noms des virages
        if (trackmap_disp_turns == 1) {
            var i = 0;
            for (var turn_id in donnees.turn_num) {

                if (i >= donnees.nb_turns) break; // on sort car sinon on risque de garder les virages en mémoire d'anciens circuits

                if (turn_id in donnees.turn_info) {
                    info = donnees.turn_info[turn_id]
                } else {
                    info = ""
                }
                if (info != "") {
                    var text = donnees.turn_num[turn_id] + " - " + info
                } else {
                    var text = donnees.turn_num[turn_id]
                }
                if (objet["text_turns"][turn_id] == undefined) {
                    textGeoTurns = new THREE.TextGeometry(text, {
                        font: response,
                        size: 1,
                        height: 0,
                        curveSegments: 3,
                        bevelEnabled: false
                    });
                    //textGeoTurns.translate(-0.5 * (i + 1).toString().length / 2 * 0.9, -0.5 * 0.5, 0);  // On replace correctement le centre de l'objet
                    textGeoTurns.translate(1, -0.5, 0);
                    textGeoTurns.lookAt(new THREE.Vector3(0, 1, 0));
                    textGeoTurns.rotateY(Math.PI);
                    //console.log(objet["text_turns"])
                    objet["text_turns"][turn_id] = new THREE.Mesh(textGeoTurns, new THREE.MeshBasicMaterial({
                        color: "#ffffff",
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.5
                    }));
                    objet["text_turns"][turn_id].renderOrder = 2;
                    scene.add(objet["text_turns"][turn_id]);

                    textGeoTurns_shadow = new THREE.TextGeometry(text, {
                        font: response,
                        size: 1,
                        height: 0,
                        curveSegments: 3,
                        bevelEnabled: false
                    });
                    textGeoTurns_shadow.translate(1 + 0.05, -0.5 - 0.05, -0.1);
                    textGeoTurns_shadow.lookAt(new THREE.Vector3(0, 1, 0));
                    textGeoTurns_shadow.rotateY(Math.PI);
                    //console.log(objet["text_turns"])
                    objet["text_turns"][turn_id + 999] = new THREE.Mesh(textGeoTurns_shadow, new THREE.MeshBasicMaterial({
                        color: "#000000",
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.5
                    }));
                    objet["text_turns"][turn_id + 999].renderOrder = 1;
                    scene.add(objet["text_turns"][turn_id + 999]);
                }

                i++;

            }
        }

        var sphere_p1 = new THREE.SphereGeometry( 0.3, 16, 16 );
        sphere_p1.translate(0, 0.5 + 0.3 + 0.2, 0);
        var line_p1 = new THREE.Geometry();
        line_p1.vertices.push(new THREE.Vector3(0, 0.5, 0));
        line_p1.vertices.push(new THREE.Vector3(0, 0.5 + 0.2 + 2 * 0.3, 0));
        for(var i = 0; i < 64; i++) {
            if (donnees.d != undefined) {
                if (i in donnees.d) {
                    var c = donnees.d[i].classid;
                    if (c != undefined) {
                        if (objet_is_disp["text_mode3"][c] == undefined) {
                            objet_is_disp["text_mode3"][c] = [];
                            objet["text_mode3"][c] = [];

                            objet["sphere_p1"][c] = new THREE.Mesh( sphere_p1, material );
                            objet_is_disp["sphere_p1"][c] = 0;
                            objet["line_p1"][c] = new THREE.Line(line_p1, material);
                            objet_is_disp["line_p1"][c] = 0;
                            objet_is_disp["text_p1"][c] = 0;
                        }
                    }
                }
            }
        }
        for (var c in objet_is_disp["text_mode3"]) {
            for (var i = 0; i < 64; i++) {
                if (objet["text_mode3"][c][i + 1] == undefined) {
                    // Mode 3
                    textGeo3 = new THREE.TextGeometry(i + 1, {
                        font: response,
                        size: 0.5,
                        height: 0,
                        curveSegments: 3,
                        bevelEnabled: false
                    });
                    if (objet_is_disp["text_mode3"][c][i + 1] == undefined && (c in objet["text_mode3"])) {
                        textGeo3.translate(-0.5 * (i + 1).toString().length / 2 * 0.9, -0.5 * 0.5, 0);  // On replace correctement le centre de l'objet
                        textGeo3.lookAt(new THREE.Vector3(0, 1, 0));
                        textGeo3.rotateY(Math.PI / 2);
                        objet["text_mode3"][c][i + 1] = new THREE.Mesh(textGeo3, new THREE.MeshBasicMaterial({
                            color: "#000000",
                            side: THREE.DoubleSide
                        }));
                        objet["text_mode3"][c][i + 1].renderOrder = 2;
                        objet_is_disp["text_mode3"][c][i + 1] = 0;
                    }
                }
            }
        }

        for(var i = 0; i < 64; i++) {
            if (donnees.d != undefined) {
                if (i in donnees.d) {

                    // Couleur de la class du pilote
                    str = donnees.d[i].cc;
                    var tmp_num = donnees.d[i].num;
                    if (tmp_num in bg_by_num) {
                        str = "0x" + bg_by_num[tmp_num].slice(1);
                    }
                    if (donnees.d[i].classid in bg_by_classid) {
                        str = "0x" + bg_by_classid[donnees.d[i].classid].slice(1);
                    }

                    if (str == "0xffffff" || str == "0x0") str = "0xbbeeff"; // couleur de base si une seule class
                    if (str != undefined) {
                        if (str != "0xffffff" && str != "0x0") {
                            str = str.slice(2);
                            for (n = str.length; n < 6; n++) {
                                str = "0" + str
                            }
                        }
                    }
                    //trackmap_context.globalAlpha = 0.65;
                    couleur = "#" + str;

                    // Mode 1
                    if (objet["text_mode1"][i] == undefined) {
                        textGeo1 = new THREE.TextGeometry(donnees.d[i].num, {
                            font: response,
                            size: 0.5,
                            height: 0,
                            curveSegments: 3,
                            bevelEnabled: false,
                            /*bevelThickness: 2,
                             bevelSize: 2,
                             bevelSegments: 5*/
                        });

                        if (objet["text_mode1"][i] == undefined) {
                            textGeo1.translate(-0.5 * donnees.d[i].num.toString().length / 2 * 0.75, -0.5 * 0.5, 0);  // On replace correctement le centre de l'objet
                            textGeo1.lookAt(new THREE.Vector3(0, 1, 0));
                            textGeo1.rotateY(Math.PI / 2);
                            //objet["text_mode1"][i] = new THREE.Mesh( textGeo, new THREE.MeshBasicMaterial( {color: couleur, side: THREE.DoubleSide} ) );
                            objet["text_mode1"][i] = new THREE.Mesh(textGeo1, new THREE.MeshBasicMaterial({
                                color: "#000000",
                                side: THREE.DoubleSide
                            }));
                            objet["text_mode1"][i].renderOrder = 2;
                            //scene.add(objet["text_mode1"][i]);
                            objet_is_disp["text_mode1"][i] = 0;
                        }
                    }


                    // Mode 2
                    if (objet["text_mode2"][i] == undefined) {
                        name = donnees.d[i].name;
                        nom_ = name.split(" ");
                        nom = nom_[nom_.length - 1].toUpperCase();
                        name = "";
                        for (var j = 0; j < 3; j++) {
                            if (nom[j] != undefined) {
                                name += nom[j];
                            }
                        }
                        textGeo2 = new THREE.TextGeometry(name, {
                            font: response,
                            size: 0.5,
                            height: 0,
                            curveSegments: 3,
                            bevelEnabled: false
                        });
                        if (objet["text_mode2"][i] == undefined) {
                            textGeo2.translate(-0.5 * name.toString().length / 2 * 0.9, -0.5 * 0.5, 0);  // On replace correctement le centre de l'objet
                            textGeo2.lookAt(new THREE.Vector3(0, 1, 0));
                            textGeo2.rotateY(Math.PI / 2);
                            objet["text_mode2"][i] = new THREE.Mesh(textGeo2, new THREE.MeshBasicMaterial({
                                color: "#000000",
                                side: THREE.DoubleSide
                            }));
                            objet["text_mode2"][i].renderOrder = 2;
                            objet_is_disp["text_mode2"][i] = 0;
                        }
                    }

                    // P1
                    text_p1 = new THREE.TextGeometry("P1", {
                        font: response,
                        size: 0.5 * 0.5,
                        height: 0,
                        curveSegments: 3,
                        bevelEnabled: false
                    });
                    var c = donnees.d[i].classid;
                    if (c != undefined) {
                        if (objet["text_p1"][c] == undefined) {
                            text_p1.translate(-0.5 * 0.5 * 0.75, -0.5 * 0.5 * 0.6, 0);  // On replace correctement le centre de l'objet
                            text_p1.lookAt(new THREE.Vector3(0, 1, 0));
                            text_p1.rotateY(Math.PI / 2);
                            objet["text_p1"][c] = new THREE.Mesh(text_p1, new THREE.MeshBasicMaterial({
                                color: "#000000",
                                side: THREE.DoubleSide
                            }));
                            objet["text_p1"][c].renderOrder = 2;
                            objet_is_disp["text_p1"][c] = 0;
                        }
                    }

                }
            }
        }
    });

}


// Affiche la direction du nord
function draw_north(north) {
    /*
    if (north != 99) {  // si c'est 99 ça veut dire qu'il n'est pas défini
        north = north + angle;
        x0 = container_w - 17 - track_maxlength / 20;
        y0 = track_maxlength / 20;

        dx = 0 * Math.cos(north) - (-1) * Math.sin(north);
        dy = 0 * Math.sin(north) + (-1) * Math.cos(north);

        rayon = track_maxlength / 25 * 1.75;

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

        // On remet l'Ombrage
        trackmap_fond_context.shadowColor = "black";
        trackmap_fond_context.shadowOffsetX = rayon / 6;
        trackmap_fond_context.shadowOffsetY = rayon / 6;
        trackmap_fond_context.shadowBlur = rayon / 2;

    }
    */
}


// Affiche une flèche indiquant le sens du circuit
function draw_fleche() {

    x0 = ((container_w - track_w) / 2 + (-track.x[0] + track_max_x) * track_mult - container_w / 2);
    z0 = ((container_h - track_h) / 2 + (-track.y[0] + track_max_y) * track_mult - container_h / 2);
    y0 = (track.z[0] - track_min_z) * track_mult * trackmap_elevation_factor;
    x1 = ((container_w - track_w) / 2 + (-track.x[1] + track_max_x) * track_mult - container_w / 2);
    z1 = ((container_h - track_h) / 2 + (-track.y[1] + track_max_y) * track_mult - container_h / 2);
    y1 = (track.z[1] - track_min_z) * track_mult * trackmap_elevation_factor;


    l = Math.sqrt((x1-x0)*(x1-x0) + (z1-z0)*(z1-z0));
    if (l != 0) {
        perp_x = (z1 - z0) / l;
        perp_z = -(x1 - x0) / l;
        long_x = (x1 - x0) / l;
        long_z = (z1 - z0) / l;
    } else {
        perp_x = 0;
        perp_z = 0;
        long_x = 0;
        long_z = 0;
    }

    scene.remove(mesh_fleche);
    mesh_fleche = undefined;  // on vide la mémoire

    geom_fleche = new THREE.Geometry();

    // Ligne d'arrivée
    M = [];
    M[0] = [1, -1/10, 1/10];
    M[1] = [1, 1/5, 1/10];
    M[2] = [-1, 1/5, 1/10];
    M[3] = [-1, -1/10, 1/10];
    M[4] = [1, -1/10, 0];
    M[5] = [1, 1/5, 0];
    M[6] = [-1, 1/5, 0];
    M[7] = [-1, -1/10, 0];

    // Flèche
    M[8] = [-1.5 - 0.05, -1/10, 1/10];
    M[9] = [-1.5 - 0.05, 2, 1/10];
    M[10] = [-1 - 0.2, 2, 1/10];
    M[11] = [-1.75, 3, 1/10];
    M[12] = [-2.5 + 0.2, 2, 1/10];
    M[13] = [-2 + 0.05, 2, 1/10];
    M[14] = [-2 + 0.05, -1/10, 1/10];
    M[15] = M[8];
    M[16] = [-1.5 - 0.05, -1/10, 0];
    M[17] = [-1.5 - 0.05, 2, 0];
    M[18] = [-1 - 0.2, 2, 0];
    M[19] = [-1.75, 3, 0];
    M[20] = [-2.5 + 0.2, 2, 0];
    M[21] = [-2 + 0.05, 2, 0];
    M[22] = [-2 + 0.05, -1/10, 0];
    M[23] = M[16];

    A = [];
    for (var i in M) {
        A[i] = [0, 0, 0];
        A[i][0] = x1 + track_epaisseur * (M[i][0] * perp_x + M[i][1] * long_x);
        A[i][2] = z1 + track_epaisseur * (M[i][0] * perp_z + M[i][1] * long_z);
        A[i][1] = y1 + track_epaisseur * M[i][2] + Math.sin(donnees.r[0]) * M[i][0] * track_epaisseur * trackmap_banking_factor;
        geom_fleche.vertices.push(new THREE.Vector3(A[i][0],A[i][1],A[i][2]));
    }

    // Ligne d'arrivée
    if (trackmap_start_finish_line_disp == 1) {
        geom_fleche.faces.push(new THREE.Face3(0, 1, 2, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(2, 3, 0, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(0, 4, 5, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(0, 5, 1, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(2, 6, 7, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(2, 7, 3, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(1, 2, 6, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(1, 6, 5, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(3, 7, 0, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(0, 7, 4, null, new THREE.Color(trackmap_start_finish_color)));
    }

    // Flèche
    if (trackmap_start_finish_arrow_disp == 1) {
        geom_fleche.faces.push(new THREE.Face3(8, 9, 14, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(14, 9, 13, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(11, 12, 10, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(8 + 8, 9 + 8, 14 + 8, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(14 + 8, 9 + 8, 13 + 8, null, new THREE.Color(trackmap_start_finish_color)));
        geom_fleche.faces.push(new THREE.Face3(11 + 8, 12 + 8, 10 + 8, null, new THREE.Color(trackmap_start_finish_color)));
        for (var i = 8; i < 15; i++) {
            geom_fleche.faces.push(new THREE.Face3(i, i + 1, i + 8, null, new THREE.Color(trackmap_start_finish_color)));
            geom_fleche.faces.push(new THREE.Face3(i + 8, i + 1, i + 9, null, new THREE.Color(trackmap_start_finish_color)));
        }
    }

    geom_fleche.computeFaceNormals();
    //geom_fleche.computeVertexNormals();
    material = new THREE.MeshLambertMaterial( { vertexColors: THREE.FaceColors, side: THREE.DoubleSide } );
    mesh_fleche = new THREE.Mesh( geom_fleche, material );

    scene.add( mesh_fleche );

}


function draw_turn(coul, turn_id, ldp, side, info) {

    //rayon = 1 * track_epaisseur / 2;
    rayon = 0.5 * track_maxlength / 60;

    k = Math.floor(donnees.coef_k * ldp);
    d = donnees.coef_k * ldp;

    // REM : le k ne doit être égale ni à k_max, ni à 0 pour éviter un mouvement saccadé sur la ligne
    if (k >= donnees.k_max || k == 0) k = donnees.k_max - 1;
    k2 = k + 1;
    if (k2 >= donnees.k_max || k2 == 0) k2 = 1;
    if (k2 > k) {
        k2_minus_k = k2 - k;
    } else {
        k2_minus_k = k2 - 0 + donnees.coef_k - k;
    }
    if (d >= k) {
        d_minus_k = d - k;
    } else {
        d_minus_k = d - 0 + donnees.coef_k - k;
    }

    if (k in track.x && k in track.y && donnees.k_max > 0 && objet["text_turns"][turn_id] != undefined) {

        x1 = ((container_w - track_w) / 2 + (-track.x[k] + track_max_x) * track_mult - container_w / 2);
        z1 = ((container_h - track_h) / 2 + (-track.y[k] + track_max_y) * track_mult - container_h / 2);
        y1 = (track.z[k] - track_min_z) * track_mult * trackmap_elevation_factor;
        x2 = ((container_w - track_w) / 2 + (-track.x[k2] + track_max_x) * track_mult - container_w / 2);
        z2 = ((container_h - track_h) / 2 + (-track.y[k2] + track_max_y) * track_mult - container_h / 2);
        y2 = (track.z[k2] - track_min_z) * track_mult * trackmap_elevation_factor;

        // On fait une interpolation
        x = x1 + (x2 - x1) * (d_minus_k) / k2_minus_k;
        z = z1 + (z2 - z1) * (d_minus_k) / k2_minus_k;
        y = y1 + (y2 - y1) * (d_minus_k) / k2_minus_k;

        l = Math.sqrt((x2 - x1)*(x2 - x1) + (z2 - z1)*(z2 - z1));

        // on le décale sur le côté 'side' de la piste
        //decale_x = - side * (z2 - z1) / l * track_epaisseur * 1.5;
        //decale_z = side * (x2 - x1) / l * track_epaisseur * 1.5;
        //decale_x = (z2 - z1) / l * track_epaisseur * 0.5;
        //decale_z = - (x2 - x1) / l * track_epaisseur * 0.5;
        decale_x = 0;
        decale_z = 0;
        x += decale_x;
        z += decale_z;

        // pré-calculs utile pour l'affichage des textes
        v_cam2.x = camera.position.x - x;
        v_cam2.y = camera.position.y - y;
        v_cam2.z = camera.position.z - z;
        d_cam2 = Math.sqrt(v_cam2.x * v_cam2.x + v_cam2.y * v_cam2.y + v_cam2.z * v_cam2.z);
        camera.getWorldDirection(v_cam);
        d2_cam = Math.sqrt(v_cam.x * v_cam.x + v_cam.z * v_cam.z);
        d_cam = Math.sqrt(v_cam.x * v_cam.x + v_cam.y * v_cam.y + v_cam.z * v_cam.z);

        // On oriente le texte dans la même direction que la caméra
        if (d2_cam != 0) {
            objet["text_turns"][turn_id].rotation.z = -Math.PI / 2 + Math.atan(-v_cam.y / d2_cam);
        }
        if (v_cam.z < 0) {
            objet["text_turns"][turn_id].rotation.y = Math.atan(v_cam.x / v_cam.z) - Math.PI / 2;
        } else if (v_cam.z != 0) {
            objet["text_turns"][turn_id].rotation.y = Math.atan(v_cam.x / v_cam.z) - Math.PI / 2 + Math.PI;
        }
        //objet["text_turns"][turn].position.set(x + v_cam2.x / d_cam2 * rayon * 1.5, y + 0*2 * rayon + v_cam2.y / d_cam2 * rayon * 1.5, z + v_cam2.z / d_cam2 * rayon * 1.5);
        objet["text_turns"][turn_id].position.set(x, y, z);
        objet["text_turns"][turn_id].scale.set( trackmap_turn_num_coef * 2 * rayon, trackmap_turn_num_coef*2*rayon, trackmap_turn_num_coef*2*rayon );

    }


    /*
    k = Math.floor(donnees.coef_k * ldp);
    d = donnees.coef_k * ldp;
    if (k >= donnees.k_max) k = 0;
    k2 = k + 1;
    if (k2 >= donnees.k_max) k2 = 0;
    x1 = (-track.x[k] + track_max_x) * track_mult;
    y1 = (-track.y[k] + track_max_y) * track_mult;
    x2 = (-track.x[k2] + track_max_x) * track_mult;
    y2 = (-track.y[k2] + track_max_y) * track_mult;

    // On fait une interpolation
    x = (container_w - track_w - 17) / 2 + x1 + (x2 - x1) * (d - k);
    y = (container_h - track_h) / 2 + y1 + (y2 - y1) * (d - k);

    rayon = track_maxlength / 75;

    // On décale le nom du virage à gauche ou à droite
    l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    if (l != 0) {
        decale_x = -(y2 - y1) / l * (rayon + track_epaisseur * 1.25) * side;
        decale_y = (x2 - x1) / l * (rayon + track_epaisseur * 1.25) * side;
        x += decale_x;
        y += decale_y;

        trackmap_context.globalAlpha = 1;

        trackmap_fond_context.fillStyle = coul;
        trackmap_fond_context.strokeStyle = coul;
        trackmap_fond_context.font = "bold " + 2 * rayon + "px Arial";
        trackmap_fond_context.textAlign = "center";
        trackmap_fond_context.fillText(turn, x, y + rayon / 1.5);

        trackmap_fond_context.fillStyle = coul;
        trackmap_fond_context.font = "bold " + 1 * rayon + "px Arial";
        trackmap_fond_context.textAlign = "left";
        trackmap_fond_context.fillText(" " + info, x + (turn.length / 2 + 0.5) * 2 * rayon / 2, y + rayon / 1.52);
    }
    */
}


function optimize_track_angle() {
    var w = 0;
    var h = 0;
    track = {x: [], y: [], z: [], r: []};
    angle_optimized = 0;
    track_mult = 0;

    for (angle = Math.PI / 2 ; angle > -Math.PI/800 ; angle -= Math.PI / 400) {

        // On fait une rotation et on cherche les valeurs min et max
        for (var k = 0; k < donnees.k_max; k++) {
            track.x[k] = donnees.x[k] * Math.cos(angle) - donnees.y[k] * Math.sin(angle);
            track.y[k] = donnees.x[k] * Math.sin(angle) + donnees.y[k] * Math.cos(angle);
            //track.z[k] = donnees.z[k] + 1;
            if (k == 0) {
                track_max_x = track.x[0];
                track_min_x = track.x[0];
                track_max_y = track.y[0];
                track_min_y = track.y[0];
                //track_min_z = track.z[0];
            } else {
                if (track.x[k] < track_min_x)
                    track_min_x = track.x[k];
                if (track.y[k] < track_min_y)
                    track_min_y = track.y[k];
                if (track.x[k] > track_max_x)
                    track_max_x = track.x[k];
                if (track.y[k] > track_max_y)
                    track_max_y = track.y[k];
                //if (track.z[k] < track_min_z)
                //    track_min_z = track.z[k];
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


// Affiche la direction du vent
function draw_winddir(north, winddir) {
    /*
    var w = parseInt($("#trackmap_canvas").css("width"));
    var h = parseInt($("#trackmap_canvas").css("height"));
    //rayon2 = track_maxlength / 75;
    rayon2 = w / 102;

    trackmap_context.globalAlpha = 1;

    if (north != 99) {  // si c'est 99 ça veut dire qu'il n'est pas défini
        winddir = angle + north + winddir + Math.PI;
        //x0 = track_maxlength / 20;
        //y0 = container_h - track_maxlength / 20;
        x0 = w / 30;
        y0 = h - w / 30;

        dx = 0 * Math.cos(winddir) - (-1) * Math.sin(winddir);
        dy = 0 * Math.sin(winddir) + (-1) * Math.cos(winddir);

        //rayon = track_maxlength / 25 * 1.75;
        rayon = w / 30 * 1.5;

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

    trackmap_context.fillStyle = "#0077ff";
    trackmap_context.font = "bold " + 1.7 * rayon2 + "px Arial";
    trackmap_context.textAlign = "left";

    weather = reformat_skies(donnees.skies);
    if (donnees.u == 1) {  // systeme metric
        weather += " " + donnees.airtemp.toFixed(0) + String.fromCharCode(176) + "C";
        weather += ", track " + donnees.tracktemp.toFixed(0) + String.fromCharCode(176) + "C";
        if (north == 99)  // si c'est 99 ça veut dire qu'il n'est pas défini
            weather += ", Winds " + (donnees.winddir / Math.PI * 180).toFixed(0) + String.fromCharCode(176) + " " + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + (donnees.windspeed * 3.6).toFixed(1) + " km/h";
        else
            weather += ", Winds " + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + (donnees.windspeed * 3.6).toFixed(1) + " km/h";
    } else {
        weather += " " + (donnees.airtemp*1.8+32).toFixed(0) + String.fromCharCode(176) + "F";
        weather += ", track " + (donnees.tracktemp*1.8+32).toFixed(0) + String.fromCharCode(176) + "F";
        if (north == 99)  // si c'est 99 ça veut dire qu'il n'est pas défini
            weather += ", Winds " + (donnees.winddir / Math.PI * 180).toFixed(0) + String.fromCharCode(176) + " " + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + (donnees.windspeed * 3.6 / 1.609344).toFixed(1) + " MPH";
        else
            weather += ", Winds " + reformat_winddir(donnees.winddir / Math.PI * 180) + " " + (donnees.windspeed * 3.6 / 1.609344).toFixed(1) + " MPH";
    }
    weather += ", RH " + (donnees.humidity*100).toFixed(0) + "%";
    weather += ", Fog " + (donnees.fog*100).toFixed(0) + "%";

    //trackmap_context.fillText(weather, track_maxlength / 10, container_h - 1.5* rayon2);
    if (north == 99)  // si c'est 99 ça veut dire qu'il n'est pas défini
        trackmap_context.fillText(weather, w / 75, h - 1.5* rayon2);
    else
        trackmap_context.fillText(weather, w / 13, h - 1.5* rayon2);

    // On enlève l'ombrage
    trackmap_context.shadowColor = "black";
    trackmap_context.shadowOffsetX = 0;
    trackmap_context.shadowOffsetY = 0;
    trackmap_context.shadowBlur = 0;
    trackmap_context.inset = 1;
    */
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
