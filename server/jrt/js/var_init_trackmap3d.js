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

    donnees_defined = 0;

    send_trackmap_nbrequest = 0;
    trackmap_nbrequest = 0;
    trackmap_loaded = 0;

    // Création du canvas pour la trackmap
    /*cv = document.createElement("canvas");
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
    */

    track = {x: [], y: [], z: [], r: []};
    turn_edit_ldp = 0;

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

    selected_idxjs = -1;
    trackname = "init";

    north_edit_rad = 0;

    timing_page = 0;

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

    donnees = {};
    donnees_new = {};
    sessionnum = 0;
    sessionid = 0;
    type_session = "";
    name_session = "";

    wait = 0;

    /*if (window_alpha > 0)
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

    document.getElementById('opt_window_x').value = window.screenLeft;
    document.getElementById('opt_window_y').value = window.screenTop;
    document.getElementById('opt_window_w').value = window.outerWidth;
    document.getElementById('opt_window_h').value = window.outerHeight;
    */

    window_name = document.title;

    /*
    document.getElementById("trackmap_bg").style.opacity = transparence_fond_trackmap;
    */

    colorize_drivers_init = 3; // indique qu'on est dans la trackmap

    objet_disp_test = 1;  // C'est une valeur qui alterne du 1 au 2 et qui permet de savoir s'il faut effacer des objets pour optimiser la 3D

    document.getElementById("trackmap_3d_bg").style.backgroundColor = trackmap_bg_color;
    document.getElementById("trackmap_3d_bg").style.opacity = transparence_fond_trackmap;

    v_cam = new THREE.Vector3(0, 0, 0);
    v_cam2 = new THREE.Vector3(0, 0, 0);
    camera_mult = 1;
    animate_started = 0;

    perp_x = 0;
    perp_z = 0;
}

pro_expired = -1;
pro_expired_old = -1;