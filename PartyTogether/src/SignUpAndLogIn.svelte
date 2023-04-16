<script>

  import { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut,updateProfile } from "firebase/auth";
  import Home from "./Home.svelte";
  import { getFirestore, collection, addDoc } from 'firebase/firestore';
 
  
  
   
  
    let password = '';
    let showLogInForm = false;
    let showSignUpForm = false;
    let SignUpButton= true;
    let LogInButton=true;
    let logOut=false;
    let SuccessfulSignUp= false;
    let createRoomTokenButton=false;
    let PartyImage=true;
    let TokenInput=false;
    let avatarUrl='';
    let avatarUrlImageAndDisplayName=false;
    let dropdownOpen = false;
    let PartyTogetherTitle=true;
    let PartyTogetherMainTitle=false;

    export let email = '';
    export let displayName='';
   
   
    
    
  
   


   //when user will click on SignUp Button,SignUp Form will be shown ,LogIn Form and PartyImage will be hidden 
    function handleSignUpButton() {
     
    showSignUpForm = true;
    showLogInForm  = false;
    SuccessfulSignUp= false;
    PartyImage=false;

    
     
  }


  
   //when user will click on LogIn Button,LogIn Form will be shown , SignUp Form and PartyImage will be hidden 
  function handleLogInButton() {
    showLogInForm  = true;
    showSignUpForm = false;
    SuccessfulSignUp= false;
    PartyImage=false;

  
  }




    //when user will click on dropdown ,which is on the profile display name,it will show logout 
    function Dropdown() {
    dropdownOpen = !dropdownOpen;
  }
   
   

     const auth = getAuth();
    const db = getFirestore();

     // Listening for changes in the user's authentication state
     onAuthStateChanged(auth, (user) => {
      SuccessfulSignUp = user !== null;
    });

    //Generating the  random avatar url
    function getRandomAvatarUrl(displayName) {
    const sets = ['set4,set3'];
    const selectedSet = sets[Math.floor(Math.random() * sets.length)];
    const colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const formattedName = displayName.trim().split(' ').join('+');
    return `https://robohash.org/${formattedName}&bgset=bg${color.substr(1)}&set=${selectedSet}`;
}


//handling the sign Up function.It will register the user email,user display Name and Password.
//After signing up  random avatar URL Image will be generated for the users profile,which will be based on the user's display name
async function handleSignUpSubmit() {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Successful SignUp", user);
      const avatarUrl = getRandomAvatarUrl(displayName);

      return Promise.all([
        updateProfile(user, { displayName: displayName, photoURL: avatarUrl }),
        addDoc(collection(db, 'users'), 
        { uid: user.uid, displayName: displayName, avatarUrl: avatarUrl })
      ]);
    })
    .then(() => {
      console.log("User's profile updated successfully.");

      //after singing Up ,it will show the Home component and other components will be hidden.
      SuccessfulSignUp = true;
      logOut = true;
      createRoomTokenButton = true;
      TokenInput = true;
      avatarUrlImageAndDisplayName=true;
      SignUpButton = false;
      showSignUpForm = false;
      LogInButton = false;
      PartyTogetherTitle=false;
      PartyTogetherMainTitle=true;

      //storing the avatar url for displaying the avatar Image 
      avatarUrl = auth.currentUser.photoURL;
      
      console.log(`Welcome, ${displayName}!`);
      console.log(`Your avatar image: ${auth.currentUser.photoURL}`);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/email-already-in-use') {
        alert('This email is already in use.', errorMessage);
      } else if (errorCode === 'auth/weak-password') {
        alert('Password should be atleast 6 characters.', errorMessage);
      } else {
        alert(errorMessage);
      }
    });
}






   //Handling LogIn function.It will have all that information which user registered during sign Up( email,  password display name and profile avatar image) 
      async function handleLogInSubmit() {
        signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Log in successful", user);
      
      displayName = user.displayName;
      avatarUrl = user.photoURL;
       
      console.log(`Welcome back, ${displayName}!`);
      console.log(`Your avatar image: ${avatarUrl}`);
      
       //after signing In ,it will show the Home component and other components will be hidden.
      SuccessfulSignUp = true;
      logOut = true;
      createRoomTokenButton = true;
      avatarUrlImageAndDisplayName=true;
      TokenInput = true;
      SignUpButton = false;
      showLogInForm = false;
      LogInButton = false;
      PartyTogetherTitle=false;
      PartyTogetherTitle=false;
      PartyTogetherMainTitle=true;

   
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
        alert('This password is wrong.');
      } else if (errorCode === 'auth/user-not-found') {
        alert('This email is incorrect.');
      } else {
        alert(errorMessage);
      }
    });
  
  }




