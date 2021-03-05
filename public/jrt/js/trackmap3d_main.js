



var container, stats;
var scene, camera, renderer;
var geometry, material;
var largeur_avec_bords, largeur_sans_bords, distance_vue, angle_ecrans;
//var ecran_centre;


document.onmousedown = function(e) {

	var a = e.clientX-window_innerWidth;
	var b = e.clientY-window_innerHeight;
 	//camera.rotation.y += a/(window_innerWidth/2)*Math.PI/2;
 	//camera.rotation.x += b/(window_innerHeight/2)*Math.PI/4;
 	//camera.rotation.y += 0.01;
}


function start() {

	init_var();
	init();
	animate();

	/*document.addEventListener( 'mousedown', onMouseDown, false);

	function onMouseDown(event) {
		var startx = event.clientX;
		var starty = event.clientY;
		var start_rotation_z = scene.rotation.z;
		var start_rotation_x = scene.rotation.x;

		//event.preventDefault();
		document.addEventListener( 'mousemove', onMouseMove, false);
		document.addEventListener( 'mouseup', onMouseUp, false);
		function onMouseMove(event) {
			scene.rotation.z = start_rotation_z + (event.clientX - startx)/(window_innerWidth/2)*Math.PI/2;
			scene.rotation.x = start_rotation_x + (event.clientY - starty)/(window_innerHeight/2)*Math.PI/2/4;
		}
		function onMouseUp(event) {
			document.removeEventListener( 'mousemove', onMouseMove, false );
			document.removeEventListener( 'mouseup', onMouseUp, false );
		}
	}*/

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

    if (!document.fullscreenElement &&    // alternative standard method
          !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
        // On n'est pas en fullscreen
        if (fullscreen_button == 1) {
            $("#fullscreen").css("display", "block");
            if (fullscreen_button_timeout > 0) {
                setTimeout(function () {
                    $("#fullscreen").css("display", "none");
                }, 1000*fullscreen_button_timeout)
            }
        }
    } else {
        // On est déjà en fullscreen donc on cache le bouton
        $("#fullscreen").css("display", "none");
    }

    // On cache le bouton pour les spectateurs
    if (broadcast >= 2) {
        $("#fullscreen").css("display", "none");
    }
    if( /iPhone|iPad/i.test(navigator.userAgent)) {  //Si c'est un iPad ou iPhone
        $("#fullscreen").css("display", "none");
    }

	// Gestion du bouton de sauvegarde de la caméra
    $("#save_camera").click(function () {
		if (broadcast == 0) {
			ws.send("save_camera;" + camera.position.x + ";" + camera.position.y + ";" + camera.position.z + ";" + camera.rotation.x + ";" + camera.rotation.y + ";" + camera.rotation.z + ";" + camera_mult);
			//console.log("save_camera;" + camera.position.x + ";" + camera.position.y + ";" + camera.position.z + ";" + camera.rotation.x + ";" + camera.rotation.y + ";" + camera.rotation.z + ";" + camera_mult)
			$("#save_camera").html("Camera<br>Saved");
			$("#save_camera").css("background-color", "#224422");
			$("#save_camera").css("color", "#88ff88");
			setTimeout(function() {
				$("#save_camera").html("Save<br>Camera");
				$("#save_camera").css("background-color", "#442244");
				$("#save_camera").css("color", "#ff88ff");
			}, 2000)
		}
	})

}


