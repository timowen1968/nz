<?php

// To circumvent the browsers impulse to autofill - keep changing the names
$randomNumber = rand(1,10000000);
require_once "Track.php";
// set error reporting level
if (version_compare(phpversion(), '5.3.0', '>=') == 1)
    error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
else
    error_reporting(E_ALL & ~E_NOTICE);

include 'db_incl.php';

    // Test mode on lets you move around without restriction
    $tesMode = "false";
    $controls = " style='display:none' ";
    if($_GET["test"]){
        $testMode =$_GET["test"];
        $controls = " ";
    }
    if($POST["test"] && $POST["test"] != ""){
        $controls = " ";
        $testMode =$_POST["test"];
    }
    $nextButton = "";
    $start = -1;
    if($_GET['start']) {
        $start = $_GET['start'];
    }

?>
<div id="page">
    <table class="header">
        <tr><td>Split Music Challenge</td>
            <td id="score"></td>
        </tr>
    </table>
    <div  <div</div></div>
<table style="width:400pt">
    <tr>
        <td><div id="pointsTD" style="align:right;font-size:15pt"></div></td>
        <td valign="top" align="left" style="text-align: right; width:5%">
            <select name="lifeline" onchange="useLifeline(this)">
                <option value="0">Life Lines</option>
                <option value="1">Replay</option>
                <option value="3">Different snippet</option>
                <option value="2">Longer snippet</option>
            </select>
            <br>
            <select name="lifeline" onchange="chooseDecade(this)">
                <option value="0">All Decades</option>
                <option value="1">1980's</option>
                <option value="3">1990's</option>
                <option value="2">2000's</option>
            </select>
            <br>
            <select name="lifeline" onchange="chooseGenre(this)">
                <option value="0">All Genres</option>
                <option value="1">Pop</option>
                <option value="3">Alternative</option>
                <option value="2">Electronic</option>
            </select>

        </td>
    </tr></table>
<form name="theform" autocomplete="off" method="POST">
    <button style='display:none' name="focushere" onclick='focusfield.focus(); return false;'>Click</button>

<!--    Fill in header details -->

<?php

    $tracks = array();

    // Get 10 random tracks from the between the min and max inclusively
    $qry = "select min(track_id) as minimum, max(track_id) as maximum from track_list";
    $result = $conn->query($qry);
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
//        $firstPos = $row[minimum] + $start;
//        $lastPos = $row[maximum] + $start;
        $firstPos = $row[minimum];
        $lastPos = $row[maximum];
    }
    $selectRows = "  ( ";
    $rand = "(";
    $b = 0;
    for($i=0; $i<10; $i++){
        // Avoid duplicate track
        while (strpos($selectRows, " ".$rand." ") != FALSE && $b++ < 50) {
            $rand = rand($firstPos, $lastPos);
        }
        $selectRows .= $rand . " , ";
    }
    $selectRows .= "0)";

    // To update the DB with the selections
    $qry = "select * from track_list where track_id in " . $selectRows;

//If in test mode, don't use random, use sequential
    if($testMode == "true"){
        if($start == -1) $start = $firstPos;
        $qry = "select * from track_list where track_id >= " . $start . " order by track_id limit 10";
    }

    $result = $conn->query($qry);
    if ($result->num_rows > 0) {
        $i = 0;
        while($row = $result->fetch_assoc()) {
            $tracks[++$i] = new Track($row);
            echo "<div id='audioDiv" . $i . "'><audio controls id='snip" . $i ."' src=\"http://www.oursort.co.za/splitmusicchallenge/" . $row[filename] . "\" " .
//                "\" ></audio></div>";
                $controls . " oncanplaythrough='setSnippet(this)' preload=\"auto\"></audio></div>";
        }
    } else {
        echo $qry;
        echo "There are no songs in the DB";
        die(1);
    }

?>
<!--    The start of the sequential number if in test mode-->


