<?php

	$secret = "1234";
	
	//$password = $_POST["password"];
	$password = filter_input(INPUT_POST, 'password');

	//print_r($_FILES);

	// Check password
	if($password !== $secret) {
		// Password incorrect.
		echo "BROADCAST ERROR : Incorrect post.php password";
		die();
	}
	else {
		if($password == $secret AND !empty($_FILES['file']['tmp_name'])) {
			move_uploaded_file($_FILES["file"]["tmp_name"], "img/".$_FILES["file"]["name"]);
		}
	}
	
?>
