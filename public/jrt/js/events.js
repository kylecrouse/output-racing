function update_datas(evt) {
    donnees_new = JSON.parse(evt);

    if ("nb_events" in donnees_new) {
        nb_events = donnees_new.nb_events;
    }

    document.getElementById("events").innerHTML = "";
    nb_e = 0;
    //for (e = 0; e < events.length; e++) {
    for (e = 0; e < 250; e++) {  // on limite aux 250 derniers évènements pour ne pas planter le navigateur
        if (e in events) {
            if (events[e].event_type != "laptime") {  // On n'affiche pas tous les temps au tour
                nb_e += 1;
                document.getElementById("events").innerHTML += "<b>" + events[e].event_type + "</b>";
                document.getElementById("events").innerHTML += " @ " + reformat_time(events[e].session_time) + "<br>";
                document.getElementById("events").innerHTML += events[e].message + "<br><hr>";
            }
            if (nb_e >= 250) {  // on limite aux 250 derniers évènements pour ne pas planter le navigateur
                break;
            }
        }
    }
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

window.onload = function() {
    init_events();
};

