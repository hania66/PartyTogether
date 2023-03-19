<script>
   
  import SignUpAndLogIn from "./SignUpAndLogIn.svelte";
  
  
  import { getFirestore, collection, addDoc } from 'firebase/firestore';
  import { v4 as uuidv4 } from 'uuid';
  import YouTubePlayer from "./YouTubePlayer.svelte";

  const db = getFirestore();

  let BackSignUpAndLogIn=false;
  let logOut=true;
  let roomLink;
  let roomClicked = false;
  let roomId;


  function handleLogOut(){
     BackSignUpAndLogIn=true;
     logOut=false;
  }

  async function createRoomLink() {
    const roomId = uuidv4();
    const roomRef = collection(db, 'rooms');
    await addDoc(roomRef, { roomId });
    roomLink = `http://localhost:${window.location.port}/home/${roomId}`;; // Replace with your actual base URL
    console.log(`Room created: ${roomLink}`);
  }

  
  function handleRoomClick(event) {
    event.preventDefault();
    roomId = event.target.href.split('/').pop();
    roomClicked = true;
  }
</script>

<!--LogOut Button-->
{#if logOut}
<button class="LogOut" on:click={handleLogOut}>Log Out</button> 
{/if}

<!--for going back to Sign Up and LogIn Component-->
{#if BackSignUpAndLogIn}
<SignUpAndLogIn />
{/if}

<button on:click={createRoomLink}>Create Room Link</button>

<!--Displaying the room link-->
{#if roomLink}
<p>Join Room: <a href={roomLink} on:click={handleRoomClick} target="_blank" rel="noreferrer">{roomLink}</a></p>
<div id="player"></div>
{/if}

{#if roomClicked}
  <YouTubePlayer roomId={roomId} />
{/if}
