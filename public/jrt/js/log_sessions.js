function update_datas(evt) {
    log = JSON.parse(evt);

    tab_laps = "<table>";

    tab_laps += "<thead class='log_titres'><tr>";
    titres = ['P', 'Driver', 'Lap', 'Laptime', 'Stint', 'Tot. Time', 'Avg laptime', 'Cons.', 'Tank', 'Avg Cons.', 'ERS', 'Cons.', 'MGU', 'Time Rem.', 'Laps Rem.', 'Fuel to add', 'PIT', 'Inc.'];
    for (t = 0; t < titres.length; t++) {
        tab_laps += "<th style='color: #000000;font-weight: bold;'>" + titres[t] + "</th>";
    }
    tab_laps += "</tr></thead>";
    n = 0;
    tab_laps += "<tbody class='log_contenu'>";
	if (log != null) {
		for (e = log.length - 1; e >= 0; e--) {
			if (log[e].teamname == teamname && log[e].log_type == 'lap infos')  {
				n++;

				// ***
				if (log[e].pit == true)  log[e].pit = 'PIT';
				if (log[e].pit == false)  log[e].pit = '';
				if (log[e].cpos == undefined) log[e].cpos = '';

				if (log[e].pit.substring(0,3) == 'PIT' || log[e].pit.substring(0,3) == 'OUT') {
					if (n % 2 == 0) {
						tab_laps += "<tr class='tr1PIT'>";
					} else {
						tab_laps += "<tr class='tr2PIT'>";
					}
				} else {
					if (n % 2 == 0) {
						tab_laps += "<tr class='tr1'>";
					} else {
						tab_laps += "<tr class='tr2'>";
					}
				}

				tab_laps += "<td>" + log[e].cpos + ".</td>";
				tab_laps += "<td>" + log[e].name + "</td>";
				//tab_laps += "<td>" + ((log[e].name).split(" "))[0] + "</td>";
				tab_laps += "<td>" + log[e].lap + "</td>";
				tab_laps += "<td>" + log[e].laptime + "</td>";
				tab_laps += "<td>" + log[e].stint + "</td>";
				tab_laps += "<td>" + log[e].total_time + "</td>";
				tab_laps += "<td>" + log[e].avg_laptime + "</td>";
				tab_laps += "<td>" + log[e].conso + " " + log[e].unit + "</td>";
				tab_laps += "<td>" + log[e].tank + " " + log[e].unit + "</td>";
				tab_laps += "<td>" + log[e].avg_conso + " " + log[e].unit + "/lap" + "</td>";
				if (log[e].ers != undefined) {
					tab_laps += "<td><span style='color: #ff0000;'>" + log[e].ers.toFixed(1) + "</span></td>";
				} else {
					tab_laps += "<td><span style='color: #ff0000;'>" + "--" + "</span></td>";
				}
				if (log[e].ersco != undefined) {
					signe = "";
					if (log[e].ersco >= 0) {
						signe = "+";
					}
					tab_laps += "<td><span style='color: #0088ff;'>" + signe + log[e].ersco.toFixed(1) + "</span></td>";
				} else {
					tab_laps += "<td><span style='color: #0088ff;'>" + "--" + "</span></td>";
				}
				if (log[e].mgu != undefined) {
					tab_laps += "<td><span style='color: #00ff00;'>" + log[e].mgu.toFixed(1) + "</span></td>";
				} else {
					tab_laps += "<td><span style='color: #00ff00;'>" + "--" + "</span></td>";
				}
				tab_laps += "<td>" + log[e].timeremain + "</td>";
				if (log[e].lapsremain < 32000) {
					tab_laps += "<td>" + log[e].lapsremain.toFixed(0) + "</td>";
					tab_laps += "<td>" + log[e].fuelneed + " " + log[e].unit + "</td>";
				} else {
					tab_laps += "<td>--</td>";
					tab_laps += "<td>--</td>";
				}
				tab_laps += "<td>" + log[e].pit + "</td>";
				if (log[e].inc != undefined) {
					if (log[e].inc > 0) {
						tab_laps += "<td><i><font color='red'>x" + log[e].inc + "</font></i></td>";
					} else {
						tab_laps += "<td></td>"
					}
				} else {
					tab_laps += "<td></td>"
				}

				tab_laps += "</tr>";
			}
			if (log[e].log_type == 'session infos' && log[e].teamname == teamname)  {
				document.getElementById("infos").innerHTML = "SESSION INFOS: " + log[e].infos;
				s = parseInt(sessionid.substr(0,10));
				if (s != 0) {
					document.getElementById("infos").innerHTML += " - <a target='_blank' href='http://members.iracing.com/membersite/member/EventResult.do?&subsessionid=" + s + "'>Session Results</a>";
				}
				document.getElementById("infos").innerHTML += " - <a target='_blank' href='timing_broadcast.html?team="+ teamname.replace("#","n").replace(/ /g, "_") + "'>JRT Timing</a>";
				document.getElementById("infos").innerHTML += " - <a target='_blank' href='trackmap.html?team="+ teamname.replace("#","n").replace(/ /g, "_") + "'>Trackmap</a>";
				document.getElementById("infos").innerHTML += " - <a target='_blank' href='events.html?team="+ teamname.replace("#","n").replace(/ /g, "_") + "'>Events</a>";
				document.getElementById("infos").innerHTML += " - " + teamname;
				document.getElementById("weather").innerHTML = "WEATHER: " + log[e].weather;
				document.getElementById("version").innerHTML = "JRT version " + log[e].ver;
			}
		}
	}

    tab_laps += "</tbody>";
    tab_laps += "</table>";
    document.getElementById("log").innerHTML = tab_laps;


}

function reformat_time(time) {
    if (time != "unlimited") {
        if (time < 167*3600) {
            heu = Math.floor(time / 3600);
            min = Math.floor((time - 3600 * heu) / 60);
            sec = Math.floor(time - 3600 * heu - 60 * min);
            if (min < 10) min = "0" + min;
            if (sec < 10) sec = "0" + sec;
            t = heu + ":" + min + ":" + sec;
            return t
        } else {
            return "--"
        }
    } else {
        return time
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

window.onload = function() {

    autoscroll = 0;

    sid = getParamValue('sid');
    tnm = getParamValue('tnm');
    if (sid != '') {
        document.getElementById("sessionid").value = sid;
    }
    //date = document.getElementById("sessionid").value;
    //date = (document.getElementById("sessionid").value).substr(11,10);
    //console.log(date);
    //teamname = "";
    //load(0);

    //init_sessions(0);


    init_events();

    document.getElementById("sessionid").onchange = function () {
        sessionid = document.getElementById("sessionid").value;
        teamname = "";
        load(0);
    };
    document.getElementById("teamname").onchange = function () {
        teamname = document.getElementById("teamname").value;
        load(0);
    };
    document.getElementById("date").onchange = function () {
        date = document.getElementById("date").value;
        init_sessions(0);
        teamname = "";
        load(0);
    };
};
