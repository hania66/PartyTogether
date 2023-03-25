<script>

  import { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut } from "firebase/auth";
  import Home from "./Home.svelte";
  
   
   
  
  
      
    let email = '';
    let password = '';
    let confirmPassword='';
    let showLogInForm = false;
    let showSignUpForm = false;
    let SignUpButton= true;
    let LogInButton=true;
    let logOut=false;
    let SuccessfulSignUp= false;
    let createRoomLinkButton=false;
    
    let displayToken=false;
   
    
    
  
    
    



    function handleSignUp() {
    showSignUpForm = true;
    showLogInForm  = false;
    SuccessfulSignUp= false;
  }


  
  function handleLogIn() {
    showLogInForm  = true;
    showSignUpForm = false;
    SuccessfulSignUp= false;

  
  }





   
    const auth = getAuth();
    
  
    // Listen for changes in the user's authentication state
    onAuthStateChanged(auth, (user) => {
      SuccessfulSignUp = user !== null;
    });
  
    async function handleSignUpSubmit() {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }else createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in successfully, update the authentication state
            const SignUpUser = userCredential.user;
            console.log("Successful SignUp",SignUpUser);
            SuccessfulSignUp = true;
            logOut=true;
            createRoomLinkButton=true;
            displayToken=true;
            SignUpButton = false;
            showSignUpForm =false;
            LogInButton=false;

            
            
            
            
          })
          .catch((error) => {
           
            const errorMessage = error.message;
            alert ("This email is already exist",errorMessage);
          });
      }
    
      



      

      async function handleLogInSubmit() {
  
        
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const LogInUser = userCredential.user;
    console.log("LogIn Successfully",LogInUser);
            SuccessfulSignUp=true;
            SignUpButton = false;
            showLogInForm=false;
            LogInButton=false;
            logOut=true;
            displayToken=true;
            createRoomLinkButton=true;
            
            


    // ...
  })
  .catch((error) => {
    
    const errorMessage = error.message;
    alert ("Incorrect email or password",errorMessage);
  });
  }
  
    
  function handleLogOut(){
    location.reload();
    signOut(auth).then(() => {
      SuccessfulSignUp=false;
      createRoomLinkButton=false;
      SignUpButton = true;
      LogInButton=true;
      logOut=false;
      roomClicked=false;
      displayToken=false;
      console.log("Successfully LogOut");

      
  // Sign-out successful.
});

  }
  </script>
  
  
 
  
<div>
 
  {#if showSignUpForm}
  <form on:submit|preventDefault={handleSignUpSubmit}>
    <label>
      Email:
      <input type="email" bind:value={email} required>
    </label>
    <label>
      Password:
      <input type="password" bind:value={password} required>
      
    </label>
  
    <label>
      Confirm Password:
      <input type="password" bind:value={confirmPassword} required>
      
    </label>
    <button class="SubmitButton" type="submit">Submit</button>
    
  </form>
  {/if}
  
  </div>



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



    {#if SignUpButton}
    <button class="SignUpButton" on:click={handleSignUp}>Sign Up</button> 
    {/if}

    {#if LogInButton}
    <button class="LogInButton" on:click={handleLogIn}>Log In</button>
    {/if}

    {#if logOut}
<button class="LogOut" on:click={handleLogOut}>Log Out</button> 
{/if}


<div>
 {#if SuccessfulSignUp}
    
 <Home createRoomLinkButton={createRoomLinkButton}  displayToken={displayToken}/>
    
  {/if}
</div>


 




<style>
  label {
    margin: 1vh 0 1vh;
    padding: 1vh 2vw;
    text-align: center;
    font-size: 2.5vh;
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
    background-color: rgba(205, 96, 63, 0.981);
    color: white;
    
  }

  .LogInLabel {
    margin: 1vh 0vh;
    padding: 1vh 2vw;
    text-align: center;
    font-size: 2.5vh;
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

  .LogInSubmitButton {
    display: block;
    width: 80vw;
    max-width: 300px;
    margin: 0 auto -45vh;
    padding: 1.8vh 2vw;
    font-size: 4vw;
    border-radius: 5px;
    border: none;
    cursor: pointer;
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
    color: black;
    border: none;
    cursor: pointer;
    font-size: 2vw;
    font-weight: bold;
    
  }

  @media only screen and (min-width: 600px) {
    input,
    .SubmitButton,
    .SignUpButton,
    .LoginInput,
    .LogInSubmitButton,
    .LogInButton, 
    .LogOut{
      width: 50vw;
      font-size: 3vw;
      max-width: 400px;
    }
  }

  @media only screen and (min-width: 1200px) {
    input,
    .SubmitButton,
    .SignUpButton,
    .LoginInput,
    .LogInSubmitButton,
    .LogInButton,
    .LogOut {
      width: 30vw;
      font-size: 1.5vw;
      max-width: 500px;
    }
  }
</style>
