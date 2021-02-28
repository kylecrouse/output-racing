function lic_class_color() {
    for (i in donnees.d) {

        // On change la couleur de fond des numéros , de l'irating et de la couleur de la position dans la class
        var str = donnees.d[i].cc;
        var tmp_num = donnees.d[i].num;
        if (tmp_num in bg_by_num) {
            str = "0x" + bg_by_num[tmp_num].slice(1);
        }
        if (donnees.d[i].classid in bg_by_classid) {
            str = "0x" + bg_by_classid[donnees.d[i].classid].slice(1);
        }

        //if (str == "0xffffff" || str == "0x0") str = "0xaaaaaa";
        if (str != undefined) {
            //if (str != "0xffffff" && str != "0x0") {
                str = str.slice(2);
                for (n = str.length; n < 6; n++) {
                    str = "0" + str
                }
                //document.getElementById('num' + i).style.backgroundColor = "#" + str;
                set_style_bg('num' + i, "#" + str);
                // On calcule la bonne couleur pour la font
                var r = parseInt("0x" + str.substr(0,2));
                var g = parseInt("0x" + str.substr(2,2));
                var b = parseInt("0x" + str.substr(4,2));
                var moy = (r + g + b) / 3;
                var font_coul = "000000";
                if (moy < 150) {
                    font_coul = "ffffff";
                }
                if (tmp_num in col_by_num) {  // si on a définit des couleurs spécifiques pour un numéros
                    font_coul = col_by_num[tmp_num].slice(1);  // REM : on enlève le #
                }
                if (donnees.d[i].classid in col_by_classid) {
                    font_coul = col_by_classid[donnees.d[i].classid].slice(1);
                }

                //document.getElementById('num' + i).style.color = "#" + font_coul;
                set_style_color('num' + i, "#" + font_coul);
                //document.getElementById('cpos' + i).style.color = "#" + str;
                set_style_color('cpos' + i, "#" + str);
                //document.getElementById('scpos' + i).style.color = "#" + str;
                set_style_color('scpos' + i, "#" + str);
            /*} else {
                // ***.
                //console(i, "cc = ",  str);

                //document.getElementById('num' + i).style.backgroundColor = "rgba(0,0,0,0)";
                set_style_bg('num' + i, "rgba(0,0,0,0)");
                if (donnees.d[i].fr == 0) { // Si les positions ne sont pas gelées
                    //document.getElementById('num' + i).style.color = "#9e9e9e";
                    set_style_color('num' + i, "#9e9e9e");
                } else {
                    //document.getElementById('num' + i).style.color = "#555555";
                    set_style_color('num' + i, "#555555");
                }
            }*/
        } else {
            //console.log(i, "cc undefined !!!");

            //document.getElementById('num' + i).style.backgroundColor = "rgba(0,0,255,0)";
            set_style_bg('num' + i, "rgba(0,0,255,0)");
            //document.getElementById('num' + i).style.color = "#ff0000";
            set_style_color('num' + i, "#ff0000");
        }

        if (ir_mode == 2 || ir_mode == 4) {
            str = donnees.d[i].lic;
            if (str != undefined) {
                str = str.slice(2);
                for (var n = str.length; n < 6; n++) {
                    str = "0" + str
                }
                //document.getElementById('ir' + i).style.backgroundColor = "#" + str;
                set_style_bg('ir' + i, "#" + str);
                if (str == "fc8a27" | str == "feec04") {
                    //document.getElementById('ir' + i).style.color = "#" + "000000";
                    set_style_color('ir' + i, "#" + "000000");
                } else {
                    //document.getElementById('ir' + i).style.color = "#" + "ffffff";
                    set_style_color('ir' + i, "#" + "ffffff");
                }
            }
        } else {
            //document.getElementById('ir' + i).style.backgroundColor = "rgba(0,0,0,0)";
            set_style_bg('ir' + i, "rgba(0,0,0,0)");
        }

        if (lic_mode < 3) {
            str = donnees.d[i].lic;
            if (str != undefined) {
                str = str.slice(2);
                for (var n = str.length; n < 6; n++) {
                    str = "0" + str
                }
                //document.getElementById('lic' + i).style.backgroundColor = "#" + str;
                set_style_bg('lic' + i, "#" + str);
                if (str == "fc8a27" | str == "feec04") {
                    //document.getElementById('lic' + i).style.color = "#" + "000000";
                    set_style_color('lic' + i, "#" + "000000");
                } else {
                    //document.getElementById('lic' + i).style.color = "#" + "ffffff";
                    set_style_color('lic' + i, "#" + "ffffff");
                }
            }
        } else {
            //document.getElementById('lic' + i).style.backgroundColor = "rgba(0,0,0,0)";
            set_style_bg('lic' + i, "rgba(0,0,0,0)");
        }

    }
}

/* LICENCE COLOR CODES :

Rookie (Red): #fc0706
Class D (Orange): #fc8a27
Class C (Yellow): #feec04
Class B (Green): #00c702
Class A (Blue): #0153db
Pro (Black): #000000

*/