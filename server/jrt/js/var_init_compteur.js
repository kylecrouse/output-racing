function getParamValue(param,url)
{
	var u = url == undefined ? document.location.href : url;
	var reg = new RegExp('(\\?|&|^)'+param+'=(.*?)(&|$)');
	matches = u.match(reg);
	if (matches) {
		return matches[2] != undefined ? decodeURIComponent(matches[2]).replace(/\+/g,' ') : '';
	} else {
		return false;
	}
}

function init_var() {

    // On détecte si la page est lancée en local ou depuis l'extérieur (on activera alors la version broadcast)
    h = window.location.hostname
    if (h) {
        b = /[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+/.test(h)    // Fait un test pour savoir si le hostname est une adresse ip
    } else {
        b = true
    }


    if (internetIP == "not needed") {
        broadcast = 0;
    } else {
        if (h != "localhost" & (h == internetIP || !b)) {
            broadcast = 1
        } else {
            broadcast = 0
        }

        // On peut forcer le broadcast
        if (window.location.href.split('?').length > 1 && window.location.href.split('?')[1] == "b") {
            broadcast = 1
        }
    }

    donnees = {};
    donnees_new = {};
    sessionnum = 0;
    sessionid = 0;
    type_session = "";
    name_session = "";
    speedfactor = 1;
    fuelfactor = 1;
    selected_idx = -1;
    selected_idxold = -1;
    selected_idxjs = -1;
    selected_idxjsold = 1;
    lastlap = [];
    bestlap = [];
    besttag = 0;
    lasttag = 0;
    bestbestidx = 0;
    bestlastidx = 0;
    coef_w = 1;

    tmp_w = getParamValue('inner_width');
    tmp_h = getParamValue('inner_height');
    force_inner_w = false;
    force_inner_h = false;
    if (tmp_w != "") {
        inner_width = tmp_w;
        force_inner_w = true;
    }
    if (tmp_h != "") {
        inner_height = tmp_h;
        force_inner_h = true;
    }
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

    wait = 0;
    disp_param = 0;
    if (disp_kg_livre == 1) {
        coef_fuel = 0.75;
    } else {
        coef_fuel = 1;  // unités d'essence en litre par defaut (0.75 pour les kg)
    }
    calculations_mode = 0; // 0 -> calculs en tenant compte du dernier tour, 1 -> on tient compte de la moyenne des 5 derniers tours
    refuel_mode = 0;
    teamracing_received = 0;

    /*
    document.getElementById("app_name").innerHTML = "Joel Real Timing PRO v" + version;
    // S'il y a une nouvelle version on le signale
    if (lastversion != version)
        document.getElementById("app_name").innerHTML += " <span style='font-weight:bold;color:#ff0000;'>NEW version available !</span>";
    */

    bg = "#999999"; // couleur du drapeau par défaut à l'ouverture
    sof_displayed = 0;
    nb_drivers = 0;

    donnees_defined = 0;

    update_tick_old = 0;

    trackname = "init";

    coef_ = [];
    coef_old_ = [];
    for (i = 0; i<64; i++) {
        coef_[i] = {}
        coef_old_[i] = {}
        coef_[i]["a"] = 0;
        coef_[i]["b"] = 0;
        coef_[i]["c"] = 0;
        coef_[i]["d"] = 0;
        coef_old_[i]["a"] = 0;
        coef_old_[i]["b"] = 0;
        coef_old_[i]["c"] = 0;
        coef_old_[i]["d"] = 0;
    }

    try_expired = 0;

    window_name = document.title;

    /*if (tires_buttons == 0) {
        document.getElementById("tires").style.display = "none";
    } else {
        document.getElementById("tires").style.display = "block";
    }*/

    display_rpmshift = 0;

    gear_ = {};
    shift_old = 0;
    rpm_old = 0;
    gear_old = 0;
    speed_old = 0;
    shift2 = 0;

    maxspeed_ = {};

    carname = "";

    last_gr = null;
    last_N_time = 0;
    gear_text = ["R", "N", "1", "2", "3", "4", "5", "6", "7", "8"];
    max_gear = 4;

    // Création du canvas pour le fond du compte_tour
    rpm_canvas = document.querySelector('#rpm_canvas');
    rpm_context = rpm_canvas.getContext('2d');
    rpm_bg_canvas = document.querySelector('#rpm_bg_canvas');
    rpm_bg_context = rpm_bg_canvas.getContext('2d');
    rpm_bg2_canvas = document.querySelector('#rpm_bg2_canvas');
    rpm_bg2_context = rpm_bg2_canvas.getContext('2d');

    wheel_angle = 0;

}

pro_expired = -1;
pro_expired_old = -1;