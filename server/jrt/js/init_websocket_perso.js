// connections websocket avec le serveur Python
function init_ws() {
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
        setTimeout(function () { init_ws(); },1000);
        ws.close();
    };
    window.onbeforeunload = function() {
        ws.onclose = function () {}; // disable onclose handler first
        ws.close()
    };
    ws.onopen = function () {
        ws.send("send_statics");    // we want to collect the statics datas (name, num, ir)

        // We define the refresh rate for the datas
        local_tick = 0;
        local_tick2 = 0;

        setTimeout(function () {
            setInterval(function () {
                if (local_tick < local_tick2 && (wait == 0) && (ws.bufferedAmount == 0) && (ws.readyState == ws.OPEN)) {   // On vérifie que tout a bien déjà été envoyé
                    if (local_tick % fps == 0) {  // specify the refresh rate of the typ2 datas -> 1 time per second
                        ws.send("2")
                    } else {
                        ws.send("3")
                    }
                    local_tick++;
                }
            }, 1000 / fps_perso);
        }, 0);
    }
}
