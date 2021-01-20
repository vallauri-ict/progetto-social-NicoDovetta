"use strict"

$(document).ready(function () {
	let socket;
	let username;
	let room_Id;
	let files = [];

	let lol = {
		cursorcolor: "#cdd2d6",
		cursorwidth: "4px",
		cursorborder: "none"
	};

	let txtUser=$("#txtUser");
	let txtRoom=$("#room_Id");
	let btnFile = $("#inputGroupFile01");
	btnFile.hide();
	let btnAllega = $("#btnAllega");
	let txtMessage=$("#txtMessage");
	let wrapper=$("#wrapper");
	wrapper.hide();
	let connect=$("#connessione");

	let connected=false;
	let forced=false;
	let errorEnter=false;

	$(".messages").niceScroll(lol);
	// io. connect è SINCRONO, cioè l'esecuzione rimane
	// bloccata finchè non arriva la risposta dal server
	socket = io.connect();

	console.log("socket: " + socket);

	socket.on('connect', function(){
		// 1) invio username

		$("#btnConnect").on("click", connetti);

		// 2) invio
		$("#btnInvia").click(function () {
			if(files.length > 0)
			{
				invia(files);
			}
			else
			{
				invia();
			}
		});

		$(document).on("keyup", function(e){
			if(e.keyCode==13 && !e.shiftKey && !errorEnter)
			{
				if(connected)
				{
					if(files.length > 0)
					{
						invia(files);
					}
					else
					{
						invia();
					}
				}
				else
				{
					connetti();
				}
			}
		});

		// 3) disconnessione
		window.addEventListener('beforeunload', function (e) {
			forced=true;
			socket.disconnect();
		});

		function invia(files = "")
		{
			console.log(txtMessage.val());
			if(txtMessage.val()!="")
			{
				if(files.length == 0)
				{
					let msg = txtMessage.val();
					socket.emit("message", msg);
				}
				else
				{
					let error = false;
					for(let i = 0; i < files.length; i++)
					{
						let file = files[i], reader = new FileReader();
						if (file.type.match('image.*'))
						{
							reader.onload = function(evt){
								let request = makeRequest("POST","/api/sendImage", {"file":evt.target.result})
								request.fail(error);
								request.done(function(data){
									socket.emit("msg_image", data["secure_url"]);
								});
							};
							reader.readAsDataURL(file);
						}
						else
						{
							error=true;
						}
					}
					files.length = 0;
					btnFile.val("");
					if(error)
					{
						swal("Error","Insert image only. More file supported coming soon.","warning");
					}
					files = "";
				}
				txtMessage.val("");
			}
		}

		function connetti()
		{
            if(txtRoom.val() == "")
            {
				errorEnter=true;
				swal("Warning!", "Insert a room id.", "warning").then(function(){
					errorEnter=false;
				});
            }
            else
            {
                if(txtUser.val()!="")
                {
                    connect.hide();
                    username=txtUser.val();
                    socket.emit("username", username);

					room_Id=txtRoom.val();
					console.log(room_Id);
					socket.emit("connectRoom_Public",room_Id);
                    connected=true;
					wrapper.show();
                }
                else
                {
					errorEnter=true;
					swal("Warning!", "Insert your username for this public room.", "warning").then(function(){
						errorEnter=false;
					});
                }
            }
		}
	});


	socket.on('notify_message', function(data){
		//Ricezione di un messaggio dal server
		data = JSON.parse(data);
		visualizza(data.userFrom, data.message, data.date);
	});

	socket.on('no_room',function(){
		swal("Nope...","Before enter a room insert the code or generate one!","error");
		wrapper.hide();
		connect.show();
	});

	socket.on('msg_image', function (data) {
		data = JSON.parse(data);
		visualizza(data.userFrom, data.image, data.date, "img");
	});

	socket.on('userNOK',function (data) {
		wrapper.hide();
		room_Id="";
		connect.show();
		forced=true;

		swal("This username already exists in the selected room_Id. Choose another one", {
			icon: "error",
			title: "Error!",
			buttons: {
				cancel: false,
				confirm: "Ok"
			}
		  }).then((value) => {
			window.location.reload();
		  });
	});

	socket.on('disconnect', function(){
		if(!forced)
		{
			//alert("Sei stato disconnesso!");
			swal("Warning!", "You have been disconnected", "warning").then(function(){
				connected=false;
				connect.show();
				wrapper.hide();
			});
		}
		forced=false;
	});

	function visualizza (userSend, message, date, type = "text") {
		date = new Date(date);
		if(type=="img")
		{
			message='<img src="' + message + '" style="width: 70%; height: 70%;"/>';
		}
		if(userSend==username)
		{
      		setMessage("you", userSend, date.toLocaleTimeString(), message);
		}
		else
		{
      		setMessage("other", userSend, date.toLocaleTimeString(), message);
		}

		// auto-scroll dei messaggi
		clearResizeScroll();
  	}

	function setMessage(identity, name, time, message)
	{
		let container = $("<li>").addClass(identity).appendTo($(".messages"));
		let head=$("<div>").addClass("head").appendTo(container);
		$("<span>").text(time+" ").addClass("time").appendTo(head);
		$("<span>").text(name).addClass("name").appendTo(head);
		$("<div>").html(message).addClass("message").appendTo(container);
	}

	function clearResizeScroll()
	{
		$(".messages").getNiceScroll(0).resize();
		return $(".messages").getNiceScroll(0).doScrollTop(999999, 999);
	}

	/*txtMessage.on("keyup", function(e)
	{
		if (e.keyCode == 13 && e.shiftKey) {
			$(this).val($(this).val()+"\n");
		}
	});*/

	txtMessage.on("keydown", function(e)
	{
		if(($(this).val()=="") && (e.keyCode == 9 || e.keyCode == 32 || e.keyCode == 13))
		{
			return false;
		}
	});

	btnAllega.on("click", function(){
		btnFile.click();
	});

	btnFile.on("change", function(){
		if(this.files.length > 0)
		{
			let fileNames = "";
			for(let i = 0; i < (this.files).length; i++)
			{
				fileNames += this.files[i].name + ";";
				files.push(this.files[i]);
			}
			txtMessage.val(fileNames);
		}
	});

	$("#btnCopy").on("click",function(){
		if(txtRoom.val()!="")
		{
			navigator.clipboard.writeText(txtRoom.val()).then(function() {
				let tooltip = document.getElementById("btnCopy");
  				tooltip.innerHTML = "Copied!";
				console.log('Async: Copying to clipboard was successful!');
			}, function(err) {
				let tooltip = document.getElementById("myTooltip");
  				tooltip.innerHTML = "Not copied!";
			});
		}
	});

	$("#btnRoom").on("click", function()
	{
		let request=makeRequest("POST", "/api/generateRoom");
		request.fail(error);
		request.done(function(data)
		{
			txtRoom.val(data["roomCode"]);
		});
	})
});