function init() {

    window.onresize = function() {
		//container_w = window.innerWidth;
		//container_h = window.innerHeight;
		//camera.position.z = -1000;
		//camera.position.y = -camera.position.z / 2;
		//draw_track("#ffffff", 1, 1, 1);
		//camera.position.y = -(container_w + container_h) / 2;
		//camera.position.z = - camera.position.y / 2;

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

		camera.aspect = window_innerWidth / window_innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window_innerWidth, window_innerHeight );
	};

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

	init_ws();

	scene = new THREE.Scene();
	//scene.background = new THREE.Color( trackmap_bg_color );

	camera = new THREE.PerspectiveCamera( trackmap_camera_fov, window_innerWidth / window_innerHeight, 1, 10000 );

	/*camera.position.x = 0;
	camera.position.z = 2000;
	camera.position.y = camera.position.z / 2;*/

	// ***
	//camera.position.z = 0;
	//camera.position.y = 5000;
	//camera.rotation.x -= Math.PI*30/180;

	//ajouter_plan_color(scene, 0, 0, -5000, 500, 500, 0xff0000)
	//ajouter_plan_texture(scene, 500, 0, -5000, 500, 500, "texture.jpg")

	//dessine_ecrans();
	//dessine_panneaux();

	geom = new THREE.Geometry();
	var v1 = new THREE.Vector3(0,0,0);
	var v2 = new THREE.Vector3(500,0,0);
	var v3 = new THREE.Vector3(0,500,0);
	var v4 = new THREE.Vector3(0,0,500);

	geom.vertices.push(v1);
	geom.vertices.push(v2);
	geom.vertices.push(v3);
	geom.vertices.push(v4);

	geom.faces.push( new THREE.Face3( 0, 1, 2, null, new THREE.Color( 0xff0000) ) );
	geom.faces.push( new THREE.Face3( 0, 3, 1, null, new THREE.Color( 0x00ff00) ) );
	geom.faces.push(new THREE.Face3(3, 2, 0, null, new THREE.Color( 0x0000ff)));
	geom.computeFaceNormals();
  	//geom.computeVertexNormals();
	//geom.computeBoundingSphere();

	//var mesh= new THREE.Mesh( geom, new THREE.MeshNormalMaterial() );

	//var material = new THREE.MeshLambertMaterial( {side: THREE.DoubleSide } );
	material = new THREE.MeshLambertMaterial( { vertexColors: THREE.FaceColors, side: THREE.DoubleSide } );
	mesh_lat = new THREE.Mesh( geom, material );
	mesh_top = new THREE.Mesh( geom, material );
	mesh_fleche = new THREE.Mesh( geom, material );
	//mesh.castShadow = true;
	//scene.add( mesh );

	var geometry = new THREE.PlaneGeometry( container_w, container_h);
	var material = new THREE.MeshLambertMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
	plane = new THREE.Mesh( geometry, material );
	//plane.receiveShadow = true;
	//scene.add( plane );

	// On prépare les objets pour chaque voiture
	var sphere_big = new THREE.SphereGeometry( 1.65, 16, 16 );
	var sphere_car = new THREE.SphereGeometry( 0.5, 16, 16 );
	var sphere_orange = new THREE.SphereGeometry( 1, 16, 16 );
	sphere_orange.translate(0, 0.5, 0);
	var point_noir = new THREE.SphereGeometry( 0.2, 16, 16 );
	point_noir.translate(0, 0.35, 0);
	var anneau = new THREE.RingGeometry( 1, 1.5, 32 );
	var anneau_small = new THREE.RingGeometry( 0.6, 0.7, 32 );

	var material = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
	objet = {
		"anneau" : [],
		"sphere_big": [],
		"anneau_small": [],
		"sphere_car": [],
		"point_noir": [],
		"sphere_orange": [],
		"text_mode1": [],
		"text_mode2": [],
		"text_mode3": {},
		"sphere_p1": {},
		"line_p1": {},
		"text_p1": {},
		"text_turns": {},
	};
	objet_is_disp = {
		"anneau" : [],
		"sphere_big": [],
		"anneau_small": [],
		"sphere_car": [],
		"point_noir": [],
		"sphere_orange": [],
		"text_mode1": [],
		"text_mode2": [],
		"text_mode3": {},
		"sphere_p1": {},
		"line_p1": {},
		"text_p1": {},
	};
	for (i = 0; i < 64; i++) {
		objet["sphere_big"][i] = new THREE.Mesh( sphere_big, material );
		objet["sphere_big"][i].renderOrder = 2;
		objet_is_disp["sphere_big"][i] = 0;
		objet["sphere_car"][i] = new THREE.Mesh( sphere_car, material );
		objet["sphere_car"][i].renderOrder = 1;
		objet_is_disp["sphere_car"][i] = 0;
		objet["point_noir"][i] = new THREE.Mesh( point_noir, material );
		objet_is_disp["point_noir"][i] = 0;
		objet["anneau"][i] = new THREE.Mesh( anneau, material );
		objet["anneau"][i].rotation.x = -Math.PI / 2;
		objet_is_disp["anneau"][i] = 0;
		objet["anneau_small"][i] = new THREE.Mesh( anneau_small, material );
		objet["anneau_small"][i].rotation.x = -Math.PI / 2;
		objet_is_disp["anneau_small"][i] = 0;
		objet["sphere_orange"][i] = new THREE.Mesh( sphere_orange, material );
		objet["sphere_orange"][i].renderOrder = 2;
		objet_is_disp["sphere_orange"][i] = 0;

		objet_is_disp["text_mode1"][i] = 0;
		objet_is_disp["text_mode2"][i] = 0;
	}


	// on ajoute une lumière blanche
	var lumiere = new THREE.DirectionalLight( 0xffffff, 1 );
	lumiere.position.set( 1000, 500, 300 );
	//lumiere.castShadow = true;
	scene.add( lumiere );
	var lumiere2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	lumiere2.position.set( -1000, 200, 0 );
	//lumiere2.castShadow = true;
	scene.add( lumiere2 );

	var lumiere3 = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( lumiere3 );

	//Set up shadow properties for the light
	/*lumiere.shadow.mapSize.width = 1024;  // default
	lumiere.shadow.mapSize.height = 1024; // default
	lumiere.shadow.camera.near = 0.5;       // default
	lumiere.shadow.camera.far = 10000;      // default*/

	if (trackmap_antialias != 0) {
		renderer = new THREE.WebGLRenderer( { antialias: true , alpha: true } );
	} else {
		renderer = new THREE.WebGLRenderer( { antialias: false , alpha: true } );
	}

	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement);

	//controls.maxPolarAngle = Math.PI / 2;
	//controls.enableZoom = true;

	//renderer.shadowMap.enabled = true;
	//renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	renderer.setSize( window_innerWidth, window_innerHeight);
	document.getElementById("rendu3D").appendChild( renderer.domElement );

	/*container = document.createElement( 'div' );
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );
	stats = new Stats();
	container.appendChild( stats.dom );*/

	//clock = new THREE.Clock();

	loader = new THREE.FontLoader();  // On prépare le loader pour les textes
}

