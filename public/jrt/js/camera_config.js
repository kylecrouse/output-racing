// Joel Real Timing

start_repeat_button = {};
repeat_button = {};

function update_datas(text) {
    donnees = JSON.parse(text);

    //$("#brakebias").html(donnees.bb);
}

function button_down(button_num) {
    ws.send("camera;" + button_num + ";" + 1);
    start_repeat_button[button_num] = setTimeout(function () {
        ws.send("camera;" + button_num + ";" + 0);
        repeat_button[button_num] = setInterval(function () {
            ws.send("camera;" + button_num + ";" + 1);
            setTimeout(function () {
                ws.send("camera;" + button_num + ";" + 0);
            }, 50);
        }, 100);
    }, 500)
}

function button_up(button_num) {
    ws.send("camera;" + button_num + ";" + 0);
    if (start_repeat_button[button_num]) {
        clearTimeout(start_repeat_button[button_num]);
    }
    if (repeat_button[button_num]) {
        clearInterval(repeat_button[button_num]);
    }
}

// Démarrage de la connection websocket
window.onload = function() {
    init_ws();

    window.onresize = function() {
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
        $("#page").css("width", window_innerWidth + "px");
        $("#page").css("height", window_innerHeight + "px");
    };

    var elem = document.documentElement;
    $("#fullscreen").click(function () {
        if (!document.fullscreenElement &&    // alternative standard method
              !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
            $("#fullscreen").css("display", "none");
        }
    });

    if ((fullscreen_button == 1) && !document.fullscreenElement &&    // alternative standard method
          !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
        // On n'est pas en fullscreen
        //if (fullscreen_button == 1) {
            $("#fullscreen").css("display", "block");
            if (fullscreen_button_timeout > 0) {
                setTimeout(function () {
                    $("#fullscreen").css("display", "none");
                }, 1000*fullscreen_button_timeout)
            }
        //}
    } else {
        // On est déjà en fullscreen donc on cache le bouton
        $("#fullscreen").css("display", "none");
    }

    if( /iPhone|iPad/i.test(navigator.userAgent)) {  //Si c'est un iPad ou iPhone
        $("#fullscreen").css("display", "none");
    }

};
