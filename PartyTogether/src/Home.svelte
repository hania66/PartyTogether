<script>
   
  
  import { getFirestore, collection, addDoc, where, query, getDocs,onSnapshot,doc ,updateDoc} from 'firebase/firestore';
  import { v4 as uuidv4 } from 'uuid';
  

  import { getAuth } from "firebase/auth";
  import YouTubePlayer from "./YouTubePlayer.svelte";
  

  

  
  let roomClicked;
  let roomId=null;
  let currentRoomToken = "";
  let roomTokenHeading=false;
  let showPopup = false;
  let participantsBoxVisible = false;
  let participantsArray = [];
  export let TokenInput=true;
  export let createRoomTokenButton;

  
  const db = getFirestore();

  //When user will click on Create Room token Button,it will generate the room token and display on the popup window.
  async function createRoomToken() {
   const roomToken = uuidv4();
   const roomRef = collection(db, 'rooms');
   const newRoom = await addDoc(roomRef, { roomId: roomToken });
   roomId = newRoom.id;
   roomTokenHeading=true;
   currentRoomToken = roomToken; //storing the generated room token;
   showPopup = true;
   console.log("currentRoomToken:", currentRoomToken);


  }


  
//when user will click on Join Room Button,it will show the YouTube and other room components(Particpants,Room token etc.)
  async function joinRoomByToken() {
  const tokenInput = document.getElementById('roomTokenInput');
  const token = tokenInput.value;
  const roomRef = collection(db, 'rooms');
  const q = query(roomRef, where("roomId", "==", token));
  const querySnapshot = await getDocs(q);
  const auth = getAuth();
  //if users has joined the same room,it will update the participants list and other room activities(current video,searching etc)
  if (querySnapshot.size === 1) {
    const foundRoomId = querySnapshot.docs[0].id;
    roomId = foundRoomId;
    if(roomId && roomId === foundRoomId){
      // it will track  if users have joined the same room or different room
      console.log(`Joined room: ${token}`);
      roomClicked = true;
      createRoomTokenButton=false;
      
      
      
      
      // Storing the user in the database
      const usersRef = collection(db, 'users');
      const uid = auth.currentUser.uid;
      
      // Checking if user already exists in the room
      const existingUserQuery = query(usersRef, where('uid', '==', uid), where('roomId', '==', foundRoomId));
      const existingUserSnapshot = await getDocs(existingUserQuery);
      if (existingUserSnapshot.size === 0) {

        // User is joining the room for the first time, create a new document
        const querySnapshot2 = await getDocs(query(usersRef, where('uid', '==', uid)));
        const userDoc = querySnapshot2.docs[0];
        const displayName = userDoc.data().displayName;
        const avatarUrl = userDoc.data().avatarUrl;
        await addDoc(usersRef, {
          uid: uid,
          roomId: foundRoomId,
          displayName: displayName,
          avatarUrl:avatarUrl
        });
      } else {

        // User has already joined the room, update the existing document
        const existingUserDoc = existingUserSnapshot.docs[0];
        const existingUserRef = doc(usersRef, existingUserDoc.id);
        const querySnapshot2 = await getDocs(query(usersRef, where('uid', '==', uid)));
        const userDoc = querySnapshot2.docs[0];
        const displayName = userDoc.data().displayName;
        const avatarUrl = userDoc.data().avatarUrl;
        await updateDoc(existingUserRef, {
          displayName: displayName,
          avatarUrl:avatarUrl
        });
      }
      currentRoomToken = token;
     
      
      
    } else {
      console.log(`You have joined a different room with the same token: ${token}`);
      alert("You have joined a different room with the same token");
    }
  } else {
    console.log(`Room not found: ${token}`);
    alert("Room not found");
  }
}

//when user will click on Room Token,it will display the current room token
function displayCurrentRoomToken() {
  console.log("currentRoomToken:", currentRoomToken);
  currentRoomToken = currentRoomToken;
  roomTokenHeading=true;
  showPopup = true;
  
  }


//when user will click on Partcipants button,it will show the Partcipants list 
async function showParticipants() {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('roomId', '==', roomId));
  const querySnapshot = await getDocs(q);
  const participants = querySnapshot.docs.map(doc => ({name: doc.data().displayName, avatar: doc.data().avatarUrl}));
  // Listening chnages for real-time updates of Participants list
  onSnapshot(q, (snapshot) => {
    const updatedParticipants = snapshot.docs.map(doc => ({name: doc.data().displayName, avatar: doc.data().avatarUrl}));
    participantsArray = updatedParticipants;
  });
  participantsArray = participants;
  participantsBoxVisible = !participantsBoxVisible; 

    
  
 
}



