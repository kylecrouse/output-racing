// connections websocket avec le serveur Python
function init_ws() {
    ws_boucle = null;  // important pour éviter un message d'erreur dans config.js

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
			ws.close()
		};
        ws.onopen = function () {
            ws.send("11");    // we want to collect the trackmap infos
            ws.send("window;"+window_name+";"+window_x+";"+window_y+";"+window_w+";"+window_h+";"+window_alpha+";"+window_topmost+";"+window_borders);
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
            t0_ms = parseInt(Date.now());
            t0_typ2_ms = parseInt(Date.now());
            //console.log("fps_trackmap =", fps_trackmap);
            ws_boucle = setInterval(ws_boucle_trackmap, 1000 / fps_trackmap);
            /*
            ws_boucle = setInterval(function () {
                    if ((wait == 0) && (ws.bufferedAmount == 0) && (ws.readyState == ws.OPEN)) {   // On vérifie que tout a bien déjà été envoyé
                        ws.send("12")
                    }
            }, 1000 / fps_trackmap);
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
			ws3.close()
		};
        ws3.onopen = function () {
            ws3.send("11");    // we want to collect the  trackmap infos

            // We define the refresh rate for the datas
            ws_boucle = setInterval(function(){
                if (ws3.bufferedAmount == 0 && (ws3.readyState == ws3.OPEN)) {
                    ws3.send("12")
                }
            } , 1000/fps_broadcast);

        };
    }

    if (broadcast >= 2) {
        // We define the refresh rate for the datas
        broadcast_tick = 0;

        load_track_data = 1;

        opt_team = getParamValue('team');
        if (opt_team) {
            opt_team = opt_team.replaceAll(" ", "_");  // on remplace les éventuels espaces par des underscores
        }

        if (opt_team == false) {
            console.log("no team chosen")
        } else {
            console.log("team = " + opt_team)
        }

        if (opt_team == false) {
            team = '';
        } else {
            team = opt_team;
        }

        ws_boucle = setInterval(function(){
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

            broadcast_tick++;
        } , 1000/fps_broadcast);
    }

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
