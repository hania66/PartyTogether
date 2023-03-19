<script>

  import { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged } from "firebase/auth";
  import { navigate } from "svelte-navigator";
  import { Router, Route } from "svelte-navigator"
 
  
  import Home from "./Home.svelte";
   
   
  
  
      
    let email = '';
    let password = '';
    let confirmPassword='';
    let showLogInForm = false;
    let showSignUpForm = false;
    let SignUpButton= true;
    let LogInButton=true;
    
  
    let SuccessfulSignUp= false;
    
  
    
    



    function handleSignUp() {
    showSignUpForm = true;
    showLogInForm  = false;
  }


  
  function handleLogIn() {
    showLogInForm  = true;
    showSignUpForm = false;

  
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
            SignUpButton = false;
            showSignUpForm =false;
            LogInButton=false;
            navigate('/home');
            
            
            
          })
          .catch((error) => {
            const errorCode = error.code;
            alert(errorCode);
            const errorMessage = error.message;
            alert (errorMessage);
          });
      }
    
      



      

      async function handleLogInSubmit() {
  
        const auth = getAuth();
signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const LogInUser = userCredential.user;
    console.log("LogIn Successfully",LogInUser);
            SuccessfulSignUp=true;
            SignUpButton = false;
            showLogInForm=false;
            LogInButton=false;
            navigate('/home');
            


    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    alert(errorCode);
    const errorMessage = error.message;
    alert (errorMessage);
  });
  }
  
    
  </script>
  
  
 
  
    <div>
  {#if SignUpButton}
  <button class="SignUpButton" on:click={handleSignUp}>Sign Up</button> 
  {/if}
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
   
  {#if SuccessfulSignUp}
  <Router>
    <Route path="/home" component={Home} />
  </Router>
{/if}
  
  
  </div>



  <div>
  {#if LogInButton}
    <button class="LogInButton" on:click={handleLogIn}>Log In</button>
    {/if}
    
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

   
 
  <style>
  
  label {
      
     
      margin-left: 580px;
      padding: 10px 30px;
      margin-top:-400px ;
      margin-bottom: 200px;
    }
  
  input {
      
      
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      margin-bottom: 200px;
      margin-left:10px;
     
    }
  
    .SubmitButton {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      max-width: 300px;
      margin-left:600px;
      margin-top: -330px;
      margin-bottom: 80px;
      font-size: 20px;
      padding: 10px 30px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      
      }
  
      .SignUpButton{

display: flex;
justify-content: center;
align-items: center;
width: 100%;
max-width: 300px;
margin-left: 600px;
margin-top: 500px;
font-size: 20px;
padding: 10px 30px;
border-radius: 5px;
border: none;
cursor: pointer;
background-color: rgba(205, 96, 63, 0.981);
color: white;
}



.LogInLabel {
    
    margin-left: 580px;
    padding: 10px 30px;
    margin-top:-800px ;
    margin-bottom: 700px;
      }
    
      .LoginInput{
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 100px;
    margin-left:10px;
      }
    
      .LogInSubmitButton {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    max-width: 300px;
    margin-left:600px;
    margin-top: -760px;
    margin-bottom: 80px;
    font-size: 20px;
    padding: 10px 30px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
        
        }

        .LogInButton{

display: flex;
justify-content: center;
align-items: center;
width: 100%;
max-width: 300px;
margin-left:600px ;
margin-bottom:400px ;
margin-top: 40px;
font-size: 20px;
padding: 10px 30px;
border-radius: 5px;
border: none;
cursor: pointer;
background-color: #cd603ffa;
color: #ffffff;
}
  
    </style>
    
  
  