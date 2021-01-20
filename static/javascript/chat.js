"use strict";
/*
************ Intestazione ************
<div class="avatar">
	<img width="50" height="50" src="http://cs625730.vk.me/v625730358/1126a/qEjM1AnybRA.jpg">
</div>
<div class="info">
	<div class="name"></div>
	<div class="count">already 1 902 messages</div>
</div>
<i class="fa fa-star"></i>

************ Messaggio ************
<li class="you"> you --> tuo messaggio; other --> messaggio di altri
	<div class="head">
		<span class="time">10:13 AM, Today</span>
		<span class="name">Nome</span>
	</div>
	<div class="message">Testo</div>
</li>*/

const HEADER='<div class="avatar">'
	+'<img width="50" height="50" style="margin-top: -40px" id="imgAvatar">'
+'</div>'
+'<div class="info" style="margin-top: 10px">'
	+'<div class="name" id="otherUser"></div>'
	+'<div class="count"></div>'
+'</div>'
+'<i class="fa fa-star"></i>';

$(document).ready(function ()
{
	let socket;
	let username;
	let room_Id;
	let files = [];

	let conf = {
		cursorcolor: "#696c75",
		cursorwidth: "4px",
		cursorborder: "none"
	};

	let lol = {
		cursorcolor: "#cdd2d6",
		cursorwidth: "4px",
		cursorborder: "none"
	};

	let btnFile = $("#inputGroupFile01").hide();
	let btnAllega = $("#btnAllega");
	let txtMessage=$("#txtMessage");
	let utenti = $(".list-friends");
	let writeForm=$(".write-form").hide();
	let chatMenu=$("#chatMenu");

	let connected=false;
	let reload=false;
	let uData;//Utente loggato
	let sData;//Utente cercato e premuto

	let requestData=makeRequest("POST", "/api/checkToken");
    requestData.fail(function()
    {
		window.location.href="login.html";
    });
	requestData.done(function(data){
		console.log(data["uId"]);
		uData={"_id":data["uId"],"email":data["email"],"username":data["username"],"gender":data.gender}
    });

	utenti.niceScroll(conf);
	$(".messages").niceScroll(lol);

	socket = io.connect();
	console.log("socket: " + socket);

	socket.on('connect', function(){
		// 1) invio username
		//socket.emit("username", username);
		connetti();

		// 2) invio
		$("#btnInvia").click(function ()
		{
			if(files.length > 0)
			{
				invia(files);
			}
			else
			{
				invia();
			}
		});

		$(document).on("keyup", function(e)
		{
			if(e.keyCode==13 && !e.shiftKey)
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
			reload=true;
			socket.disconnect();
		});

		function invia(files = "")
		{
			if(txtMessage.val()!="")
			{
				if(room_Id.includes("noChat"))
				{
					let request = makeRequest("POST","/api/createPrivateRoom",{"uData1":uData,"uData2":sData});
					request.fail(error)
					request.done(function(data){
						room_Id=data["roomId"];
						socket.emit("connectRoom_Private", {"room":room_Id, "email":uData.email});
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
										//Dobbiamo capire come mai vada in errore con jqXHR.status = 0 e risolvere
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
					});
				}
				else
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
									//Dobbiamo capire come mai vada in errore con jqXHR.status = 0 e risolvere
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
		}

		function connetti()
		{
			let request = makeRequest("POST","/api/getInfo");
			request.fail(error);
			request.done(function(data){
				username=data.username;
				socket.emit("username", data.username);
				connected=true;
				cercaUtenti();
			});
		}
	});

	socket.on('notify_message', function(data){
		// ricezione di un messaggio dal server
		data = JSON.parse(data);
		visualizza(data.emailFrom, data.userFrom, data.message, data.date);
	});

	socket.on('msg_image', function (data) {
		console.log(data);
		data = JSON.parse(data);
		visualizza(data.emailFrom, data.userFrom, data.image, data.date, "img");
	});

	socket.on('disconnect', function(){
		if(!reload)
		{
			swal("Warning!", "You have been disconnected", "warning");
			connected=false;
		}
	});

	utenti.on("click", "li", function(){
		let otherUser=$(this).find("div.user");
		room_Id = otherUser.prop("id");
		sData=JSON.parse(localStorage.getItem(room_Id));
		writeForm.show();

		$(".messages").empty();
		$(".top").html(HEADER);
		$("#imgAvatar").prop("src",`img/User-${sData.gender}.png`);
		$("#otherUser").text(otherUser.text());
		$(".count").text($(this).find("div.status").text());

		if(!room_Id.includes("noChat_"))
		{
			console.log("Connecting");
			socket.emit("connectRoom_Private", {"room":room_Id, "email":uData.email});
			let request = makeRequest("POST","/api/getMessage",{"room_Id":room_Id});
			request.fail(error)
			request.done(function(data){
				data=data[0]["msg"];
				for (let item of data) {
					visualizza(item["email"], item["username"], item["msg"], item["date"], item["type"]);
				}
			})
		}
	});

	/*txtMessage.on("keyup", function(e)
	{
		if (e.keyCode == 13 && e.shiftKey) {
			$(this).val($(this).val()+"\n");
		}
	});*/

	$("#btnSearch").on("click", function(){
		$(this).prop("disabled", true);
		let request = makeRequest("POST","/api/findUsers");
			request.fail(error);
			request.done(function(data){
				localStorage.clear();
				chatMenu.empty();
				for(let item of data)
				{
					$(`<li><img width="50" height="50" src="img/User-${item["gender"]}.png">`+
					`<div class="info"><div class="user" id="noChat_${item["_id"]}">${item["username"]}</div>` +
					`<div class="status on">${item["email"]}</div></div></li>`).appendTo(chatMenu);
					localStorage.setItem(`noChat_${item["_id"]}`,JSON.stringify(item));
				}
				$("#btnReturn").prop("disabled", false);
			});
	});

	$("#btnReturn").on("click", cercaUtenti);

	/*
	$("#findAll").on("click",function(){
		search($(this).prop("id"));
	});

	$("#findOne").on("click",function(){
		search($(this).prop("id"));
	});

	function search(id)
	{
		console.log(id)
		if(id=="findAll")
		{
			let request = makeRequest("POST","/api/findUsers",{"val":$("#txtFindUser").val()});
			request.fail(error);
			request.done(function(data){
				localStorage.clear();
				chatMenu.empty();
				for(let item of data)
				{
					$(`<li><img width="50" height="50" src="img/User-${item["gender"]}.png">`+
					`<div class="info"><div class="user" id="noChat_${item["_id"]}">${item["username"]}</div>` +
					`<div class="status">${item["email"]}</div></div></li>`).appendTo(chatMenu);
					localStorage.setItem(`noChat_${item["_id"]}`,JSON.stringify(item));
				}
			});
		}
		else
		{
			console.log(ciao)
		}
	}*/

	txtMessage.on("keydown", function(e)
	{
		if($(this).val()=="" && (e.keyCode == 9 || e.keyCode == 32 || e.keyCode == 13))
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

	function visualizza (emailFrom, userFrom, message, date, type = "text") {
		date = new Date(date);
		if(type=="img")
		{
			message='<img src="' + message + '" style="width: 70%; height: 70%;"/>';
		}
		if(emailFrom==uData["email"])
		{
      		setMessage("you", userFrom, date.toLocaleTimeString(), message);
		}
		else
		{
      		setMessage("other", userFrom, date.toLocaleTimeString(), message);
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

	function cercaUtenti(){
		$("#btnReturn").prop("disabled", true);
		localStorage.clear();
		chatMenu.empty();
		$(".top").empty();
		$(".messages").empty();
		writeForm.hide();
		let request = makeRequest("POST", "/api/getChat", {"uId":uData["_id"]});
		request.fail(error);
		request.done(function(data){
			localStorage.clear();
			for(let item of data)
			{
				let i = 0;
				while(i<item.users.length)
				{
					if(item["users"][i]["email"]!=uData.email)
					{
						$(`<li><img width="50" height="50" src="img/User-${item["users"][i]["gender"]}.png">`+
						`<div class="info"><div class="user" id="${item["_id"]}">${item["users"][i]["username"]}</div>` +
						`<div class="status on">${item["users"][i]["email"]}</div></div></li>`).appendTo(chatMenu);
						localStorage.setItem(`${item["_id"]}`,JSON.stringify(item["users"][i]));
					}
					i++;
				}
			}
			$("#btnSearch").prop("disabled", false);
		});
    }

	function clearResizeScroll()
	{
		$(".messages").getNiceScroll(0).resize();
		return $(".messages").getNiceScroll(0).doScrollTop(999999, 999);
	}
});