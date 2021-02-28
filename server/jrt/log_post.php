<?php

	// CONFIGURATION - Edit this to your needs

	// The secret must match the password that you send in the POST request
	$secret = "1234";
	
	// The path to the datajson folder that contains the data.json, trackdata.json, events.json, etc
	$datadir = "datajson";
	
	// END OF CONFIGURATION - Do not edit unless you understand what it does
	

	// Read json POST data
	$json_string = file_get_contents("php://input");
	//echo "Received json: " . $json_string . "\n";
	
	// Parse
	$json = json_decode($json_string, true);		
	$password = $json["password"];
	
	// Check password
	if($password !== $secret) {
		// Password incorrect. Do not make this known, just exit.
		echo "BROADCAST ERROR : Incorrect log_post.php password";
		die();
	}
	else {
	
		// Check which type of data update this is
		$update_type = $json["type"];
		
		if ($update_type === "log_data") {
			
			// Read changes sent
			$changes = urldecode(stripslashes($json["log_data"]));
			
			// Read current events
			$new_log = json_decode($changes, true);
			//$logfile = $datadir.'/'.$new_log[0]['name'];
			//$logfile = $datadir.'/log_data.json';
			//$logfile = $datadir.'/log_session_'.$new_log[0]['sessionid'].'_'.$new_log[0]['date'].'_'.$new_log[0]['sessiontype'].'_'.$new_log[0]['classname'];
			$logfile = $datadir.'/log_session_'.$new_log[0]['sessionid'].'_'.$new_log[0]['date'].'_'.$new_log[0]['sessiontype'];
			$log = read_log();

			// Apply these changes
			apply_log_changes($log, $changes);
			
			// Save back
			save_log($log);
			
			// Create liste_sessions.js file that contains the list of session number broadcasted
			create_liste_sessions();
			
		}
		else {
			//echo "Unknown update type: " . $update_type;
			die();
		}
	}
	
	
	function read_log() {
		global $logfile;
		if (file_exists($logfile)) {
			$json_string = file_get_contents($logfile);
			return json_decode($json_string, true);
		}
		else {
			return array();
		}
	}
	
	function apply_log_changes(&$log, $changes) {
		// Loop through changes
		foreach(json_decode($changes, true) as $change) {
			// Insert log
			array_unshift($log, $change);
		}
	}
	
	function save_log($log) {
		global $logfile;
		$json_string = json_encode($log);
		file_put_contents($logfile, $json_string);
	}

	function create_liste_sessions() {
		global $datadir;
		$liste = "liste_sessions = [";

		$files = scandir($datadir, 1);
		foreach($files as $filename) {
			if (substr($filename, 0, 12) == 'log_session_') {
				$liste .= '"'.substr($filename, 12).'",';
			}
		}
		
		$liste .= "]";
		file_put_contents($datadir."/liste_sessions.js", $liste);
	}
	
?>
