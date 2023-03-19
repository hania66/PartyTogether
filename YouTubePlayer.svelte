<!-- Room.svelte -->

<script>
  import { onMount } from 'svelte';
import axios from 'axios';
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAuth } from 'firebase/auth';

let apiKey = 'AIzaSyBtWqruJei20EWLpPAyjLUDgzUnFwXFjz0';
let query = '';
let videos = [];
let player;
let playerState = null;
let user;
export let roomId;

const auth = getAuth();
const db = getDatabase();

// Reference to the room in the database
const roomRef = ref(db, `rooms/${roomId}`);
// Reference to the user in the room
let userRef;

// Load initial video list from Firebase
onValue(roomRef, (snapshot) => {
  const data = snapshot.val();
  if (data && data.videos) {
    videos = Object.values(data.videos);
  }
});

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

const onPlayerReady = event => {
  // event.target.playVideo(); // uncomment this line if you want the video to play automatically when it's ready
}

const onPlayerStateChange = event => {
  if (event.data === YT.PlayerState.PLAYING) {
    const videoId = player.getVideoData().video_id;
    playerState = { type: 'play', time: player.getCurrentTime(), videoId };
    set(ref(db, `rooms/${roomId}/playerState`), playerState);
  } else if (event.data === YT.PlayerState.PAUSED) {
    playerState = { type: 'pause', time: player.getCurrentTime() };
    set(ref(db, `rooms/${roomId}/playerState`), playerState);
  } else if (event.data === YT.PlayerState.ENDED) {
    playerState = { type: 'end', time: player.getDuration() };
    set(ref(db, `rooms/${roomId}/playerState`), playerState);
  }
}

const onYouTubeIframeAPIReady = () => {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
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
  const videoId = event.currentTarget.dataset.id;
  if (player) {
    player.loadVideoById(videoId);
  }
}

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

<h1>Room {roomId}</h1>
<input type="text" bind:value={query} placeholder="Search for videos">
<button on:click={searchVideos}>Search</button>
<ul>
  {#each videos as video}
    <li>
      <img src="{video.thumbnailUrl}" alt="{video.title}">
      <a href="#" on:click={playVideo} data-id={video.id}>{video.title}</a>
    </li>
  {/each}
</ul>

<div id="player"></div>

<style>
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    display: flex;
    align-items: center;
    margin: 0.5rem 0;
  }
  img {
    width: 120px;
    height: 90px;
    margin-right: 0.5rem;
  }
  a {
    font-size: 1.2rem;
    text-decoration: none;
    color: blue;
    cursor: pointer;
  }
</style>