function animate() {
	mon_animation = requestAnimationFrame( animate );
	animate_started = 1;
	render();
	//stats.update();
}


function render() {

	// On empêche la caméra d'aller sous le niveau 0.
	//if (trackmap_loaded == 1) {
		var centerPosition = controls.target.clone();
		centerPosition.y = 0;
		var groundPosition = camera.position.clone();
		groundPosition.y = 0;
		var d = (centerPosition.distanceTo(groundPosition));
		var origin = new THREE.Vector2(controls.target.y,0);
		var remote = new THREE.Vector2(0,d); // replace 0 with raycasted ground altitude
		var angleRadians = Math.atan2(remote.y - origin.y, remote.x - origin.x);
		controls.maxPolarAngle = angleRadians;
	//}

	renderer.render( scene, camera );

}


// Display the datas contained in text variable
function update_datas(text) {

    if (text != -1) {
        text_header_= text.split("??");
        text_header = text_header_[0];
    }
    else {
        text_header = ""
    }

    //if (text != -1 && text != "-2" && text != "-3") {
    if (text != -1 && text_header != "-2" && text_header != "-3") {

        //if (donnees_defined)
        //    text="interpol"

        //if (text != "interpol") {
            donnees_new = JSON.parse(text);

            for (nom in var_sent_every_second) {
                if (donnees_new[nom] != undefined) {
                    save_donnees_new[nom] = donnees_new[nom];
                } else {
                    donnees_new[nom] = save_donnees_new[nom];
                }
            }

            decalage = (parseInt(Date.now()/1000) - donnees_new.tstamp);

            //if (donnees_defined) {
            if ((decalage > 60) || ((donnees_defined) && (donnees_new.styp == type_session) && (donnees_new.sname == name_session) && (donnees_new.sn == sessionnum) && (donnees_new.sid == sessionid))) {     // If we are still in the same session, we don't delete the old datas
            //if ((donnees_defined) && (donnees_new.styp == type_session) && (donnees_new.sn == sessionnum) && (donnees_new.sid == sessionid)) {     // If we are still in the same session, we don't delete the old datas
            //if ((donnees_new.typ == 1) || ((donnees_defined) && (donnees_new.styp == type_session) && (donnees_new.sn == sessionnum) && (donnees_new.sid == sessionid))) {     // If we are still in the same session, we don't delete the old datas
                $.extend(true, donnees, donnees_new);     // Merge donnees_new into donnees, recursively

				change_classid(donnees);

            } else {

                load_track_data = 1;
                console.log("New session, we are reloading init session data ...");

                sessionnum = donnees_new.sn;
                sessionid = donnees_new.sid;
                type_session = donnees_new.styp;
	            name_session = donnees_new.sname;
                donnees = JSON.parse(text);
                donnees_defined = 1;
                if (broadcast == 0) {
                    //ws.send("send_statics");    // we want to collect the statics datas (name, num, ir)
                    ws.send("11");
                }
                if (broadcast == 1) {
                    ws3.send("11");
                }
            }
        //}

        selected_idxjs = donnees.c;

        if (donnees_new.trackname != undefined)
            trackname_new = donnees_new.trackname;
        else
            trackname_new = trackname;

        if (trackname_new != trackname && trackname != "init") {
            console.log("Chargement du nouveau circuit ...");
            //ws.send("Chargement du nouveau circuit : nouveau = '" + trackname_new +"' ancien = '"+trackname+"'");
            //location.reload();
            // On efface les anciens virages
            donnees.turn_num = donnees_new.turn_num;
            donnees.turn_ldp = donnees_new.turn_ldp;
            donnees.turn_side = donnees_new.turn_side;
            donnees.turn_info = donnees_new.turn_info;
			// Permet de savoir qu'il faudra charger aussi les infos de camera du nouveau circuit
			trackmap_loaded = 0;
			// On dessine le circuit à la bonne taille
			draw_track("#ffffff", 1, 1, 1);
        }
        if (trackname_new != trackname && trackname == "init") {
            console.log("Chargement du circuit ...");
			// Permet de savoir qu'il faudra charger aussi les infos de camera du nouveau circuit
			trackmap_loaded = 0;
			// On dessine le circuit à la bonne taille
			draw_track("#ffffff", 1, 1, 1);
        }
        if (trackname_new != undefined)
            trackname = trackname_new;

        // Si la trackmap a changée on demande au serveur de nous envoyer les données
        if (donnees.stm != send_trackmap_nbrequest) {
            if (broadcast == 0) {
                ws.send("11");
                //ws.send("send_statics");
                //location.reload();
            } else if (broadcast == 1) {
                ws3.send("11");
            }
            send_trackmap_nbrequest = donnees.stm
        }

        // Dès qu'on reçoit toutes les données on dessine le circuit
        if (donnees_new.typ == 11) {
			// On redessine le circuit à la bonne taille
			//console.log("Track updated");
			draw_track("#ffffff", 1, 1, 1);
		}

        if (donnees.pro_v == 1 || donnees.try_v == 1 || donnees.pro_v == undefined) { // On affiche la trackmap que pour les utilisateurs possédant une licence pro
            trackmap();
            //document.getElementById("buy_paypal").style.display = "none";
        }
        if (donnees.pro_v <= 0 && donnees.try_v == 0) { // On affiche le bouton BUY de Paypal
			//document.getElementById("buy_paypal").style.display = "block";
		}

    //} else if (text == "-3") {
    } else if (text_header == "-3") {
        trackname = "none";  // utile pour savoir qu'il faudra recharger la page si c'est la première fois qu'on charge un circuit
    }


    if (text_header == "-3" || text_header == "-2") {
        send_config = JSON.parse(text_header_[1]);
    } else {
        send_config = donnees_new.s_c;
    }

    // Changement de configuration
    window_shortname = get_window_shortname(window_name);
    if (send_config != undefined && window_shortname in send_config) {
        send_config = send_config[window_shortname];
    } else {
        send_config = {};
    }
    if (send_config != undefined && broadcast <= 1 && text != -1) {
        if ("tstamp" in send_config) {
            if (send_config_tstamp != send_config.tstamp && send_config != "") {
                send_config_tstamp = send_config.tstamp;
                //console.log(send_config);
                change_config(send_config);
            }
        }
    }


}





