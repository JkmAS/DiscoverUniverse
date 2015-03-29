function displayStar(id){
			document.getElementById(id).style.display = document.getElementById(id).style.display == "none" ? "" : "none";			
}
setInterval(function(){displayStar("right")}, 2000);
setInterval(function(){displayStar("left")}, 8000);
