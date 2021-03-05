// connections websocket avec le serveur Python
function init_ws() {

    ws_boucle = null;  // important pour éviter un message d'erreur dans config.js

    console.log("broadcast =", broadcast);

    opt_team = getParamValue('team');
    if (opt_team) {
        opt_team = opt_team.replaceAll(" ", "_");  // on remplace les éventuels espaces par des underscores
    }

    if (opt_team == false) {
        console.log("no team chosen")
    } else {
        console.log("team = " + opt_team)
    }

    if (broadcast == 0) {
        try {
            ws = new WebSocket("ws://" + localIP + ":" + PORT8001 + "/");
        } catch (error) {
            // on réessaie plus tard
            setTimeout(function () { init_ws(); },1000);
            return;
        }
        // Socket for the local communications
		ws.onmessage = function(d) {
            var datas = d.data;
            if (datas != "wait") {
                //if (local_tick2 <= local_tick) {
                    update_datas(datas);
                    local_tick2++;
                //}
                wait = 0;
            } else
                wait = 1
        };
		ws.onclose = function() {
            //setTimeout(function () {location.reload()},5000);
            setTimeout(function () { clearInterval(ws_boucle); init_ws(); },1000);
            ws.close();
        };
		window.onbeforeunload = function() {
			ws.onclose = function () {}; // disable onclose handler first
			ws.close();
		};
        ws.onopen = function () {
            ws.send("31");
            ws.send("window;"+window_name+";"+window_x+";"+window_y+";"+window_w+";"+window_h+";"+window_alpha+";"+window_topmost+";"+window_borders);

            //ws.send("f3_mode_in_race_dashboard;" + f3_mode_in_race_dashboard);

            if (window_iracing_control == 1) {
                if (iracing_fullscreen == 1) {
                    window_iracing_borders = 0;
                    ws.send("window;iRacing.com Simulator;0;0;0;0;-1;-1;0");
                } else
                    ws.send("window;iRacing.com Simulator;" + window_iracing_x + ";" + window_iracing_y + ";" + window_iracing_w + ";" + window_iracing_h + ";-1;" + window_iracing_topmost + ";" + window_iracing_borders);
            }

            local_tick = 0;
            local_tick2 = 0;
            // We define the refresh rate for the datas
            t0_ms = parseInt(Date.now());
            t0_typ2_ms = parseInt(Date.now());
            ws_boucle = setInterval(ws_boucle_dashboard, 1000 / fps_dashboard);
            /*
            ws_boucle = setInterval(function () {
                if ((wait == 0) && (ws.bufferedAmount == 0) && (ws.readyState == ws.OPEN)) {   // On vérifie que tout a bien déjà été envoyé
                    if (local_tick % fps_dashboard == 0) {  // specify the refresh rate of the typ2 datas -> 1 time per second
                        ws.send("32")
                    } else {
                        ws.send("33")
                    }
                    local_tick++;
                }
            }, 1000 / fps_dashboard);
            */

        };
    }
    if (broadcast == 1) {
        try {
            ws3 = new WebSocket("ws://"+internetIP+":" + PORT8003 + "//");
        } catch (error) {
            // on réessaie plus tard
            setTimeout(function () { init_ws(); },1000);
            return;
        }
        // Socket for the broadcast communications
		ws3.onmessage = function(d) {
            var datas = d.data;
            update_datas(datas);
        };
		ws3.onclose = function() {
            //setTimeout(function () {location.reload()},5000);
            setTimeout(function () { clearInterval(ws_boucle); init_ws(); },1000);
            ws3.close();
        };
		window.onbeforeunload = function() {
			ws3.onclose = function () {}; // disable onclose handler first
			ws3.close();
		};
        ws3.onopen = function () {
            ws3.send("31");

            //ws3.send("f3_mode_in_race_dashboard;" + f3_mode_in_race_dashboard);

            local_tick = 0;
            local_tick2 = 0;
            // We define the refresh rate for the datas
            ws_boucle = setInterval(function(){
                if (ws3.bufferedAmount == 0 && (ws3.readyState == ws3.OPEN)) {
                    if (local_tick % fps_broadcast == 0) {  // specify the refresh rate of the typ2 datas -> 1 time per second
                        ws3.send("32")
                    } else {
                        ws3.send("33")
                    }
                    local_tick++;
                }
            } , 1000/fps_broadcast);

        };
    }

    if (broadcast >= 2) {

        // We define the refresh rate for the datas
        broadcast_tick = 0;

        load_track_data = 1;

        if (opt_team == false) {
            team = '';
        } else {
            team = opt_team;
        }

        load_datajson();

        ws_boucle = setInterval(function(){
            load_datajson();
        } , 1000/fps_broadcast);
    }

    setting_changed_time = 0;  // pour savoir quand afficher le changement de setting (tc, abs, ...)
    setting_changed_name = "--";
    setting_changed_value = 0;
    tab_setting = {
        "tc": "Traction Control",
        "tc2": "Traction Control2",
        "bb": "Brake Bias",
        "abs": "ABS",
        "wj": "Weight Jacker",
        "arb_f": "Front ARB",
        "arb_r": "Rear ARB",
        "mgua": "MGU-K Deploy Opt. High",
        "mguf": "MGU-K Deploy Fixed",
        "mgum": "MGU-K Deploy Mode",
        "regen_gain": "MGU-K re-gen Gain",
        "fuel_mixture": "Engine Map",
        "peak_bb": "Peak Brake Bias",
        "diff_preload": "Entry Preload",
        "diff_entry": "Entry Diff",
        "boo": "Boost Level",
        "lim": "Rev Limiter",
        "wj_l": "Left Weight Jacker",
        "wing_f": "Front Wing",
        "wing_r": "Rear Wing",
        "wing_f2": "Front Wing",
        "wing_r2": "Rear Wing",
        "diff_mid": "Middle Diff",
        "diff_exit": "Exit Diff",
        "eng_br": "Engine Braking",
        "eng_pw": "Engine Power",
        "t_sh": "Throttle Shape",
        "tc_tog": "Traction Control",
        "svfuel": "Fuel Add",
        "me_p2p_count": "P2P Count",
        "powersteering": "Power Steering Assist"
    };
    setting_ = {};

}

function load_datajson() {
    // On lit les données dans le fichier data.json
    if (load_track_data == 1) {
        url = "datajson/track_data" + team + ".json";
    } else {
        url = "datajson/data" + team + ".json";
    }

    // To prevent caching
    var nocache = new Date().getTime();
    var path = url + '?cache=' + nocache;

    var AJAX_req = new XMLHttpRequest();
    AJAX_req.open( "POST", url, true );
    //AJAX_req.open( "GET", url, true );
    AJAX_req.setRequestHeader("Content-type", "application/json");

    AJAX_req.onreadystatechange = function()
    {
        if( AJAX_req.readyState == 4 && AJAX_req.status == 200 )
        {
            datas = AJAX_req.responseText;

            success = 0;
            //d = JSON.parse(datas);
            try {
                d = JSON.parse(datas);
                if (d != undefined && d != null) {
                    success = 1;
                }
            } catch (e) {
                success = 0;
                console.log("JSON not valid, will retry later ...");
                //return false;
            }

            if (success == 1) {
                if (d.load_track_data == 1) {
                    load_track_data = 0;
                }
                update_datas(datas);
            }

        }
    };

    AJAX_req.send();

    //console.log(nb_events)

    broadcast_tick++;
}

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