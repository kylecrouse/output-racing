function set(id, left, top, larg, haut, fontsize) {
    document.getElementById(id).style.left = Math.floor(w * left / compteur_ref_w) + x_offset + "px";
    if (larg >= 0)
        document.getElementById(id).style.width = wh(w * left / compteur_ref_w, w * larg / compteur_ref_w) + "px";
    document.getElementById(id).style.top = Math.floor(w * top / compteur_ref_w) + y_offset + "px";
    if (haut >= 0)
        document.getElementById(id).style.lineHeight = wh(w * top / compteur_ref_w, w * haut / compteur_ref_w) + "px";
    if (fontsize > 0)
        document.getElementById(id).style.fontSize = w * fontsize + "px";
}

function wh(start, long) {
    return Math.floor(start + long) - Math.floor(start)
}

function RGBA(e, alpha) { //e = jQuery element, alpha = background-opacity
    if (alpha < 1/500) {  // Pour éviter de bugguer avec firefox
        alpha = 1/500;
    }
    //b = e.css('backgroundColor');
    b = $(e).css('background-color');
    if (b != 'transparent') {
        $(e).css('backgroundColor', 'rgba' + b.slice(b.indexOf('('), ( (b.match(/,/g).length == 2) ? -1 : b.lastIndexOf(',') - b.length)) + ', ' + alpha + ')');
    }
}

