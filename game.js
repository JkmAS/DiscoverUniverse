document.addEventListener("DOMContentLoaded", function(event) { 

//======================Setting of variables============================

	var canvas = document.getElementById("game");
	var ctx = canvas.getContext("2d");
	 
	var background = {
		y : -4000 + canvas.height, //canvas has 400px, background 4000px
		minX : 10,
		maxX : 690
	};
	
	var rocket = {
		direction : null,
		x : canvas.width/2,//set rocket in the middle
		y : canvas.height - 128 - 35,//image height = 128 //land = 35
		engine : 0,
		speed : 0,
		maxSpeed : 300,
		turning : 3,
		state : 1000
	};
	var heightRocket;
	var gravitation = 3;
		
	var numberObjects = 50;	
	var randomType;
	var types;
	//random from m to n -> Math.floor(Math.random() * (n-m+1)) + m
	
	var cloud = {};	
	for (i=0; i<=numberObjects; i++){		
		randomType = Math.floor((Math.random() * 3) + 0);
		types = ["small", "big", "storm"];
		cloud[i] = {
			//only in canvas width
			x : Math.floor((Math.random() * background.maxX) + background.minX),
			//only (400,1600)
			y : Math.floor((Math.random() * -1600) + 0),
			type: types[randomType]
		};
	}	

	var meteorite = {};
	for (i=0; i<=numberObjects; i++){		
		randomType = Math.floor((Math.random() * 2) + 0);
		types = ["small", "big"];
		meteorite[i] = {
			//only in canvas width
			x : Math.floor((Math.random() * background.maxX) + background.minX),
			//only (1800, 3000)
			y : Math.floor((Math.random() * -1200) - 1800),
			type: types[randomType]
		};
	}	
	
	//in km
	var karmarLine = 100; 
	var troposphere = 20; 
	var stratosphere = 50; 
	var mesosphere = 85; 		
	
	var unit;
	var message = "";	
	//Status of game - win|lost|start|explosion
	var game = null;

//==========================Images======================================	
	//upload images
	var img = {};
	var imgNames = ["land", "rocketOff", "rocketOffLeft",
					"rocketOffRight", "rocketOn", "rocketOnLeft",
					"rocketOnRight", "rocketExplosion", "satellite",
					"smallCloud", "bigCloud", "stormCloud",
					"smallMeteorite", "bigMeteorite"];
				
	for (var i = 0; i <= imgNames.length-1; i++){		
		img[imgNames[i]] = new Image();
		var loadImages = [];
		img[imgNames[i]].onload = function(){
			loadImages[i] = true;
		};
		if (loadImages[i] == false){
			console.log("[WARNING] The image "+imgNames[i]+" is not loaded");
			break;
		}
		img[imgNames[i]].src = 'images/'+imgNames[i]+".png";	
	}		
	
//========================Graphics and rendering========================	
	//render graphics
	function render(){
		drawImage("background");
		if(rocket.engine == 0){
			drawImage("rocketOff");
		} else {
			drawImage("rocketOn");	
		}	
		if(game == "explosion"){
			drawImage("rocketExplosion");
		}		
		if(game == "win"){
			drawImage("satellite");
		}		
		drawImage("sky");
		drawImage("space");
		drawText();
		move();		
	}		
	
	//draw images
	function drawImage(name){
		switch(name){
			case "background":
				ctx.drawImage(img.land, 0, background.y);
				break;		
			case "rocketOff":
				//center, which direction
				if (rocket.direction == null){
					ctx.drawImage(img.rocketOff, rocket.x, rocket.y);
					break;
				}
				//left, which direction
				if (rocket.direction == "left"){
					ctx.drawImage(img.rocketOffLeft, rocket.x, rocket.y);
					break;
				}
				//right, which direction
				if (rocket.direction == "right"){
					ctx.drawImage(img.rocketOffRight, rocket.x, rocket.y);
					break;
				} 
			case "rocketOn":
				//center, which direction
				if (rocket.direction == null){
					ctx.drawImage(img.rocketOn, rocket.x, rocket.y);
					break;
				}
				//left, which direction
				if (rocket.direction == "left"){
					ctx.drawImage(img.rocketOnLeft, rocket.x, rocket.y);
					break;
				}
				//right, which direction
				if (rocket.direction == "right"){
					ctx.drawImage(img.rocketOnRight,rocket.x, rocket.y);
					break;
				}
			case "rocketExplosion":
				ctx.drawImage(img.rocketExplosion,rocket.x, rocket.y);
				break;
			case "satellite":
				ctx.drawImage(img.satellite,rocket.x+100, rocket.y);
				break;
			case "sky":
				for (i=0; i<=numberObjects; i++){
					if (cloud[i].type == "big"){
						ctx.drawImage(img.bigCloud, cloud[i].x, cloud[i].y);
					}
					if (cloud[i].type == "small"){
						ctx.drawImage(img.smallCloud, cloud[i].x, cloud[i].y);
					}
					if (cloud[i].type == "storm"){
						ctx.drawImage(img.stormCloud, cloud[i].x, cloud[i].y);
					}
				}	
				break;			
			case "space":
				for (i=0; i<=numberObjects; i++){
					if (meteorite[i].type == "small"){
						ctx.drawImage(img.smallMeteorite, meteorite[i].x, meteorite[i].y);
					}
					if (meteorite[i].type == "big"){
						ctx.drawImage(img.bigMeteorite, meteorite[i].x, meteorite[i].y);
					}
				}	
				break;					
		}		
		calcHeightRocket();
	}
	
	function drawText(){
		ctx.font = "15px Ubuntu";
		ctx.fillStyle = "#ffffff";
		ctx.fillText("State: "+rocket.state,5,15);	
		ctx.fillText("Speed: "+rocket.speed,5,30);		
		ctx.fillText("Height: "+heightRocket+" "+unit,5, 45);
		ctx.fillText("Terminal: "+message, 5, 60);
	}
		
//===============================Listener===============================		
	addEventListener('keydown', controls, true);
	function controls(e) {
        switch (e.keyCode) {
			 // Left arrow, change locationX of rocket, change direction
			case 37:
				//you can not change direction at start
				if (game != "start"){
					rocket.x = rocket.x-rocket.turning;
					if (rocket.direction == null){
						rocket.direction = "left";
					}
					if (rocket.direction == "right"){
						rocket.direction = null;
					}
					if (rocket.direction == "left"){
						rocket.direction = "left";
					}
				}
				break;
			// Up arrow, turn on the engine
			case 38:
				//start, enable gravitation
				game = null;
				rocket.engine = 1;
				break;
			// Right arrow, change locationX of rocket, change direction
			case 39:
				//you can not change direction at start
				if (game != "start"){
					rocket.x = rocket.x+rocket.turning;
					if (rocket.direction == null){
						rocket.direction = "right";
					}
					if (rocket.direction == "left"){
						rocket.direction = null;
					}
					if (rocket.direction == "right"){
						rocket.direction = "right";
					}
				}
				break;
			// Down arrow, turn off the engine 
			case 40:
				rocket.engine = 0;
				break;
        }
    }	
    
    //move rocket
    function move(){
		//if the rocket has speed, height++ and change position of clouds
		if (rocket.speed > 0){
			background.y++;
			for (i=0; i<=numberObjects; i++){
				cloud[i].y++;
				meteorite[i].y++;
			}
		} else{
			//when the rocket launch, can not fall 
			if (game != "start"){
				background.y--;
				for (i=0; i<=numberObjects; i++){
					cloud[i].y--;
					meteorite[i].y--;
				}
			}			
		}
		//if engine is on, increase speed
		if (rocket.engine == 1 && rocket.speed <= rocket.maxSpeed){
			rocket.speed++;
		} else{
			//when the rocket launch, can not decrease speed of rocket
			if (game != "start"){
				rocket.speed = rocket.speed - gravitation;
			}	
		}
	}
	
//=================================Logic================================	
	
	//calculate height of rocket
	function calcHeightRocket(){
		heightRocket = (background.y+3600)*28;//100000/3600=28
		unit = "m";
		//change units to km
		if (heightRocket > 15000){
			heightRocket = heightRocket/1000;
			heightRocket = Math.round(heightRocket * 100) / 100;
			unit = "km";			
		}
	}
	
	//win the game
	function win(){
		if (heightRocket > karmarLine && unit == "km"){
			game = "win";
			message = "[Victory] Your space program was successful, satellite was launched";
		}
	}
	
	//lost connection the observatory 
	function lostConnection(){
		if (rocket.x < background.minX || rocket.x > background.maxX){
			game = "lost";
			message = "[Lost of connection] Rocket has deviated from its course";
		}
	}
		
	//destruction of the rocket
	function destruction(){
		if (rocket.speed < -300){
			game = "explosion";
			message = "[Destruction] Maximal descending speed is 300";
		}
		if (heightRocket < -30 && game == null){
			game = "explosion";
			message = "[Explosion] The rocket is not designed for landing on the ground";	
		}
		if (rocket.state <= 0){
			game = "explosion";
			message = "[Destruction] Rocket was heavily damaged";
		}
	}
	
	//detect the type of atmosphere
	function detectTypeAtmosphere(){
		if (heightRocket >= troposphere && unit == "km"){
			message = "[Info] The rocket reached troposphere";
		}
		if (heightRocket >= stratosphere && unit == "km"){
			message = "[Info] The rocket reached stratosphere";
		}
		if (heightRocket >= mesosphere && unit == "km"){
			message = "[Info] The rocket reached mesosphere";
		}
	}	
	
	//detect contact with another object
	function detectContact(type){		
		for (i=0; i<=numberObjects; i++){
			var distanceX;
			var distanceY;
			var difference;
			
			if (type == "sky"){
				difference = 60;
				distanceX = rocket.x-cloud[i].x;
				distanceY = rocket.y-cloud[i].y;
			} else {
				difference = 45;
				distanceX = rocket.x-meteorite[i].x;
				distanceY = rocket.y-meteorite[i].y;
			}
						
			if (distanceX < difference && distanceX > -difference
				&& distanceY < difference && distanceY > -difference){
				if (type == "sky"){		
					switch(cloud[i].type){
						case "small":
							rocket.state = rocket.state - 1;
							break;
						case "big":
							rocket.state = rocket.state - 2;
							break;
						case "storm":
							rocket.state = rocket.state - 3;
							break;
					}
				} else {
					switch(meteorite[i].type){
						case "small":
							rocket.state = rocket.state - 5;
							break;
						case "big":
							rocket.state = rocket.state - 10;
							break;
					}
				}
			}
		}		
	}
    
//==========================Starting games==============================

    // Cross-browser support for requestAnimationFrame
	var w = window;
	requestAnimationFrame = w.requestAnimationFrame || 
							w.webkitRequestAnimationFrame || 
							w.msRequestAnimationFrame || 
							w.mozRequestAnimationFrame;
							
    //start, disable gravitation
    game = "start";
        
    //main function
    function main(){
		detectContact("sky");
		detectContact("space");
		detectTypeAtmosphere();
		win();
		lostConnection();
		destruction();
		render();
		if (game != "explosion" && game != "lost" && game != "win"){
			requestAnimationFrame(main);
		}
	}	
		
    main();
});
