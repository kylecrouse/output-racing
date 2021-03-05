function deltas_and_gapcolor() {

    w = window_innerWidth;
    h = window_innerHeight;

    // Si le ref_w et ref_h sont définis pour le display, il remplace le réglage général
    disp_sel = "_" + advanced["display_selected"];
    ref_w = advanced["ref_w" + disp_sel];
    ref_h = advanced["ref_h" + disp_sel];
    if (ref_w != undefined) dashboard_ref_w = ref_w;
    if (ref_h != undefined) dashboard_ref_h = ref_h;

    ratio = dashboard_ref_w / dashboard_ref_h;

    if (w/h > ratio) {
        w = Math.floor(h * ratio);
    } else {
        h = Math.floor(w / ratio);
    }

    //w_delta = window_innerWidth * 160 / 1280;
    //delta_h = window_innerWidth * 64 / 1280;
    w_delta = [];
    delta_h = [];
    w_delta[1] = w * advanced["w_" + "delta_pre" + disp_sel] / dashboard_ref_w;
    delta_h[1] = w * advanced["h_" + "delta_pre" + disp_sel] / dashboard_ref_w;
    w_delta[2] = w * advanced["w_" + "delta_post" + disp_sel] / dashboard_ref_w;
    delta_h[2] = w * advanced["h_" + "delta_post" + disp_sel] / dashboard_ref_w;
    coef_w = 1 / 1280;

    lapdistpctraw_s = donnees.me_dp - donnees.me_lc;

    if (donnees.pro_v == 1 || donnees.try_v == 1) {  // On affiche le delta que pour les utilisateurs possédant une licence pro
        boucle_delta(1);  // pre
        boucle_delta(2);  // post
    }

}

function boucle_delta(i) {
    // i = 1 --> pre
    // i = 2 --> post

    if (i == 1) {
        lapdistpctraw_i = donnees["pre_dp" + _f3] - donnees["pre_lc" + _f3];
        donnees_i_posf3 = donnees["pre_posf3" + _f3];
    } else {
        lapdistpctraw_i = donnees["post_dp" + _f3] - donnees["post_lc" + _f3];
        donnees_i_posf3 = donnees["post_posf3" + _f3];
    }

    if (donnees_i_posf3 > donnees.me_posf3) {
        deltax[i] = (Math.floor(lapdistpctraw_i * w_delta[i])) % w_delta[i]
    } else {
        deltax[i] = (Math.floor(lapdistpctraw_s * w_delta[i])) % w_delta[i]
    }

    barrex[i] = (Math.floor(lapdistpctraw_i * w_delta[i])) % (w_delta[i]) + 1;

    //{ Barre de position des pilotes
    if (barrex[i] != barrexold[i]) {
        //if (i == selected_idxjs && selected_driver_mode != 0) {
        //    contextB[i].fillStyle = 'rgba(0,0,0,1)'
        //} else {
            contextB[i].fillStyle = 'rgba(255,255,255,1)';
        //}
        if (barrex[i] > barrexold[i])
            contextB[i].clearRect(barrexold[i]-10, 0, barrex[i] - barrexold[i]+10+1, delta_h[i]);
        else
            contextB[i].clearRect(barrexold[i], 0, 10, delta_h[i]);
        contextB[i].fillRect(barrex[i], 0, 1, delta_h[i]);
        barrexold[i] = barrex[i];
    } else {
        contextB[i].fillStyle = 'rgba(255,255,255,1)';
        contextB[i].fillRect(barrex[i], 0, 1, delta_h[i]);
    }

    if (deltax[i] != deltaxold[i]) {     // on ralentit l'actualisation du delta
        for (var j = 1; j < 64; j++) {
            rel2old[j][i] = rel2old[j - 1][i];
        }
        rel2old[0][i] = rel2[i];

        //rel2[i] = donnees.d[i].rc;
        if (i == 1) {
            rel2[i] = donnees["pre_rcf3" + _f3];
        }  else {
            rel2[i] = donnees["post_rcf3" + _f3];
        }

        if (rel2[i] * rel2old[0][i] < 0 && Math.abs(rel2[i]) > 1) { // Si on a changé de signe c'est que ds posf3 est passé devant ou derrière donc on réinit. le delta
            context[i].clearRect(0, 0, w_delta[i], delta_h[i]);
            init_delta[1] = 1;
            init_delta[2] = 1
        }

        if (init_delta[i] | (deltax[i] <= w_delta[i] / 2 && rel2startok[i] != 1)) {
            init_delta[i] = 0;
            rel2start[i] = rel2[i];
            rel2startok[i] = 1
        }
        if (deltax[i] > w_delta[i] / 2) {
            rel2startok[i] = 0
        }
        if (rel2start[i] < 999999) {
            coul = Math.floor(32 - (rel2[i] - rel2start[i]) * 16);
            if (coul > 64) {
                coul = 64
            }
            if (coul < 0) {
                coul = 0
            }
            y = (rel2[i] - rel2start[i]) * delta_h[i] / 2;

            if (i == 1) {
                //document.getElementById('pre_rel').style.color = couleurs2[coul];
                set_style_color('pre_rel', couleurs2[coul]);
            } else {
                //document.getElementById('post_rel').style.color = couleurs2[coul];
                set_style_color('post_rel', couleurs2[coul]);
            }

            if (deltax[i] > deltaxold[i]) {
                context[i].clearRect(deltaxold[i] + 1, 0, deltax[i] - deltaxold[i], delta_h[i]);
                context[i].fillStyle = couleurs2[coul];
                if (y > 0) {
                    context[i].fillRect(deltaxold[i] + 1, delta_h[i] / 2 - y, deltax[i] - deltaxold[i], y);
                } else {
                    context[i].fillRect(deltaxold[i] + 1, delta_h[i] / 2, deltax[i] - deltaxold[i], -y);
                }
            }
            if (deltax[i] < deltaxold[i] - w_delta[i] / 2) { // Si on recommence un autre tour
                context[i].clearRect(deltaxold[i], 0, w_delta[i] - deltaxold[i], delta_h[i]);
                context[i].fillStyle = "rgba(100,100,100,0.5)";
                context[i].fillRect(deltax[i] + 1, 0, w_delta[i] - deltax[i] - 1, delta_h[i]);
                context[i].fillStyle = couleurs2[coul];
                if (y > 0) {
                    context[i].fillRect(0, delta_h[i] / 2 - y, deltax[i] + 1, y);
                } else {
                    context[i].fillRect(0, delta_h[i] / 2, deltax[i] + 1, -y);
                }
                deltaxold[i] = -100; // pour être sûr d'effacer le début du delta au changement de tour
            } else {
                deltaxold[i] = deltax[i];
            }
        }

        // Pour éviter un affichage erronné du delta au départ
        if (rel2start[i] == 0) {
            init_delta[i] = 1
        }

    }


}