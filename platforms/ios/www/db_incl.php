<?php
/**
 * Created by PhpStorm.
 * User: Tim
 * Date: 2016/03/07
 * Time: 11:06 PM
 */
// set error reporting level
if (version_compare(phpversion(), '5.3.0', '>=') == 1)
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
else
    error_reporting(E_ALL & ~E_NOTICE);

$servername = "localhost";
$username = "root";
$password = "password";

// Remote
//$servername = "www.oursort.co.za";
//$username = "oursortc_remote";
//$password = "Charade007!";

// Create connection
//$conn = new mysqli($servername, $username, NULL, "oursortc_music_challenge");
$conn = new mysqli($servername, $username, NULL, "tracklist");


// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);

}
?>