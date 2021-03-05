
function aff_rpm() {

    rpm = donnees.rpm;
    rpm_angle = start_angle + (end_angle - start_angle) * rpm / max_rpm;

    rpm_context.clearRect(0, 0, w, h);

    // Affichage du volant symbolisé par un rectangle
    if (disp_wheel) {
        rpm_context.lineWidth   = rayon_compteur*2.05/10;
        rpm_context.strokeStyle = "orange";
        rpm_context.beginPath();
        if (donnees.w_a != undefined) {
            wheel_angle = donnees.w_a;
        }
        rpm_context.arc(640 * w / compteur_ref_w, 640 * w / compteur_ref_w, rayon_compteur * 11 / 10, Math.PI*1.5 - wheel_angle - 0.05, Math.PI*1.5 - wheel_angle + 0.05);
        rpm_context.stroke();
    }

    degrade1 = rpm_context.createRadialGradient(640* w / compteur_ref_w,640* w / compteur_ref_w,rayon_compteur*9/10,640* w / compteur_ref_w,640* w / compteur_ref_w,rayon_compteur) ;
    degrade1.addColorStop(0,"rgba(0,0,255,0)");
    //degrade1.addColorStop(0.5,"rgba(0,0,255,0.5)");
    degrade1.addColorStop(1,"rgba(0,0,255,1)");
    //rpm_context.fillStyle = degrade1;
    rpm_context.strokeStyle = degrade1;
    rpm_context.lineWidth   = rayon_compteur*1/10;

    if (donnees.gear_ != undefined) {
        if(donnees.gr >= 1) {
            red_rpm = donnees.gear_[donnees.gr];
        } else {
            red_rpm = donnees.gear_[1];
        }
    }

    if (donnees.rpm_redline != undefined) {
        max_rpm = donnees.rpm_redline;  // important de le mettre à jour tout le temps car sinon on peut avoir des valeurs absurdes quand le red_rpm est à 99999
    }
    if (red_rpm >= max_rpm && red_rpm < 20000) {  // on s'assure que le red_rpm n'était pas absurde
        max_rpm = red_rpm / 0.80;
    }
    red_angle = start_angle + (end_angle - start_angle) * red_rpm / max_rpm;

    rpm_context.beginPath();
    if (rpm_angle < red_angle) {
        rpm_context.arc(640 * w / compteur_ref_w, 640 * w / compteur_ref_w, rayon_compteur * 9.5 / 10, start_angle, rpm_angle);
    } else {
        rpm_context.arc(640 * w / compteur_ref_w, 640 * w / compteur_ref_w, rayon_compteur * 9.5 / 10, start_angle, red_angle);
    }
    //rpm_context.fill();
    rpm_context.stroke();

    if (rpm_angle >= red_angle) {
        degrade2 = rpm_context.createRadialGradient(640 * w / compteur_ref_w, 640 * w / compteur_ref_w, rayon_compteur * 9 / 10, 640 * w / compteur_ref_w, 640 * w / compteur_ref_w, rayon_compteur, rayon_compteur);
        degrade2.addColorStop(0, "rgba(255,0,0,0)");
        //degrade2.addColorStop(0.5,"rgba(0,0,255,0.5)");
        degrade2.addColorStop(1, "rgba(255,0,0,1)");
        rpm_context.strokeStyle = degrade2;
        rpm_context.beginPath();
        rpm_context.arc(640 * w / compteur_ref_w, 640 * w / compteur_ref_w, rayon_compteur * 9.5 / 10, red_angle, rpm_angle);
        //rpm_context.fill();
        rpm_context.stroke();
    }

    //rpm_context.globalCompositeOperation = "destination-out";
    //rpm_context.beginPath();
    //rpm_context.strokeStyle = "#ffffff";
    //rpm_context.lineWidth   = rayon_compteur + 1;
    //rpm_context.arc(640* w / compteur_ref_w, 640* w / compteur_ref_w, rayon_compteur/2, 10 * Math.PI / 180, (40 + 1) * Math.PI / 180);
    //rpm_context.stroke();

}

function aff_gears() {
    if (donnees.gr > max_gear) {
        max_gear = donnees.gr;
        transit_speed = 0;
    }
    for (i = -1; i <= max_gear; i++) {
        if (i == donnees.gr) {
            set_transition("gear" + gear_text[i + 1], 640 - gear_width/2 + gear_width * (i - donnees.gr), gear_top, gear_width, gear_height, 0.28 * gear_width/256, transit_speed, 1, "#ffffff", 1);
        } else {
            coef_width = 0.9;
            if (Math.abs(donnees.gr - i) > 2) {
                opac = 0;
                scale = 0.2;
                col = "#ffffff";
                coef_width = 0.6;
            }
            if (Math.abs(donnees.gr - i) == 2) {
                opac = 0.25;
                scale = 0.4;
                col = "#ffffff";
                coef_width = 0.7;
            }
            if (Math.abs(donnees.gr - i) == 1) {
                opac = 0.5;
                scale = 0.7;
                col = "#ffffff"
            }

            if (i < donnees.gr) {
                set_transition("gear" + gear_text[i + 1], 640 - gear_width/2 + gear_width * coef_width * (i - donnees.gr) - gear_width * (1 - coef_width) / 2, gear_top, gear_width, gear_height, 0.28 * gear_width/256, transit_speed, scale, col, opac);
            } else {
                set_transition("gear" + gear_text[i + 1], 640 - gear_width/2 + gear_width * coef_width * (i - donnees.gr) + gear_width * (1 - coef_width) / 2, gear_top, gear_width, gear_height, 0.28 * gear_width/256, transit_speed, scale, col, opac);
            }
        }
    }
    transit_speed = 250;
}

