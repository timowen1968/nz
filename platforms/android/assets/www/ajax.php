<?php
/**
 * Created by PhpStorm.
 * User: Tim
 * Date: 3/12/16
 * Time: 11:06 PM
 */

include 'db_incl.php';
if($_POST['option'] == "logError"){
    $qry = "insert into error_reports set track_id = " . $_POST['track'] . ", reason_code = '" . $_POST['reason'] .
        "', info = '" . $_POST['info'] . "', date = now(), timeframe = " . $_POST['timesnippet'] . ", resolved = false, detail = '" . $_POST['detail'] . "'";


//    echo $qry;
    $result = $conn->multi_query($qry);
    echo "<br>Thank you for your report ";
}
if($_POST['option'] == "updateSelected"){
    $bits = mbsplit(" , ", str_replace("(", "", $_POST['tracks']));
    $qry="";
    for ($i =0; $i<10; $i++){
        $qry .= "insert into track_selected values (" . trim($bits[$i]) . ");";
    }$qry .= "update games_played set total = (total + 1);";

    $result = $conn->multi_query($qry);
    if($result < 1){
        echo $qry . ": " . $result;
    }
}

if($_POST['option'] == "updatePopular"){
    $qry = "insert into track_popular values (default," . $_POST['track'] . ")";

    $result = $conn->real_query($qry);
    echo " no " . $_POST['trackNo'] . ": " . $result;
}
?>