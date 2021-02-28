// connections websocket avec le serveur Python
function init_events() {
    broadcast_tick = 0;
    sessionid = document.getElementById("sessionid").value;
    teamname = tnm;

    init_sessions(1);
    load(0);

    refresh = setInterval( function () {
        load(1);
    }, 1000/0.2);  // refresh every 5 seconds

}

function load(param) {
    // On lit les données dans le fichier log_data.json

    //url = "datajson/log_data.json";
    url = "datajson/log_session_" + sessionid;
	//console.log(url)

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

            if (datas != undefined && datas != null) {
                if (param == 0) {
                    init_teams(datas);
                }
                //update_datas(datas);
                try {
                    update_datas(datas);
                } catch (e) {
                    console.log(e, "JSON not valid, will retry later ...");
                    //return false;
                }

                if (param == 0) {
                    document.getElementById("link").value = "http://" + (document.location.hostname + document.location.pathname + "?sid=" + sessionid + "&tnm=" + teamname).split(" ").join("%20");
                }

                if (autoscroll) {
                    window.scrollTo(0, document.body.scrollHeight);
                }
            }
        }
    };
    AJAX_req.send();

    //broadcast_tick++;
}

function init_teams(evt) {
    log = JSON.parse(evt);

    success = 0;
    try {
        d = JSON.parse(datas);
        if (d != undefined && d != null) {
            success = 1;
        }
    } catch (e) {
        success = 0;
        console.log("JSON not valid, will retry later ...");
    }

    if (success == 1) {
        liste_teams = {};
        nb = 0;
        if (log != null) {
            for (e = log.length - 1; e >= 0; e--) {
                liste_teams[log[e].teamname] = 1;
            }
        }

        document.getElementById("teamname").innerHTML = "";
        for (team in liste_teams) {
            document.getElementById("teamname").innerHTML += "<OPTION>" + team + "</OPTION>"
        }
        if (teamname == "") {
            teamname = document.getElementById("teamname").value;
        } else {
            document.getElementById("teamname").value = teamname;
        }
    }

}

function init_sessions(param) {
    str = "";
    i = 0;
    for (num = 0; num < liste_sessions.length; num++) {
        if (liste_sessions[num].substr(11,10) == date) {
            if (i == 0 && param == 0) {
                sessionid = liste_sessions[num];
            }
            str += "<OPTION>" + liste_sessions[num] + "</OPTION>";
            i++;
        }
    }
    if (str != "") {
        document.getElementById("sessionid").innerHTML = str;
        if (sessionid == '') {
            sessionid = document.getElementById("sessionid").value;
        } else {
            document.getElementById("sessionid").value = sessionid;
        }
    }
    if (date != "") {
        document.getElementById("date").value = date;
    }
}

function opt_autoscroll(elt) {
    if (elt.checked) {
        autoscroll = 1
    } else {
        autoscroll = 0;
    }
}