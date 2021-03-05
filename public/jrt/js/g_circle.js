// Joel Real Timing

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

        /*$("#g_lon").html(donnees.g_lon);
        $("#g_lat").html(donnees.g_lat);*/
        if (donnees.g_lat != undefined && donnees.g_lon != undefined) {
            draw_g_circle(donnees.g_lat, donnees.g_lon)
        }

    }catch(e) {
        //console.log("Json error")
    }
}

// Démarrage de la connection websocket
window.onload = function() {

    // Création des canvas pour le G-Circle
    cv = document.createElement("canvas");
    cv.setAttribute("id", "g_circle_canvas");
    document.getElementById("g_circle").appendChild(cv);
    g_circle_canvas = document.querySelector('#g_circle_canvas');
    g_circle_context = g_circle_canvas.getContext('2d');

    cv = document.createElement("canvas");
    cv.setAttribute("id", "g_circle_canvas2");
    document.getElementById("g_circle").appendChild(cv);
    g_circle_canvas2 = document.querySelector('#g_circle_canvas2');
    g_circle_context2 = g_circle_canvas2.getContext('2d');

    cv = document.createElement("canvas");
    cv.setAttribute("id", "g_circle_canvas0");
    document.getElementById("g_circle").appendChild(cv);
    g_circle_canvas0 = document.querySelector('#g_circle_canvas0');
    g_circle_context0 = g_circle_canvas0.getContext('2d');

    cv = document.createElement("canvas");
    cv.setAttribute("id", "g_circle_fond_canvas");
    document.getElementById("g_circle").appendChild(cv);
    g_circle_fond_canvas = document.querySelector('#g_circle_fond_canvas');
    g_circle_fond_context = g_circle_fond_canvas.getContext('2d');

    responsive_dim();
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
        responsive_dim();
    };
};

function responsive_dim() {
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
    document.getElementById("g_circle_canvas").setAttribute("width", window_innerWidth);
    document.getElementById("g_circle_canvas").setAttribute("height", window_innerHeight);
    document.getElementById("g_circle_canvas2").setAttribute("width", window_innerWidth);
    document.getElementById("g_circle_canvas2").setAttribute("height", window_innerHeight);
    document.getElementById("g_circle_canvas0").setAttribute("width", window_innerWidth);
    document.getElementById("g_circle_canvas0").setAttribute("height", window_innerHeight);
    document.getElementById("g_circle_fond_canvas").setAttribute("width", window_innerWidth);
    document.getElementById("g_circle_fond_canvas").setAttribute("height", window_innerHeight);

    // On redessine le fond du g_circle
    g_circle_fond_context.beginPath(); //On démarre un nouveau tracé.
    g_circle_fond_context.arc(window_innerWidth / 2, window_innerHeight / 2, 3 * window_innerWidth / 640, 0, Math.PI * 2); //On trace la courbe délimitant notre forme
    g_circle_fond_context.fillStyle = "#666666";
    g_circle_fond_context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
    g_circle_fond_context.closePath();
    for (g = 1; g <= 5; g++) {
        g_circle_fond_context.beginPath(); //On démarre un nouveau tracé.
        g_circle_fond_context.arc(window_innerWidth / 2, window_innerHeight / 2, g * window_innerWidth / 2 / 5, 0, Math.PI * 2); //On trace la courbe délimitant notre forme
        g_circle_fond_context.strokeStyle = "#ffffff";
        g_circle_fond_context.lineWidth = 4 * window_innerWidth / 640;
        g_circle_fond_context.stroke(); //On utilise la méthode fill(); si l'on veut une forme pleine
        g_circle_fond_context.closePath();
    }

}

function draw_g_circle(x, y) {
    coef = window_innerWidth / 2 / 5;  // 5G max
    rayon = 24;

    // On efface tout
    g_circle_context2.globalAlpha = 1;
    g_circle_context2.clearRect(0, 0, window_innerWidth, window_innerHeight);
    g_circle_context2.globalAlpha = 0.99;
    g_circle_context2.drawImage(g_circle_canvas, 0, 0);
    g_circle_context.clearRect(0, 0, window_innerWidth, window_innerHeight);
    g_circle_context.drawImage(g_circle_canvas2,0,0);
    //g_circle_context.clearRect(0, 0, window_innerWidth, window_innerHeight);

    g_circle_context.beginPath(); //On démarre un nouveau tracé.
    g_circle_context.arc(window_innerWidth / 2 + x * coef, window_innerHeight / 2 + y * coef, rayon * window_innerWidth / 640, 0, Math.PI * 2); //On trace la courbe délimitant notre forme
    g_circle_context.fillStyle = "#cc0000";
    g_circle_context.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
    g_circle_context.closePath();

    g_circle_context0.clearRect(0, 0, window_innerWidth, window_innerHeight);
    g_circle_context0.beginPath(); //On démarre un nouveau tracé.
    g_circle_context0.arc(window_innerWidth / 2 + x * coef, window_innerHeight / 2 + y * coef, rayon * window_innerWidth / 640, 0, Math.PI * 2); //On trace la courbe délimitant notre forme
    g_circle_context0.fillStyle = "#ff0000";
    g_circle_context0.fill(); //On utilise la méthode fill(); si l'on veut une forme pleine
    g_circle_context0.closePath();

}