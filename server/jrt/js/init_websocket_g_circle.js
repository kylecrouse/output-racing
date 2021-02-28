// connections websocket avec le serveur Python
function init_ws() {
    ws_boucle = null;  // important pour �viter un message d'erreur dans config.js

    try {
        ws = new WebSocket("ws://" + localIP + ":" + PORT8001 + "/");
    } catch (error) {
        // on r�essaie plus tard
        setTimeout(function () { init_ws(); },1000);
        return;
    }
    // Socket for the local communications
    ws.onmessage = function(d) {
        var datas = d.data;
        update_datas(datas);
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

        // We define the refresh rate for the datas
        setInterval(function () {
            if (ws.bufferedAmount == 0 && (ws.readyState == ws.OPEN)) {   // On v�rifie que tout a bien d�j� �t� envoy�
                ws.send("33")
            }
        }, 1000 / 60);  // fps 60

    };
}
