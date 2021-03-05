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
    /*h = window.location.hostname
    if (h) {
        b = /[0-9]+[.][0-9]+[.][0-9]+[.][0-9]+/.test(h)    // Fait un test pour savoir si le hostname est une adresse ip
    } else {
        b = true
    }

    if (internetIP == "not needed") {
        broadcast = 0;
    } else {
        if (h != "localhost" & (h == internetIP | !b)) {
            broadcast = 1
        } else {
            broadcast = 0
        }

        // On peut forcer le broadcast
        if (window.location.href.split('?').length > 1 && window.location.href.split('?')[1] == "b") {
            broadcast = 1
        }
    }*/

    donnees = {};
    donnees_new = {};
    sessionnum = 0;
    sessionid = 0;
    type_session = "";
    name_session = "";
    fuelfactor = 1;
    speedfactor = 1;
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



    // Création des canvas pour les delta graphs
    canvas_pre = document.querySelector('#canvas_pre');
    context_pre = canvas_pre.getContext('2d');
    canvas_post = document.querySelector('#canvas_post');
    context_post = canvas_post.getContext('2d');
    context = [];
    context[1] = context_pre;
    context[2] = context_post;

    canvasB_pre = document.querySelector('#canvasB_pre');
    contextB_pre = canvasB_pre.getContext('2d');
    canvasB_post = document.querySelector('#canvasB_post');
    contextB_post = canvasB_post.getContext('2d');
    contextB = [];
    contextB[1] = contextB_pre;
    contextB[2] = contextB_post;

    deltax = [];
    deltaxold = [];
    rel2 = [];
    rel2old = [];
    rel2start = [];
    rel2startok = [];
    init_delta = [];
    for (i = 1; i < 3; i++) {
        deltax[i] = 0
        deltaxold[i] = 0
        rel2[i] = 0;
        rel2old[i] = [];
        rel2start[i] = 999999;
        rel2startok[i] = 0;
        init_delta[i] = 1;
    }

    for (j = 0; j < 64; j++) {
        rel2old[j] = [];
        for (i = 1; i < 3; i++) {
            rel2old[j][i] = 0
        }
    }

    barrex = [];
    barrexold = [];
    for (i = 0; i < 64; i++) {
        barrex[i] = 0;
        barrexold[i] = 0
    }

    // Création du canvas pour la boussole
    canvas_compass = document.querySelector('#canvas_compass');
    context_compass = canvas_compass.getContext('2d');

    display_rpmshift = 0;

    gear_ = {};
    shift_old = 0;
    rpm_old = 0;
    gear_old = 0;
    speed_old = 0;
    shift2 = 0;

    maxspeed_ = {};

    carname = "";

    rpm_coef_a = 0;
    rpm_coef_b = 0;
    max_rpm = 1;
    red_rpm = 1;

    bg_flag = "#bbbbbb";
    bg_flag_old = bg_flag;
    bg_flag_start_time = 0;

    update_telemetry_status = 0;
}

pro_expired = -1;
pro_expired_old = -1;

dashboard_online_folder = "";

fnman_disp_temporary_tstamp = 0;  // sert à afficher temporairement le fuelneed_man réglé quand on change la valeur
fnman_old = 0;  // pour savoir si le fuelneed_man a changé
fn_auto_offset_disp_temporary_tstamp = 0;  // sert à afficher temporairement le fuelneed_auto_offset réglé quand on change la valeur
fn_auto_offset_old = 0;  // pour savoir si le fuelneed_auto_offset a changé
fn_dont_change_colors = 0;
fn_signe = "";  // permet d'afficher le signe pour le fuelneed_auto_offset

frame_src_selected = {}; // Servira à savoir si l'url du frame doit être mise à jour ou pas
for (var i = 0; i < 4; i++) {
    frame_src_selected[i] = "";
}
