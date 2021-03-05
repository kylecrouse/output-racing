// Joel Real Timing

start_repeat_button = {};
repeat_button = {};

supportsTouch = false;
if ('ontouchstart' in window) {
    //iOS & android
    supportsTouch = true;
} else if(window.navigator.msPointerEnabled) {
    //Win8
    supportsTouch = true;
}

function update_datas(text) {
    try {
        donnees = JSON.parse(text);

        for (nom in var_sent_every_second) {
            if (donnees[nom] != undefined) {
                save_donnees_new[nom] = donnees[nom];
            } else {
                donnees[nom] = save_donnees_new[nom];
            }
        }

        $("#brakebias").html(donnees.bb);
        $("#tractioncontrol").html(donnees.tc);
        //$("#hys").html(donnees.mguf);

    }catch(e) {
        //console.log("Json error")
    }
}

function button_down(button_num) {
    ws.send("button;" + button_num + ";" + 1);
    start_repeat_button[button_num] = setTimeout(function () {
        ws.send("button;" + button_num + ";" + 0);
        repeat_button[button_num] = setInterval(function () {
            ws.send("button;" + button_num + ";" + 1);
            setTimeout(function () {
                ws.send("button;" + button_num + ";" + 0);
            }, 50);
        }, 100);
    }, 500)
}

// Ceci est un essaie mais ça ne fonctionne pas bien
/*
function button_down_until_hys_val(button_num, hys_val) {
    if (donnees.mguf > hys_val) {
        console.log(donnees.mguf, hys_val)
        ws.send("button;" + button_num + ";" + 1);
        start_repeat_button[button_num] = setTimeout(function () {
            ws.send("button;" + button_num + ";" + 0);
            repeat_button[button_num] = setInterval(function () {
                if (donnees.mguf <= hys_val) {
                    ws.send("button;" + button_num + ";" + 0);
                    if (start_repeat_button[button_num]) {
                        clearTimeout(start_repeat_button[button_num]);
                    }
                    if (repeat_button[button_num]) {
                        clearInterval(repeat_button[button_num]);
                    }
                } else {
                    ws.send("button;" + button_num + ";" + 1);
                    setTimeout(function () {
                        ws.send("button;" + button_num + ";" + 0);
                    }, 50);
                }
            }, 100);
        }, 500)
    }
}
*/

function button_down_click(button_num) {
    if (supportsTouch == false) {
        ws.send("button;" + button_num + ";" + 1);
        setTimeout(function () {
            ws.send("button;" + button_num + ";" + 0);
        }, 100);
    }
}

function button_down_once(button_num) {
    ws.send("button;" + button_num + ";" + 1);
}

function button_up_once(button_num) {
    ws.send("button;" + button_num + ";" + 0);
}

function button_up(button_num) {
    ws.send("button;" + button_num + ";" + 0);
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
