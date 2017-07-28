/**
 * Created by Tim on 9/3/16.
 *
 */

// SELECT char_length(concat(`title`, ' ', `artist` )) FROM `track_list` WHERE char_length(concat(`title`, ' ', `artist` )) < 30

var VERSION = "1.1.0";
var AFFILIATE="&app=itunes&at=1000ly28";
// Debug values
var TEST = false;
var DISABLESWIPE = false;
var SHOWAUDIO = false;
var noConnection = false;
var POWEREDBY = "Powered by <img src='img/iTunes.png'>";
var chosenGenres = false;
var dataError = false;

// Reference to the form
var f;

var LIMIT = 5;

//var URL = "www.oursort.co.za";
var URL = "www.copyediting.co.nz";
var totalCorrect = 0;
var duration = 2000;
var points = 0;
var overall_score = 0;
var beenWarned = "false";
var introRun = false;
// Used in named fields to prevent browser from auto-populating
var randomNumber = Math.ceil((Math.random() * 999999999));

var rankoptions = ["BAMBI", "BAMBI'S MOM", "SUPERMAN", "CHUCK NORRIS", "BATMAN", "JEDI"];
var rank;
var numberReady = [0,0,0,0,0,0,0,0,0,0]; // To check when all tracks are ready to play
var playFull = "false";
var storePlayingFull = -1;
var showedPlayAllMessage = "false";
var user = "";
var coinAudio;
var clickAudio;
var startDate;

var fontWide = " 19pt Lucida Console";
var fontSizeWide = "19";
var fontMedium = " 18pt Lucida Console";
var fontSizeMedium = "18";
var fontNarrow = " 13pt Lucida Console";
var fontSizeNarrow = "13";


var fontSize = fontSizeMedium;
var font = fontMedium;

var mp3Url = "http://" + URL + "/splitmusicchallenge/mp3/";
var holdingPosition = 1;
var Load = [];
var Tracks = [];
var genre;
var decade;
var playInProgress = false;
var pausePlaying = false;
var playedUpTo = 0;
var levelChanged = false;
var highScore;
var isMobileDevice;
var fieldWithFocus; // Needed to blur() when swiping else screen gets messed up
var context;
var bufferLoader;
var CONCURRENTLIMIT = 4;
var viewport;
var device = "iphone";
var expect = ""; // For demo, dictates what action we are expecting from the user to continue;



function testConnection(){
    if(chosenGenres){
        if(typeof(Load[0]) == "undefined"){
            noInternet();
        }
    }
    
}
$(document).ready(function(){
                  startDate = new Date();
                  startDate.setDate(startDate.getDate() + 10)
    viewport = {
                  width  : $(window).width(),
                  height : $(window).height()
    };
    if(viewport.width > 1200){
        device = "laptop";
    } else if (viewport.width > 600){
        device = "ipad";
    }

    if(!SHOWAUDIO){ $("audio").prop("controls", false) };
    
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

    if(!isMobileDevice){
        $("#fontTR").show();
    }
    if(!navigator.onLine){
        noInternet();
        return false;
    }
    f = document.forms[0];

    setUp();
                  
    getTracks();

    if(!TEST)
    {
                  $("#infoRow11").hide();
                  $("#infoRow12").hide();
                  $("#infoRow13").hide();
    }
    
    correctAudio = document.getElementById("correctAudio");
    correctAudio.currentTime = 0;
    correctAudio.muted = false;
    correctAudio.loop = true;

    coinAudio = document.getElementById("coinAudio");
    clickAudio = document.getElementById("clickAudio");
    clickAudio.currentTime = 0;
    clickAudio.muted = false;
    clickAudio.loop = false;

    $(window).on('resize orientationChange', function(event) { handleViewport(); });


});

function getTracks(){
    console.log("getTracks [chosengenres] " + chosenGenres);
    if(!chosenGenres){
        $("#page").show();
        $("#splash").hide();

        ajaxGenres();
        return;
    }

    $.get("http://" + URL + "/splitmusicchallenge/smc.php?device=" + device + "&genre=" + f.genreList.value.replace('&', '%26') +
          "&version=" + VERSION + "&decade=" + f.decade.value + "&rand=" + Math.random(), function(data) {
          populatePage(data);  });
}

