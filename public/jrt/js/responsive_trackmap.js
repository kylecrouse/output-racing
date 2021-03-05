function RGBA(e, alpha) { //e = jQuery element, alpha = background-opacity
    if (alpha < 1/500) {  // Pour éviter de bugguer avec firefox
        alpha = 1/500;
    }
    //b = e.css('backgroundColor');
    b = $(e).css('background-color');
    if (b != 'transparent') {
        $(e).css('backgroundColor', 'rgba' + b.slice(b.indexOf('('), ( (b.match(/,/g).length == 2) ? -1 : b.lastIndexOf(',') - b.length)) + ', ' + alpha + ')');
    }
}

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

    if (donnees.logo_pct != undefined) {
        logo_pct = donnees.logo_pct;
    }

    trackmap_canvas_w = -1;
    trackmap_canvas_h = -1;

    container_w = window_innerWidth + 17;
    container_h = window_innerHeight;
    container_diag = Math.sqrt(container_w*container_w + container_h*container_h);

    $("#page").css("width", window_innerWidth + "px");
    $("#page").css("height", window_innerHeight + "px");

    document.getElementById("trackmap").style.top = 0 + "px";
    document.getElementById("trackmap_bg").style.top = 0 + "px";
    //document.getElementById("trackmap_canvas").setAttribute("width", Math.max(1, container_w - 17));
    //document.getElementById("trackmap_canvas").setAttribute("height", Math.max(1, container_h));
    trackmap_canvas.width = Math.max(1, (container_w - 17)) * devicePixelRatio;
    trackmap_canvas.height = Math.max(1, container_h) * devicePixelRatio;
    trackmap_canvas.style.width = Math.max(1, (container_w - 17)) + "px";
    trackmap_canvas.style.height = Math.max(1, container_h) + "px";

    //document.getElementById("trackmap_fond_canvas").setAttribute("width", Math.max(1, container_w - 17));
    //document.getElementById("trackmap_fond_canvas").setAttribute("height", Math.max(1, container_h));
    trackmap_fond_canvas.width = Math.max(1, (container_w - 17)) * devicePixelRatio;
    trackmap_fond_canvas.height = Math.max(1, container_h) * devicePixelRatio;
    trackmap_fond_canvas.style.width = container_w - 17 + "px";
    trackmap_fond_canvas.style.height = Math.max(1, container_h) + "px";

    //document.getElementById("trackmap_fond_turns_canvas").setAttribute("width", Math.max(1, container_w - 17));
    //document.getElementById("trackmap_fond_turns_canvas").setAttribute("height", Math.max(1, container_h));
    trackmap_fond_turns_canvas.width = Math.max(1, (container_w - 17)) * devicePixelRatio;
    trackmap_fond_turns_canvas.height = Math.max(1, container_h) * devicePixelRatio;
    trackmap_fond_turns_canvas.style.width = container_w - 17 + "px";
    trackmap_fond_turns_canvas.style.height = Math.max(1, container_h) + "px";

    if (trackmap_disp_timelost) {
        document.getElementById("plost").style.display = "block";
    } else {
        document.getElementById("plost").style.display = "none";
    }

    // On redessine le circuit à la bonne taille
    //draw_track("rgba(90,90,90,0.8)", 1, 2, 1);
    //draw_track("#2c2c2c", 1, 1, 1);
    draw_track();
    trackmap(); // on dessine aussi tout de suite les pilotes

    //document.getElementById("trackmap").style.background = "url(./img/trackmap_logo.png) right bottom no-repeat";
    document.getElementById("trackmap").style.backgroundSize = container_w*logo_pct + "px";

    // Chargement du logo et du fond (après avoir vérifié qu'ils existent)
    if (donnees.trackpath != undefined) {
        if (trackmap_disp_logo == 1) {
            imgurl = "./img/" + donnees.trackpath + "_logo.png";
            img = new Image();
            img.src = imgurl;
            $(img)
                .load(function () {
                    if (donnees.trackpath != undefined) {
                        imgurl = "./img/" + donnees.trackpath + "_logo.png";
                    } else {
                        imgurl = "url('./img - default/trackmap_logo.png')";
                    }
                    $("#trackmap").css("background-image", "url('" + imgurl + "')");
                })
                .error(function () {
                    imgurl = "url('./img - default/trackmap_logo.png')";
                    $("#trackmap").css("background-image", "url('" + imgurl + "')");
                });
            img = null;
        }
        if (trackmap_bg_img) {
            imgurl = "./img/" + donnees.trackpath + "_bg.png";
            img2 = new Image();
            img2.src = imgurl;
            $(img2)
                .load(function () {
                    if (donnees.trackpath != undefined) {
                        imgurl = "./img/" + donnees.trackpath + "_bg.png";
                    } else {
                        imgurl = "url('./img - default/trackmap_bg.png')";
                    }
                    $("#trackmap_bg").css("background-image", "url('" + imgurl + "')");
                })
                .error(function () {
                    imgurl = "url('./img - default/trackmap_bg.png')";
                    $("#trackmap_bg").css("background-image", "url('" + imgurl + "')");
                });
            img2 = null;
        } else {
            $("#trackmap_bg").css("background-color", trackmap_bg_color);
            $("#trackmap_bg").css("background-image", "url('')");
        }
    }

    if (trackmap_disp_logo == 0) {
        $("#trackmap").css("background-image", "url('./img - default/trackmap_nologo.png')");
    }

    //$("#trackmap_bg").css("opacity", transparence_fond_trackmap);

    //document.getElementById("trackmap_bg").style.background = "url(./img/trackmap_bg.png) right bottom no-repeat";
    //document.getElementById("trackmap_bg").style.backgroundSize = "100% auto";

    //document.getElementById("container").style.filter = "blur(8px)"


    // Gestion du bouton fullscreen
    if ((fullscreen_button == 1) && (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement)) {  // current working methods
        // On n'est pas en fullscreen
        if (broadcast <= 1) {
            //if (fullscreen_button == 1) {
                $("#fullscreen").css("display", "block");
                if (fullscreen_button_timeout > 0) {
                    setTimeout(function () {
                        $("#fullscreen").css("display", "none");
                    }, 1000*fullscreen_button_timeout)
                }
            //}
        }
    } else {
        // On est déjà en fullscreen donc on cache le bouton
        $("#fullscreen").css("display", "none");
    }
    if( /iPhone|iPad/i.test(navigator.userAgent)) {  //Si c'est un iPad ou iPhone
        $("#fullscreen").css("display", "none");
    }

    // On charge les éventuels css perso
    // ...

}
