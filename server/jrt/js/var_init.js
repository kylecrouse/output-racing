

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

function change_class_selected() {
    class_selected_in_url = getParamValue('classid');
    if (class_selected_in_url === false || isNaN(parseInt(class_selected_in_url))) {
        class_selected_in_url = class_selected;  // on garde le réglage dans JRT Config de la page
    } else {
        class_selected_in_url = parseInt(class_selected_in_url);
    }
    //console.log("class selected :", class_selected_in_url);

    class_selected = class_selected_in_url;
    class_selected_me = false;
    if (class_selected == -1) {
        class_selected_me = true;  // pour dire qu'on affiche que les pilotes de notre classe
    }
}

function init_var(create_canvas_trackmap) {
    clt = [];
    clt_ = [];
    for (i = 0; i < 64; i++) {
        clt[i] = i + 1;
        clt_[i] = i + 1;
    }
    clt_old = [];
    for (i = 0; i < 64; i++) {
        clt_old[i] = i + 1
    }
    clt_class = [];
    for (i = 0; i < 64; i++) {
        clt_class[i] = i + 1
    }

    clt_filter_colorized = [];
    for (i = 0; i < 64; i++) {
        clt_filter_colorized[i] = i + 1;
    }

    classement = "pos";
    classement_old = classement;
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
    deltax = [];
    deltaxold = [];
    for (i = 0; i < 64; i++) {
        deltax[i] = 0
        deltaxold[i] = 0
    }
    gapold = [];
    relold = [];
    rel2 = [];
    rel2old = [];
    gap2 = [];
    gap2old = [];
    for (i = 0; i < 64; i++) {
        rel2old[i] = [];
        gap2old[i] = [];
    }
    rel2start = [];
    gap2start = [];
    for (i = 0; i < 64; i++) {
        rel2start[i] = 999999;
        gap2start[i] = 999999
    }
    rel2startok = [];
    gap2startok = [];
    init_delta = [];
    for (i = 0; i <= 64; i++) {
        rel2startok[i] = 0;
        gap2startok[i] = 0;
        init_delta[i] = 1;
    }
    barrex = [];
    barrexold = [];
    for (i = 0; i < 64; i++) {
        barrex[i] = 0;
        barrexold[i] = 0
    }
    coef_w = 1;
    do_resize = 0;

    delta_h = ligne_h;

    for (i = 0; i < 64; i++) {
        cv = document.createElement("canvas");
        cv.setAttribute("width", Math.max(1, w['delta']));
        cv.setAttribute("height", Math.max(1, delta_h));
        cv.setAttribute("id", "canvas" + i);
        document.body.appendChild(cv);
    }
    for (i = 0; i < 64; i++) {
        cvB = document.createElement("canvas");
        cvB.setAttribute("class", "canvasB");
        cvB.setAttribute("id", "canvasB" + i);
        cvB.setAttribute("width", Math.max(1, w['delta']));
        cvB.setAttribute("height", Math.max(1, delta_h));
        document.body.appendChild(cvB);
    }


    canvas = [];
    canvasB = [];
    context = [];
    contextB = [];
    for (i = 0; i < 64; i++) {
        canvas[i] = document.querySelector('#canvas' + i);
        context[i] = canvas[i].getContext('2d');
        canvasB[i] = document.querySelector('#canvasB' + i);
        contextB[i] = canvasB[i].getContext('2d');
    }


    // On range les titres dans le dictionnaire disp pour avoir le bon ordre pour les valeurs affichées
    disp = {};
    //console.log("***", tab_titres)
    for (j = 0; j < tab_titres.length; j++) {
        t = tab_titres[j];
        disp[t] = 1;
    }

    // On rajoute les autres titres à la suite, peu importe l'ordre
    disp_all = {};
    for (j = 0; j < tab_titres_all_default.length; j++) {
        t = tab_titres_all_default[j];
        if (!(t in disp)) {
            disp[t] = 0;
        }
        disp_all[t] = 1;
    }

    // On forme tab_titres_all
    j = 0;
    tab_titres_all = [];
    for (t in disp) {
        tab_titres_all[j] = t;
        j++;
    }


    wait = 0;
    clt_idxp1 = 1;
    disp_param = 0;
    if (disp_kg_livre == 1) {
        coef_fuel = 0.75;
    } else {
        coef_fuel = 1;  // unités d'essence en litre par defaut (0.75 pour les kg)
    }
    calculations_mode = 0; // 0 -> calculs en tenant compte du dernier tour, 1 -> on tient compte de la moyenne des 5 derniers tours
    refuel_mode = 0;
    teamracing_received = 0;

    document.getElementById("app_name").innerHTML = "v" + version;
    // S'il y a une nouvelle version on le signale
    //if (lastversion != version)
    //    document.getElementById("app_name").innerHTML += " <span style='font-weight:bold;color:#ff0000;'>!!!</span>";

    bg = "#999999"; // couleur du drapeau par défaut à l'ouverture

    // On regarde si on veut filter une classe dans l'url
    change_class_selected();

    sof_displayed = 0;
    nb_drivers = 0;

    selected_idxjs_scrollpos = 0;

    // On active le lien pour l'affichage des options (si on l'affiche directement depuis le css, ça fait "bugguer" l'affichage de l'iPad
    document.getElementById("display_options").style.display = "block";

    // On coche les checkbox des options en fonction des valeurs choisies
    if (autoscroll == 1) {
        document.getElementById("opt_autoscroll").checked = true
    } else {
        document.getElementById("opt_autoscroll").checked = false
    }
    if (tires_buttons == 0) {
        document.getElementById("tires").style.display = "none";
        document.getElementById("opt_tires_buttons").checked = false
    } else {
        document.getElementById("tires").style.display = "block";
        document.getElementById("opt_tires_buttons").checked = true
    }
    if (f3_box == 1) {
        document.getElementById("opt_f3_box").checked = true
    } else {
        document.getElementById("opt_f3_box").checked = false
    }

    if (disp_trackmap == 1)
        document.getElementById('trackmap').style.display = 'block';
    else
        document.getElementById('trackmap').style.display = 'none';

    if (window_alpha > 0)
        document.getElementById('opt_transparency').value = window_alpha;
    else
        document.getElementById('opt_transparency').value = 255;

    if (window_borders == 1) {
        document.getElementById("opt_borders").checked = true
    } else {
        document.getElementById("opt_borders").checked = false
    }

    if (window_iracing_borders == 1) {
        document.getElementById("opt_iracing_borders").checked = true
    } else {
        document.getElementById("opt_iracing_borders").checked = false
    }

    if (window_topmost == 1) {
        document.getElementById("opt_always_on_top").checked = true
    } else {
        document.getElementById("opt_always_on_top").checked = false
    }

    if (window_iracing_topmost == 1) {
        document.getElementById("opt_iracing_always_on_top").checked = true
    } else {
        document.getElementById("opt_iracing_always_on_top").checked = false
    }

    opt_charge_photo_favoris(0);

    photo_processing = 0;
    photo_processing_old = 0;
    photo_stop = 0;
    photo_wait = 0;

    donnees_defined = 0;

    switch_f3box_nbrequest = 0;
    send_trackmap_nbrequest = 0;
    trackmap_nbrequest = 0;
    trackmap_loaded = 0;
    scroll_up_nbrequest = 0;
    scroll_down_nbrequest = 0;

    if (create_canvas_trackmap) {
        // Création du canvas pour la trackmap
        cv = document.createElement("canvas");
        cv.setAttribute("id", "trackmap_canvas");
        document.getElementById("trackmap").appendChild(cv);
        trackmap_canvas = document.querySelector('#trackmap_canvas');
        trackmap_context = trackmap_canvas.getContext('2d');

        cv = document.createElement("canvas");
        cv.setAttribute("id", "trackmap_fond_canvas");
        document.getElementById("trackmap").appendChild(cv);
        trackmap_fond_canvas = document.querySelector('#trackmap_fond_canvas');
        trackmap_fond_context = trackmap_fond_canvas.getContext('2d');

        cv = document.createElement("canvas");
        cv.setAttribute("id", "trackmap_fond_turns_canvas");
        document.getElementById("trackmap").appendChild(cv);
        trackmap_fond_turns_canvas = document.querySelector('#trackmap_fond_turns_canvas');
        trackmap_fond_turns_context = trackmap_fond_turns_canvas.getContext('2d');

    }

    track = {x: [], y: []};
    turn_edit_ldp = 0;
    ldp_selected_idxjs = null;
    selected_idxjs = -1;
    rayon = null;
    ldp_exit_raw_old = null;
    dp_freeze = null;

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

    container_w = window_innerWidth;
    container_h = window_innerHeight;
    container_diag = Math.sqrt(container_w*container_w + container_h*container_h);

    track_maxlength = container_diag;

    trackname = "init";

    north_edit_rad = 0;
    selected_idx_before_f3 = -1;

    timing_page = 1;

    dp_exit = 0;
    dp = 0;

    update_tick_old = 0;

    coef_ = [];
    coef_old_ = [];
    for (i = 0; i<64; i++) {
        coef_[i] = {};
        coef_old_[i] = {};
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

    document.getElementById("trackmap_bg").style.opacity = transparence_fond_trackmap;
    //console.log(transparence_fond_trackmap)

    // On n'affiche pas les options de fenêtre en mode broadcast
    if (broadcast != 0) {
        document.getElementById("window_options").style.display = "none";
        document.getElementById("ir_window_options").style.display = "none"
    }

    pro_v_old = 0;

    team = "";

    nb_events = 0;
    nb_events_loaded = 0;
    events = [];
    events_fix = [];
    events_loaded = true;

    disp_laptimes = 0;
    disp_laptimes_old = 0;
    laptimes_idx = -1;
    laptimes_maxlap = [];
    for (var i=0;i<64;i++) {
        laptimes_maxlap[i] = 0;
    }

    // Tableau qui mémorise les temps au tour de chaque pilote
    laptime_ = {};
    laptime_type_ = {};
    laptime_avg1_ = {};
    laptime_avg2_ = {};
    laptime_avg3_ = {};
    startlap_avg1_ = {};
    startlap_avg2_ = {};
    startlap_avg3_ = {};
    calc_avg_ = {};  // servira à savoir qu'il faut recalculer les moyennes
    for (var i = 0; i < 64; i++) {
        laptime_[i] = {};
        laptime_type_[i] = {};
        laptime_avg1_[i] = 0;
        laptime_avg2_[i] = 0;
        laptime_avg3_[i] = 0;
        startlap_avg1_[i] = 0;
        startlap_avg2_[i] = 0;
        startlap_avg3_[i] = 0;
        calc_avg_[i] = 0;
    }

    cars_list = {};
    filtered = false;
    clt_filtered = {};
    idx_filtered = {};
    clt_filtered_tmp = {};

    click_status = {'start': 0, 'caridx': -2};

    ticker_nb_events = 0;
    ticker_lineheight = 0;


    // On définit les boutons de menu du bas
    //
    // mode = "up" : menu pleine page qui monte jusqu'en haut
    // mode = "down" :  menu qui reste en bas
    menu_ = {
        "standing_filter": {"state": 0, "mode": "down"},
        "my_results": {"state": 0, "mode": "up"},
        "events_filter": {"state": 0, "mode": "down"},
        "colorize_drivers": {"state": 0, "mode": "down"},
    };
    menu_wait = 0; // permet d'attendre que les menus ait terminés leur scrolling pour autoriser un nouveau click


    ask_ispro = 1;

    mois = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    liste_sessions_ = {};
    tmp = ["car", "track", "annee", "mois", "jour", "type"];
    for (t in tmp) {
        liste_sessions_[tmp[t]] = {};
        for (i in liste_sessions) {
            if (!(liste_sessions[i][tmp[t]] in liste_sessions_[tmp[t]])) {
                liste_sessions_[tmp[t]][liste_sessions[i][tmp[t]]] = 1;
            }
        }
    }
    toggle_laptimes(0);

    document.getElementById("events_ticker").innerHTML = "";

    my_results_filter = {"car" : 0, "track": 0, "annee": 0, "mois": 0, "jour": 0, "type": 0};

    type_events_list = {};

    winddir_old = null;
    windspeed_old = null;

    mx_old = -1;
    my_old = -1;
    souris_active = 0;
    md = parseInt($("#souris").css("height"));
    souris_off = null;
    function deplace_souris( e ) {
        if (souris_off != null) {
            clearTimeout(souris_off);
        }
        souris_off = setTimeout(function () {
            document.getElementById("souris").style.display = "none";
            souris_active = 0;
        }, 1);
        mx = e.clientX;
        my = e.clientY;
        if (mx != mx_old || my != my_old) {
            document.getElementById("souris").style.left = mx - md/2 + "px";
            document.getElementById("souris").style.top = my - md/2 + "px";
            mx_old = mx;
            my_old = my;
            if (souris_active == 0) {
                document.getElementById("souris").style.display = "block";
                souris_active = 1;
            }
        }
    }
    if (!(/Android|webOS|iPhone|iPad/i.test(navigator.userAgent))) {
        // Je l'ai désactivé car ne semble plus nécessaire avec l'oculus
        //window.addEventListener('mousemove', deplace_souris, false);
    }

}


// Variables globales ou variable à initialiser qu'au chargement de la page

last_sessionid = 0;
last_sessionnum = 0;

//delai_change_laptimes = 450;
delai_change_laptimes = 0;
loaded = 0;

decalage = 999;

colorize_drivers_init = 2;

colorize_driver_ = {};
colorize_team_ = {};
uncolorize_ = {};

lapsremain_bg2_left = 0;

mouse_over_idx = -1;  // Sert à savoir sur quel index est la souris, comme ça on peut réactiver les affichage 'hover' pour 'car', 'avg', ...

sessiontime = 0;

timeremain = null;
timeremain_old = null;

pro_expired = -1;
pro_expired_old = -1;

donnees_reform_car = {};

text_save = -1;  // pour pouvoir recharger les données si on fait des changements de config

fnman_disp_temporary_tstamp = 0;  // sert à afficher temporairement le fuelneed_man réglé quand on change la valeur
fnman_old = 0;  // pour savoir si le fuelneed_man a changé
fn_auto_offset_disp_temporary_tstamp = 0;  // sert à afficher temporairement le fuelneed_auto_offset réglé quand on change la valeur
fn_auto_offset_old = 0;  // pour savoir si le fuelneed_auto_offset a changé
fn_dont_change_colors = 0;
fn_signe = "";  // permet d'afficher le signe pour le fuelneed_auto_offset