// Viewport Specific stuff
function handleViewport(chosenFont){

    if(device == "laptop") { // laptop
        if(typeof (chosenFont) != "undefined") {
            fontSize = chosenFont;
            font = fontWide.replace("15", chosenFont);
        }else {
            font = fontWide;
            fontSize = fontSizeWide;
        }
        $("#top").css("display", "none");
        $("#page").center();
        $("#header").css("font", font).css("font-size", fontSize+"pt");
        $("#optionsImg").prop("size", "20");
        $("select").css("font", font).css("font-size","10pt");
        $(".buttonTrack").css("font-size", (fontSize-3)+"pt").css("width", (chosenFont)+"pt");
        $(".buttonTrack:disabled").css("font-size", (fontSize-3)+"pt");
    }else if(device == "ipad"){  // Ipad
        if(typeof (chosenFont) != "undefined") {
            fontSize = chosenFont;
            font = fontMedium.replace("18", chosenFont);
            addCookie("font", font);
            addCookie("fontSize", fontSize);
        }else {
            font = getCookie("font");
            fontSize = getCookie("fontSize");
            if(font == ""){
                font = fontMedium;
                fontSize = fontSizeMedium;
            }
        }
        LIMIT = 10;
        $("#top").css("display", "block").css("width", viewport.width);
        $("#page").css("width","100%").css("height", "100%").css("background","url('img/musicimageipad.jpg')").css("background-size", "100%").center();
        $("#serverData").css("width", (viewport.width-80)+"px").css("position", "absolute").css("left", "40px");
        $("#header").css("font", font).css("font-size", fontSize+"pt");
//        $("#wideViewport").css("font", font).css("font-size", "");
        $("#optionsImg").prop("size", "18");
        $("select").css("font", font).css("font-size","8pt");
        $(".buttonTrack").css("font-size", (fontSize-3)+"pt").css("width", (fontSize*1+5)+"pt").css("height", (fontSize*1+5)+"pt").css("border-radius", Math.ceil((fontSize*1+9)/2) + "px");
        $(".buttonTrack:disabled").css("font-size", (fontSize-3)+"pt");
        $("select").css("font-size", (fontSize*1-3)+"pt").css("width", "50%");
        $("#subHeader").css("font", font).css("font-size", (fontSize*1+2)+"pt");
        $("#info").css("font", font).css("font-size", (fontSize*1+2)+"pt");



    }
    else{ // iPhone
        $("#page, #connection").css("background", "url('img/musicimageiphone.jpg') no-repeat").css("background-size", "100% 100%")
        $("#splash").css("background", "url('img/splashiphone.jpg') no-repeat").css("background-size", "100%")
        if(typeof (chosenFont) != "undefined") {
            fontSize = chosenFont;
            font = fontNarrow.replace("9", chosenFont);
            addCookie("font", font);
            addCookie("fontSize", fontSize);
        }else {
            font = getCookie("font");
            fontSize = getCookie("fontSize");
            if(font == ""){
                font = fontNarrow;
                fontSize = fontSizeNarrow;
                addCookie("font", font);
                addCookie("fontSize", fontSize);
            }
        }
        $("#top").css("display", "block").css("width", viewport.width);
        $("#page").css("width", viewport.width).css("height", viewport.height).css("top", "100px").center();
        $("#serverData").css("width", viewport.width);
        $("#optionsImg").prop("size", "10");
        $("select").css("font", font).css("font-size", "7pt").css("color", "black");
        $("#splash").css("font-size", "15pt");
        $(".buttonTrack").css("font-size", (fontSize)+"pt").css("width", (chosenFont*2)+"px");
        $(".buttonTrack:disabled").css("font-size", (fontSize)+"pt");
        $("select").css("font-size", (fontSize*1-3)+"pt");
        $("#wideViewport").css("font", font);

    }
    $("#pause").center();
    $("#itunesInfo").css("position","absolute").css("left", "0").css("width", (viewport.width -25) + "px").css("overflow", "hidden")
//    $("#genreInfo").css("position","absolute").css("left", "0").css("width", (viewport.width -25) + "px").css("overflow", "hidden")
    $("#genreInfo").center();
    $("#messages").css("right", viewport.width + "px").css("bottom", viewport.height + "px").css("width", "100%").css("left", "0px").css("top",(viewport.height - 50) + "px").css("position", "absolute").css("text-align", "center");

    message(11, font);
//    message(12, fontSize);
    $("select").css("background", "#455e9c").css("border", "1px solid #455e9c");
    $("#splash").css("width", viewport.width).css("height", viewport.height).css("line-height", viewport.height + "px");
    $("#winsplash").css("width", viewport.width).css("height", viewport.height).css("line-height", viewport.height + "px");
//    $("#wideViewport").css("font", font);
//    $("#subHeader").css("font", font);
    $("input").css("font-size", fontSize+"pt");
    $(".info").css("font", font);
//    $("#subHeader").css("font-size", (fontSize*1+2)+"pt");
//    $("#runIntro6").center();
    if(TEST){
        $("#page").css("background", "");
    }
    
    return viewport;
}
function refreshTotalScore(){
    document.getElementById("pointsTD").innerHTML = "Total Score: " + Math.floor(overall_score) + "<br>Level: " + rank;
}
function getTotalPoints() {
    found = getCookie("overall_score");
    if (found == "" || found == "NaN") {
        found = 0;
    }
    return getRank(found);
}
function getRank(found){
    duration = 2000;
    rank = rankoptions[0];
    if((found*1) < 10000){
        duration = 3000;
        rank = rankoptions[0];
    }else if((found*1) < 50000){
        duration = 2700;
        rank = rankoptions[1];
    }else if((found*1) < 100000){
        duration = 2400;
        rank = rankoptions[2];
    }else if((found*1) < 200000){
        rank = rankoptions[3];
    }else if((found*1) < 500000){
        rank = rankoptions[4];
    }else{
        duration = 1500;
        rank = rankoptions[5];
    }
    return found;
}
function audioReady(){
    var okay = 0;
    for(var i = 0; i<LIMIT; i++){
        okay+= numberReady[i];
    }
   return okay == LIMIT;
//      return okay == 6;
}
function checkSong(e, ev){
    fieldWithFocus = e;

    ev = ev || window.event;
    ev.preventDefault();
//    var v = e.value;
//    e.value = "aa";
    var charCode = ev.keyCode || ev.which || ev.charCode;

    // Tab and shift must do nothing
    if(charCode == 9 || charCode == 16 || charCode == 13) return false;

    bits=e.name.split("_");
    var number = bits[1];

    // Get all the fields in the name of the song and artist
    var es = document.getElementById("row" + number).getElementsByTagName("input");

    // If a key was pressed but the field was empty and is still empty, presume backspace was pressed
    if(e.value == "" && (typeof(e.oldvalue) == "undefined" || e.oldvalue == "")){
        var focusField = "";
        $("#backicon").hide();

        var foundNext = false;
        // If user presses backspace at beginning of row, check previous rows for field to focus on
        if(e == es[0]){
            for(var jj=number-1; jj>0; jj--){
                var ess = document.getElementById("row" + jj).getElementsByTagName("input");
                for(var i=ess.length-1; i>=0; i--){
                    if(ess[i].disabled == false) {
//                        $(ess[i]).focus();
                        focusField = ess[i];
                        foundNext = true;
                        break;
                    }
                }
                if(foundNext) break;
            }
        }else {
            var keepLooping = "false";
            for (var i = es.length - 1; i > 0; i--) {
                if (e == es[i] || keepLooping == "true") {
                    if (es[i - 1].disabled == false) {
//                        $(es[i - 1]).focus();
                        focusField = es[i - 1];
                        break;
                    }
                    keepLooping = "true";
                }
            }
        }
        if(focusField != ""){
            if(typeof(e.count) == "undefined" || e.count == 0){
                var rect = e.getBoundingClientRect();
                e.count = 1;
                console.log(e.count + " " + typeof(e.count));
                return;
            }else{
                e.count = 0;
                focusField.focus();
            }
            return;
        }
    }

    e.oldvalue = e.value;
    var correct = 0;

    var indexOfCurrent = 0;
    var total = 0;
    deductPoints(Tracks[number-1].score);
    for(var i=0; i<es.length; i++){
        total += Tracks[number-1].answersText[i].length;
        if(e == es[i]){
            indexOfCurrent = i;
        }
        if(es[i].value.toUpperCase() == Tracks[number-1].answersText[i].toUpperCase()) {
            correct += Tracks[number-1].answersText[i].length;
        }
    }
    // If correct answer automatically focus on next field
    var correctAnswer = Tracks[number-1].answersText[indexOfCurrent].toUpperCase();
    var entered = es[indexOfCurrent].value.toUpperCase().substr(0,correctAnswer.length);
    message(13, entered);
    if(entered == correctAnswer){
//        $(e).effect("explode", {}, 500);
        playCorrect();
        if(indexOfCurrent < (es.length -1)){
            // Focus on the next empty field on the same line
            var jj;
            for(jj=indexOfCurrent +1; jj<(es.length); jj++){
                if(!es[jj].disabled){
                    $(es[jj]).select();
                    $(es[jj]).focus();
                    break;
                }
            }
            if(jj == es.length) es[indexOfCurrent].blur();
        }else{
            es[indexOfCurrent].blur(); // Else last field on line, so hide the keyboard
        }
        // Correct, so make it green and disable it
        es[indexOfCurrent].value = Tracks[number-1].answersText[indexOfCurrent];
        es[indexOfCurrent].style.background = "#9dffc3";
        es[indexOfCurrent].disabled = true;
    }else if (entered.length >= correctAnswer.length){
//        $(e).effect("shake");
        es[indexOfCurrent].style.background = "indianred";
        es[indexOfCurrent].value = es[indexOfCurrent].value.substr(0, correctAnswer.length);
    }else{
//        es[indexOfCurrent].style.background = "#99ccff";
        es[indexOfCurrent].style.background = "#99ccff";
    }
    var scoreForSong = Math.ceil(correct / total * 100);
    if (scoreForSong >= 100){
        scoreForSong = 100;
        Tracks[number-1].score = 100;
        for(var i=0; i<es.length; i++){
            es[i].disabled = true;
        }
        // Focus on next line
//        if (number != LIMIT){
//            $(document.getElementsByName(randomNumber + "~answer_" + (number*1+1*1))[0]).focus();
//        }
        totalCorrect++;
        $("#ajaxResult").load("http://" + URL + "/splitmusicchallenge/ajax.php", { option: "updatePopular", track: Tracks[number-1].trackId},
            function(){  }) ;
        addPoints(100);
        // message(12, "Total right " + totalCorrect);
    }
    Tracks[number-1].score = scoreForSong;
    addPoints(scoreForSong);

    // Fix the overall_score
    if (totalCorrect == LIMIT){
        e.blur();
        addPoints(20000);
        $("#page").toggle('swirl',{spins:2},1000, function(){unswirl()});
        document.getElementById("surrender_all").style.display = "none";
        document.getElementById("getNext").style.display = "table";
        var numbers = document.getElementsByName("number");
        for (var i=0; i<numbers.length; i++){
            numbers[i].innerHTML = "X";
        }
        $('select[name="reasonError"]').removeAttr("disabled");
        $('select[name="songError"]').removeAttr("disabled");
        showAlbumIcons();
        $("#messages").html("<b>Click the icons to view on <img src='img/iTunes.png'></b>")

    }
    showPoints();
    return false;

}

