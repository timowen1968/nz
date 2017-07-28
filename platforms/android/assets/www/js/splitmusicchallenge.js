/**
 * Created by Tim on 3/9/16.
 */
TESTNUMBER = 10;
var totalCorrect = 0;
var duration = 1500;
var points = 0
var best_score = 0;
var average_percent = 0;
var overall_score = 0;
var rank = 100;
var beenWarned = "false";
var f;
var focusfield; // Workaround for focus on iOS
var randomNumber = 0;

var rank = "BAMBI"; // CHUCK NORRIS, BATMAN, TIM  depends on points
var next = 0;
var store = [0,0,0,0,0,0,0,0,0,0]; // stores timeframe for each track
var trackIds = [] // Stores the track_id for each song
var track_score = [0,0,0,0,0,0,0,0,0,0] // store score per track
var numberReady = [0,0,0,0,0,0,0,0,0,0] // To check when all tracks are ready to play
var answerlist = [];
var playFull = "false"
var storePlayingFull = -1;
var showedPlayAllMessage = "false";
var user = "";
var showSplash = "true";
var consecutivePresses = 0;
var letterCount = 0;
var coinAudio;


$(document).ready(function(){
    $("#splash").center();
    var bits = window.location.href.split("?");
    var parms = "";
    if (bits.length > 1){
        parms="?" + bits[1];
    }
    // $.get("http://localhost:8080/www/splitmusicchallengemobi.php" + parms, function (data)
    $.get("http://www.oursort.co.za/splitmusicchallenge/splitmusicchallengemobi.php" + parms, function (data)
    {
        var prep = data.replace(/REPMES/g, "title='Replay this snippet. It will cost you points, though' " +
           " type='button' class='smooth' disabled><img style='padding:0' src='img/replay.jpg' height=15></button>")

        prep = prep.replace(/AUDSRC/g,
            "oncanplaythrough='setSnippet(this)' preload='auto' src=\"http://www.oursort.co.za/splitmusicchallenge/");

        $("#serverData").html(prep);

        $("audio").load();
        // Mute all the audio
        $("audio").prop("muted", "true");

        // $("input")[0].focus();
        f = document.forms[0];
        var inputs = document.getElementsByTagName("input");
        inputs[0].focus();

        coinAudio = document.getElementById("coinAudio");
        if(f.test.value != "") showSplash = "false";
        if(showSplash == "false"){
        $("#splash").hide();
        $("#page").show();
    }

    beenWarned = getCookie("been_warned");
    if (beenWarned == ""){
        beenWarned = "false";
    }

    overall_score = getTotalPoints();

    refreshTotalScore();
    showPoints();

    $("#reportMistake").click(function(){
        $("#reportProblem").center().fadeIn(1000);
        $("#errorResult").html("");
        $("#songError").focus();
        return false;
    });
    $("#showAbout").click(function(){
        $("#about").center().fadeIn(1000);
        return false;
    });
    $("#ajaxResult").load("http://www.oursort.co.za/splitmusicchallenge/ajax.php", { option: "updateSelected", tracks: f.selectedRows.value},
        function(){  }) ;

    coinAudio.load();
    // $(coinAudio).bind("ended", function() { alert("ended")})
    })

});

function refreshTotalScore(){
    document.getElementById("pointsTD").innerHTML = "Total Score: " + overall_score + "<br>Level: " + rank;
}
function getTotalPoints(){
    if(user == ""){
        found = getCookie("overall_score");
        if(found == ""){
            return 0;
        }
        return found;

    }
}
function audioReady(){
    var okay = 0;
    for(var i = 0; i<numberReady.length; i++){
        okay+= numberReady[i];
    }
    return okay == 10;
}
function countReady(){
    var okay = 0;
    for(var i = 0; i<numberReady.length; i++){
        okay+= numberReady[i];
    }
    return okay;
}

