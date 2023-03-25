<script>
   
  
  import { getFirestore, collection, addDoc, where, query, getDocs } from 'firebase/firestore';
  import { v4 as uuidv4 } from 'uuid';
  import YouTubePlayer from "./YouTubePlayer.svelte";

  const db = getFirestore();

  let roomToken;
  let roomClicked;
  let roomId=null;
  export let displayToken=true;
  export let createRoomLinkButton;

  async function createRoomToken() {
   const roomToken = uuidv4();
const roomRef = collection(db, 'rooms');
const newRoom = await addDoc(roomRef, { roomId: roomToken });
roomId = newRoom.id;
document.getElementById('roomTokenDisplay').textContent = `Room Token: ${roomToken}`;

  }

  async function joinRoomByToken() {
  const tokenInput = document.getElementById('roomTokenInput');
  const token = tokenInput.value;
  const roomRef = collection(db, 'rooms');
  const q = query(roomRef, where("roomId", "==", token));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.size === 1) {
    const foundRoomId = querySnapshot.docs[0].id;
    roomId = foundRoomId;
    if(roomId && roomId === foundRoomId){
      // Both users have joined the same room
      console.log(`Joined room: ${token}`);
      roomClicked = true;
      createRoomLinkButton=false;
      

      // Store the user in the database
      const usersRef = collection(db, 'users');
      await addDoc(usersRef, {
        name: "John Doe",
        email: "johndoe@example.com",
        roomId: foundRoomId
      });


      
    } else {
      console.log(`You have joined a different room with the same token: ${token}`);
    }
  } else {
    console.log(`Room not found: ${token}`);
    alert("Room not found");
  }
}


  function handleRoomClick(event) {
    event.preventDefault();
    roomToken = event.target.href.split('/').pop();
    joinRoomByToken();
  }
</script>




<!-- The HTML components remain the same as in the original code -->
{#if createRoomLinkButton}
  <button class="CreateRoomButton" on:click={createRoomToken}>Create Room Token</button>
{/if}

<p id="roomTokenDisplay"></p>

<!-- Displaying the room token input -->
{#if displayToken}
  {#if !roomClicked}
  <p>Enter or paste your Room Token:</p>
  <input type="text" id="roomTokenInput" />
  <button class="JoinRoom" on:click={joinRoomByToken}>Join Room</button>
   {/if}
{/if}

<!-- Displaying the YouTube player if the user has joined a room -->
{#if roomClicked}
  <div>
    <YouTubePlayer roomId={roomId} />
  </div>
{/if}



<style>
  /* Set up Flexbox */
  
  /* Style the components */
  .CreateRoomButton {
    display: block;
    width: 80vw;
    max-width: 500px;
    margin: 10vh auto 0;
    padding: 2vh 2vw;
    font-size: 2vw;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    background-color: #005180;
    color: white;
  }

  #roomTokenDisplay {
    margin-top: 4vh;
    font-size: 2vw;
    text-align: center;
  }

  #roomTokenInput {
    display: block;
    width: 80vw;
    max-width: 550px;
    margin: 2vh auto;
    padding: 2vh 2vw;
    font-size: 3vw;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .JoinRoom {
    display: block;
    width: 80vw;
    max-width: 150px;
    margin: 2vh auto;
    padding: 2vh 2vw;
    font-size: 2vw;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    background-color: #ff5a5a;
    color: white;
  }

  p{
    display:block ;
    text-align: center;
    font-size:2vw ;
  }


  @media only screen and (min-width: 600px) {
    .CreateRoomButton,
    #roomTokenInput,
    .JoinRoom{
      width: 50vw;
      font-size: 2.5vw;
      max-width: 400px;
    }
  }

  @media only screen and (min-width: 1200px) {
    .CreateRoomButton,
    #roomTokenInput,
    .JoinRoom  {
      width: 30vw;
      font-size: 1.5vw;
      max-width: 500px;
    }
  }
  /* Media queries for responsive design */
 
</style>