function winsplashClicked(){
    $("#winsplash").toggle('swirl',{spins:2},1000, function() {
                           $("#page").toggle('swirl',{spins:4},1000 ) } );
}
function unswirl(){
    $("#winsplash").center().toggle('swirl',{spins:3},1000, function() { setTimeout(winsplashClicked, 1000) } );
}

function stopPlay(track){
    document.getElementById("row" + (next)).style.background = "";
    Tracks[track-1].stop();

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
    }catch (e){
        document.getElementById("debug").innerHTML = "";
    }
}

function deleteCookie(cname){
    try {
        var d = new Date();
        d.setFullYear(2000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=0; " + expires;
    }catch (e){
        document.getElementById("debug").innerHTML = "";
    }
}

function slotIn(sequence){
    
    var track = Load[sequence];
    track.fetching = 0;
//    if(sequence == 0){
//        message(13, (new Date() - startDate)/1000);
//    }
    track.percent = 90;
    var idTrack = sequence * 1 + 1;
    message(idTrack, "slotin");
    
    var hindex = idTrack - 1;
    e = track.getAudio();
    numberReady[sequence] = 1;

//    $("#infoRow" + idTrack).hide();

    var fields = track.inputSong;

    // #455e9c
    var byWord = "<bold style='color:white;font-weight:bold'>by</bold>";
    if(fields[0].value.toUpperCase() == "BONUS"){
        addPoints(1000);
        totalCorrect++;
        byWord = "";
    }
    var ename = randomNumber + "~answer_" + idTrack;
    for(var j=0; j<fields.length; j++){
        fields[j].setAttribute("name", ename);
        $("#answerContainer"+idTrack).append(fields[j]);
    }
    message(idTrack, "slotin 2");
    track.percent = 100;

    $("#answerContainer" + idTrack).html($("#answerContainer"+idTrack).html() + byWord); // byTag
    fields = track.inputArtist;
    for(var j=0; j<fields.length; j++){
        fields[j].setAttribute("name", ename);
        $("#answerContainer"+idTrack).append(fields[j]);
    }
    message(idTrack, "slotin3");
    $("#infoRow" + idTrack).hide();
    $("#row" + idTrack).show();
    var eles = document.getElementsByName(ename);
    for(j=0; j<eles.length;j++){
        eles[j].onkeyup = function(event){ checkSong(this, event) };
        eles[j].onfocus = function(event){ fieldWithFocus = this };
    }
//    $("#page").center();
    Tracks[hindex] = track;
    iTunesGetInfo(sequence);

    
}
function increasePercent(track, value, max){
    if(track == 1){
        console.log("increasePercent was:"+Load[track].percent + " add:" + value + " to max:" + max + " " + new Date());
    }
    if ((Load[track].percent + value) <= max){
     Load[track].percent += value;
        message((track*1+1*1), ""); // To update the visual %
//    }else if (Load[track].percent > max){
//        Load[track].percent = max;
    }
//    message((track*1+1), "");
}

function replayFull(){
    console.log("replayFull.playInProgress " + playInProgress + " " + playedUpTo);
    if(playInProgress) return false;
    message(13, "playedUpTo " + playedUpTo);
//    Tracks[playedUpTo].getAudio.currentTime = Tracks[playedUpTo].snippetNumber * 1 + 1;
//    if (playedUpTo == 0) playedUpTo = -1; // If we need to start at the first track;
    nextSnippet(playedUpTo*1+1);
}

function confirmWarning(response, snippet){
    if (!response) return false;
    addCookie("been_warned", "true");
    beenWarned = "true";
    replay(snippet);
}
function replay(snippet){
    if(beenWarned == "false" && playFull == "false" && introRun){
        messageUser("Using these replay buttons will cost you points", "That's ridiculous!", confirmWarning, snippet);
        return;
    }
    if(playFull == "false") {
        if(playInProgress) return false;
        if(introRun) if(!deductPoints(50)) return;
        document.getElementById("row" + (snippet)).style.background = "#455e9c";
        
        Tracks[snippet-1].play();
        playInProgress = true;
        setTimeout(function () {
            playInProgress = false;
            Tracks[snippet-1].stop();
            document.getElementById("row" + (snippet)).style.background = "";
        }, duration );
        var es = document.getElementsByName(randomNumber + "~answer_" + snippet)[0];
//        if(introRun == "true") $(es).focus();

    }else{
        // Game over and user has requested to play the full song

        fillItunesDiv(snippet - 1);
    }

}

function showPoints(){
    $("#score").html("Credits: " + Math.ceil(points));
}
function purchaseCredits(response){
    points+=500;
    showPoints();
}

function offerToPurchase(response){
    if(response){
        messageUser("Good choice! We are feeling generous today, extra credits are on us.", "", purchaseCredits);
    }
}
function deductPoints(number){
//    if((points - number) < 0){
//        messageUser("You do not have enough credits. Purchase more?", "No Thanks", offerToPurchase);
//        
//        return false;
//    }
    points -= number;
    showPoints();
    return true;
}
function addPoints(number){
    points += number;
    showPoints();
}
function playAgain(){
    runAnimate(1);
    playClick();
    addCookie("overall_score", (overall_score * 1 + points));
    if(points > highScore){ addCookie("highscore", points) };
    var pause = 0;
    if(points > 0){
        coinAudio.currentTime = 0;
        coinAudio.muted = false;
        coinAudio.play();
        var sub = points / (coinAudio.duration*10);
        sub+=20;
    }
    animateScore(sub, points, (overall_score*1+points));
    return false;
}

function playClick(){
    clickAudio.play();

}
function playCorrect(){
//    var random = Math.random();
//    var coinSnip = (random * (coinAudio.duration - 0.9)); // Need to make sure we have enough seconds to play
//    console.log("coinSnip = " + coinSnip + "/" + coinAudio.duration);
//    coinAudio.currentTime = coinSnip;
//    coinAudio.currentTime = 3.2;
//    if(coinAudio.currentTime > 3.3){
//        coinAudio.currentTime = 0.5;
//    }
    correctAudio.muted = false;
    correctAudio.play();
    setTimeout(stopPlayCorrect, 700);
}
function stopPlayCorrect(){
    correctAudio.pause();
}
function animateScore(sub, score, finalScore) {
    if (score > 0) {
        if((overall_score * 1 + sub) > finalScore){
            overall_score = finalScore;
        }else{
            overall_score = overall_score * 1 + sub;
        }
        score-=sub;
        points = score;
        refreshTotalScore();
        if (score > 0) {
            showPoints();
        }
        setTimeout(animateScore, 100, sub, score, finalScore);
    }else{
        $("#page").hide();
        $("#splash").show();
        nextGame();
    }
}

function nextGame(){
    $("#play").hide();
    $("#splash").center().show();
    window.location.href = "index.html?rand=" + Math.random();
}

function trapError(e, obj){
    $("#errorResult").load("http://" + URL + "/splitmusicchallenge/ajax.php", { option: "logError", track: obj.id.substr(4), reason: 5,
            info: "file does not exist", timesnippet: 0, detail: "None"},
        function(){ cleanupErrorDiv() }) ;

}
// In test mode, presents the next 10 tracks
function getNextSet(){
    $("#splash").html("Tuning Our Instruments").show();
    $("#play").hide();
    f.start.value = f.start.value * 1 + ( LIMIT * 1);
    window.location.href="index.html?test=true&start=" + f.start.value;
    return true;
}

function surrenderAll(e){
//    $("button").prop("disabled", true);
//    $("#backicon").prop("disabled", false);
    $("select").prop("disabled", true);
    

    document.getElementById("lifeline").disabled = true;
    if (playedUpTo != -1){
        Tracks[playedUpTo].stop();
        document.getElementById("row" + (playedUpTo*1+1*1)).style.background = "";
        document.getElementById("row" + (playedUpTo*1+1*1)).style.valign = "center";
    }
    pausePlaying=true;
    for(var i=1; i<=LIMIT;i++){
        fields = document.getElementsByName(randomNumber + "~answer_"+i)

//        $("input:text").prop("disabled", "true");
        for(var j=0;j<fields.length;j++){
            if(fields[j].value == "&" || fields[j].value.toUpperCase()  == Tracks[i-1].answersText[j].toUpperCase() ){
                $(fields[j]).css("background", "#9dffc3");
            }else{
                $(fields[j]).css("background", "indianred").css("color", "black").css("opacity", "1");
            }
            fields[j].value = Tracks[i-1].answersText[j];
            fields[j].disabled = true;
//            $(fields[j]).css("border-radius", "9px").css("color", "beige");
        }
    }
    var numbers = document.getElementsByName("number");
    for (var i=0; i<numbers.length; i++){
        numbers[i].innerHTML = "X";
    }

    showAlbumIcons();
    $("#messages").html("<b>Click the icons to view on <img src='img/iTunes.png'></b>")

    e.style.display = "none";
    document.getElementById("getNext").style.display = "table";
    // Still allow user to select decade and genre, and to report a problem
    $('select[name="decade"]').removeAttr("disabled");
    $('.genreButton').removeAttr("disabled");
    $('select[id="reasonError"]').removeAttr("disabled");
    $('select[id="songError"]').removeAttr("disabled");

    // $("#loser").center().fadeToggle(1000).fadeToggle(500);
    duration = 120000;
    playFull = "true";
    pausePlaying = true;
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

        if(f.reasonError.value < 0){
            error = "true";
            f.reasonError.style.background = "pink";
        }

        var timeslice = -1;
        if(f.reasonError.value <= 4){
            if(f.songError.value == -1){
                f.songError.style.background = "pink";
                error = "true";
            }else{
                timeslice = Tracks[bits[0]-1].timeSnippet;
            }
        }
        if(error == "true") return false;
        allDetails = "";
        for (i=0; i<LIMIT; i++){
            allDetails += " " + Tracks[i].id + ":" + Tracks[i].timeSnippet;
        }
        var cleanReason = f.errorReason.value.replace(/"/g,"").replace(/'/g,"");
        $("#errorResult").load("http://" + URL + "/splitmusicchallenge/ajax.php", { option: "logError", track: bits[1], reason: f.reasonError.value,
                info: cleanReason, timesnippet: timeslice, detail: allDetails},
            function(){ cleanupErrorDiv() }) ;
        document.getElementById("songErrorTr").style.display = "none";
    }
    catch (e){
//        alert ("Submiterrpr " +e);
        return false;
    }
}


function changeError(i){
    if (i == 1 && f.reasonError.value == -1) {
        document.getElementById("songErrorTr").style.display = "none";
        return;
    }
    if (i == 2 && f.songError.value == -1) return;
    if (i == 1){
        if(f.reasonError.value >=0 && f.reasonError.value < 5) {
            document.getElementById("songErrorTr").style.display = "table-row";
        }else{
            document.getElementById("songErrorTr").style.display = "none";
        }
        if(f.reasonError.value == 4){ // Something else
            $(f.errorReason).focus();
        }
        return;
    }
    if (i == 2 && f.songError.value == 0) { // Not song related
    }

}
function defaultCallBack(){

}
function useLifeline(e){
    if(e.value == 0) return true;
    if(e.value == 99){
        messageUser("You've already used up this life line", "", defaultCallBack);
        e.value = 0;
        return;
    }

    // replay full set of snippets - free
    if(e.value == 1){
        replayFull();

        // Play different snippet
    }else if (e.value == 3){
        if(!deductPoints(100)) return;

        loadSnippets();
        // Remove from the list of lifelines
        $(e[e.selectedIndex]).remove();
        if(playedUpTo > 0 && playedUpTo < LIMIT){
            document.getElementById("row" + (++playedUpTo)).style.background = "";
        }
        replayFull();
        //        nextSnippet(0);

        // Play longer snippet
    }else if (e.value == 2){
        if(!deductPoints(Math.ceil(duration / 25))) return;
        duration = duration * 1 + 500;
        if(duration > 4000){ // Remove from the list of lifelines
            $(e[e.selectedIndex]).remove();
        }
        if(playedUpTo > 0 && playedUpTo < LIMIT){
            document.getElementById("row" + (++playedUpTo)).style.background = "";
        }
        replayFull();
        //        nextSnippet(0);
    }
    e.selectedIndex = 0;
    return;
}

function loadSnippets(){
    console.log("snippy before " + Tracks[0].timeSnippet);
    for(var loopy=0; loopy<LIMIT;loopy++) {
        var e = Tracks[loopy].getAudio();
        random = Math.random();
        var snippy = Math.floor(random * (e.duration - 6)) + 2; // Need to make sure we have enough seconds to play
        Tracks[loopy].timeSnippet = snippy;
        e.currentTime = snippy;
    }
    console.log("snippy after " + Tracks[0].timeSnippet);
    
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


function fetchSource(url, idx){
    var i = idx;
    prefetch_file(url, function(url) { fetched(url, idx) },
                  function(pc, idx) { progress(pc, i) }, function(e,idx) { error(e, url) });
}

function populatePage(data){
    if(data.substr(0,5) == "ERROR"){
      dataError = true;
      $("#page").show();
      $("#splash").hide();
      ajaxGenres();
      return;
    }
    startDate = new Date();
    setTimeout(testConnection, 10000);

                                                      
    $("#messages").html(POWEREDBY);
    message(11, (new Date() - startDate)/1000);
    
    var audioText = "";
    var songErrorOptions = "<option value='-1'>Select</option>";
    var selectedRowsValue = "";
    var line = data.split("~~~");
        

    for (var i=10; i>LIMIT; i--){
        $("#fillerRow"+(Math.ceil(((10 - i)/2) + 0.25))).show();
    }
    
    // On Ipad, need to pad to use more of the screen
    if(device == "ipad"){
        for (var i=1; i<9; i++){
            $("#fillerRow"+i).show();
        }
    }
    
    
    for(var i=0; i<LIMIT;i++){
        var music = new Music();
        music.sequence = i;
        var snippetNumber = (i*1+1);
        
        var bits = line[i].split("~!~");
        music.trackId = bits[0];
        music.fileName = bits[1];
        music.songName = bits[2];
        music.artist = bits[3];
        music.id = "loadSnip" + snippetNumber;

        
        var audioE = document.createElement("audio");
        // Check if local file ot itunes file
        var checkDigit = music.fileName.indexOf('apple.com');
        if(checkDigit > 0){
          music.source = "http" +music.fileName;
          audioE.setAttribute("src", "http" +music.fileName);
        }else{
          audioE.setAttribute("src", mp3Url +music.fileName);
          audioE.setAttribute("type", "audio/mpeg; codecs=mp3");
          music.source = mp3Url +music.fileName;
        }
        audioE.setAttribute("id", "loadSnip" + snippetNumber);
        audioE.setAttribute("controls", true);
        audioE.setAttribute("preload", "auto");
        audioE.load();
        audioE.muted = true;
        document.getElementById("audioElements").appendChild(audioE);
        
        songErrorOptions += "<option value='" + snippetNumber + "_" + music.trackId + "'>" + snippetNumber + "</option>";
        
        Load[i] = music;
        Load[i].percent = 1;
        message((i*1+1), music.fileName);
        $("#infoRow"+(i*1+1)).css("visibility", "visible");
        setTimeout(setSnippet, 1000, i, 0);
    }
    for(var i=LIMIT;i<10; i++) {
        $("#infoRow"+(i*1+1)).hide();
    }
    
    for(var i=0; i<LIMIT;i++) {
        var music = Load[i];
        populateLoadMusicList(i, music);
        layoutAnswerGrid(i, music);
        selectedRowsValue +=  music.trackId +  " ";
    }
//    return;
    $("#songError").html(songErrorOptions);
    $("#splash").hide();
    $("#page").center();

    $("#page").show();
    
}


function layoutAnswerGrid(i, track){
    var pad = 2;
    var bits = track.songName.split(" ");
    var showValue = false;
    var value = "";
    var index = (i*1+1);
    message(index, "answer grid");
    
    if(bits[0] == "Bonus") {
        showValue = true;
    };
    for(var ii=0; ii<bits.length;ii++) {
        var newInput = document.createElement("input");
        newInput.setAttribute("type", "text");
        newInput.setAttribute("class", "track");
        $(newInput).css("font", font);
        $(newInput).css("fontSize", fontSize+"pt");
        $(newInput).css("width", getWidthOfText(bits[ii]));
        if(showValue) {
            newInput.setAttribute("value", bits[ii]);
            newInput.setAttribute("disabled", "true");
        }

        newInput.setAttribute("name", randomNumber + "_answer_" + index);
        newInput.onkeyup = function(event){ checkSong(this, event) };
        track.inputSong[ii] = newInput;
    }
    
    bits = track.artist.split(" ");
    for(var ii=0; ii<bits.length;ii++) {
        var newInput = document.createElement("input");
        newInput.setAttribute("type", "text");
        newInput.setAttribute("class", "track");
        // newInput.setAttribute("size", (bits[ii].length*1+pad) + "em");
        $(newInput).css("font", font);
        $(newInput).css("width", getWidthOfText(bits[ii]));
        if(showValue) {
            newInput.setAttribute("value", bits[ii]);
            newInput.setAttribute("disabled", "true");
        }
        if(bits[ii].trim().toUpperCase() == "AND" || bits[ii].trim() == "&"){
            newInput.setAttribute("value", "&");
            newInput.setAttribute("disabled", "true");
            bits[ii] = "&";
        }
        newInput.setAttribute("name", randomNumber + "_answer_" + index);
        newInput.onkeyup = function(event){ checkSong(this, event) };
        track.inputArtist[ii] = newInput;
    }
    return;
}
function populateLoadMusicList(i, music){
    bits = (music.songName + " " + music.artist).split(" ");
    for(var ii=0; ii<bits.length;ii++){
        music.answersText[ii] = bits[ii].trim();
    }
}
function tilt(x){
}

function noInternet(){
    noConnection = true;
    handleViewport();
    $("#splash").hide();

    $("#connection").center();
    $("#connection").show();
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);

}
function setUp(){
    var viewport = handleViewport();

    $("#splash").center();
    $("#splash").css("position", "absolute").css("top", "20px").css("bottom", "20px");
    if(!TEST) $(".buttonInfo").css("visibility", "hidden");
    $("#splash").show();
    if(device == "ipad"){  // Ipad
        $("#runIntro3").css("right", "12em");
        $("#runIntro4").css("top", "7em").css("right", "12em");
        $("#runIntro5").css("top", "9em").css("right", "12em");
//        $("#runIntro6").css("position", "absolute").css("top", (viewport.height/2-(Math.floor(0.1*viewport.height))) + "px").css("left", (Math.floor(0.2*viewport.width)) + "px").css("width", (Math.floor(0.6*viewport.width)) + "px");
    }else if(device == "iphone"){  // Ipad
        $("#runIntro3").css("right", "8em");
        $("#runIntro4").css("top", "5em").css("right", "6em");
        $("#runIntro5").css("top", "6em").css("right", "5em");
//        $("#runIntro6").center();
    }
    $("#runIntro6").center();
    

    
    // document.getElementById("splash").style.display = "block";
    getGenre();
    getDecade();
    getHighScore();

    beenWarned = getCookie("been_warned");
    if (beenWarned == ""){
        beenWarned = "false";
    }
    introRun = getCookie("intro_run");
    if (introRun == ""){
        introRun = false;
    }else{
      introRun = true;
    }
    chosenGenres = introRun;

    overall_score = getTotalPoints();

    refreshTotalScore();
    showPoints();


}

function ITunes(){
    this.image = "";
    this.artist = "";
    this.track = "";
    this.releaseDate = "";
    this.album = "";
    this.artistLink = "";
    this.trackLink = "";
    this.albumLink = "";
    this.preview = "";
    this.iconImage = "";
}
function Music() {
    this.itunesInfo = new ITunes();
    this.sequence = "";
    this.source = "";
    this.timeSnippet = 0;
    this.answersText = [];
    this.inputSong = [];
    this.inputArtist = [];
    this.id = "";
    this.fileName = "";
    this.songName = "";
    this.artist = "";
    this.score = 0;
    this.audio = "";
    this.percent = 0;
    this.history = "";
    this.audio;
    this.canPlay = 0;
    this.bufferEmpty = 0;
    this.resetCount = 0;
    this.fetching = 0;
    this.addHistory = function(h){
        this.history += "\n" + h.replace(/'"'/,"").replace(/"'"/,"");
    }

    this.getAudio = function() {
        return document.getElementById(this.id);
    }
    this.play = function(){
        this.getAudio().currentTime = this.timeSnippet;
        try{
            this.getAudio().muted = false;
            this.getAudio().play();
        }catch(e){
            console.log("play error " + e);
        }
    }
    this.stop = function(){
        this.getAudio().pause();
        this.getAudio().currentTime = this.timeSnippet;
    }
    this.playFull = function(){
        var obj = this.getAudio();
        obj = document.getElementById(this.id);
        obj.currentTime = 0;
        this.getAudio().muted = false;
        obj.play();
    }
    this.showAudioDetails = function(obj) {
        console.log("currentSrc " + obj.currentSrc);
        console.log("ended " + obj.ended);
        console.log("error " + obj.error);
        console.log("muted " + obj.muted);
        console.log("networkState " + obj.networkState);
        console.log("paused " + obj.paused);
        console.log("buffered " + obj.buffered.start(0) + " - " + obj.buffered.end(0));
        console.log("played " + obj.played.length);
        console.log("readyState " + obj.readyState);
        console.log("seeking " + obj.seeking);
        console.log("currentTime " + obj.currentTime);
        console.log("duration " + obj.duration);
    }
}
function showOptions(){
    DISABLESWIPE = !DISABLESWIPE;
    // Only disable swipe when menu is opened, nextsnippet amends it
    if(DISABLESWIPE) pausePlaying = true;
//    pausePlaying = true;
//    playInProgress = !playInProgress;
    $( "#options" ).toggle("slide", {direction:"right"}, "fast");
}
function showAbout(){
    DISABLESWIPE = true;
    $("#optionsImg").attr("disabled" , "true");
    $( "#options" ).toggle("slide", {direction:"right"}, "fast")
    $( "#about" ).toggle("slide", {direction:"left"}, "fast")
}
                                                      
function privacy(){
  DISABLESWIPE = true;
  $("#optionsImg").attr("disabled" , "true");
  $( "#options" ).toggle("slide", {direction:"right"}, "fast")
  $( "#privacy" ).toggle("slide", {direction:"left"}, "fast")
}
function showReport(){
    DISABLESWIPE = true;
    $("#optionsImg").attr("disabled" , "true");
    $( "#options" ).toggle("slide", {direction:"right"}, "fast")
    $( "#reportProblem" ).toggle("slide", {direction:"left"}, "fast")
}

function cleanupErrorDiv(){
//    $( "#options" ).toggle("slide", {direction:"right"}, "slow")
    DISABLESWIPE = false;
    pausePlaying = false;
    $("#optionsImg").removeAttr("disabled");
    $( "#reportProblem" ).toggle("slide", {direction:"left"}, "slow")
    f.songError.value = "-1";
    f.reasonError.value = "-1";
    f.errorReason.value = "";
}

function cleanupAboutDiv(){
    DISABLESWIPE = false;;
    $("#optionsImg").attr("disabled" , "false");
//    $( "#options" ).toggle("slide", {direction:"right"}, "slow")
    $( "#about" ).toggle("slide", {direction:"left"}, "slow")
}
function cleanupDiv(d){
  DISABLESWIPE = false;;
  $("#optionsImg").attr("disabled" , "false");
//    $( "#options" ).toggle("slide", {direction:"right"}, "slow")
  $( "#" + d ).toggle("slide", {direction:"left"}, "slow")
}

function runIntro(){
    if(introRun) return true;
    $("#runIntro1").css("display", "table-row");
    $("button").attr("disabled", "true");
    $("select").attr("disabled", "true");
    $("input").attr("readonly", "true");
    var classes = document.getElementsByClassName("trackTD");
    flicker(classes,0);
    return false;

}
function flicker(c,i){
    return;
    if(i > 0){
        $(c-1).css("background-image", "url('img/dimgreenplay.gif')")
    }
    if(c == 9) return;
    $(c).css("background-image", "url('img/lightgreenplay.gif')")
    setTimeout(flicker, 1000, (c, i*1+1));

}

function chooseGenre(ele){
    if(ele.value == "0"){
        deleteCookie("genre");
    }else {
        addCookie("genre", ele.value);
    }
    playAgain();
    // window.location.href = "index.html?rand=" + Math.random();
    return;
}

function getHighScore(){
    highScore = getCookie("highscore");
    if (highScore == ""){
        highScore = 0;
    }
}

function getGenre(){
    f.genreList.value = getCookie("genre");
    var c = f.genreList.value.split(",").length-1;
    if(c == 1){
      $("#specialOption").html(1 + " Genre");
    }else{
      $("#specialOption").html(c + " Genres");
    }
    f.fakeSelect.value = "3";
}

function chooseDecade(ele){
    if(ele.value == "0"){
        deleteCookie("decade");
    }else {
        addCookie("decade", ele.value);
    }
    playAgain();
    // window.location.href = "index.html?rand=" + Math.random();
    return;
}

function getDecade(){
    var decade = getCookie("decade");
    if (decade == ""){
        decade = 0;
    }
    f.decade.value = decade;
}

function getWidthOfText(text) {
    var tmp = document.createElement("span");
    tmp.className = "input-element tmp-element";
    $(tmp).css("font", fontSize + "pt Lucida Console");
    $(tmp).css("visibility", "hidden");
    tmp.innerHTML = text;
    document.body.appendChild(tmp);
    var theWidth = Math.ceil(tmp.getBoundingClientRect().width);
    message(13, " width " + theWidth + " " + text + " " + fontSize);
    document.body.removeChild(tmp);
    return theWidth + "px";
}

var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
    message(12, "touch start");
    xDown = evt.touches[0].clientX;
    yDown = evt.touches[0].clientY;
};