function setFocus(field){
    if((typeof field) == "object"){
        focusfield = field.id;
    }else {
        focusfield = field;
    }
    alert(focusfield);
    fakeClick(function(){ f.focushere.click() });
}

function checkSong(e, ev){
    ev = ev || window.event;
    var charCode = ev.keyCode || ev.which;

    // Tab and shift must do nothing
    if(charCode == 9 || charCode == 16 || charCode == 13) return false;

    bits=e.name.split("_");
    var number = bits[1];

    // Get all the fields in the name of the song and artist
    var es = document.getElementsByName(randomNumber + "~answer_" + number);

    // To prevent random guessing of 1 letter after another
    // if(charCode == 8){
    //     if(consecutivePresses >= 5){
    //         alert("I know what you're doing and I won't have it. Deducting 50 points.")
    //         points-=50;
    //         showPoints();
    //         consecutivePresses = 0;
    //         letterCount = 0;
    //         return;
    //     }
    //     if(letterCount == 1){
    //         consecutivePresses++;
    //     }
    //     letterCount = 0;
    // }else{
    //     letterCount++;
    // }
    // If backspace go to previous field if there is one

    if(charCode == 8 && e.value == "" && (typeof(e.oldvalue) == "undefined" || e.oldvalue == "")){

        alert(charCode)
        var keepLooping = "false";
        for(var i=es.length-1; i>0; i--){
            if(e == es[i] || keepLooping == "true"){
                if(es[i-1].disabled == false) {
                    fakeClick(function() { setFocus(es[i-1]) });
                    break;
                }
                keepLooping = "true";
            }
        }
    }

    e.oldvalue = e.value;
    var correct = 0;

    // Loop through all fields in answer
    var loopagain = true;
    var indexOfCurrent = 0;
    var total = 0;
    for (var i=0; i<answerlist[number-1].length; i++){
        total += answerlist[number-1][i].length;
    }
// Loop through each field for song
    deductPoints(track_score[number-1]);
    for(var i=0; i<es.length; i++){
        if(e == es[i]){
            indexOfCurrent = i;
        }
        // loop through characters in each field in answer

        // number is the track number - need to subtract 1 for the array
        // i is the field number starting at 0
        // ii is the character in the field
        // debug(es[i].value.toUpperCase() + " = " +answerlist[number-1][i].toUpperCase());
        if(es[i].value.toUpperCase() == answerlist[number-1][i].toUpperCase()) {
            for (var ii = 0; (ii < es[i].value.length && ii < answerlist[number - 1][i].length); ii++) {
                if (es[i].value[ii].toUpperCase() == answerlist[number - 1][i][ii].toUpperCase()) {
                    correct++;
                }
            }
        }
    }

    // If correct answer automatically focus on next field
    if(es[indexOfCurrent].value.toUpperCase() == answerlist[number-1][indexOfCurrent].toUpperCase()){
        // Correct, so make it green and disable it
        es[indexOfCurrent].disabled = true;
        es[indexOfCurrent].style.background = "lightgreen"
        if(indexOfCurrent < (es.length -1)){
            // Because AND is automatically filled in, we need to skip fields with AND in them
            if(es[indexOfCurrent+1].value == "&"){
                es[indexOfCurrent+1].style.background = "lightgreen"
                es[indexOfCurrent+2].focus();
            }else {
                es[indexOfCurrent + 1].focus();
            }
            es[indexOfCurrent].value = answerlist[number-1][indexOfCurrent].toUpperCase();
        }else if(number < 10){
            setFocus(document.getElementsByName(randomNumber + "~answer_" + (number*1+1*1))[0]);
        }
    }
    var scoreForSong = Math.ceil(correct / total * 100);
    if (scoreForSong >= 100){
        scoreForSong = 100;
        for(var i=0; i<es.length; i++){
            es[i].disabled = true;
        }
        if (number != 10){
            setFocus(document.getElementsByName(randomNumber + "~answer_" + (number*1+1*1))[0]);
        }
        totalCorrect++;
        $("#ajaxResult").load("http://www.oursort.co.za/splitmusicchallenge/ajax.php", { option: "updatePopular", track: trackIds[(number*1-1*1)], trackNo: number},
            function(){  }) ;
        addPoints(100);
    }
    track_score[number-1] = scoreForSong;
    addPoints(track_score[number-1]);

    // document.getElementById("mark_" + number).innerHTML = scoreForSong + "% " + correct;
    
    // Fix the overall_score
    if (totalCorrect == 10){
        points += 1000;
        alert("Congratulations! You got it.")
        document.getElementById("surrender_all").style.display = "none";
        document.getElementById("getNext").style.display = "inline";

    }
    showPoints();

}


