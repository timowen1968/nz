/**
 * Created by Tim on 9/3/16.
 *
 */
// Once metadata has loaded, this checks the track is ready to play


// Monitors the buffer until the selected snippet is in one of the ranges
function monitorLoad(sequence, c){
//    console.log("monitor " + sequence + " " + c);
    var calls = c;
    calls++;
    var track = Load[sequence];
    var idTrack = sequence*1+1;

    increasePercent(sequence, 5, 85);

    message(idTrack, "monitorload " + sequence + " " + calls);
    var e = track.getAudio();
    if(typeof(c) == "undefined"){
        calls=0;
//        e.load();
//    }else{
//        e.pause();
    }
    
    // If this one is ready, skip it
    message(idTrack, "Ready to check buffer (call # " + calls + ")");
    // message(idTrack,50);
    if(numberReady[sequence] == 1){
        message(idTrack, "Finished");
        return;
    }
    // message(idTrack,50);
    var buffLen = e.buffered.length;
    message(idTrack, " Buffer exists length " + buffLen + " calls " + calls);
    // Wait for the buffer to have contents
    var count=0;
    if(e.buffered.length == 0){
        if(calls > 5){
            track.bufferEmpty++;
            resetSrc(e);
            return;
        }
        message(idTrack, " Buffer is empty " + track.fileName + " " + calls + " BE " + track.bufferEmpty);
        setTimeout(monitorLoad, 500, sequence, calls);
        return;
    }
    increasePercent(sequence, 5, 90);

    // If the snippet we need has been buffered, then release it
    var min = track.timeSnippet - 1; // 1 second back for safety
    if(min <0) min=0;
    var max = (track.timeSnippet + 3) * 1 // 3 seconds ahead to give room to play
    var buffercount=0;
    var amountLoaded =0;
    for (i = 0; i < buffLen; i++) {
        amountLoaded+=(e.buffered.end(i) - e.buffered.start(i));
        message(idTrack, amountLoaded + " of " + e.duration + " " + calls);
        if(amountLoaded == e.duration){
            e.pause();
            slotIn(sequence);

            // All loaded? Start the game!
            if (audioReady()){
                $("#surrender_all").css("display", "block").prop("disabled", false);
                var endDate = new Date();
                message(11, (endDate - startDate)/1000);
                if(runIntro()) {
                    // Listen for swipe to replay
                    document.addEventListener('touchstart', handleTouchStart, true);
                    document.addEventListener('touchmove', handleTouchMove, true);
                    enableShake();
                    var endDate = new Date();
                    nextSnippet(0);
                }
            }

            return;
        }
    }
//    if(calls == 10 || calls ==20 || calls == 30 || calls == 40){
//    if(calls == 1){
//        e.load();
//    }
    message(13, "FetchA ? " + countLoading());
    if(calls < 40 || countLoading() > 20){
        console.log("calls " + calls + " countLoading=" + countLoading() + " idx=" + idTrack + " song=" + track.songName + " url=" + track.source);
        setTimeout(monitorLoad, 100, sequence, calls);
        return;
    }
// Sometimes the audio tag NEVER fires a canplay, in which case we remove the tag and replace it.
//    return;
    message(idTrack, "Not in buffer " + e.buffered.start(0) + " - " + e.buffered.end(0) + " ( " + track.timeSnippet
        + " ) resetting X " + calls);
    message(13, "Fetch ? " + countLoading());
//    track.fetching++;
    track.resetCount++;
    resetSrc(e);
    return;

}

// plays all the tracks
function nextSnippet(next){

    $("#startGame").hide();
//    $("button").prop("disabled", true);
    $("#backicon").prop("disabled", false);
    $("#optionsImg").prop("disabled", false);
    $("select").prop("disabled", true);
    $('select[name="reasonError"]').prop("disabled", false);
    $('select[name="songError"]').prop("disabled", false);
    $("#surrender_all").prop("disabled", false);
    // Stop at the end of the playlist
    // Stop previous track playing if this is not the first one
    if(next != 0){
        // If time did not change since play started then it did not play - figure out what to do about it
        if(Tracks[next-1].timeSnippet == Tracks[next-1].getAudio().currentTime && Tracks[next-1].artist != "1000 Points"
        && !pausePlaying && playInProgress){
            if(Tracks[next-1].timeSnippet > 0){
                Tracks[next-1].timeSnippet--;
//                Tracks[next-1].stop();
//                Tracks[next-1].getAudio().currentTime = (Tracks[next-1].timeSnippet);
            }
            Tracks[next-1].stop();
            message(13, (next -1) + " did not play " + Tracks[next-1].getAudio().currentTime);
            playIfReady(next-1);
//            nextSnippet(next);
            return;
        }
        Tracks[next-1].stop();
        
        if(!pausePlaying || playFull === "true")
            document.getElementById("row" + (next)).style.background = "";

        if(next == LIMIT) {
            $("button").prop("disabled", false);
            $("select").prop("disabled", false);
            $("#fakeSelect").attr("disabled", "true");
            $("#surrender_all").prop("disabled", false);
            $("#surrender_all").css("display", "");
            playInProgress = false;
            playedUpTo = -1;
            return;
        }
    }
    if(pausePlaying){
        $("button").prop("disabled", false);
        $("select").prop("disabled", false);
        $("#fakeSelect").attr("disabled", "true");
        $("#surrender_all").prop("disabled", false);
        
        playInProgress = false;
        pausePlaying = false;
        if(introRun == "false"){
            document.getElementById("row" + (next)).style.background = "";
        }
        return;
    }
    playInProgress = true;
    playIfReady(next);
}

