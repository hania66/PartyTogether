<script>

	
	import SignUpAndLogIn from "./SignUpAndLogIn.svelte";
	import { onMount } from "svelte";

  onMount(() => {
  window.addEventListener("popstate", function(event) {
	history.pushState(null, document.title, location.href);
	event.preventDefault();
  });
 });

	
	
	</script>
	
	<html lang="en">
	<style>
		
		body {
			background-color:#181816;
			
		}
     
  
		
		
		</style>
	
	<body >
	  
	<!--SignUp and LogIn component-->
	<main>
		<SignUpAndLogIn />
	</main>
	
	</body>
		
	</html>
	
	
	