function handleTouchMove(evt) {
    if(DISABLESWIPE)
        return;
    if ( ! xDown || ! yDown ) {
        return;
    }

    message(12, "touch start move " + xDown);
    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 4 && (expect == "" || expect == "left")) {
            biggerFont();
        } else if ( xDiff < -4 && (expect == "" || expect == "right")) {
            smallerFont();
        }
    } else {
        if ( yDiff > 4  && (expect == "" || expect == "up")) {
            swipePause();
        } else if ( yDiff < -4  && (expect == "" || expect == "down")){
            if(noConnection){
                location.reload(true);
            }else{
                swipePlay();
            }
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
};

function swipePause(){
    if(typeof(fieldWithFocus) != "undefined") fieldWithFocus.blur();
    
    if(!introRun){
        $("#runIntro6").hide();
        setTimeout(slideSwipebox, 2000, 2);
    }
    if( !playInProgress || playedUpTo >= 9) return;
    pausePlaying = true;
    $("#pause").css("opacity", 0.0);
    $("#pause").css("display", "block");
    
    evolve(document.getElementById("pause"), 0);
}
function swipePlay(){

    if(typeof(fieldWithFocus) != "undefined"){
        fieldWithFocus.blur();
    }
    if(fieldWithFocus){
        fieldWithFocus.blur();
    }
    // If no internet connection, swipe reloads the game
    if(typeof (Tracks[0]) == "undefined"){
        // console.log("replay");
        playAgain();
        return false;
    }

    if(playInProgress || showedPlayAllMessage == "true") return;
//    message(12, document.getElementById("pause").style.display);
    if(document.getElementById("pause").style.display != "none") {
        // message(11, document.getElementById("pause").style.display);
        disolve(document.getElementById("pause"), 1);
    }
    if(!introRun){
        $("#runIntro6").hide();
        setTimeout(slideSwipebox, 1000, 1);
    }
    replayFull();
}

function disolve(ele, opac){
    // ele.style.display = "inline";
    $(ele).css("zIndex", 0);

//    $("#page").css("opacity", 1);
    if(opac > 0){
        opac -= 0.20;
        ele.style.opacity = opac;
        $("#page").css("opacity", (1-opac));
        setTimeout(disolve, 50, ele, opac);
        return;
    }
    $(ele).css("display", "none");
}
function evolve(ele, opac){
    if(opac < 1){
        opac += 0.10;
        ele.style.opacity = opac;
        $("#page").css("opacity", (1-opac));
        setTimeout(evolve, 80, ele, opac);
        return;
    }
     setTimeout(disolve,100,ele,1);
}
function biggerFont(){
    if(device == "iphone" && fontSize == "15") return;
    if(fontSize == "20") return;
    fontSize = fontSize*1+1;
//    font = fontSize;
    adjustInputSizes();
    handleViewport(fontSize);
    $("#page").center();
    if(!introRun){
        $("#runIntro6").hide();
        setTimeout(slideSwipebox, 500, 3);
    }
    
}
function smallerFont(){
    if(device == "iphone" && fontSize == "9") return;

    if(fontSize == "13") return;
    fontSize = fontSize*1-1;
    font = fontSize;
    adjustInputSizes();
    handleViewport(fontSize);
    $("#page").center();
    if(!introRun){
        $("#runIntro6").hide();
        setTimeout(slideSwipebox, 500, 4);
    }
}

function shareToTwitter(){
    var storeRank = rank;
    getRank(points * 1 + overall_score * 1);
    var message = "Can you recognise a song in just a couple of seconds? Play the Split Music Challenge and find out.";

    if (rank != storeRank) {
        message = "I've reached the level of " + rank + " on the Split Music Challenge!"
    } else if (points > highScore) {
        message = "I've reached a personal new best on the Split Music Challenge! " + points + " points."
    }

    open("https://twitter.com/home?status=" + message +
        "%26url=http%3A//" + URL + "/splitmusicchallenge/index.html");

}
function shareToFaceBook(){
}

function adjustInputSizes(){
    e = document.getElementsByTagName("input");
    var row = 0;
    var saveRow = 0;
    var field = -1;
    for(var i=0; i<e.length; i++){
        if(e[i].name.indexOf("answer") <= 0) continue;
        row = (e[i].name.split("_")[1])-1;
        if(row != saveRow) field = -1;
        field++;
        saveRow = row;
//        e[i].style.fontSize = fontSize;
        $(e[i]).css("width", getWidthOfText(Tracks[row].answersText[field]));
    }
}

                                         

function messageUser(message, cancel, callBack, parm){
    $("#alertsMessage").html(message);
    var cancelButton = "";
    if(cancel != ""){
        cancelButton = "<button class='alerts' type='button' onClick='returnInput(false, " + callBack +  ", " + parm + ")'>" + cancel + "</button>";
    }
    var okayButton = "<button class='alerts' type='button' onClick='returnInput(true, " + callBack + ", " + parm + ")'>Okay</button>";
    $("#alertsButtons").html(cancelButton + "&nbsp;&nbsp;" + okayButton);
    $("#alerts").center();
    //    $(".alerts, #alerts").show();
    $("#alerts").show();
    
}
function returnInput(response, callBack, parm){
    $("#alerts").hide();
    callBack(response, parm);

}


function message(r, mess){
    try {

        var fullmess = "";
        
        var now = new Date();
        var lapsed = ((now - startDate)/1000);
        lapsed = Math.floor(lapsed);
        var loading = "";
        if (TEST || r > LIMIT) {
//            if(lapsed > 20 && r<=10){
//                mess = "<a target=_new href='mp3/" + Load[r-1].fileName + "'>"+Load[r-1].fileName+"</a>";
//            }
          $("#info" + r).html(r + "<input type='text' class='info' size=1 value='" + r + "' style='visibility:hidden;font:" + font + "'/> " +
                              "<div class='progress'>" + mess + "</div>");
        }else{
          Load[r - 1].addHistory(mess);
          // console.log(mess);
          fullmess = Load[r - 1].history;
          
        var perc = Load[r - 1].percent;
        if(lapsed > 1){
            if(lapsed > 10 && lapsed % 2 == 0){
                loading = "";
            }else {
                loading = "";
            }
        }
        if(lapsed > 30){
          console.log("lapsed > 30 %=" + perc + " lapsed=" + lapsed + " idx=" + r + " song=" + Load[r-1].songName + " url=" + Load[r-1].source);
          // Something went wrong so abort and try again
          playAgain();
          return;
//            loading = "<a target=_new href='mp3/" + Load[r-1].fileName + "'>"+Load[r-1].fileName+"</a>";
        }
                // loading = lapsed;
//                                                      loading = perc;
        color = "#9dffc3";
        if(perc > 90){
          console.log("lapsed > 90 %=" + perc + " lapsed=" + lapsed + " idx=" + r + " song=" + Load[r-1].songName + " url=" + Load[r-1].source);
            color = "indianred";
        }
        var inside = "<table style='width:" + viewport.width + "px'><tr><td onclick='alert(\"" + Load[r-1].songName + "\")' style='color:black; width:" + perc + "%;background:" + color + ";text-align:center; display:block; overflow:hidden;white-space:nowrap'>" + loading +
          // "%;background:#455e9c;text-align:center'>" +
          "</td><td>&nbsp</td></tr></table>";
          $("#info" + r).html(inside).css("font", font).css("font-size", (fontSize*1)+"pt");;
          // if (perc < 90) {
          //     Load[r - 1].percent = perc * 1 + 10;
          // }
        }
    }catch(e){
                                                      console.log(e);
          }
          
}

function prefetch_file(url,
                       fetched_callback,
                       progress_callback,
                       error_callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    
    xhr.addEventListener("load", function () {
                         if (xhr.status === 200) {
                            var URL = window.URL || window.webkitURL;
                            var blob_url = URL.createObjectURL(xhr.response);
                            fetched_callback(blob_url);
                         } else {
                            error_callback(xhr.status, url);
                         }
                         }, false);
    
    var prev_pc = 0;
    xhr.addEventListener("progress", function(event) {
                         if (event.lengthComputable) {
                            var pc = Math.round((event.loaded / event.total) * 100);
                            if (pc != prev_pc) {
                                prev_pc = pc;
                                progress_callback(pc);
                            }
                         }
                         });
    xhr.send();
}

function error(e, url){
}
function progress(pc, idx){
    console.log(idx + " = " + pc);
}

var source1;
var source2;
function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = new Array();
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    
    var loader = this;
    
    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
                                       request.response,
                                       function(buffer) {
                                       if (!buffer) {
                                       return;
                                       }
                                       loader.bufferList[index] = buffer;
                                       if (++loader.loadCount == loader.urlList.length)
                                       loader.onload(loader.bufferList);
                                       },
                                       function(error) {
                                       console.error('request.onload: decodeAudioData error', error);
                                       }
                                       );
    }
    
    request.onerror = function() {
    }
    
    request.send();
}

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
}