function stopPlay(track){
    var audio = document.getElementById("snip" + track);
    audio.pause();
    audio.currentTime = 0;
}


function getCookie(name){
    var name = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
function addCookie(cname, cvalue){
    try {
        var d = new Date();
        d.setFullYear(2116);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
        // document.getElementById("debug").innerHTML = "";
        debug("document.cookie = " + cname + " =" + cvalue + "; " + expires);
        // time() + (10 * 365 * 24 * 60 * 60)
    }catch (e){
        document.getElementById("debug").innerHTML = "";
        debug("AddCookie error " + e);
    }
}

function nextSnippet(track){
    if(document.forms[0].test.value != "true") {
        $("button").prop("disabled", true);
    }else{
        $("button").prop("disabled", false);
    }
    $('button[name=focushere]').prop("disabled", false);
    $("select").prop("disabled", true);

    // If number provided, replay the snippet for a song, or the whole snippet
    if(typeof(track) == "number"){
        if(track == 0){
            next = 0;
        }else{
            // Just this one song
            var audio = document.getElementById("snip" + track);
            audio.currentTime = store["snip" + next];
            audio.muted = false;
            audio.play();
            setTimeout(stopPlay, duration, track);
        }
    }
    // Stop at the end of the playlist
    if(next == 10) {
        var audio = document.getElementById("snip10");
        audio.pause();
        audio.currentTime = 0;
        document.getElementById("row10").style.background = "";

        //$(".disableDiv").visible();
        //$("input").prop('disabled', false);
        $("button").prop("disabled", false);
        $("select").prop("disabled", false);
        setFocus($("input")[0]);
        return;
    }
    var snippy = store[next];
    next++;

    document.getElementById("snip" + next).currentTime = snippy;
    if(next > 1){
        stopPlay(next-1);
        document.getElementById("row" + (next-1)).style.background = "";
    }
    var audio = document.getElementById("snip" + next);
    audio.muted = false;
    audio.play();
    document.getElementById("row" + (next)).style.background = "#69C0A0";

    setTimeout(nextSnippet, duration);
}

function oops(){
    for(i=0; i<store.length;i++) {
        if (store[i] == 0) { // already loaded this one
            debug(i + " " + document.getElementsByTagName("audio")[i].src)
        }
    }
    return false;
}

// Called by onplay on the audio tag
// Chooses the snippet to play and stores it on store[]
// Then calls monitorLoad
function setSnippet(e){
    var index = e.id.substr(4);
    index = index - 1;
    if(store[index] != 0){ // A snippet has already been generated for this one
        return;
    }
    // Wait until it is ready
    if(e.readyState != 4){
        console.log("Wasting time - readystate " + e.readyState);
        setTimeout(setSnippet, 100, e);
        return;
    }

    // console.log("added snippet for " + e.id);
    // Generate a time snippet and store it
    random = Math.random();
    var snippy = Math.floor(random * (e.duration - 6))+2; // Need to make sure we have enough seconds to play

    // A duration this small indicates the file is invalid
    if(e.duration < 30) {
        debug(e.id.substr(4) + " SIZE PROBLEM setSnippet " + random + " * (" + (e.duration) + " - 20) + 15 = " + snippy + " " + e.src);
    }
    store[index] = snippy;
    setTimeout(monitorLoad, 500, e); // Give it a second to begin buffering
}

// Monitors the buffer until the selected snippet is in one of the ranges
function monitorLoad(e){
    var index = e.id.substr(4);
    index = index - 1;
    // If this one is ready, skip it
    if(numberReady[index] == 1){
        return;
    }
    console.log("Have buffer for " + e.id);
    var buffLen = e.buffered.length;
    // Wait for the buffer to have contents
    var count=0;
    // Give the buffer time to load
    while(buffLen <= 0 && count < 100){
        // debug("Buffer length = " + buffLen + " for " + e.id.substr(4) + " " + count);

        count++;
        buffLen = e.buffered.length;
    }
    // Should have started by now. If not there is a problem, so try reseting the audio tag
    if(count >= 100) {
        console.log(e.id + " Buffering problem " + buffLen);
        debug(e.id + " Buffering problem " + buffLen);
        e.saveSrc = e.src;
        // setTimeout(resetSrc, 2000, e);
        return;
    }
    // If the snippet we need has been buffered, then release it
    var min = store[index] - 1; // 1 second back for safety
    var max = (store[index] + 4) * 1 // 4 seconds ahead to give room to play
    var buffercount=0;
    while(buffercount++ < 100) {
        for (i = 0; i < buffLen; i++) {
            if (e.buffered.start(i) <= min && e.buffered.end(i) >= max) {
                e.pause();

                numberReady[index] = 1;
                $("#splash").html("Loading songs: " + (countReady() / 10 * 100) + "%");
                if (document.getElementsByName(randomNumber + "~answer_" + e.id.substr(4))[0].value == "Bonus") {
                    addPoints(1000);
                    store[index] = 0;
                }

                // All loaded? Start the game!
                if (audioReady()) {
                    nextSnippet();
                    $("#splash").hide();
                    $("#page").show();
                }

                return;
            }
        }
        // console.log("Buffering count " + buffercount);
    }
// Only happens in Safari
// Sometimes the audio tag NEVER fires a canplay, in which case we remove the tag and replace it.
    console.log("Not in buffer");
    resetSrc(e);
    // console.log("Calling monitor here A")
    // setTimeout(monitorLoad, 100, e);

}

// Only happens in Safari
// Sometimes the audio tag NEVER fires a canplay, in which case we remove the tag and replace it.
// I know, right?!
function resetSrc(e){
    e.pause();
    e.load();
    i=e.id.substr(4);
    // Remove the entry in the snippet list so it will refresh
    store[i-1] = 0;
    debug("resetSrc play() "+ i);
    e.play();
}

function replayFull(){
    next = 0;
    nextSnippet(0);
}

function replay(snippet){
    if(beenWarned == "false" && playFull == "false"){
        a = confirm("Using these replay buttons will cost you points");
        beenWarned = "true";
        if (!a) return false;
        addCookie("been_warned", "true");
    }
    var e = document.getElementById("snip" + snippet);
    if(playFull == "false") {
        // e.style.display = "inline";
        deductPoints(10);
        for(i=0; i<e.buffered.length; i++) {
            // console.log(e.id + " (" + e.buffered.start(i) + "," + e.buffered.end(i) + ") = " + store[snippet -1] + " " + e.src + "     " + e.muted);
        }
        e.currentTime = store[snippet - 1]
        // e.setAttribute("muted", "false");
        // console.log("replay play() " + 1);
        e.play();
        setTimeout(function () {
            e.pause()}, duration );
    }else{
        // Game over and user has requested to play the full song

        // If a track is already playing, stop it
        if(storePlayingFull != -1){
            e.pause();
        }
        if(storePlayingFull == snippet) return;
        e.currentTime = 0;
        // console.log("replay play()" + 2);
        e.play();
        storePlayingFull = snippet;
    }

}

function showPoints(){
    document.getElementById("score").innerHTML = points;
}

function deductPoints(number){
    points -= number;
    showPoints();
}
function addPoints(number){
    points += number;
    showPoints();
}
function playAgain(){
    addCookie("overall_score", (overall_score * 1 + points));
    var pause = 0;
    if(points > 0){
        coinAudio.currentTime = 0;
        coinAudio.muted = false;
        coinAudio.play();
        pause = Math.ceil(4500/points);
    }
    debug(points);
    animateScore(pause);
    return false;
}
function animateScore(pause) {
    if (points > 0) {
        overall_score = overall_score * 1 + 1;
        points--;
        refreshTotalScore();
        showPoints();
        setTimeout(animateScore, pause, pause);
    }else{
        window.location.href = "index.html?rand=" + Math.random();
    }
}


function trapError(e, obj){
    alert("trap error " + obj.currentSrc + " " + e.code + " " +obj.error.code);
    $("#errorResult").load("http://www.oursort.co.za/splitmusicchallenge/ajax.php", { option: "logError", track: obj.id.substr(4), reason: 5,
            info: "file does not exist", timesnippet: 0, detail: "None"},
        function(){ cleanupErrorDiv() }) ;

}
function startTest(){

    audio_files = document.getElementsByTagName("audio");
    alert("(audio_files.length " +audio_files.length);
    for (var i = 0; i < audio_files.length; i++) {
        var audFile = audio_files[i];
        var clue = audFile.id;
        alert("clue " +clue);
        //document.getElementById("progress").innerHTML = "Processing " + clue;
        audFile.addEventListener("error", function(e) { trapError(e, this) } );
        //audFile.addEventListener("loadeddata", function() { alert("loaded")});
        //audFile.addEventListener("error", function(e) { document.getElementById("message").innerHTML += clue + " " + e.currentTarget.error.code + "<br>"});
        audFile.load();
    }
}

// In test mode, presents the next 10 tracks
function getNextSet(){
    f.start.value = f.start.value * 1 + ( 10 * 1);
    window.location.href="index.html?test=true&start=" + f.start.value;
    return true;
}

function surrender(e){
    fields = document.getElementsByName(randomNumber + "~answer_"+(e+1))

    for(i=0;i<fields.length;i++){
        fields[i].value = answerlist[e][i];
    }
}

function surrenderAll(e){
    for(i=1; i<=10;i++){
        fields = document.getElementsByName(randomNumber + "~answer_"+i)

        for(j=0;j<fields.length;j++){
            fields[j].value = answerlist[i-1][j];
        }
    }
    e.style.display = "none";
    document.getElementById("getNext").style.display = "inline";
    $("#loser").center().fadeToggle(1000).fadeToggle(500);
    duration = 120000;
    playFull = "true";
    // if(showedPlayAllMessage = "false") alert("Selecting the replay button next to a song will now play the full track. Click it again to make it stop if you hate it");
    showedPlayAllMessage = "true";

}
function submitError(){
    try{
        bits = f.songError.value.split("_");

        if(bits.length == 1){
            bits[1] = "-1";
        }

        var error = "false";
        f.songError.style.background = "";
        f.reasonError.style.background = "";

        //if(bits[1] < 0){
        //    error = "true";
        //    f.songError.style.background = "pink";
        //}

        if(f.reasonError.value < 0){
            error = "true";
            f.reasonError.style.background = "pink";
        }

        document.getElementById("songErrorTr").style.display = "none";
        var timeslice = -1;
        if(f.reasonError.value <= 2){

            timeslice = store[bits[0]-1];
        }
        allDetails = "";
        for (i=0; i<10; i++){
            allDetails += " " + store[i] + ":" + trackIds[i];
        }
        //console.log("error " + error + " " + timeslice);
        if(error == "true") return false;
        // Do ajax call to log the data
        //return;
        $("#errorResult").load("http://www.oursort.co.za/splitmusicchallenge/ajax.php", { option: "logError", track: bits[1], reason: f.reasonError.value,
            info: f.errorReason.value, timesnippet: timeslice, detail: allDetails},
            function(){ cleanupErrorDiv() }) ;
    }
    catch (e){
        alert ("Submiterrpr " +e);
        return false;
    }
}

function cleanupErrorDiv(){
    $("#reportProblem").fadeOut(2000);
    f.songError.value = "-1";
    f.reasonError.value = "-1";
    f.errorReason.value = "";
}

function cleanupAboutDiv(){
    $("#about").fadeOut(2000);
    f.songError.value = "-1";
    f.reasonError.value = "-1";
    f.errorReason.value = "";
}

function changeError(i){
    if (i == 1 && f.reasonError.value == -1) {
        document.getElementById("songErrorTr").style.display = "none";
        return;
    }
    if (i == 2 && f.songError.value == -1) return;
    if (i == 1){
        if(f.reasonError.value >=0 && f.reasonError.value < 3) {
            document.getElementById("songErrorTr").style.display = "inline";
        }else{
            document.getElementById("songErrorTr").style.display = "none";
        }
        if(f.reasonError.value == 4){ // Something else
            f.errorReason.focus();
        }
        return;
    }
    if (i == 2 && f.songError.value == 0) { // Not song related
    }

}
function useLifeline(e){
    if(e.value == 0) return true;
    if(e.value == 99){
        alert("You've already used up this life line");
        e.value = 0;
        return;
    }

    // replay full set of snippets - free
    if(e.value == 1){
        replayFull();

    // Play different snippet
    }else if (e.value == 3){
        deductPoints(500);

        loadSnippets();
        e[e.selectedIndex].value = "99";
        nextSnippet(0);

    // Play longer snippet
    }else if (e.value == 2){
        duration = duration * 1 + 500;
        deductPoints(Math.ceil(duration / 50));
        if(duration > 2000)
            e[e.selectedIndex].value = "99";
        nextSnippet(0);
    }
    e.value = 0;
    return;
}

function loadSnippets(){
    audio_files = document.getElementsByTagName("audio");
    for(var loopy=0; loopy<10;loopy++) {
        var e = audio_files[loopy];
        random = Math.random();
        var snippy = Math.floor(random * (e.duration - 6)) + 2; // Need to make sure we have enough seconds to play
        // A duration this small indicates the file is invalid
        if (e.duration < 30) {
            debug(e.id.substr(4) + " SIZE PROBLEM setSnippet " + random + " * (" + (e.duration) + " - 20) + 15 = " + snippy + " " + e.src);
        }
        // debug("(setSnippet) Generated snippet " + e.id + " readystate = " + e.readyState);
        store[loopy] = snippy;
    }

}
function debug(t){
    document.getElementById("debug").innerHTML += t + "<br>";
}

/**
 * Created by Tim on 3/13/16.
 */
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
            $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
            $(window).scrollLeft()) + "px");
    return this;
}
jQuery.fn.visible = function() {
    return this.css('visibility', 'visible');
};

jQuery.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};

jQuery.fn.visibilityToggle = function() {
    return this.css('visibility', function(i, visibility) {
        return (visibility == 'visible') ? 'hidden' : 'visible';
    });
};
function fakeClick(fn) {
    var $a = $('<a href="#" id="fakeClick"></a>');
    $a.bind("click", function(e) {
        e.preventDefault();
        fn();
    });

    $("body").append($a);

    var evt,
        el = $("#fakeClick").get(0);

    if (document.createEvent) {
        evt = document.createEvent("MouseEvents");
        if (evt.initMouseEvent) {
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            el.dispatchEvent(evt);
        }
    }

    $(el).remove();
}


