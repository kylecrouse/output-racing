
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
            //console.log(local_tick2)
            var datas = d.data;
            if (datas != "wait") {
                //console.log(local_tick2, local_tick);
                //if (local_tick2 <= local_tick) {
                    update_datas(datas);
                    local_tick2++;
                //}
                wait = 0;
            } else {
                wait = 1
            }
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
            ws.send("send_statics");    // we want to collect the statics datas (name, num, ir)
            ws.send("window;"+window_name+";"+window_x+";"+window_y+";"+window_w+";"+window_h+";"+window_alpha+";"+window_topmost+";"+window_borders);
            ws.send("photo;0");  // pour savoir si cuda est fonctionnel
            //console.log("window;"+window_name+";"+window_x+";"+window_y+";"+window_w+";"+window_h+";"+window_alpha+";"+window_topmost+";"+window_borders)

            if (window_iracing_control == 1) {
                if (iracing_fullscreen == 1) {
                    window_iracing_borders = 0;
                    document.getElementById("opt_iracing_borders").checked = false;
                    ws.send("window;iRacing.com Simulator;0;0;0;0;-1;-1;0");
                } else
                    ws.send("window;iRacing.com Simulator;" + window_iracing_x + ";" + window_iracing_y + ";" + window_iracing_w + ";" + window_iracing_h + ";-1;" + window_iracing_topmost + ";" + window_iracing_borders);
            }

            // We define the refresh rate for the datas
            local_tick = 0;
            local_tick2 = 0;
            nb_events = 0;

            t0_ms = parseInt(Date.now());
            t0_typ2_ms = parseInt(Date.now());
            ws_boucle = setInterval(ws_boucle_timing, 1000 / fps);

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
			ws3.close()
		};
        ws3.onopen = function () {
            ws3.send("send_statics");    // we want to collect the statics datas (name, num, ir)
            //ws3.send("1");
            // We define the refresh rate for the datas
            broadcast_tick = 0;
            nb_events = 0;

            ws_boucle = setInterval(function(){
                if (ws3.bufferedAmount == 0 && (ws3.readyState == ws3.OPEN)) {

                    /*
                    //if (disp_events_ticker) {
                    if (disable_all_events == 0) {
                        ws3.send("1;" + nb_events);
                    } else {
                        ws3.send("1")
                    }*/

                    if (fps_broadcast >=2) {
                        if (broadcast_tick % fps_broadcast == 0) {  // specify the refresh rate of the typ2 datas -> 1 time per second
                            //if (disp_events_ticker) {  // ATTENTION : si on enlève cette partie, les laptimes ne seront pas affichés
                            if (disable_all_events == 0) {
                                ws3.send("2;" + nb_events);
                            } else {
                                ws3.send("2;-1")
                            }
                        } else {
                            ws3.send("3")
                        }
                    } else {
                        if (disable_all_events == 0) {
                            ws3.send("2;" + nb_events);
                        } else {
                            ws3.send("2;-1")
                        }
                    }
                    broadcast_tick++;
                }
            } , 1000/fps_broadcast);

        };

    }

    if (broadcast >= 2) {

        // We define the refresh rate for the datas
        broadcast_tick = 0;
        nb_events = 0;
        nb_events_loaded = 0;

        load_track_data = 1;

        if (opt_team == false) {
            team = '';
        } else {
            team = opt_team;
        }

        load_datajson();

        events_loaded = true;

        ws_boucle = setInterval(function(){
            if (events_loaded) {
                load_datajson();
            }
        } , 1000/fps_broadcast);
    }

}

function load_events() {
    // On lit les données dans le fichier data.json

    pack_num = Math.floor(nb_events_loaded/100);
    //console.log("loading pack " + pack_num + " [" + nb_events_loaded + " events]");

    url = "datajson/events_data" + team + "_" + (pack_num) + ".json";
    //console.log("loading pack num ", pack_num, "...");
    // To prevent caching
    var nocache = new Date().getTime();
    var path = url + '?cache=' + nocache;


    var AJAX_req = new XMLHttpRequest();
    AJAX_req.open("POST", url, true);
    //AJAX_req.open("GET", url, true);
    AJAX_req.setRequestHeader("Content-type", "application/json");

    AJAX_req.onreadystatechange = function () {

        // A tester si toujours le problème 404
        /*if (AJAX_req.readyState == 4 && AJAX_req.status == 404) {
            events_loaded = true;
        }*/

        if (AJAX_req.readyState == 4 && AJAX_req.status == 200) {
            datas = AJAX_req.responseText;

            success = 0;
            //new_events = JSON.parse(datas);
            try {
                new_events = JSON.parse(datas);
                if (new_events != undefined && new_events != null) {
                    success = 1;
                }
            } catch (e) {
                success = 0;
                console.log("JSON not valid, will retry later ...");
                load_events();
                //return false;
            }

            if (success == 1) {

                if (Math.floor(nb_events / 100) > pack_num) {

                    //console.log(pack_num, new_events.length)
                    if (new_events.length < 100) {  // on rajoute des éléments s'il en manque
                        var nb = 0;
                        tmp = [];
                        var id = 100;
                        for (var e in new_events) {
                            id--;
                            nb++;
                            a = [new_events[e]];
                            tmp = tmp.concat(a);
                        }
                        for (var i = nb + 1; i <= 100; i++) {
                            id--;
                            a = [{'id': id, 'event_type': 'none'}];
                            tmp = tmp.concat(a);
                        }
                        events_fix = tmp.concat(events_fix);
                    } else if (new_events.length > 100) {
                        var nb = 0;
                        tmp = [];
                        for (var e in new_events) {
                            nb++;
                            a = [new_events[e]];
                            tmp = tmp.concat(a);
                            if (nb >= 100) {
                                //console.log(tmp[0].id);
                                break;
                            }
                        }
                        events_fix = tmp.concat(events_fix);
                    } else {
                        events_fix = new_events.concat(events_fix);

                    }

                    //console.log(pack_num, new_events.length);

                    nb_events_loaded = (pack_num + 1) * 100;
                    console.log("Loaded event pack num " + pack_num + " ... " + nb_events_loaded + " events loaded", nb_events);
                    //$("#loading").css("display", "block");
                    $("#loading").html("LOADING DATA ... " + (100 * nb_events_loaded / nb_events).toFixed(0) + "%");
                    load_events();  // On charge le fichier des events suivant
                    /*setTimeout(function () {
                        load_events();  // On charge le fichier des events suivant en temporisant 0.1 seconde pour éviter que le serveur se croit attaqué
                    }, 50);*/
                } else {
                    events = new_events.concat(events_fix);
                    nb_events_loaded = events.length;
                    events_loaded = true;
                    $("#loading").html("LOADING DATA ... 100%");
                    setTimeout(function () {
                        $("#loading").css("display", "none");
                        $("#loading").html("LOADING DATA ... 0%");
                    }, 1000);
                    console.log("Loaded event pack num " + pack_num + " ... " + nb_events_loaded + " events loaded", nb_events);
                }
            }



        }

    };

    AJAX_req.send();
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
    AJAX_req.open("POST", url, true );
    //AJAX_req.open("GET", url, true );
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

                if (nb_events > 0 && events_loaded && disable_all_events == 0) {  // on vérifie aussi que la boucle récursive dans load_events est terminée
                    events_loaded = false;
                    load_events();
                } else {
                    $("#loading").css("display", "none");
                }
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