function createAudios(i) {
    // Fix up prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    
    var bufferLoader = new BufferLoader(
                                    context,
                                    [
                                     Load[i].fileName,
                                     ],
                                    function() {finishedLoading(bufferList,i)}
                                    );
//    console.log("loading buffer");
    bufferLoader.load();
}

function finishedLoading(bufferList, i) {
//    console.log("finishedLoading " + i);
    return;
    // Create two sources and play them both together.
    for(var i=0; i<1; i++){
        Load[i].source = context.createBufferSource();
        Load[i].source.buffer = bufferList[i];
        Load[i].source.connect(context.destination);
    }
//    console.log("loaded");
    Load[0].source.start(0,30, 5);
}

function skipIntro(){
    if(isMobileDevice){
        DISABLESWIPE = false;
        // Listen for swipe to replay
        document.removeEventListener('touchstart', handleTouchStart, false);
        document.removeEventListener('touchmove', handleTouchMove, false);
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
        enableShake();
        $("#runIntro1").hide();
        nextBubble(6);
    }
    
}

function nextBubble(i, skip){
    $("#runIntro" +i).hide();
    if(typeof(skip) == "undefined"){
        playClick();
    }
    console.log(i);
    switch (i){
            // Use individual buttons to replay a snippet.
        case 1: replay(3);
            setTimeout(nextBubble, 6000, 2, 1);
            break;
        case 2:
//            f.lifeline.disable = false;
            $("select[name=lifeline]").removeAttr("disabled");

             $("select[name=lifeline]").prop("size", "6");
//            document.getElementById("lifeline").size = "6";
            setTimeout(nextBubble, 5000, 3, 1);
            break;
        case 3:
            setTimeout(nextBubble, 4000, 4, 1);
            break;
        case 4:
            setTimeout(nextBubble, 4000, 5, 1);
            break;
        case 5:
                                                      //f.genre.size = 0;
            if(isMobileDevice){
                DISABLESWIPE = false;
                // Listen for swipe to replay
                document.removeEventListener('touchstart', handleTouchStart, false);
                document.removeEventListener('touchmove', handleTouchMove, false);
                document.addEventListener('touchstart', handleTouchStart, false);
                document.addEventListener('touchmove', handleTouchMove, false);
                enableShake();
                slideSwipebox(0);
                break;
            }
        case 7: // Shake
            $("input").removeAttr("readonly");
            document.getElementById("answerContainer3").getElementsByTagName("INPUT")[0].focus();
            fieldWithFocus = document.getElementById("answerContainer1").getElementsByTagName("INPUT")[0];
            expect = "shake";
            break;
        case 6: // Start game
            $("input").removeAttr("readonly");
            $("select").removeAttr("disabled");
                                                      $("#fakeSelect").attr("disabled", "true");
            introRun = true;
            addCookie("intro_run", "true");
            nextSnippet(0);
            return;
            break;
    }
    i++;
    $("#runIntro" +i).css("display", "block");
    message(13, "runintro" + i);
}

