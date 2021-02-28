function animations() {
    bestbest = 9999;
    bestlast = 9999;
    bestbestidxold = bestbestidx;
    bestlastidxold = bestlastidx;

    //transparence_lignes = 0.5;
    if (donnees.d != undefined) {
        for (i in donnees.d) {
            //for (i=1;i<5 && donnees.d != undefined && i in donnees.d ;i++) { // DEBUG

            if (f3_box == 1) {
                document.getElementById('p' + i).style.transitionProperty = "none";
                clt_[i] = donnees.d[i].posf3;
            } else {
                clt_[i] = clt[i];
                if (animation) {
                    document.getElementById('p' + i).style.transitionProperty = "top";
                } else {
                    document.getElementById('p' + i).style.transitionProperty = "none";
                }
            }

            // Background Color of the lines
            if (Date.now() - click_status.start > focus_replay_delay && click_status.caridx == i) {  // si click long sur le pilote on affiche la ligne en rouge
                //document.getElementById('p' + i).style.backgroundColor = '#ff0000';
                set_style_bg('p' + i, '#ff0000');
            } else {
                if (i == selected_idxjs && selected_driver_mode != 0 && fond_blanc != 3) {
                    //document.getElementById('p' + i).style.backgroundColor = '#FFFFFF';
                    set_style_bg('p' + i, '#FFFFFF');
                    //document.getElementById('p' + i).style.color = '#000000';
                    set_style_color('p' + i, '#000000');
                } else {
                    if (donnees.d[i].fr == 0) { // Si les positions ne sont pas gelées
                        //document.getElementById('p' + i).style.color = '#ffffff';
                        set_style_color('p' + i, '#ffffff');
                        tmp_bg = clt_[i] % 2 == 1 ? 'rgba(51,51,51,' + 0.5 * transparence_lignes + ')' : 'rgba(34,34,34,' + 0.5 * transparence_lignes + ')';
                        //document.getElementById('p' + i).style.backgroundColor = tmp_bg;
                        set_style_bg('p' + i, tmp_bg);
                    } else {
                        //document.getElementById('p' + i).style.color = '#000000';
                        set_style_color('p' + i, '#000000');
                        tmp_bg = clt_[i] % 2 == 1 ? 'rgba(210,210,210,' + 1 * transparence_lignes + ')' : 'rgba(200,200,200,' + 1 * transparence_lignes + ')';
                        //document.getElementById('p' + i).style.backgroundColor = tmp_bg;
                        set_style_bg('p' + i, tmp_bg);
                    }
                }
            }

            // Animation en couleur lors des changements de position
            //if (donnees.d[i].dp > 0) {

            if (animation) {

                if (!document.getElementById('opt_colorize_drivers_' + i).checked) {
                    // Gestion des position et des transitions pour l'animation
                    if (clt[i] < clt_old[i]) {   // si on a gagné des places
                        document.getElementById('pB' + i).style.transitionDuration = "0s";
                        document.getElementById('pB' + i).style.transitionDelay = "0s";
                        //document.getElementById('p' + i).style.transitionDelay = "0.5s";
                        //document.getElementById('pB' + i).style.backgroundColor = 'rgba(0,180,0,0.5)';
                        set_style_bg('pB' + i, 'rgba(0,180,0,0.5)');
                    }
                    if (clt[i] > clt_old[i]) {   // si on a perdu des places
                        document.getElementById('pB' + i).style.transitionDuration = "0s";
                        document.getElementById('pB' + i).style.transitionDelay = "0s";
                        //document.getElementById('p' + i).style.transitionDelay = "0.5s";
                        //document.getElementById('pB' + i).style.backgroundColor = 'rgba(180,0,0,0.5)';
                        set_style_bg('pB' + i, 'rgba(180,0,0,0.5)');
                    }
                    if (clt[i] == clt_old[i]) {
                        //document.getElementById('p' + i).style.transitionDelay = "0s";
                        document.getElementById('pB' + i).style.transitionDuration = "0.5s";
                        document.getElementById('pB' + i).style.transitionDelay = "2s";
                        //document.getElementById('pB' + i).style.backgroundColor = 'rgba(0,0,0,0)';
                        set_style_bg('pB' + i, 'rgba(0,0,0,0)');
                    }
                }
            }
            //}

            clt_old[i] = clt[i];

            // Les animations ne commencent qu'après le franchissement de la ligne de départ
            //if (donnees.d[i].dp > 1) {

            if (animation) {
                // Animation des chronos
                last = donnees.d[i].l;
                best = donnees.d[i].b;
                if (best < bestbest & best > 9 & donnees.d[i].p != 1) {
                    bestbest = best;
                    bestbestidx = i;
                }
                if (last < bestlast & last > 9 & donnees.d[i].p != 1) {
                    bestlast = last;
                    bestlastidx = i;
                }

                if (last != lastlap[i]) {   // si on a gagné des places
                    document.getElementById('last' + i).style.transitionDuration = "0s";
                    document.getElementById('last' + i).style.transitionDelay = "0s";
                    //document.getElementById('last' + i).style.backgroundColor = 'rgba(200,200,200,0.5)';
                    set_style_bg('last' + i, 'rgba(200,200,200,0.5)');
                    if (last == best & lasttag == 0) {
                        //document.getElementById('last' + i).style.backgroundColor = 'rgba(0,255,0,0.5)';
                        set_style_bg('last' + i, 'rgba(0,255,0,0.5)');
                    }
                }
                if (last == lastlap[i]) {
                    document.getElementById('last' + i).style.transitionDuration = "3s";
                    document.getElementById('last' + i).style.transitionDelay = "2s";
                    //document.getElementById('last' + i).style.backgroundColor = 'rgba(0,0,0,0)';
                    set_style_bg('last' + i, 'rgba(0,0,0,0)');
                }
                if (best != bestlap[i]) {   // si on a gagné des places
                    document.getElementById('best' + i).style.transitionDuration = "0s";
                    document.getElementById('best' + i).style.transitionDelay = "0s";
                    //document.getElementById('best' + i).style.backgroundColor = 'rgba(200,200,200,0.5)';
                    set_style_bg('best' + i, 'rgba(200,200,200,0.5)');
                    if (last == best & besttag == 0) {
                        //document.getElementById('best' + i).style.backgroundColor = 'rgba(0,255,0,0.5)';
                        set_style_bg('best' + i, 'rgba(0,255,0,0.5)');
                    }
                }
                if (best == bestlap[i]) {
                    document.getElementById('best' + i).style.transitionDuration = "3s";
                    document.getElementById('best' + i).style.transitionDelay = "2s";
                    //document.getElementById('best' + i).style.backgroundColor = 'rgba(0,0,0,0)';
                    set_style_bg('best' + i, 'rgba(0,0,0,0)');
                }
                lastlap[i] = donnees.d[i].l
                bestlap[i] = donnees.d[i].b
            }

            //}

            // Gestion des couleurs des noms ... en fonction de la couleur du fond
            if ((i == selected_idxjs && selected_driver_mode != 0 && fond_blanc != 3) || (donnees.d[i].fr == 1 && transparence_lignes >= 0.2)) {
                //document.getElementById('p' + i).style.color = '#000000';
                set_style_color('p' + i, '#000000');
                //document.getElementById('name' + i).style.color = '#000000';
                //document.getElementById('ir' + i).style.color = '#000000';
                set_style_color('ir' + i, '#000000');
                //document.getElementById('speed' + i).style.color = '#000000';
                //document.getElementById('apex_speed' + i).style.color = '#005555';
                set_style_color('apex_speed' + i, '#005555');
                //document.getElementById('max_speed' + i).style.color = '#330077';
                set_style_color('max_speed' + i, '#330077');
                if (!(Date.now() - click_status.start > focus_replay_delay && click_status.caridx == i)) {  // on vérifie qu'il n'y a pas eu un click long sur le pilote
                    if (i == selected_idxjs && selected_driver_mode != 0 && fond_blanc != 3) {
                        //document.getElementById('p' + i).style.backgroundColor = '#FFFFFF';
                        set_style_bg('p' + i, '#FFFFFF');
                    }
                }
                //document.getElementById('last' + i).style.color = '#000000';
                set_style_color('last' + i, '#000000');
                //document.getElementById('best' + i).style.color = '#000000';
                set_style_color('best' + i, '#000000');
                //document.getElementById('lc' + i).style.color = '#000000';
                set_style_color('lc' + i, '#000000');
                //document.getElementById('stint' + i).style.backgroundColor = '#FFFF00';
                set_style_bg('stint' + i, '#FFFF00');
                //document.getElementById('stint' + i).style.color = '#000000';
                set_style_color('stint' + i, '#000000');
            } else {
                //document.getElementById('p' + i).style.color = '#FFFFFF';
                set_style_color('p' + i, '#FFFFFF');
                //document.getElementById('name' + i).style.color = '#ffffff';
                //document.getElementById('ir' + i).style.color = '#ffffff';
                set_style_color('ir' + i, '#FFFFFF');
                //document.getElementById('speed' + i).style.color = '#ffffff';
                //document.getElementById('apex_speed' + i).style.color = '#aaeedd';
                set_style_color('apex_speed' + i, '#aaeedd');
                //document.getElementById('max_speed' + i).style.color = '#ccaaee';
                set_style_color('max_speed' + i, '#ccaaee');
                //document.getElementById('last' + i).style.color = '#ffffff';
                set_style_color('last' + i, '#ffffff');
                //document.getElementById('best' + i).style.color = '#ffffff';
                set_style_color('best' + i, '#ffffff');
                //document.getElementById('lc' + i).style.color = '#ffffff';
                set_style_color('lc' + i, '#ffffff');
                //document.getElementById("stint" + i).style.backgroundColor = 'rgba(0,0,0,0)';
                set_style_bg('stint' + i, 'rgba(0,0,0,0)');
                //document.getElementById('stint' + i).style.color = '#FFFF00';
                set_style_color('stint' + i, '#FFFF00');
            }


            // Gestion des indications de Pit et les temps de pit
            //if (donnees.d[i].p == 1 | donnees.d[i].s<1 | donnees.d[i].ts == -1) {
            //if (donnees.d[i].p == 1 | donnees.d[i].s<1) {
            if (donnees.d[i].dp == -4 && mouse_over_idx != i) { // Si le pilote n'est pas encore sur la grille
                //document.getElementById('pM' + i).style.backgroundColor = 'rgba(0,0,0,0.8)';
                set_style_bg('pM' + i, 'rgba(0,0,0,0.8)');
                document.getElementById('pM' + i).style.zIndex = "6";
            } else {
                if (mouse_over_idx != i && (donnees.d[i].fr == 0) && (donnees.d[i].ts == -1 || donnees.d[i].s < 1)) { // Display name grey when driver is deconnected temporary or not or when He is stop anywhere
                    //document.getElementById('pM' + i).style.backgroundColor = 'rgba(0,0,0,'+ 0.5 * transparence_lignes + ')';
                    set_style_bg('pM' + i, 'rgba(0,0,0,' + 0.5 * transparence_lignes + ')');
                    document.getElementById('pM' + i).style.zIndex = "6";
                } else {
                    //document.getElementById('pM' + i).style.backgroundColor = 'rgba(0,0,0,0)';
                    set_style_bg('pM' + i, 'rgba(0,0,0,0)');
                    document.getElementById('pM' + i).style.zIndex = "-1";
                }
            }
            if (donnees.d[i].pr == 1) {
                //document.getElementById('pitroadtime'+i).style.color = '#000000';
                set_style_color('pitroadtime' + i, '#000000');
                //document.getElementById('name'+i).style.color = '#ff9900';
                set_style_color('name' + i, '#ff9900');
                //document.getElementById('pitroadtime'+i).style.backgroundColor = '#ff9900';
                set_style_bg('pitroadtime' + i, '#ff9900');
                //document.getElementById('last'+i).innerHTML = "PIT"
                set_inner_html('last' + i, "PIT");
                //document.getElementById('last'+i).style.color = "#ff9900";
                set_style_color('last' + i, "#ff9900");
            } else {

                tmp_col = '#9e9e9e';
                tmp_bg = 'rgba(0,0,0,0)';

                if (donnees.d[selected_idxjs] != undefined) {
                    if (selected_driver_mode != 0 && fond_blanc != 3 && donnees.d[selected_idxjs].rt > 0 && donnees.d[selected_idxjs].pr != 1) {
                        if (donnees.d[i].rt > donnees.d[selected_idxjs].rt + 5) {
                            tmp_col = '#000000';
                            tmp_bg = '#00ff00';
                        }
                        if (donnees.d[i].rt < donnees.d[selected_idxjs].rt - 5) {
                            tmp_col = '#ffffff';
                            tmp_bg = '#ff0000';
                        }
                    }
                }

                //document.getElementById('pitroadtime' + i).style.color = tmp_col;
                set_style_color('pitroadtime' + i, tmp_col);
                //document.getElementById('pitroadtime' + i).style.backgroundColor = tmp_bg;
                set_style_bg('pitroadtime' + i, tmp_bg);

                if ((i == selected_idxjs && selected_driver_mode != 0 && fond_blanc != 3) || (donnees.d[i].fr == 1)) {
                    if ((i == selected_idxjs && selected_driver_mode != 0 && fond_blanc != 3) || (transparence_lignes >= 0.2)) {  // on affiche les noms en noir que si le fond n'est pas trop transparent
                        //document.getElementById('name' + i).style.color = '#000000';
                        set_style_color('name' + i, '#000000');
                        //document.getElementById('last' + i).style.color = "#000000"
                        set_style_color('last' + i, '#000000');
                    } else {
                        //document.getElementById('name' + i).style.color = '#ffffff';
                        set_style_color('name' + i, '#ffffff');
                        //document.getElementById('last' + i).style.color = "#ffffff";
                        set_style_color('last' + i, '#ffffff');
                    }
                } else {

                    // Gestion des couleurs des noms en fonction de si les pilotes ont 1 tour de retard ou d'avance
                    if (f3_box == 0) {
                        cl = clt[i];
                        cl_sel = clt[selected_idxjs];
                    } else {
                        cl = donnees.d[i].posf3;
                        if (donnees.d[selected_idxjs] != undefined) {
                            cl_sel = donnees.d[selected_idxjs].posf3;
                        }
                    }
                    dp = donnees.d[i].dp;
                    if (donnees.d[selected_idxjs] != undefined) {
                        dp_sel = donnees.d[selected_idxjs].dp;
                        if (dp != undefined && dp_sel != undefined) {
                            if (cl > cl_sel) { // si le pilote est derrière
                                if (dp_sel > dp + 1) { // le pilote a au moins un tour de retard (bleu)
                                    //document.getElementById('name' + i).style.color = '#0099FF';
                                    set_style_color('name' + i, '#0099FF');
                                } else if (dp > dp_sel) {  // le pilote a au moins un tour d'avance (rouge)
                                    //document.getElementById('name' + i).style.color = '#FF4444';
                                    set_style_color('name' + i, '#FF4444');
                                } else {  // on est dans le même tour
                                    //document.getElementById('name' + i).style.color = '#FFFFFF';
                                    set_style_color('name' + i, '#FFFFFF');
                                }
                            } else { // si le pilote est devant
                                if (dp_sel > dp) {  // le pilote a au moins un tour de retard (bleu)
                                    //document.getElementById('name' + i).style.color = '#0099FF';
                                    set_style_color('name' + i, '#0099FF');
                                } else if (dp > dp_sel + 1) {  // le pilote a au moins un tour d'avance (rouge)
                                    //document.getElementById('name' + i).style.color = '#FF4444';
                                    set_style_color('name' + i, '#FF4444');
                                } else {  // on est dans le même tour
                                    //document.getElementById('name' + i).style.color = '#FFFFFF';
                                    set_style_color('name' + i, '#FFFFFF');
                                }
                            }
                        }
                    }
                    //document.getElementById('name' + i).style.color = '#ffffff';

                    //document.getElementById('last' + i).style.color = "#ffffff";
                    set_style_color('last' + i, '#FFFFFF');
                }
            }
            if (donnees.d[i].ps == 1) {
                if (donnees.d[i].tow == 0 || donnees.d[i].tow == undefined) {
                    //document.getElementById('pitstalltime' + i).style.color = '#ffffff';
                    set_style_color('pitstalltime' + i, '#FFFFFF');
                    //document.getElementById('pitstalltime' + i).style.backgroundColor = '#ff9900';
                    set_style_bg('pitstalltime' + i, '#ff9900');
                } else {
                    //document.getElementById('pitstalltime' + i).style.color = '#ffff00';
                    set_style_color('pitstalltime' + i, '#ffff00');
                    //document.getElementById('pitstalltime' + i).style.backgroundColor = '#aa00aa';
                    set_style_bg('pitstalltime' + i, '#aa00aa');
                }
            } else {
                //document.getElementById('pitstalltime'+i).style.color = '#9e9e9e';
                set_style_color('pitstalltime' + i, '#9e9e9e');
                //document.getElementById('pitstalltime'+i).style.backgroundColor = 'rgba(0,0,0,0)';
                set_style_bg('pitstalltime' + i, 'rgba(0,0,0,0)');
            }

            if (donnees.d[i].p2p_status != undefined) {
                if (donnees.d[i].p2p_status == 1) {
                    //document.getElementById('p2p'+i).style.color = 'white';
                    set_style_color('p2p' + i, 'white');
                    //document.getElementById('p2p'+i).style.backgroundColor = '#bb77ff';
                    set_style_bg('p2p' + i, '#bb77ff');
                } else {
                    //document.getElementById('p2p'+i).style.color = 'inherit';
                    set_style_color('p2p' + i, 'inherit');
                    //document.getElementById('p2p'+i).style.backgroundColor = 'rgba(0,0,0,0)';
                    set_style_bg('p2p' + i, 'rgba(0,0,0,0)');
                }
            }


            //}
            // Colorize Drivers
            /*if (document.getElementById('opt_colorize_drivers_' + i)) {
             if (document.getElementById('opt_colorize_drivers_' + i).checked) {
             document.getElementById('pB' + i).style.transitionDuration = "0s";
             document.getElementById('pB' + i).style.transitionDelay = "0s";
             document.getElementById('pB' + i).style.backgroundColor = document.getElementById('colorize_drivers_col_' + i).value;
             //RGBA(document.getElementById('pB' + i), 0.8);
             //e = document.getElementById('pB' + i)
             //b = $(e).css('background-color');
             //$(e).css('backgroundColor', 'rgba' + b.slice(b.indexOf('('), ( (b.match(/,/g).length == 2) ? -1 : b.lastIndexOf(',') - b.length)) + ', ' + 0.8 + ')');
             } else {
             document.getElementById('pB' + i).style.transitionDuration = "0s";
             document.getElementById('pB' + i).style.transitionDelay = "0s";
             document.getElementById('pB' + i).style.backgroundColor = 'rgba(0,0,0,0)';
             }
             }*/
        }
    }

    besttag = 0;
    lasttag = 0;
    if (bestbestidxold!=bestbestidx) {    // On change de best donc on remet les bonnes couleurs pour les autres
        if (bestbestidxold>0) {
            //document.getElementById('best'+bestbestidxold).style.color = "#FFFFFF";
            set_style_color('best'+bestbestidxold, "#FFFFFF");
        }
        if (bestbestidx>0) {
            if (animation) {
                document.getElementById('best' + bestbestidx).style.transitionDuration = "0s";
                document.getElementById('best' + bestbestidx).style.transitionDelay = "0s";
            }
            //document.getElementById('best'+bestbestidx).style.backgroundColor = 'rgba(255,102,255,0.5)';
            set_style_bg('best'+bestbestidx, 'rgba(255,102,255,0.5)');
            besttag = 1;
        }
    }
    if (bestbestidx>0) {
        //document.getElementById('best'+bestbestidx).style.color = "#FF66FF";
        set_style_color('best'+bestbestidx, "#FF66FF");
    }
    if (bestlastidxold!=bestlastidx) {    // On change de best donc on remet les bonnes couleurs pour les autres
        if (bestlastidxold>0) {
            //document.getElementById('last'+bestlastidxold).style.color = "#FFFFFF";
            set_style_color('last'+bestlastidxold, "#FFFFFF");
        }
        if (bestlastidx>0) {
            if (animation) {
                document.getElementById('last' + bestlastidx).style.transitionDuration = "0s";
                document.getElementById('last' + bestlastidx).style.transitionDelay = "0s";
            }
            //document.getElementById('last'+bestlastidx).style.backgroundColor = 'rgba(0,217,255,0.5)';
            set_style_bg('last'+bestlastidx, 'rgba(0,217,255,0.5)');
            lasttag = 1;
        }
    }
    if (bestlastidx>0) {
        //document.getElementById('last'+bestlastidx).style.color = "#00d9FF";
        set_style_color('last'+bestlastidx, "#00d9FF");
    }

}
