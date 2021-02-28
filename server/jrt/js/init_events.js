// connections websocket avec le serveur Python
function init_events() {
    // We define the refresh rate for the datas
    broadcast_tick = 0;

    nb_events = 0;
    nb_events_loaded = 0;
    events = [];
    events_fix = [];
    events_loaded = true;

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

    load_datajson();

    refresh = setInterval(load_datajson , 1000/0.2);  // refresh every 5 seconds
}

function load_events() {
    // On lit les données dans le fichier data.json

    pack_num = Math.floor(nb_events_loaded/100);
    //console.log("loading pack " + pack_num + " [" + nb_events_loaded + " events]");

    url = "datajson/events_data" + team + "_" + (pack_num) + ".json";

    // To prevent caching
    var nocache = new Date().getTime();
    var path = url + '?cache=' + nocache;

    var AJAX_req = new XMLHttpRequest();
    AJAX_req.open("POST", url, true);
    //AJAX_req.open("GET", url, true);
    AJAX_req.setRequestHeader("Content-type", "application/json");

    AJAX_req.onreadystatechange = function () {
        if (AJAX_req.readyState == 4 && AJAX_req.status == 200) {
            datas = AJAX_req.responseText;

            //new_events = JSON.parse(datas);
            success = 0;
            try {
                new_events = JSON.parse(datas);
                if (new_events != undefined && new_events != null) {
                    success = 1;
                }
            } catch (e) {
                success = 0;
                console.log("JSON not valid, will retry later ...");
                return false;
            }

            if (success == 1) {
                //if (new_events.length >= 100) {
                if (Math.floor(nb_events / 100) > pack_num) {
                    //console.log(pack_num, nb_events_loaded);
                    events_fix = new_events.concat(events_fix);
                    nb_events_loaded = (pack_num + 1) * 100;
                    load_events();  // On charge le fichier des events suivant
                } else {
                    events = new_events.concat(events_fix);
                    nb_events_loaded = events.length;
                    events_loaded = true;
                    //console.log(nb_events_loaded)
                    //console.log(pack_num, nb_events_loaded, nb_events, new_events.length);
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
    AJAX_req.open( "POST", url, true );
    //AJAX_req.open( "GET", url, true );
    AJAX_req.setRequestHeader("Content-type", "application/json");

    AJAX_req.onreadystatechange = function()
    {
        if( AJAX_req.readyState == 4 && AJAX_req.status == 200 )
        {
            datas = AJAX_req.responseText;

            //d = JSON.parse(datas);
            success = 0;
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

                if (nb_events > 0 && events_loaded) {  // on vérifie aussi que la boucle récursive dans load_events est terminée
                    events_loaded = false;
                    load_events();
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
