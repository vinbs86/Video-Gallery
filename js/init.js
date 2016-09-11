// Initialize Firebase
  var config = {
    apiKey: "AIzaSyBxcgVdMdGbIamu3jt5S1_kzul1XXzFXkI",
    authDomain: "adore-8b8da.firebaseapp.com",
    databaseURL: "https://adore-8b8da.firebaseio.com",
    storageBucket: "adore-8b8da.appspot.com",
  };
  firebase.initializeApp(config);

  var storage = firebase.storage();
  var database = firebase.database();

  var updateVideoTime = (event) => {
  	let player = $(event.data.video);
  	var progress = $(".progress div.determinate");
  	var time = ((100 / player[0].duration) * player[0].currentTime);
  	progress.css("width", time + "%");
  }

  var togglePlayPause = (event) => {
    let btn = $(event.currentTarget);
    let video = event.data.video;
    if($(video).hasClass("playing")){
      if(video.paused || video.ended){
        btn.attr("class", "valign icon play pause");
        video.play();
      }
      else{
        btn.attr("class", "valign icon play");
        video.pause();
      }
    }
  }

  $("body").on("videoAdded", ".video", (event) => {
  	let player = $(event.currentTarget).find("video")[0];
    $("video").each(function(i,e){ //stops every other video on the page
      e.currentTime = 0;
      e.pause();
      $(e).removeClass("playing");
    });
    player.play(); //autoplays
    $(player).addClass("playing");
    $(".controls .icon.play").attr("class", "valign icon play pause");
  	$(player).on("timeupdate", {video: player}, updateVideoTime);
    $(player).on("ended", () => {player.currentTime = 0; $(".controls .icon.play").attr("class", "valign icon play")});
    $(".controls .icon.play").on("click", {video: player}, togglePlayPause);
    $(".controls .volume i").on("click", (event) => { 
      if(!player.muted){
        $(event.target).html("volume_off");
        player.muted = true;
      }
      else{
        $(event.target).html("volume_up");
        player.muted = false;
      }
    });
    $(".volume-range").on("change", (event) => {
      let volume = $(event.target).val() / 100;
      player.muted = false;
      player.volume = volume;
    });
    $(".controls .icon.close:not(.disabled)").on("click", (eventClose) => {
      $(".frontline .video video").addClass("playing");
      player.pause();
      $(player).trigger("ended");
      $("div.controls .icon.close").attr("class", "valign icon close disabled");
      $(event.currentTarget).animate({opacity: 0}, 500, () => $(event.currentTarget).remove());
    });
  });

$(".progress div.determinate").resizable({
      handles: {e: "#handle", w: "#handle" },
      start: () => {
        $(".controls .icon.play").attr("class", "valign icon play");
        let video = $(".video.fullscreen video.playing")[0];
        video.pause();
      },
      resize: (event, ui) => {
        let rate = ui.size.width/$(ui.element).parent().width();
        let video = $(".video.fullscreen video.playing")[0];
        video.currentTime = video.duration * rate;
      },
      stop: () => {
        $(".controls .icon.play").attr("class", "valign icon play pause");
        let video = $(".video.fullscreen video.playing")[0];
        video.play();
      }
    });