/*
function ajouter_plan_color(scene, x, y, z, w, h, color) {
	var geometry = new THREE.PlaneGeometry( w, h);
	//var material = new THREE.MeshLambertMaterial( { color: color, side: THREE.DoubleSide, wireframe: false } );
	var material = new THREE.MeshBasicMaterial( { color: color, side: THREE.DoubleSide, wireframe: false } );
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(x, y, z);
	scene.add( mesh );
	return mesh;
}

function ajouter_plan_texture(scene, x, y, z, w, h, img) {
	var geometry = new THREE.PlaneGeometry( w, h);
	var texloader = new THREE.TextureLoader();
	var tex=texloader.load(img);
	//var material = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide });
	var material = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(x, y, z);
	scene.add( mesh );
	return mesh;
}

function dessine_ecrans() {
	ecran_centre = ajouter_plan_color(scene, 0, 0, -distance_vue, largeur_sans_bords, largeur_sans_bords*ratio_y/ratio_x, 0x0088ff);
	x = -largeur_avec_bords/2-largeur_avec_bords/2*Math.cos(Math.PI*angle_ecrans/180);
	z = -distance_vue+largeur_avec_bords/2*Math.sin(Math.PI*angle_ecrans/180)
	ecran_gauche = ajouter_plan_color(scene, x, 0, z, largeur_sans_bords, largeur_sans_bords*ratio_y/ratio_x, 0x0088ff)
	ecran_gauche.rotation.y += Math.PI*angle_ecrans/180;
	ecran_droite = ajouter_plan_color(scene, -x, 0, z, largeur_sans_bords, largeur_sans_bords*ratio_y/ratio_x, 0x0088ff)
	ecran_droite.rotation.y += -Math.PI*angle_ecrans/180;
}

function dessine_panneaux() {
	a = largeur_sans_bords;
	b = largeur_avec_bords;

	couleur_panneaux = 0x332233;

	x = -(a+b)/4;
	y = 0;
	z = -distance_vue;
	w = (b-a)/2;
	h = 2000;
	panneau_centre_left = ajouter_plan_color(scene, x, y, z, w, h, couleur_panneaux);
	panneau_centre_right = ajouter_plan_color(scene, -x, y, z, w, h, couleur_panneaux);

	x = 0;
	y = (a*ratio_y/ratio_x+2000)/4;
	z = -distance_vue;
	w = a;
	h = (2000-a*ratio_y/ratio_x)/2;
	panneau_centre_top = ajouter_plan_color(scene, x, y, z, w, h, couleur_panneaux);
	panneau_centre_bottom = ajouter_plan_color(scene, x, -y, z, w, h, couleur_panneaux);


	d = b/2;
	x = -b/2 - d*Math.cos(Math.PI*angle_ecrans/180);
	y = (a*ratio_y/ratio_x+2000)/4;
	z = -distance_vue+d*Math.sin(Math.PI*angle_ecrans/180);
	w = a;
	h = (2000-a*ratio_y/ratio_x)/2;
	panneau_gauche_top = ajouter_plan_color(scene, x, y, z, w, h, couleur_panneaux);
	panneau_gauche_top.rotation.y += Math.PI*angle_ecrans/180;
	panneau_gauche_bottom = ajouter_plan_color(scene, x, -y, z, w, h, couleur_panneaux);
	panneau_gauche_bottom.rotation.y += Math.PI*angle_ecrans/180;
	panneau_droite_top = ajouter_plan_color(scene, -x, y, z, w, h, couleur_panneaux);
	panneau_droite_top.rotation.y += -Math.PI*angle_ecrans/180;
	panneau_droite_bottom = ajouter_plan_color(scene, -x, -y, z, w, h, couleur_panneaux);
	panneau_droite_bottom.rotation.y += -Math.PI*angle_ecrans/180;


	d = (a+b)/4 + b/2 + 500;
	x = -b/2 - d*Math.cos(Math.PI*angle_ecrans/180);
	y = 0;
	z = -distance_vue+d*Math.sin(Math.PI*angle_ecrans/180);
	w = (b-a)/2 + 1000;
	h = 2000;
	panneau_gauche_left = ajouter_plan_color(scene, x, y, z, w, h, couleur_panneaux);
	panneau_gauche_left.rotation.y += Math.PI*angle_ecrans/180;
	panneau_droite_right = ajouter_plan_color(scene, -x, y, z, w, h, couleur_panneaux);
	panneau_droite_right.rotation.y += -Math.PI*angle_ecrans/180;

	d = (b-a)/4;
	x = -b/2 - d*Math.cos(Math.PI*angle_ecrans/180);
	y = 0;
	z = -distance_vue+d*Math.sin(Math.PI*angle_ecrans/180);
	w = (b-a)/2;
	h = 2000;
	panneau_gauche_right = ajouter_plan_color(scene, x, y, z, w, h, couleur_panneaux);
	panneau_gauche_right.rotation.y += Math.PI*angle_ecrans/180;
	panneau_droite_left = ajouter_plan_color(scene, -x, y, z, w, h, couleur_panneaux);
	panneau_droite_left.rotation.y += -Math.PI*angle_ecrans/180;

}

function supprimer_ecrans() {
	scene.remove(ecran_centre);
	scene.remove(ecran_gauche);
	scene.remove(ecran_droite);
}

function supprimer_panneaux() {
	scene.remove(panneau_centre_left);
	scene.remove(panneau_centre_right);
	scene.remove(panneau_centre_top);
	scene.remove(panneau_centre_bottom);
	scene.remove(panneau_gauche_left);
	scene.remove(panneau_gauche_right);
	scene.remove(panneau_gauche_top);
	scene.remove(panneau_gauche_bottom);
	scene.remove(panneau_droite_left);
	scene.remove(panneau_droite_right);
	scene.remove(panneau_droite_top);
	scene.remove(panneau_droite_bottom);
}

function recalculer() {
	recupere_valeurs_input();

	//supprimer_ecrans();
	supprimer_panneaux();

	//dessine_ecrans();
	dessine_panneaux();

}

*/