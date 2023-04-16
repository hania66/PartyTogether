<script>
import { onMount } from 'svelte';
import axios from 'axios';
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAuth } from 'firebase/auth';


let apiKey = 'AIzaSyBtWqruJei20EWLpPAyjLUDgzUnFwXFjz0';
let query = '';
let videos = [];
let player=null;
let videoId;
let playerState = null;
let user;
export let roomId;

const auth = getAuth();
const db = getDatabase();



// when user will search for videos by clicking on search button,it will give the result and will update that search result for the other users who are in the same room
const searchVideos = async () => {
  const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      key: apiKey,
      q: query,
      part: 'snippet',
      type: 'video'
    }
  });
  videos = response.data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnailUrl: item.snippet.thumbnails.medium.url
  }));


  set(ref(db, `rooms/${roomId}/videos`), videos);
}



const roomRef = ref(db, `rooms/${roomId}`);
// Loading initial video list from Firebase
onValue(roomRef, (snapshot) => {
  const data = snapshot.val();
  if (data && data.videos) {
    videos = Object.values(data.videos);
  }
  
 
});
  
// it will play the video when the player is ready
const onPlayerReady = event => {
 const videoData = event.target.getVideoData();


  if (videoData && videoData.video_id) {
    event.target.loadVideoById(videoData.video_id);
  }
};


//it will store the player state on firebase
const onPlayerStateChange = event => {
  const state = event.data;

  if (state === YT.PlayerState.PLAYING) {
    playerState = { type: 'play', time: player.getCurrentTime() };
  } else if (state === YT.PlayerState.PAUSED) {
    playerState = { type: 'pause', time: player.getCurrentTime() };
  } else if (state === YT.PlayerState.ENDED) {
    playerState = { type: 'end', time: player.getDuration() };
  }

  if (playerState !== null) {
    set(ref(db, `rooms/${roomId}/playerState`), playerState);
  }
};

//  checking if the current time of the video is different than the time saved in playerState.
// If there is a difference of 1 second or more, the video is seeked to the saved time.
const onTimeUpdate = () => {
  if (playerState !== null && playerState.type === 'play') {
    const currentTime = player.getCurrentTime();
    const timeDiff = Math.abs(currentTime - playerState.time);
    if (timeDiff >= 1) {
      player.seekTo(playerState.time);
    }
  }
};


// This function will toggles the state of the play/pause button and updates the player state in Firebase
const onPlayPauseClick = event => {
  const btn = event.currentTarget;
  const isPlaying = player.getPlayerState() === YT.PlayerState.PLAYING;

  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }

  playerState = { type: isPlaying ? 'pause' : 'play', time: player.getCurrentTime() };
  set(ref(db, `rooms/${roomId}/playerState`), playerState);

  btn.innerText = isPlaying ? 'Play' : 'Pause';
};


//backWard click
const onBackwardClick = event => {
  const currentTime = player.getCurrentTime();
  const newTime = Math.max(currentTime - 10, 0);
  player.seekTo(newTime);
  playerState = { type: 'play', time: newTime };
  set(ref(db, `rooms/${roomId}/playerState`), playerState);
};

//onForward click
const onForwardClick = event => {
  const duration = player.getDuration();
  const currentTime = player.getCurrentTime();
  const newTime = Math.min(currentTime + 10, duration);
  player.seekTo(newTime);
  playerState = { type: 'play', time: newTime };
  set(ref(db, `rooms/${roomId}/playerState`), playerState);
};

// Watching for changes in the player state and updating the player when necessary
onValue(ref(db, `rooms/${roomId}/playerState`), (snapshot) => {
  const data = snapshot.val();
  if (data && data.time) {
    playerState = data;
    const state = player.getPlayerState();
    const currentTime = player.getCurrentTime();
    const timeDiff = Math.abs(currentTime - playerState.time);
    if (data.type === 'play') {
      if (state !== YT.PlayerState.PLAYING) {
        player.playVideo();
      }
      if (timeDiff >= 1) {
        player.seekTo(playerState.time);
      }
    } else if (data.type === 'pause') {
      if (state !== YT.PlayerState.PAUSED) {
        player.pauseVideo();
      }
    } else if (data.type === 'end') {
      player.stopVideo();
    }
  }
});


//Youtube Frame
const onYouTubeIframeAPIReady = () => {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: 't0Q2otsqC4I',
    playerVars: {
      'rel': 0, // hide related videos
      'showinfo': 0,
       

  
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    },
    
    
  });
}


// loading the YouTube IFrame API script in the webpage.
const loadPlayer = () => {
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
}

