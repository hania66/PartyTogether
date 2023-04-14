<script>

	
	import SignUpAndLogIn from "./SignUpAndLogIn.svelte";
	import { onMount } from "svelte";

  onMount(() => {
  // Prevent back exit function
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
	  
	
	<main>
		<SignUpAndLogIn />
	</main>
	
	</body>
		
	</html>
	
	
	