function responsive_dim() {

    if (force_inner_w) {
        window_innerWidth = inner_width;
    } else {
        window_innerWidth = window.innerWidth;
    }
    if (force_inner_h) {
        window_innerHeight = inner_height;
    } else {
        window_innerHeight = window.innerHeight;
    }

    w = window_innerWidth;
    h = window_innerHeight;

    if ((carname in car_with_ers_drs) || (carname in car_with_drs)) {
        compteur_ref_w = 1280 + 170;
    } else {
        compteur_ref_w = 1280;
    }
    compteur_ref_h = 1280;
    //ratio = 16/9;
    //ratio = 1;
    ratio = compteur_ref_w / compteur_ref_h;

    if (w/h > ratio) {
        w = Math.floor(h * ratio);
        x_offset = (window_innerWidth - w)/2;  // pour centrer le dashboard
        y_offset = 0;
    } else {
        h = Math.floor(w / ratio);
        x_offset = 0;
        y_offset = (window_innerHeight - h )/2;  // pour centrer le dashboard
    }

    $("#page").css("width", window_innerWidth + "px");
    $("#page").css("height", window_innerHeight + "px");

    //set("gear", 0, 192, 1280, 320, 0.28);
    gear_top = 660;
    gear_width = 250;
    gear_height = gear_width*5/4;
    transit_speed = 0;

    last_gr = null;

    set("speed", 0, 220, 1280, 320, 0.20);
    set("speed_unit", 0, 420, 1280, 320, 0.08);
    if (donnees.u) {
        $("#speed_unit").html("km/h")
    } else {
        $("#speed_unit").html("m/h")
    }

    set("t_cont", 640-225, 1000, 450, 80, 0.032);
    set("b_cont", 640-225, 1000 + 85, 450, 80, 0.032);
    set("t_text", 640-225, 1000 + 2, 450, 80, 0.052);
    set("b_text", 640-225, 1000 + 85 + 2, 450, 80, 0.052);
    $("#t").css("border-radius", 15 * w / compteur_ref_w + "px");
    $("#b").css("border-radius", 15 * w / compteur_ref_w + "px");
    $("#t_cont").css("border-radius", 15 * w / compteur_ref_w + "px");
    $("#b_cont").css("border-radius", 15 * w / compteur_ref_w + "px");

    set("ers", 1320, 300, 110, 680, 0.045);
    $("#ers").css("border-radius", 30 * w / compteur_ref_w + "px");
    set("ers_bg", 1320, 300, 110, 680, 0.045);
    $("#ers_bg").css("border-radius", 30 * w / compteur_ref_w + "px");
    set("drs", 1160, 640 + 380, 270, 120, 0.075);
    $("#drs").css("border-radius", 30 * w / compteur_ref_w + "px");

    set("rpm", 0, 0, 256, 64, 0.055);

    // Redimensionnement du compteur
    if ((carname in car_with_ers_drs) || (carname in car_with_drs)) {
        rpm_w = 1280 + 170;
    }else {
        rpm_w = 1280;
    }
    rpm_h = 1280;
    rayon_compteur = 533 * w / compteur_ref_w;
    rpm_context.canvas.width = Math.max(1, w * rpm_w / compteur_ref_w);
    rpm_context.canvas.height = Math.max(1, w * rpm_h / compteur_ref_w);
    document.getElementById("rpm_canvas").style.left = Math.floor(w * 0 / compteur_ref_w) + x_offset + "px";
    document.getElementById("rpm_canvas").style.top = Math.floor(w * 0 / compteur_ref_w) + y_offset + "px";

    // Dessine le fond du compte-tours
    start_angle = - 230 * Math.PI / 180;
    end_angle = 50 * Math.PI / 180;
    max_rpm = donnees.rpm_redline;
    red_rpm = donnees.rpm_first;
    // On vérifie que ce n'est pas trop bas par rapport au max
    if (red_rpm/max_rpm < 0.8) {
        red_rpm = 0.8*max_rpm;
    }
    red_angle = start_angle + (end_angle - start_angle) * red_rpm / max_rpm;

    rpm_bg_context.clearRect(0, 0, w, h);
    rpm_bg_context.canvas.width = Math.max(1, w * rpm_w / compteur_ref_w);
    rpm_bg_context.canvas.height = Math.max(1, w * rpm_h / compteur_ref_w);
    document.getElementById("rpm_bg_canvas").style.left = Math.floor(w * 0 / compteur_ref_w) + x_offset + "px";
    document.getElementById("rpm_bg_canvas").style.top = Math.floor(w * 0 / compteur_ref_w) + y_offset + "px";

    rpm_bg2_context.clearRect(0, 0, w, h);
    rpm_bg2_context.canvas.width = Math.max(1, w * rpm_w / compteur_ref_w);
    rpm_bg2_context.canvas.height = Math.max(1, w * rpm_h / compteur_ref_w);
    document.getElementById("rpm_bg2_canvas").style.left = Math.floor(w * 0 / compteur_ref_w) + x_offset + "px";
    document.getElementById("rpm_bg2_canvas").style.top = Math.floor(w * 0 / compteur_ref_w) + y_offset + "px";

    if ((carname in car_with_ers_drs) || (carname in car_with_drs)) {
        // Rectangles de fond pour l'ERS
        x = Math.floor(640 * w / compteur_ref_w);
        y = Math.floor((640 - 360) * w / compteur_ref_w);
        r = x + wh(x, (640 + 170) * w / compteur_ref_w);
        b = y + wh(y, (720 + 0) * w / compteur_ref_w);
        radius = 40 * w / compteur_ref_w;
        rpm_bg2_context.fillStyle = "rgba(0,0,0,0.6)";
        rpm_bg2_context.beginPath();
        rpm_bg2_context.moveTo(x + radius, y);
        rpm_bg2_context.lineTo(r - radius, y);
        rpm_bg2_context.quadraticCurveTo(r, y, r, y + radius);
        rpm_bg2_context.lineTo(r, b - radius);
        rpm_bg2_context.quadraticCurveTo(r, b, r - radius, b);
        rpm_bg2_context.lineTo(x + radius, b);
        rpm_bg2_context.quadraticCurveTo(x, b, x, b - radius);
        rpm_bg2_context.lineTo(x, y + radius);
        rpm_bg2_context.quadraticCurveTo(x, y, x + radius, y);
        rpm_bg2_context.fill();
        // Rectangle de fond pour le DRS
        x = Math.floor(640 * w / compteur_ref_w);
        y = b;
        r = x + (640 + 170) * w / compteur_ref_w;
        b = y + (0 + 160) * w / compteur_ref_w;
        radius = 40 * w / compteur_ref_w;
        rpm_bg2_context.fillStyle = "rgba(25,25,25,0.5)";
        rpm_bg2_context.beginPath();
        rpm_bg2_context.moveTo(x + radius, y);
        rpm_bg2_context.lineTo(r - radius, y);
        rpm_bg2_context.quadraticCurveTo(r, y, r, y + radius);
        rpm_bg2_context.lineTo(r, b - radius);
        rpm_bg2_context.quadraticCurveTo(r, b, r - radius, b);
        rpm_bg2_context.lineTo(x + radius, b);
        rpm_bg2_context.quadraticCurveTo(x, b, x, b - radius);
        rpm_bg2_context.lineTo(x, y + radius);
        rpm_bg2_context.quadraticCurveTo(x, y, x + radius, y);
        rpm_bg2_context.fill();

        // On creuse le fond pour afficher la barre de l'ERS
        x = Math.floor(1320 * w / compteur_ref_w);
        y = Math.floor(300 * w / compteur_ref_w);
        r = x + wh(x, 110 * w / compteur_ref_w);
        b = y + wh(y, 680 * w / compteur_ref_w);
        radius = 40 * w / compteur_ref_w;
        rpm_bg2_context.globalCompositeOperation = "destination-out";
        rpm_bg2_context.fillStyle = "rgba(255,255,255,1)";
        rpm_bg2_context.beginPath();
        rpm_bg2_context.moveTo(x + radius, y);
        rpm_bg2_context.lineTo(r - radius, y);
        rpm_bg2_context.quadraticCurveTo(r, y, r, y + radius);
        rpm_bg2_context.lineTo(r, b - radius);
        rpm_bg2_context.quadraticCurveTo(r, b, r - radius, b);
        rpm_bg2_context.lineTo(x + radius, b);
        rpm_bg2_context.quadraticCurveTo(x, b, x, b - radius);
        rpm_bg2_context.lineTo(x, y + radius);
        rpm_bg2_context.quadraticCurveTo(x, y, x + radius, y);
        rpm_bg2_context.fill();
    }

    // On efface l'emplacement du compteur
    rpm_bg2_context.globalCompositeOperation = "destination-out";
    rpm_bg2_context.fillStyle = "rgba(0,0,0,1)";
    rpm_bg2_context.beginPath();
    rpm_bg2_context.arc(640 * w / compteur_ref_w, 640 * w / compteur_ref_w, rayon_compteur * 1.2, 0 , 2 * Math.PI);
    rpm_bg2_context.fill();
    rpm_bg2_context.globalCompositeOperation = "source-over";

    rpm_bg2_context.fillStyle = "rgba(0,0,0," + compteur_bg_transparency + ")";
    rpm_bg2_context.beginPath();
    rpm_bg2_context.arc(640 * w / compteur_ref_w, 640 * w / compteur_ref_w, rayon_compteur * 1.2, 0 , 2 * Math.PI);
    rpm_bg2_context.fill();

    rpm_bg_context.strokeStyle = "#ffffff";
    rpm_bg_context.lineWidth = rayon_compteur / 60;
    rpm_bg_context.beginPath();
    rpm_bg_context.arc(640 * w / compteur_ref_w, 640 * w / compteur_ref_w, rayon_compteur, start_angle - rayon_compteur/60/rayon_compteur/2 , end_angle + rayon_compteur/60/rayon_compteur/2);
    rpm_bg_context.stroke();

    rpm_bg_context.fillStyle = "rgba(255,255,255,0.5)";

    if (max_rpm > 14000) {
        inc_rpm = 2000;
    } else {
        inc_rpm = 1000;
    }
    for (r = 0; r <= max_rpm + inc_rpm; r += inc_rpm) {
        if (r > max_rpm)
            rpm = max_rpm;
        else
            rpm = r;
        rpm_angle = start_angle + (end_angle - start_angle) * rpm / max_rpm;
        rpm_bg_context.beginPath();
        x = 640 * w / compteur_ref_w + rayon_compteur * Math.cos(rpm_angle);
        y = 640 * w / compteur_ref_w + rayon_compteur * Math.sin(rpm_angle);
        rpm_bg_context.moveTo(x, y);
        x2 = 640 * w / compteur_ref_w + 0.95 * rayon_compteur * Math.cos(rpm_angle);
        y2 = 640 * w / compteur_ref_w + 0.95 * rayon_compteur * Math.sin(rpm_angle);
        rpm_bg_context.lineTo(x2, y2);
        rpm_bg_context.stroke();

        if (r <= max_rpm) {
            xt = 640 * w / compteur_ref_w + 1.1 * rayon_compteur * Math.cos(rpm_angle);
            yt = 640 * w / compteur_ref_w + 1.1 * rayon_compteur * Math.sin(rpm_angle);
            rpm_bg_context.font = "bold " + rayon_compteur / 7 + "px Arial";
            rpm_bg_context.textAlign = "center";
            rpm_bg_context.textBaseline = "middle";
            rpm_bg_context.fillText(Math.floor(rpm / 1000), xt, yt);
        }

    }

    if (carname in car_with_drs) {
        document.getElementById("drs").style.display = "block";
    } else {
        document.getElementById("drs").style.display = "none";
    }
    if (carname in car_with_ers_drs) {
        document.getElementById("ers").style.display = "block";
        document.getElementById("ers_bg").style.display = "block";
    } else {
        document.getElementById("ers").style.display = "none";
        document.getElementById("ers_bg").style.display = "none";
    }

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

}