function slideSwipebox(count){
//    $("#runIntro6").show();
    expect = "";
    switch (count){
        case 0: // Swipe down to resume play
            $("#endHints").html("")
            $("#swipeHint").html("Swipe down to resume play<br>&nbsp;<br>Do it now to continue");
            expect = "down";
            break;
        case 1: // Swipe up
            $("#swipeHint").html("Swipe up to pause play<br>&nbsp;<br>Do it now to continue");
            expect = "up";
            break;
        case 2: // Left
            $("#swipeHint").html("Swipe left to increase font<br>&nbsp;<br>Do it now to continue");
            expect = "left";
            break;
        case 3: // Right
            $("#swipeHint").html("Swipe Right to decrease font<br>&nbsp;<br>Do it now to continue");
            expect = "right";
            break;
        case 4: // Shake
            nextBubble(7, 1);
            return;
            break;
        case 5: // Walkthrough complete
            $("#swipeHint").html("Walkthrough Complete.");
            $("#endHints").html("Begin");
            introRun = true;
            break;
    }
    $("#runIntro6").css("display", "inline-table");
}
function walkThrough(){
    $( "#options" ).toggle("slide", {direction:"right"}, "fast");
    introRun=false;
    runIntro();
}

function enableShake(){
    if (typeof window.DeviceMotionEvent != 'undefined') {
        // Shake sensitivity (a lower number is more)
        var sensitivity = 10;
        
        // Position variables
        var x1 = 0, y1 = 0, z1 = 0, x2 = 0, y2 = 0, z2 = 0;
        
        // Listen to motion events and update the position
        window.addEventListener('devicemotion', function (e) {
            x1 = e.accelerationIncludingGravity.x;
            y1 = e.accelerationIncludingGravity.y;
            z1 = e.accelerationIncludingGravity.z;
            return false; // Prevent from bubbling
        }, false);
        
        // Periodically check the position and fire
        // if the change is greater than the sensitivity
        setInterval(function () {
            var change = Math.abs(x1-x2+y1-y2+z1-z2);
                    
            if (change > sensitivity) {
                if (fieldWithFocus) fieldWithFocus.blur();
                if(expect == "shake"){
                    expect = "";
                    $("#runIntro8").hide();
                    slideSwipebox(5);
                }
                    
            }
                    
            // Update new position
            x2 = x1;
            y2 = y1;
            z2 = z1;
        }, 150);
    }

}
