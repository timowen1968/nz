var itunesOpen = false;
var fancyColors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet" ];
var fancyLetters = new Array();

function iTunesGetInfo(idx){
    var artist = Tracks[idx].artist.replace(/ /g, "+").replace(/"/g,"").replace(/'/g,"").replace(/&/g,"");
    var song = Tracks[idx].songName.replace(/ /g, "+").replace(/"/g,"").replace(/'/g,"").replace(/&/g,"");
    var url="https://itunes.apple.com/search?limit=10&media=music&entity=musicTrack&term=" +
        artist + "+" + song + "&callback=?";
    $.getJSON(url, function(data) { addItunesData(data, idx);  });
}
function addItunesData(data, idx){
    var a = "<a target=new href='";
    var imageUrl;
    var oldest = "2100-12-31";
    var iti = new ITunes();
    for (var i=0;i<data["results"].length;i++){
        var d = data["results"][i];
        var artistName = d.artistName.toUpperCase().replace(/&/g,"").replace(/ AND /g, "");
        var trackName = d.trackName.toUpperCase().replace(/&/g,"").replace(/ AND /g, "");
        var artistName2 = Tracks[idx].artist.toUpperCase().replace(/&/g,"").replace(/ AND /g, "");
        var trackName2 = Tracks[idx].songName.toUpperCase().replace(/&/g,"").replace(/ AND /g, "");
        if(artistName.indexOf(artistName2) < 0 ||
           trackName.indexOf(trackName2) < 0){
//           console.log("skipping " + artistName + "=" + artistName2 + " + " + trackName + "=" + trackName2);
           continue;
        }
//        console.log("checking " + d.artistName + " " + d.trackName);
                                                               
        // Use the oldest release as it is most likely the original album
        var relDate = d.releaseDate.substring(0,10);
        var year = d.releaseDate.substring(0,4);
//        console.log(d.artistName + " " + relDate + " " + oldest + " " + d.collectionName + " " + (relDate >= oldest) + " " + d.kind);
        if(typeof (d.collectionName) == "undefined") {
            continue;
        }
        if(relDate >= oldest){
            continue;
        }
//        console.log("Keeping " + relDate);
        oldest = relDate;
        iti.iconImage = "<img width=25 height=25 src='" + d.artworkUrl100 + "' style='border: 1px solid white'>";
        iti.image = "<img width=100 height=100 src='" + d.artworkUrl100 + "' id='coverImage' onclick='clickLink()'>";
        iti.artist = a + d.artistViewUrl    + AFFILIATE + "'>" + d.artistName + "</a>";
        iti.album = a + d.collectionViewUrl + AFFILIATE + "' id='albumLink'>"+d.collectionName +"</a>";
        iti.track = a + d.trackViewUrl      + AFFILIATE + "'>"+d.trackName+"</a>";
        iti.releaseDate = relDate;
//                                                               console.log(iti.artist);
//                                                               console.log(iti.album);
//                                                               console.log(iti.track);
    
        iti.preview = "<audio id='previewUrl' src='" + d.previewUrl + "' controls>";
    }
    Tracks[idx].itunesInfo = iti;
    //    fillItunesDiv(idx);
}
                                                                                                                          
function clickLink(){
    document.getElementById("albumLink").click();
}
function fillItunesDiv(idx){
    if(Tracks[idx].songName.toUpperCase() === "BONUS TRACK!") return;
    var iti = Tracks[idx].itunesInfo;
    if(iti.artist === ""){
        document.getElementById("itunesIntro").innerHTML = "No Information found on ITunes"
    }else{
        document.getElementById("itunesIntro").innerHTML = "Click Artist, Album or Track to view on Itunes";
    }
    document.getElementById("itunesImg").innerHTML = iti.image;
    document.getElementById("itunesArtist").innerHTML = iti.artist;
    document.getElementById("itunesAlbum").innerHTML = iti.album;
    document.getElementById("itunesTrack").innerHTML = iti.track;
    document.getElementById("itunesYear").innerHTML = iti.releaseDate;
    document.getElementById("itunesPreview").innerHTML = iti.preview;
    //    $("#coverImage").css("z-index", "2").css("position", "absolute");
                                                               console.log("itunesOpen " + itunesOpen);
    showItunes();
    if (itunesOpen){
        showItunes(); // First one will have closed the div
    }
    itunesOpen = true;
    //    $("#coverImage").on("click", coverClicked);
}
                                                               
function coverClicked(d){
    if(document.getElementById("coverImage").style.width === "200px"){
        $("#coverImage").css("width", "100px" );
    }else{
        $("#coverImage").css("width", "200px" );
    };
}
function showItunes(){
    $( "#itunesInfo" ).toggle("slide", {direction:"left"}, "fast")
}
function cleanupItunesDiv(){
    DISABLESWIPE = false;
    if(document.getElementById("previewUrl")){
        document.getElementById("previewUrl").pause();
    }
    itunesOpen = false;
    $( "#itunesInfo" ).toggle("slide", {direction:"left"}, "slow")
}

function showInfo(o){
    if (playFull === "false") return true;
    var idx = o.id.substring(3);
    fillItunesDiv(idx - 1);
    return false;
}

function showAlbumIcons(){
    for (var i=0; i<Tracks.length; i++){
        if(Tracks[i].songName.toUpperCase() === "BONUS TRACK!") continue;
        var iti = Tracks[i].itunesInfo;
        if(iti.iconImage === "") continue; // No data from Itunes
        $("#trackTD" + i).html(iti.iconImage).css("vertical-align","bottom");
    }
}
function ajaxGenres(){
  $("#optionsImg").attr("disabled", "true");
  pausePlaying=true;
  document.getElementById("fakeSelect").value = "2";// Set it to "Loading..."

  $("#ajaxResult").hide().load("http://" + URL + "/splitmusicchallenge/ajax.php", { option: "getGenres", decade: f.decade.value}, function(data){ addGenres(data) }) ;
}
                                                               
function addGenres(data){
  DISABLESWIPE = true;

  document.getElementById("fakeSelect").value = "1";
                                                               console.log("addGenres[dataError] " + dataError);
  if(document.getElementById("genreTable").innerHTML != "" && !dataError){
    showGenreInfo();
    return;
  }
                                                               
  var htmlString = "<br><center><table>";
  htmlString += "<tr><td><input type=checkbox id='all' onclick='toggleAllChecks(this.checked)'>&nbsp;&nbsp;All/None&nbsp;&nbsp;&nbsp;&nbsp;</td><td></td></tr>";
  var gArray = data.split("||");
  for (var i=0; i<gArray.length;i++){
    var bits = gArray[i].split("~");
    if(bits[0] == "") continue;
      check = "";
      mustCheck = f.genreList.value.indexOf("'" + bits[0] + "'");
      if(mustCheck >= 0) check = "checked";
    htmlString += "<tr><td><input type=checkbox id='" + bits[0] + "' " + check + ">&nbsp;&nbsp;" + bits[0] + "&nbsp;&nbsp;&nbsp;&nbsp;</td><td></td></tr>";
  }
  htmlString += "</table>"
  htmlString += "<br><div id=genreMessage style='padding:4px;color:white;border:1px solid red;visibility:hidden;border-radius:9px;background:red'>No genres selected</div>";
  if(dataError){
    htmlString += "<br>Available genres for the " + f.decade.value + "'s";
    dataError = false;
  }
  htmlString += "</center>";
  $("#genreTable").html(htmlString);
  showGenreInfo();
}
                                                               
function toggleAllChecks(tf){
  var e = document.getElementById("genreTable").getElementsByTagName("input");
  for (var i=1; i<e.length;i++){
    e[i].checked = tf;
  }

}
function showGenreInfo(){
  $( "#genreInfo" ).attr("visibility", "visible").center().toggle("slide", {direction:"left"}, "fast")
}

function cleanupGenreDiv(restart){
  pausePlaying=false;
  $("#optionsImg").removeAttr("disabled", "true");


  var str = "";
  var number = 0;
  var e = document.getElementById("genreTable").getElementsByTagName("input");
  for (var i=1; i<e.length;i++){
    if(e[i].checked){
      number++;
      str += "'" + e[i].id + "',";
    }
  }

  if (number == 0){
    $("#genreMessage").css("visibility", "visible");
    return;
  }
  // Because it looks messy when it sashays away
  $(".genreTable").css("visibility:hidden");
  if(number == 1){
    $("#specialOption").html("1 Genre");
  }else{
    $("#specialOption").html(number + " Genres");
  }
  f.fakeSelect.value = "3";
  $("#genreMessage").css("visibility", "hidden");
                                                               
  str += "'0'";
  addCookie("genre", str);
  f.genreList.value = str;
            
  DISABLESWIPE = false;
  $( "#genreInfo" ).toggle("slide", {direction:"left"}, "slow")
                                                               
  if(!chosenGenres){
    chosenGenres = true;
    getTracks();
    return;
  }
                                                               
  if(restart){
    $( "#genreInfo" ).hide();
    playAgain();
    return;
  }
}

function runAnimate(opt){
  if(opt == 1) animateHeading2(0, 0);
  if(opt == 2) animateHeading(0);
//  setTimeout(animateHeading, 5000, 0);
}
                                                               
function animateHeading2(fancyIndex, count){
  if(count++ == 20){
    $("#fancyHeading").html("Split Music Challenge");
    setTimeout(runAnimate, 10, 2);
    return;
  }
  var str = "Split Music Challenge";
  var fancy = "";
  for(var i=0; i<str.length; i++){
    if(fancyIndex > fancyColors.length) fancyIndex=0;
    fancy += "<fan style='color:" + fancyColors[fancyIndex] + "'>" + str[i] + "</fan>";
    fancyIndex++;
//    }
  }
//  alert(fancy + " " + fancyIndex + " " + start + " " + str.length);
  $("#fancyHeading").html(fancy);
  setTimeout(animateHeading2, 200, fancyIndex, count);
//  setTimeout(nextBubble, 6000, 2, 1);
}

                                                               
function animateHeading(fancyIndex){
  var str = "Split Music Challenge";
  if(fancyIndex >= str.length){
    $("#fancyHeading").html("Split Music Challenge");
    setTimeout(runAnimate, 10, 1);
    return;
  }
  var fancy ="";
  for(var i=0; i<fancyIndex; i++){
    fancy+=str[i];
  }
  fancy += "<fan style='color:indianred'>" + str[fancyIndex] + "</fan>";
  for(var i=fancyIndex+1; i<str.length; i++){
    fancy+=str[i];
  }
  $("#fancyHeading").html(fancy);
  setTimeout(animateHeading, 200, ++fancyIndex);
}
                                                               
function publishOnFacebook() {
  $("#ajaxResult").load("https://graph.facebook.com/me/feed", { message: "New high score on the Split Music Challenge! https://appsto.re/nz/W0d-jb.i",
    access_token: "EAACEdEose0cBAETl0z9PEpTSQxlM0bIAlyJpVRfxItZBTMSlzw7MSb5EaEMkSst2cwYzeEfZAFwOACNiZBsYyrGv9ZCifZCuugqn1Na76ZBoqHiGSAEoSHY5a7OT2jabeUvHd7oLwY6xn4ZCL18FfUFR4xZBzwD6kxSwY2cC81lZAGFhMhZCtM7hoKwLoiGTGQZAEsZD"},
                        function(data, mess){ shareResult(data, mess) }) ;
 
}
function shareResult(d,m){
  alert(d + " " + m);
}
                                                              
