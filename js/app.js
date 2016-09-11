var app = angular.module("Adore", []);

app.controller("AdoreController", ($scope) => {
	var Sref = storage.ref();
	var Dref = database.ref();

	$scope.videos = [];
  var firstVideoAdded = false;
  var options = [];

	Dref.child("videos").on("value", (snapshot) => {
		$scope.videos = snapshot.val().sort((i1, i2) => i2.timestamp - i1.timestamp); //order videos by publish date (most recent first)

		$scope.load($(".videos"), 0);

    if(!firstVideoAdded){ //avoid adding the first video everytime a new video is inserted
      //add 1st video
      let firstVideo = storage.ref().child($scope.videos[0].link);
      firstVideo.getDownloadURL().then((vurl) => {
        firstVideo.getMetadata().then((metadata) => {
          let video = $("<video id='first' class='responsive-video playing'></video>");
          $(video).append("<source src='" + vurl + "' type='" + metadata.contentType + "'/>");
          $("div.first.video").attr("title", $scope.videos[0].name).append(video);
          firstVideoAdded = true;
          $("div.first.video").trigger("videoAdded");
        });
      });
    }
	});

  var addVideo = (player) => {
    let video = $("<video class='responsive-video playing'></video>");
    video.append("<source src='" + player.data("video") + "' type='" + player.data("type") + "'/>");
    player.append(video);
    $(".video.fullscreen").trigger("videoAdded");
  }

  var appendThumbnail = (container, name, videoUrl, finish) => {
    let imgUrl = videoUrl.replace(/\.[0-9a-z]+$/i, ".jpg");
    storage.ref("thumbs").child(imgUrl).getDownloadURL().then((iurl) => {
      storage.ref().child(videoUrl).getDownloadURL().then((vurl) => {
        storage.ref().child(videoUrl).getMetadata().then((metadata) => {
          let wrapper = $("<div class='video col l3 m4 s6 center valign-wrapper' title='" + name + "'></div>");
          $(wrapper).append("<img src='" + iurl + "' class='thumbnail responsive-img valign'/>");
          let icon = playIcon.clone();
          $(wrapper).append(icon);

          $(wrapper).on("click", (event) => {
            let player = $(event.currentTarget).clone();
            player.data($(event.currentTarget).data());
            player.find(".thumbnail, .icon").hide();
            player.addClass("fullscreen");
            $("div.controls .icon.close").attr("class", "valign icon close");
            $("body").append(player);
            player.fadeIn();
            addVideo(player);
          });

          container.append(wrapper);
          $(wrapper).data("video", vurl);
          $(wrapper).data("type", metadata.contentType);
          if(finish){
            $("body").removeClass("loading");
            options = [
              { selector: wrapper, offset: 0, callback: () => {
                  $scope.load($(".videos"), $(".videos").children(".video").length);
              }}
            ];

            Materialize.scrollFire(options);
          }
        });
        
      });
    });
  }

  $scope.load = (container, position) => {
    if(position == 0) container.empty();
    if(position <= container.children().length){
  		let chunk = $scope.videos.slice(position + 1, position + 1 + 10); //gets 10 videos to load before infinite scroll (minus 1 which is the most recent video)
  		for(i in chunk){
        console.log(i);
        let finish = false;
        if(i == chunk.length -1) finish = true;
        appendThumbnail(container, chunk[i].name, chunk[i].link, finish);
  		}
    }
  };

  var playIcon = $('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 500 500" class="valign icon hide-on-small-only play" xml:space="preserve">'
                      + '<g class="circle">'
                        + '<path class="circle st0" d="M250,0c138.1,0,250,111.9,250,250S388.1,500,250,500S0,388.1,0,250S111.9,0,250,0z M250.6,438.7'
                          + 'c104.4,0,188.1-83.7,188.1-188.1S355,62.5,250.6,62.5S62.5,146.3,62.5,250.6S146.2,438.7,250.6,438.7z"/>'
                      + '</g>'
                      + '<g class="play">'
                        + '<path class="st0" d="M346,238.2l-141.7-84.3c-1.7-1-3.5-1.6-5.5-1.6c-5.5,0-10.1,4.6-10.1,10.2h-0.1v175.1h0.1'
                          + 'c0,5.6,4.5,10.2,10.1,10.2c2.1,0,3.8-0.7,5.7-1.7L346,261.8c3.4-2.8,5.5-7,5.5-11.8C351.5,245.3,349.4,241.1,346,238.2z"/>'
                      + '</g>'
                      + '<g class="pause">'
                        + '<path class="st0" d="M229.6,364.4V135.5c0-4.3-3.4-7.7-7.8-7.7h-45.6c-4.3,0-7.8,3.4-7.8,7.7v228.9c0,4.3,3.4,7.8,7.8,7.8h45.6'
                          + 'C226.2,372.2,229.6,368.7,229.6,364.4z"/>'
                        + '<path class="st0" d="M323.7,127.8h-45.6c-4.3,0-7.8,3.4-7.8,7.7v228.9c0,4.3,3.4,7.8,7.8,7.8h45.6c4.3,0,7.8-3.4,7.8-7.8V135.5'
                          + 'C331.5,131.3,328,127.8,323.7,127.8z"/>'
                      + '</g>'
                    + '</svg>');
});