function set_transition(id, left, top, larg, haut, fontsize, dur, scale, col, opac) {
    $("#" + id).transition({opacity: opac, color: col, x: Math.floor(left * w / compteur_ref_w + x_offset), y: Math.floor(w * top / compteur_ref_w + y_offset), scale: scale}, dur, 'linear');

    if (larg >= 0)
        document.getElementById(id).style.width = wh(w * left / compteur_ref_w + x_offset, w * larg / compteur_ref_w) + "px";
    if (haut >= 0)
        document.getElementById(id).style.lineHeight = wh(w * top / compteur_ref_w + y_offset, w * haut / compteur_ref_w) + "px";
    if (fontsize > 0)
        document.getElementById(id).style.fontSize = w * fontsize + "px";
}

function update_compteur() {

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

    if (donnees.typ == 31 || donnees.typ == 1) {
    }

    if (donnees.typ <= 32) {

        if (donnees.u != undefined) {
            speedfactor = donnees.u == 1 ? 1 : 1 / 1.609344;
            if (donnees.carname == "lotus79" || donnees.carname == "lotus49") {
                fuelfactor = donnees.u == 1 ? 1 : 1 / 4.54609;
            } else {
                fuelfactor = donnees.u == 1 ? 1 : 1 / 3.78541178;
            }
        }

        // Si on a changé de voiture, on réinitialise les données d'optimisations de rapport de boite
        // Et on affiche ou efface certains blocs en fonction de la voiture
        // Et on redessine le compte-tour au cas où on a changé de voiture
        if (donnees.carname != carname && donnees.carname != undefined) {
            //console.log("carname", donnees.carname)
            carname = donnees.carname;
            max_gear = 4;
            gear_ = {};
            maxspeed_ = {};
            last_gr = null;
            for (i in donnees.gear_) {
                gear_[i] = donnees.gear_[i]
            }
            if (carname in car_with_drs) {
                document.getElementById("drs").style.display = "inline-block";
            } else {
                document.getElementById("drs").style.display = "none";
            }
            if (carname in car_with_ers_drs) {
                document.getElementById("ers").style.display = "inline-block";
            } else {
                document.getElementById("ers").style.display = "none";
            }
            responsive_dim();
        }
    }


    if (donnees.typ <= 33) {

        if (donnees.rpm != undefined)
            //document.getElementById("rpm").innerHTML = donnees.rpm.toFixed(0);


        if (donnees.gr != undefined) {
            if (last_gr != null) {
                if (donnees.gr != last_gr) {
                    if (donnees.gr == 0) {
                        if (Date.now()/1000 - last_N_time > 0.2) {  // si ça fait plus de 2 dixièmes qu'on est en neutre, on affiche la vitesse
                            aff_gears();
                            last_gr = 0;
                        }
                    } else {
                        aff_gears();
                    }
                }
            } else {
                aff_gears();
                last_gr = donnees.gr;
                last_N_time = Date.now()/1000;
            }
            if (donnees.gr != 0) {
                last_gr = donnees.gr;
                last_N_time = Date.now()/1000;
            }
        }

        if (donnees.s != undefined) {
            document.getElementById("speed").innerHTML = (speedfactor * donnees.s * 3.6).toFixed(0);
            if (donnees.u) {
                $("#speed_unit").html("km/h")
            } else {
                $("#speed_unit").html("m/h")
            }
        }

        if (donnees.b != undefined) {
            document.getElementById("b").style.right = (100 - donnees.b) + "%";
            if (donnees.b == 0) {
                document.getElementById("b_text").style.color = "#000000"
            } else if (donnees.b == 100) {
                document.getElementById("b_text").style.color = "#c80000"
            } else {
                document.getElementById("b_text").style.color = "#ffffff"
            }

        }
        if (donnees.t != undefined) {
            document.getElementById("t").style.right = (100 - donnees.t) + "%";
            if (donnees.t == 0) {
                document.getElementById("t_text").style.color = "#000000"
            } else if (donnees.t == 100) {
                document.getElementById("t_text").style.color = "#00a800"
            } else {
                document.getElementById("t_text").style.color = "#ffffff"
            }
        }

        if (carname in car_with_drs) {
            if (donnees.drs != undefined) {
                if (donnees.drs == 3) {
                    document.getElementById("drs").style.backgroundColor = "rgba(0,255,0,1)";
                    document.getElementById("drs").style.color = "#000000";
                    document.getElementById("drs").style.opacity = 1;
                } else {
                    document.getElementById("drs").style.backgroundColor = "rgba(0,0,0,1)";
                    document.getElementById("drs").style.color = "#666666";
                    document.getElementById("drs").style.opacity = 0.75;
                }
            }
        }
        if (carname in car_with_ers_drs) {
            if (donnees.ers != undefined)
                //document.getElementById("ers").innerHTML = donnees.ers.toFixed(1);
                set("ers", 1320, 300 + 680 - 680*donnees.ers/100, 110, 680 *donnees.ers/100, 0.045);
        }
        aff_rpm();
    }
}