//when user will click on log Out button,it will the show main components which and hide others
  function handleLogOut(){
    location.reload();
    signOut(auth).then(() => {
      SuccessfulSignUp=false;
      createRoomTokenButton=false;
      SignUpButton = true;
      LogInButton=true;
      logOut=false;
      roomClicked=false;
      TokenInput=false;
      PartyTogetherTitle=true;
      PartyImage=true;
      console.log("Successfully LogOut");

      
  
});

  }
  </script>




    <!---App Title -->
{#if PartyTogetherTitle}
	  <header>
		<h1 class="PartyTogetherTitle">PartyTogether</h1>
		
	  </header>
{/if}


    <!---PartyImage Content  -->
{#if PartyImage}
  <div class="image-container">
    <img src="./PartyContent.jpg" alt="PartyContent" />
  </div>
  {/if}


  
    <!------------------sign up Form------------------- -->
  
<div>
 
  {#if showSignUpForm}
  <form on:submit|preventDefault={handleSignUpSubmit}>
    <label>
      Email:
      <input type="email" bind:value={email} required>
    </label>
    <label>
      Username:
      <input type="text" bind:value={displayName} required>
      
    </label>
  
    <label>
      Password:
      <input type="password" bind:value={password} required>
      
    </label>
    <button class="SubmitButton" type="submit">Submit</button>
    
  </form>
  {/if}
  
  </div>



    <!---------------------LogIn Form------------------------- -->
  <div>
 
  {#if showLogInForm }
    <form on:submit|preventDefault={handleLogInSubmit}>
      <label class="LogInLabel">
        Email:
        <input class="LoginInput" type="email" bind:value={email} required>
      </label>
      <label>
        Password:
        <input class="LoginInput" type="password" bind:value={password} required>
        
      </label>
      <button class="LogInSubmitButton" type="submit">Submit</button>
      
    </form>
    
    {/if}
   
    </div>


    <!---------------------signUp and LogIn Buttons------------------ -->
    {#if SignUpButton}
    <button class="SignUpButton" on:click={handleSignUpButton}>Sign Up</button> 
    {/if}

    {#if LogInButton}
    <button class="LogInButton" on:click={handleLogInButton}>Log In</button>
    {/if}

  
    
    
    <!---------Home Components,Avatar Image and displayName,which will be shown after signingUp or LogingIn--------------->
    <div>
      {#if SuccessfulSignUp}
      {#if PartyTogetherMainTitle}
      <div class="header-wrapper">
            <header class="header">
            <h1>PartyTogether</h1> 
            <div class="user-info">
              {#if avatarUrlImageAndDisplayName}
              <img class="avatarUrl" src={avatarUrl} alt="" />
                <button on:click={Dropdown} class="user-info__name">
                  {displayName} &#x25BE;
                </button>
                {#if dropdownOpen}
                  <ul class="dropdown-menu">
                    <li><button on:click={handleLogOut}>Log Out</button></li>
                  </ul>
                {/if}
              {/if}
              {#if logOut && !avatarUrlImageAndDisplayName}
                <button class="LogOut" on:click={handleLogOut}>Log Out</button> 
              {/if}
              
            </div>
           </header>
          </div>
       
        {/if}
        <Home createRoomTokenButton={createRoomTokenButton}  TokenInput={TokenInput}  />
      {/if}
    </div>


 




<style>
 
 .PartyTogetherTitle{
			text-align: center;
			font-size: 6vh;
			color: #cd603ffa;
		}
	

  label {
    margin: 1vh 0 1vh;
    padding: 1vh 2vw;
    text-align: center;
    font-size: 2.5vh;
    color: #ffffff;
  }

  input {
    display: block;
    width: 80vw;
    max-width: 300px;
    margin: 0 auto 2vh;
    padding: 1.7vh 2vw;
    font-size: 1.5vh;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .SubmitButton {
    display: block;
    width: 80vw;
    max-width: 300px;
    margin: 0 auto -45vh;
    padding: 1.8vh 2vw;
    font-size: 4vw;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    background-color:   #80808054;
    color:#ffffff;
  }

  .SignUpButton {
    display: block;
    width: 80vw;
    max-width: 300px;
    margin: 50vh auto 0;
    padding: 1.6vh 2vw;
    font-size: 4vw;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    background-color: #cd603ffa;
    color: white;
    
  }

  .LogInLabel {
    margin: 1vh 0vh;
    padding: 1vh 2vw;
    text-align: center;
    font-size: 2.5vh;
    color: #ffffff;
  }

  .LoginInput {
    display: block;
    width: 80vw;
    max-width: 300px;
    margin: 0 auto 3vh;
    padding: 1.7vh 2vw;
    font-size: 2vh;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .LogInSubmitButton  {
    display: block;
    width: 80vw;
    max-width: 300px;
    margin: 0 auto -45vh;
    padding: 1.8vh 2vw;
    font-size: 4vw;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    background-color:  #80808054;
    color:#ffffff;
  }

  .LogInButton {
    display: block;
    width: 80vw;
    max-width: 300px;
    margin: 5vh auto;
    padding: 1.8vh 2vw;
    font-size: 4vw;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    background-color: #cd603ffa;
    color: #ffffff;
  }

  
  .LogOut{
    display: block;
    margin:auto;
    background-color: transparent;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 3vw;
    font-weight: bold;
    
    
  }

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 2px solid #ccc;
  color:#cd603ffa;
  font-size: 4vw;
  
}

.header-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}
.avatarUrl {
  width: 80px; 
  height: 80px; 
  border-radius: 50%; 
  display: block; 
  margin: 0 auto;
  background-color: #ccc; 
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center; 
  flex-direction: column; 
  text-align: center; 
  margin-left: 10px;
}

.user-info__name {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 3.5vw; 
  font-weight: bold;
  color: white; 
}

.dropdown-menu  {
  position: absolute;
  background-color: white;
  padding: 0.5rem;
  list-style: none;
  
}

.dropdown-menu li button{
  margin: 0.5rem 0;
  background-color: transparent;
  border: none;
  cursor: pointer;
  

}
  .image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 7vh auto -45vh;
    
  }
  
  
  .image-container img {
    width: 80vw;
    max-width: 600px;
  }


  @media only screen and (min-width: 600px) {
    input,
    .SubmitButton,
    .SignUpButton,
    .LoginInput,
    .LogInSubmitButton,
    .LogInButton, 
    .LogOut,
    
   

    .header{
      font-size: 3vw;
    }
    .user-info__name{
      font-size: 3vw;
    }
    .avatarUrl {
    width: 60px;
    height: 60px;
  }
  }

  @media only screen and (max-width: 820px) {
    .user-info__name{
      font-size: 3vw;
    }
}

  @media only screen and (min-width: 1200px) {
     input,
    .SubmitButton,
    .SignUpButton,
    .LoginInput,
    .LogInSubmitButton,
    .LogInButton,
    .LogOut{
      width: 30vw;
      font-size: 1.5vw;
      max-width: 500px;
    }
  
    
    .header{
      font-size: 2.5vh;
    }
    .user-info__name{
      font-size: 1.5vw;
    }
    .avatarUrl {
    width: 80px;
    height: 80px;
  }
  }
</style>