//when user will click on any searched video link,it will be played on youTube player frame and will save it to the firebase 
const playVideo = event => {
    event.preventDefault();
    const newVideoId = event.currentTarget.dataset.id;
    if (player) {
      player.loadVideoById(newVideoId);
    }
    videoId = newVideoId;
    // Save the current video ID to Firebase
    set(ref(db, `rooms/${roomId}/videoId`), videoId);
    console.log("Video Id:",videoId);
  }
  
 // Watch for changes in the current video ID and update the player when necessary
 onValue(ref(db, `rooms/${roomId}/videoId`), (snapshot) => {
      const data = snapshot.val();
      if (data && data !== videoId) {
        player.loadVideoById(data);
        videoId = data;
      }
    });  
  
  
  
  onMount(() => {
  user = auth.currentUser;
  let userRef = null;
  if (user) {
    userRef = ref(db, `rooms/${roomId}/users/${user.uid}`);
    
    onValue(userRef, (snapshot) => {
      if (!snapshot.exists()) {
        set(userRef, true);
      }
    });
  }
  
  loadPlayer();
  
});
  
</script>

<!-----------youtTube player frame,search Input,Search button and searched videos links------>
<body>
  <div class="Playercontainer">
    <div class="right">
      <div class="player" id="player"></div>
    </div>

    <div class="left">
      <div class="search">
        <input class="search-input" type="text" bind:value={query} placeholder="Search for videos">
        <button class="search-btn" on:click={searchVideos}>Search</button>
      </div>
      <ul class="videos">
        {#each videos as video}
        <li>
          <div class="thumbnail-wrapper">
            <img class="thumbnail" src="{video.thumbnailUrl}" alt="{video.title}">
            <a class="video-link" href="#" on:click={playVideo} data-id={video.id}>{video.title}</a>
          </div>
        </li>
        {/each}
      </ul>


    </div>
  </div>
</body>

<style>


  

.Playercontainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }

  
  .left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;
    width: 100%;
    max-width: 800px;
  }

  .videos {
    list-style: none;
    padding: 0;
    margin-bottom: 2rem;
  }

  .thumbnail-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    border: 2px solid #cd603ffa;
    background-color: #000;
    border-radius: 10px;
  }

  .thumbnail {
    width: 120px;
    height: 90px;
    margin-right: 0.5rem;
    border-radius: 10px 0 0 10px;
  }

  .video-link {
    display: block;
    font-size: 1.2rem;
    text-decoration: none;
    color: #ffffff;
    cursor: pointer;
    padding: 0.5rem;
    background-color: black;
    border-radius: 0 10px 10px 0;
  }
  .search {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  .search-input {
    padding: 0.5rem;
    border-radius: 10px;
    margin-right: 0.5rem;
  }
  .search-btn {
    padding: 0.5rem;
    border-radius: 10px;
    border: none;
    background-color: #cd603ffa;
    color: #fff;
    cursor: pointer;
  }
  
  .right {
    display: flex;
    justify-content: center;
    align-items: center;
    padding:0;
    width: 1200px;
 
   
  }
  .player {
    width: 1200px;
    max-width: 100%;
    height: 600px;
    margin-top: -10vh;
}
    
  

@media only screen and (max-width: 1200px) {
  .Playercontainer {
    flex-direction: column;
  }

  .right{
    width:1200px;
    max-width: 100%;
  }

  .player {
    width: 1200px;
    max-width:100%;
  }
  
  .left {
    max-width: 100%;
    margin:0 auto;
  }

  .left {
    margin-bottom: 2rem;
  }

  .right {
    margin-bottom: 0;
  }

  .thumbnail-wrapper {
    margin-bottom: 1rem;
  }

  .video-link {
    font-size: 1rem;
    padding: 0.25rem;
  }
}

@media only screen and (max-width: 600px) {

  
  
  .player {
    max-width: 100%;
    width:350px;
    height: 320px;
    margin-top: -20vh;
     
    
  }
  .right{
    max-width: 100%;
    width:350px;
    height: 320px;
    
  }

  .search {
   
    margin-top: -7vh;
    margin-bottom: 0;
  }

  .thumbnail {
    width: 80px;
    height: 60px;
  }

  .thumbnail-wrapper {
    margin-bottom: 0.5rem;
  }

  .video-link {
    font-size: 0.8rem;
    padding: 0.25rem;
  }
}

@media only screen and (max-width: 820px) {
  .right{
    max-width: 100%;
    
  }

  .player {
    max-width: 100%;
    
     
    
  }
}
</style>