</script>




<!---------------------- Create Room Token Button------------------------- -->
{#if createRoomTokenButton}
  <button class="CreateRoomButton" on:click={createRoomToken}>Create Room Token</button>
{/if}

<!-----------------------Room Token Popup and close button------------------------------->
{#if showPopup}
  <div class="popup-overlay">
    <div class="popup-content">
      <p class="RoomTokenHeading"> Copy your Room Token:</p>
      <p id="roomTokenDisplay">{currentRoomToken}</p>
      <button class="TokenPopup" on:click={() => showPopup = false}>Close</button>
    </div>
  </div>
{/if}

<!--------------------- Room token input and Join Room button------------------>
{#if TokenInput}
  {#if !roomClicked}
  <p class="InputToken">Enter or paste your Room Token:</p>
  <input type="text" id="roomTokenInput" />
  <button class="JoinRoom" on:click={joinRoomByToken}>Join Room</button>
   {/if}
{/if}


<!--------Room Content(YouTubePlayer,Partcipants Button,Room token Button,hide button)---------->
{#if roomClicked}
<div class="roomHeaderContainer">
  <h1 class="roomTitle">Party Room</h1>
  <div class="buttonGroupContainer">
    <button class="showParticipantsButton" on:click={showParticipants}>Participants</button>
    <button class="currentRoomTokenButton" on:click={displayCurrentRoomToken}>Room Token</button>
  </div>
</div>

<div class="participants-container">
  {#if participantsArray.length > 0 && participantsBoxVisible}
<div id="participantsBox" class="box">
<div class="box-header">
  <span class="ParticipantsLabel">Participants:</span>
  <button class="HideButton" on:click={showParticipants}>Hide</button>
</div>
<div id="participantsList" class="horizontal-list">
  {#each participantsArray as { name, avatar }}
    <div class="participant">
      <div class="avatar-container">
        <img src={avatar} alt="Avatar for {name}" class="avatar">
      </div>
      <span class="name">{name}</span>
    </div>
  {/each}
</div>
</div>
{/if}
</div>
  <div class="room-container">
    <div class="video-container">
      <YouTubePlayer roomId={roomId} />
      
    </div>
  </div>
{/if}



<style>

.ParticipantsLabel{
  font-weight: bold;
  color: white;
  font-size: 6vw;
  margin-bottom: 3px;
  
}

.HideButton{
  font-weight: bold;
  background-color: black;
  border:none;
  cursor: pointer;
  color: white;
  font-size: 6vw;

}
  .roomHeaderContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 1200px;
    margin: 6vh auto;
    background-color: black;
    box-sizing: border-box;
    padding: 16px;
    border-radius: 10px;
  }
  
  .roomTitle {
    font-size: 4vw;
    color:white;
    text-align: center;
    flex: 1;
    margin: 0;
  }
  
  .buttonGroupContainer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex: 1;
    min-width: 220px;
    max-width: 1000px
    
  }
  
  .buttonGroupContainer button {
    width: 200px;
    margin-left: 5px;
    font-size: 3vw;
    cursor: pointer;
  }
  

  
  .participants-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -4.5vh;
  margin-bottom: 8.5vh;
  margin-left: auto;
  margin-right: auto;
}

#participantsBox {
  background-color: black;
  border-radius: 10px;
  padding: 10px;
  width: 1200px;
  overflow-x: auto;
}

.box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
}

.horizontal-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: -2vh;
 
}

.participant {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  margin-bottom: 5px;
  margin-left: 0;
}

.avatar-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -5px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.name {
  margin-top: 2px;
  text-align: center;
  font-size: 3vw;
  color: white;
}

   .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .popup-content {
    background-color: #fcf6db;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.5);
    text-align: center;
  }
 
  


  .CreateRoomButton {
    display: block;
    width: 80vw;
    max-width: 500px;
    margin: 7vh auto 0;
    padding: 2vh 2vw;
    font-size: 3vw;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    background-color: #005180;
    color: white;
  }

  #roomTokenDisplay {
    display: block;
    width: 80vw;
    max-width: 450px;
    margin: -6vh auto;
    padding: 2vh 2vw;
    font-size: 3vw;
    text-align: center;
    border: 1px solid white;
    border-radius: 30px;
    background-color: white;
    color:black;
   
  }

  .RoomTokenHeading{

    width: 80vw;
    margin: 7vh auto;
    font-size: 3vw;
    text-align: center;
    color:black;
  }

  #roomTokenInput {
    display: block;
    width: 80vw;
    max-width: 550px;
    margin: -11vh auto;
    padding: 2vh 2vw;
    font-size: 3vw;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .JoinRoom {
    display: block;
    width: 80vw;
    max-width: 150px;
    margin: 12vh auto;
    padding: 2vh 2vw;
    font-size: 3vw;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    background-color: #ff5a5a;
    color: white;
  }

  .InputToken{
    
    display:block ;
    margin: 12vh auto;
    text-align: center;
    font-size:3vw ;
    color:#ffffff;
  }

  .TokenPopup{
    display:block;
    margin: 13vh auto 0vh;
    background-color: #005180;
    color: #ffffff;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    font-size: 4vw;
  }

  
  @media only screen and (min-width: 600px) {
    .CreateRoomButton,
    #roomTokenInput,
    .RoomTokenHeading,
    #participantsList,
    .InputToken,
    .JoinRoom{
      width: 50vw;
      font-size: 3vw;
      max-width: 400px;
    }


    
    
    .buttonGroupContainer button {
      width: 200px;
      font-size: 3vw;
    }
    

    .TokenPopup{
      font-size: 3vw;
     
    }

    .roomTitle{
      font-size: 4vw;
      color:white;
    }

    .ParticipantsLabel,
    .HideButton{
      font-size: 6vw;

    }

    
    #roomTokenDisplay{
      max-width: 300px;
      font-size: 3vw;
    }

    .participants-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .horizontal-list {
    justify-content: center;
    
    
  }
  
  .participant {
    width: 80px;
    
  }
  
  .avatar-container {
    width: 50px;
    height: 50px;
    margin-top: 3px;
  }
  
  .name {
    margin-top: 5px;
    font-size: 3vw;
  }

  .roomHeaderContainer {
    width: 100%;
  }

  }



  @media only screen and (max-width: 820px) {
  .roomTitle {
    font-size: 3vw;
    color:white;
  }

  .ParticipantsLabel,
    .HideButton{
      font-size: 3vw;

    }

  .buttonGroupContainer button {
    font-size: 2.5vw;
    width: 300px;
    margin-left: 5px;
  }

  .roomHeaderContainer {
    width: 100%;
  }

  .TokenPopup{
      font-size: 3vw;
      
    }
    #roomTokenDisplay{
      max-width: 100%;
      font-size: 3vw;
    }
    
  }

  @media only screen and (max-width: 912px) {
    .TokenPopup{
      font-size: 3vw;
     
    }
    #roomTokenDisplay{
      max-width: 100%;
      font-size: 3vw;
    }

    .ParticipantsLabel,
    .HideButton{
      font-size: 3vw;

    }
}
  

  @media only screen and (min-width: 1200px) {
    .CreateRoomButton,
    #roomTokenInput,
    .InputToken,
    .RoomTokenHeading,
    
    
   
    #participantsList  {
      width: 30vw;
      font-size: 1.5vw;
      max-width: 500px;
    }
    .TokenPopup{
      font-size: 1.5vw;
      
    }
    
    
    .roomTitle {
      font-size: 2.5vw;
    }

    .ParticipantsLabel,
    .HideButton{
      font-size: 1.5vw;

    }
    
    .buttonGroupContainer button {
      width: 600px;
      margin-left: 5px;
      font-size: 1.5vw;
    }

    .JoinRoom  {
      max-width: 240px;
      font-size: 1.5vw;

    }

    
    
    #roomTokenDisplay{
      max-width: 550px;
      font-size: 1.3vw;
    }

    .participants-container {
    width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .horizontal-list {
    justify-content: center;
   
  }
  
  .participant {
    width: 100px;
   
  }
  
  .avatar-container {
    width: 50px;
    height: 50px;
    margin-top: 5px;
  }
  
  .name {
    margin-top: 5px;
    font-size: 1vw;
  }

 

  }
  
  
  

 
</style>