function playIfReady(next){
    if(typeof(Tracks[next]) == "undefined"){
        message(11, "Track " + next + " is not ready");
        setTimeout((playIfReady, 200, next));
        return;
    }
//    message(11, Tracks[next].getAudio().readyState);
    playedUpTo = next;
    if(Tracks[next].score == 100){
        Tracks[next].getAudio().currentTime++;
        nextSnippet(++next);
        return;
    }
    Tracks[next].play();
    next++;
    document.getElementById("row" + (next)).style.background = "#455e9c";

    setTimeout(nextSnippet, duration, next);

}
// Only happens in Safari
// Sometimes the audio tag NEVER fires a canplay, in which case we remove the tag and replace it.

function resetSrc(e){
    e.pause();
    var trackNo=e.id.substr(8);
    var i = trackNo -1;
    Load[i].canPlay = 0;
    e.load();
    if(!isMobileDevice){
        e.muted = true;
        e.play();
    }
    return;
}

function fetchSources(i){
    // Set can play on the previous one
    if(i > 0){
        if(!isMobileDevice){
            Load[i-1].getAudio().muted = true;
            Load[i-1].getAudio().play();
        }
    }
    if(i == LIMIT){
        return;
    }
    // Adding "source" via Element
    console.log(i);
    Load[i].fetching = 1;
    if(Load[i].fileName == "res/Coins.mp3"){
            addAudioSrcHTML(Load[i].fileName,++i);
        }else{
            addAudioSrcHTML(mp3Url + Load[i].fileName, ++i);
        }
    if(countLoading() > CONCURRENTLIMIT){
        stall(i);
        return;
    }
        fetchSources(i);
}

// Ios imposes a limit of 5 concurrent connections

function stall(i){
    if(countLoading() > CONCURRENTLIMIT){
        setTimeout(stall, 200, i);
        return;
    }
    fetchSources(i);
}
 

function addAudioSrcHTML(src, idx){
    var audioE = document.getElementById("loadSnip"+idx);
    audioE.setAttribute("src", src);
    audioE.load(); // Too soon
}

function countLoading(){
    var count = 0;
    for (var i=0; i<LIMIT; i++){
        count+=Load[i].fetching;
    }
    return count;
}

// Once metadata has loaded, this selects a random timesnippet to play
function setSnippet(audioIndex, count){
    
    var track = Load[audioIndex];
    var audioElement = track.getAudio();
    
    idTrack = audioIndex*1+1;
    message(idTrack, "Start loading " + count + " "  + audioElement.src);
    if(typeof(count) == "undefined"){
        count=0;
    }
    message(idTrack, "Have Load object");
    
    if(track.timeSnippet != 0){ // A snippet has already been generated for this one
        return;
    }
    increasePercent(audioIndex, 10, 50);
//    track.percent = 10;
    message(idTrack, "");
    if(audioElement.readyState != 4){

        message(idTrack, "readystate " + audioElement.readyState);
        increasePercent(audioIndex, 5, 80);
        if(count > 10){
            resetSrc(audioElement);
            count = 0;
            message(idTrack, "resetting" + track.id);
        }
        setTimeout(setSnippet, 500, audioIndex, ++count);
        return;
    }
    
    track.percent = 70;
    // Generate a time snippet and store it
    if(Load[audioIndex].songName.toUpperCase().indexOf("BONUS") >= 0){
        Load[audioIndex].timeSnippet = 0;
    }else{
        random = Math.random();
        var snippy = Math.floor(random * (audioElement.duration - 6))+2; // Need to make sure we have enough seconds to play
        
        // A duration this small indicates the file is invalid
        if(audioElement.duration < 25) {
//            alert(audioElement.src + " is not a valid audio file")
            message(idTrack, " SIZE PROBLEM setSnippet " + random + " * (" + (audioElement.duration) + " - 20) + 15 = " + snippy + " " + audioElement.src);
//            return;
        }
        Load[audioIndex].timeSnippet = snippy;
    }
    
    setTimeout(monitorLoad, 1000, audioIndex); // Give it a second to begin buffering
}