<!--    Layout the input fields for each sond-->
    <table id=songsTable2 cellpadding="0" cellspacing="0">

        <tbody>
        <?php
        for($i=0; $i<10; $i++){
            // Arrays start at 0
            $songNumber = $i+1;
            echo "\n<tr id='row" . $songNumber ."'><td cellpadding=0 cellspacing=0>";
            echo "<button type=\"button\" class='smooth' disabled onclick='replay($songNumber); return false' " .
                " id=\"replay_" . $songNumber . "\" title='Replay this snippet. It will cost you points, though'>" .
                "<img style='padding:0' src='img/replay.jpg' height=15 ></button>";
            echo "<div style='white-space: nowrap; display:inline; vertical-align:top'>";

//          Layout the song title fields
            $bits = mbsplit(" ", $tracks[$songNumber]->getSongTitle());
            for($j=0; $j<sizeof($bits); $j++){
                $len = strlen($bits[$j]);
                if($tracks[$songNumber]->getSongTitle() == "Bonus Track!"){
                    echo "<input name='" . $randomNumber . "~answer_" . $songNumber . "' disabled type='text' style='width:" .
                        ($len + 2) . "ch' value='" . $bits[$j] . "'/>";
                }else{
                    echo "<input name='" . $randomNumber . "~answer_" . $songNumber . "' onkeyup='return checkSong(this, event)' type='text' style='width:" .
                        ($len + 2) . "ch' />";
                }
            }

            echo "</div> by <div style='white-space: nowrap; display:inline; vertical-align:top'>";

//          Layout the artist fields
            $bits = mbsplit(" ", $tracks[$songNumber]->getArtist());
            for($j=0; $j<sizeof($bits); $j++){
                $len = strlen($bits[$j]);
                $val = "";
                if($tracks[$songNumber]->getSongTitle() == "Bonus Track!"){
                    echo "<input name='" . $randomNumber . "~answer_" . $songNumber . "' disabled type='text' style='width:" .
                        ($len + 3) . "ch' value='" . $bits[$j] . "'/>";
                }else {
                    if (strtoupper($bits[$j]) == "AND" || $bits[$j] == "&") {
                        $val = " value='&' disabled ";
                        $len = 1;
                    }
                    echo "<input name='" . $randomNumber . "~answer_" . $songNumber . "' " . $val . " onkeyup='return checkSong(this, event)' type=text style='width:" .
                        ($len + 3) . "ch'>";
                }
            }
//            echo "<div style='display:inline' id='mark_" . $songNumber . "'></div>";
            echo "</div></td>";
//            echo "<td><button type=\"button\" class='smooth' disabled style='display:inline' onClick='surrender(" . $i . "); return false'>Give up?</button> ";
            echo "</tr>";
        }
        ?>
        </tbody>
    </table>
        <script type="text/javascript">
            <?php
                echo "randomNumber = " . $randomNumber . ";";
            for($i=0; $i<10; $i++) {
                $songNumber = $i+1;
                echo "\nanswerlist[" . $i . "] = []";

                $bits = mbsplit(" ", $tracks[$songNumber]->getSongTitle());
                for ($j = 0; $j < sizeof($bits); $j++) {
//                    $len = strlen($bits[$j]);
                    echo "\nanswerlist[" . $i . "][" . $j . "] = \"" . str_replace("", "", $bits[$j]) . "\";";
                }
                $bitsb = mbsplit(" ", $tracks[$songNumber]->getArtist());
                for ($j = 0; $j < sizeof($bitsb); $j++) {
//                    $len = strlen($bits[$j]);
                    echo "\nanswerlist[" . $i . "][" . ($j+sizeof($bits)) . "] = \"" . str_replace("AND", "&", $bitsb[$j]) . "\";";
                }
                echo "\ntrackIds[" . $i . "] = " . $tracks[$songNumber]->getTrackId();
            }
            ?>
        </script>

    <?php
    if($testMode == "true"){
        $nextButton = "<button  type=\"button\" style='display:none' onclick='return getNextSet()' id='getNext'>Next 10 Songs</button>";
    }else{
        $nextButton = "<button  type=\"button\" style='display:none'  id='getNext'
            onclick='playAgain()'>Next</button>";

    }
    ?>
    <button type="button" id='reportMistake' disabled>Report a problem</button>
    <?php echo $nextButton; ?>
    <button type="button" id='surrender_all'  disabled onclick="surrenderAll(this); return false">Give up?</button>
    <button type="button" id='Oops' onclick="oops(); return false">Oops</button>
    <br>
    <button type="button" id="showAbout">About</button>


<!--    Splash -->
<!--    Problem reporting -->
    <div id="reportProblem">
        <div id="reportHeading"><table><tr><td width="99%" style="text-align: center;color:black">Found a problem on this page?</td>
                    <td onClick="cleanupErrorDiv()"><b>X</b></td></tr></table></div>
        <div id="reportBody">Thanks for letting us know.<br>
            <table style="color:black">
                <tr><td>What's the problem?</td>
                    <td>
                        <select id="reasonError" onchange="changeError(1)">
                            <option value="-1">Select</option>
                            <option value="0">Song Title</option>
                            <option value="1">Artist</option>
                            <option value="2">Song Does not Play</option>
                            <option value="3">No songs Play</option>
                            <option value="4">Something Else</option>
                        </select>
                    </td>
                </tr>
                <tr id="songErrorTr" style="display:none">
                    <td>Please select the song with the problem:</td>
                    <td><select id="songError" onchange="changeError(2)">
                            <option value="-1">Select</option>
                        <?php
                            for($i=1; $i<=10;$i++){
                                echo "<option value='" . $i . "_" . $tracks[$i]->getTrackId() . "'>" . $i . "</option>";
                            }
                        ?>
                        </select>
                    </td></tr>
                </table>
                More Info:<br>
                <textarea  id="errorReason" rows="10" cols="50"></textarea>
            <button type="button" onclick="submitError(); return false;" style="color:black">Submit</button>
            <div id="errorResult">result</div>
        </div>
    </div>
    <div id="loser">Loser!</div>
    <input type='hidden' name='selectedRows' value='<?php echo $selectRows ?>'>
    <input type='hidden' name='test' value='<?php echo $testMode ?>'>
    <input type='hidden' value='<?php echo $start ?>' name='start'>
</form>

</div>
<div id="splash">
    Loading songs: 0%
</div>
<div id="debug" <?php echo $controls ?> > a</div>
<div id="ajaxResult"></div>
<div id="about" style="display:none">
    <div id="aboutHeading"><table><tr><td width="99%" style="text-align: center;color:black">Scoring and some disclaimers :/</td>
                <td onClick="cleanupAboutDiv()"><b>X</b></td></tr></table></div>
    <div id="aboutBody">Still need to fill this<br></div>
</div>
    <audio id='coinAudio' src='mp3/coins.mp3' loop="true" preload=""auto"></audio>


