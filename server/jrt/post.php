<?php

	// CONFIGURATION - Edit this to your needs

	// The secret must match the password that you send in the POST request
	$secret = "1234";
	
	// The path to the datajson folder that contains the data.json, trackdata.json, events.json, etc
	$datadir = "datajson";
	
	// END OF CONFIGURATION - Do not edit unless you understand what it does
	
	
	// Read json POST data
	$json_string = file_get_contents("php://input", true);
	//echo "Received json: " . $json_string . "\n";
	
	// Parse
	$json = json_decode($json_string, true);		
	$password = $json["password"];
	
	$team = $json["team"];
	$team = str_replace("#", "n", $team);
	// Set file paths
	$datafile = $datadir . "/data".$team.".json";
	$trackfile = $datadir . "/track_data".$team.".json";
	
	$is_break = 1;  // Sert à savoir si on a fini de lire tous les events

	// Check password
	if($password !== $secret) {
		// Password incorrect.
		echo "BROADCAST ERROR : Incorrect post.php password";
		//echo "Your password in JRT config is : " . $password . "\n";
		//echo "Your password in the post.php file is : " . $secret . "\n";
		die();
	}
	else {
	
		// Check which type of data update this is
		$update_type = $json["type"];
		
		if ($update_type === "data") {
		
			// Timing data update	
			// Just write json to file, overwrite existing
			$data = urldecode(stripslashes($json["data"]));				
			$result = file_put_contents($datafile, $data);
			if ($result !== false) {
				//echo "Data OK";
				die();
			}
			else {
				echo "BROADCAST ERROR : Write failed!";
				die();
			}
		}
		else if ($update_type === "track_data") {
		
			// Trackmap update
			// Just write json to file, overwrite existing
			$trackdata = urldecode(stripslashes($json["track_data"]));				
			$result = file_put_contents($trackfile, $trackdata);
			if ($result !== false) {
				//echo "Data OK";
				die();
			}
			else {
				echo "BROADCAST ERROR : Write failed!";
				die();
			}
		
		}
		else if ($update_type === "event_data") {
			
			// Event update
			// This is more complicated - the event list can get very long
			// so we receive just incremental updates, not the entire history
			// Therefore: read current events, add this update, then write back.
			
			//$eventsfile = $datadir . "/events_data".$team.".json";

			// Read changes sent
			$changes = urldecode(stripslashes($json["event_data"]));
			//echo "Changes: " . json_decode($changes);
			
			$new_events = json_decode($changes, true);

			//
			$first_id = $new_events[0]["event"]["id"];
			$last_id_saved = $first_id - 1;
			
			// Read current events
			$events = read_events();
			//echo "Events: " . json_decode($events);

			// Delete the old events data if session_time is under old session_time
			/*if ($new_events[0]["event"]["session_time"] < $events[0]["session_time"]) {
				$events = array();
			}*/
			
			//echo "***".$first_id."***";
			if ($first_id % 100 == 0) {
				$events = array();
			}
			
			$id = $first_id;
			
			// Apply these changes
			//while ($is_break == 1) {
			apply_event_changes($events, $changes);
			//echo "Events after : " . json_decode($events);
			//}

			// Save back
			save_events($events);
			
		}
		else {
			echo "BROADCAST ERROR : Unknown update type: " . $update_type;
			die();
		}
	}
	
	function read_events() {
		//global $eventsfile;
		global $first_id, $team, $datadir;
		
		$eventsfile = $datadir . "/events_data".$team."_".(floor($first_id / 100)).".json";
		
		if (file_exists($eventsfile)) {
			$json_string = file_get_contents($eventsfile);
			return json_decode($json_string, true);
		}
		else {
			return array();
		}
	}
	
	function apply_event_changes(&$events, $changes) {
		
		global $is_break, $id, $last_id_saved;
		$is_break = 0;
		
		
		foreach(json_decode($changes, true) as $change) {
			// TODO: check type of change ('Add' / 'Edit' / 'Delete') and act appropriately
			// For now: only add supported.
			//if ($change["event"]["id"] >= $id) {
			$change_type = $change["type"]; // not used for now
			
			if ($change_type === 0) {			
				// Insert event
				array_unshift($events, $change["event"]);
				// Memorise the last id saved
				$last_id_saved = $change["event"]["id"];
				//echo "*".$last_id_saved;
			}
			else if ($change_type === 1) {
				echo "Editing events not supported yet";
				die();
			}
			else if ($change_type === 2) {
				echo "Deleting events not supported yet.";
				die();
			}
			
			if ($last_id_saved % 100 == 99) {
				// Save back
				save_events($events);
				$events = array();
				$id = $last_id_saved + 1;
				//$is_break = 1;
				//break;
			}
			//}
		}
	}
	
	function save_events($events) {
		//global $eventsfile;
		global $id, $team, $datadir;
		$eventsfile = $datadir . "/events_data".$team."_".(floor($id / 100)).".json";

		//echo("Saved to ".$eventsfile);
		
		$json_string = json_encode($events);
		file_put_contents($eventsfile, $json_string);

		// On rajoute le fichier suivant pour éviter de faire planter la page html
		$eventsfile_suiv = $datadir . "/events_data".$team."_".(1 + floor($id / 100)).".json";
		$events_suiv = array();
		$json_string_suiv = json_encode($events_suiv);
		file_put_contents($eventsfile_suiv, $json_string_suiv);
		
		// On écrit les fichiers précédents au cas où ils n'existeraient pas
		$k = floor($id / 100);
		$vide = array();
		$json_vide = json_encode($vide);
		if ($k > 0) {
			for ($i = 0; $i < $k; $i++) {
				$e_file = $datadir . "/events_data".$team."_".($i).".json";
				//echo $e_file;
				if (!file_exists($e_file)) {
					file_put_contents($e_file, $json_vide);
				}
			}
		}
	}
?>
