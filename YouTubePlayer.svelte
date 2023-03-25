<!-- Room.svelte -->

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
  
  if (data && data.videoId) {
        videoId = data.videoId;
        console.log("video Id :",videoId);
        
      }

});


  

const onPlayerReady = event => {
  const videoData = event.target.getVideoData();
  if (videoData && videoData.video_id) {
    event.target.loadVideoById(videoData.video_id);
  }
};


const onPlayerStateChange = event => {
  if (event.data === YT.PlayerState.PLAYING) {
    const videoId = player.getVideoData().video_id;
    playerState = { type: 'play', time: player.getCurrentTime(), videoId };
    set(ref(db, `rooms/${roomId}/playerState`), playerState);
  } else if (event.data === YT.PlayerState.PAUSED) {
    const videoId = player.getVideoData().video_id;
    playerState = { type: 'pause', time: player.getCurrentTime(), videoId };
    set(ref(db, `rooms/${roomId}/playerState`), playerState);
  } else if (event.data === YT.PlayerState.ENDED) {
    const videoId = player.getVideoData().video_id;
    playerState = { type: 'end', time: player.getDuration(), videoId };
    set(ref(db, `rooms/${roomId}/playerState`), playerState);
  } else if (event.data === YT.PlayerState.BUFFERING) {
    const videoId = player.getVideoData().video_id;
    playerState = { type: 'buffering', time: player.getCurrentTime(), videoId };
    set(ref(db, `rooms/${roomId}/playerState`), playerState);
  } else if (event.data === YT.PlayerState.CUED) {
    const videoId = player.getVideoData().video_id;
    playerState = { type: 'cued', time: player.getCurrentTime(), videoId };
    set(ref(db, `rooms/${roomId}/playerState`), playerState);
  }
}

// Watch for changes in the player state and update the player when necessary
onValue(ref(db, `rooms/${roomId}/playerState`), (snapshot) => {
  const data = snapshot.val();
  if (data && data.videoId === videoId && data.time) {
    playerState = data;
    if (data.type === 'play') {
      player.seekTo(data.time);
      player.playVideo();
    } else if (data.type === 'pause') {
      player.seekTo(data.time);
      player.pauseVideo();
    } else if (data.type === 'end') {
      player.seekTo(data.time);
      player.stopVideo();
    } else if (data.type === 'buffering') {
      playerState = data;
      player.seekTo(data.time);
      player.playVideo();
    } else if (data.type === 'cued') {
      playerState = data;
      player.seekTo(data.time);
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
