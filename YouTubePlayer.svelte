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
// Reference to the room in the database
// Reference to the user in the room
let userRef;
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
  // Save the updated video list to Firebase
  set(ref(db, `rooms/${roomId}/videos`), videos);
}
const roomRef = ref(db, `rooms/${roomId}`);
// Load initial video list from Firebase
onValue(roomRef, (snapshot) => {
  const data = snapshot.val();
  if (data && data.videos) {
    videos = Object.values(data.videos);
  }
  
 
});
  
const onPlayerReady = event => {
  const videoData = event.target.getVideoData();
  if (videoData && videoData.video_id) {
    event.target.loadVideoById(videoData.video_id);
  }
};


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

const onTimeUpdate = () => {
  if (playerState !== null && playerState.type === 'play') {
    const currentTime = player.getCurrentTime();
    const timeDiff = Math.abs(currentTime - playerState.time);
    if (timeDiff >= 1) {
      player.seekTo(playerState.time);
    }
  }
};

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

const onBackwardClick = event => {
  const currentTime = player.getCurrentTime();
  const newTime = Math.max(currentTime - 10, 0);
  player.seekTo(newTime);
  playerState = { type: 'play', time: newTime };
  set(ref(db, `rooms/${roomId}/playerState`), playerState);
};

const onForwardClick = event => {
  const duration = player.getDuration();
  const currentTime = player.getCurrentTime();
  const newTime = Math.min(currentTime + 10, duration);
  player.seekTo(newTime);
  playerState = { type: 'play', time: newTime };
  set(ref(db, `rooms/${roomId}/playerState`), playerState);
};

// Watch for changes in the player state and update the player when necessary
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


const onYouTubeIframeAPIReady = () => {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    },
    
    
  });
}
const loadPlayer = () => {
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
}
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
    // Checking if the user has joined the room
    onValue(userRef, (snapshot) => {
      if (!snapshot.exists()) {
        set(userRef, true);
      }
    });
  }
  
  loadPlayer();
  
});
  // Listen for
</script>
<h1 class="title">Party Room</h1>

<div class="container">
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
          <img class="thumbnail" src="{video.thumbnailUrl}" alt="{video.title}">
          <a class="video-link" href="#" on:click={playVideo} data-id={video.id}>{video.title}</a>
        </li>
      {/each}
    </ul>

    
  </div>
</div>

<style>
  /* header styles */
  .title {
    text-align: center;
    font-size: 3.5rem;
    margin: 5rem 0;
    color:#cd603ffa;
  }
  /* container styles */
  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }
  /* left column styles */
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
  .thumbnail {
    width: 120px;
    height: 90px;
    margin-right: 0.5rem;
  }
  .video-link {
    font-size: 1.2rem;
    text-decoration: none;
    color: #005180;
    cursor: pointer;
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
  /* right column styles */
  .right {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;
    width: 100%;
    max-width: 800px;
  }
  .player {
    width: 100%;
    max-width: 600px;
    height: 360px;
    background-color: #000;
  }
  /* responsive styles */
  @media screen and (max-width: 768px) {
    .left, .right {
      width: 100%;
      max-width: unset;
      font-size:4vw;
    }
    .search {
      margin-top: 1rem;
      margin-bottom: 2rem;
    }
  }
</style>