"use strict"
const ACCESS_BUTTONS=
'<li class="nav-item">'
+'<a class="btn btn-primary noselect" href="signUp.html">Sign Up</a>'
+'</li>'

+'<li class="nav-item">'
+'<a class="btn btn-success noselect" href="login.html" style="margin-left: 10%;">Login</a>'
+'</li>';

const LOGGED_BUTTONS=
'<li class="nav-item">'
+'<a class="btn btn-danger  noselect" id="btnDisconnect" style="margin-top: 5%;">Disconnect</a>'
+'</li>'

+'<li class="nav-item">'
+'<a class="noselect" id="userMan" href="userManagement.html" style="margin-left: 10%;">'
+'<img id="userImage">'
+'</a>'
+'</li>';
const LI_NOT_LOGGED =
'<li id = "linkSignUp" class="nav-item active">'
+'<a class="nav-link noselect" href="signUp.html">Sign Up</a>'
+'</li>'

+'<li id = "linkLogin" class="nav-item active">'
+'<a class="nav-link noselect" href="login.html">Login</a>'
+'</li>';

const LI_LOGGED =
'<li id = "linkDisc" class="nav-item active">'
+'<a class="nav-link noselect" >Disconnect</a>'
+'</li>'

+'<li id = "linkUser" class="nav-item active">'
+'<a class="nav-link noselect" href="userManagement.html>Profile</a>'
+'</li>';

function makeRequest(method, url, parameters = {}) {
    let contentType;
    if (method.toUpperCase() == "GET")
    {
        contentType = "application/x-www-form-urlencoded; charset=UTF-8"
    }
    else
    {
        contentType = "application/json; charset=UTF-8"
        parameters = JSON.stringify(parameters);
    }

    return $.ajax({
        url: url, //default: currentPage
        type: method,
        data: parameters,
        contentType: contentType,
        dataType: "json",
        timeout: 500000
    });
}


function error(jqXHR, testStatus, strError) {
    if (jqXHR.status == 0)
    {
        swal("Error!", "Connection refused or Server timeout", "error");
    }
    else if(jqXHR.status == 403)
    {
        window.location.href="login.html";
    }
    else if (jqXHR.status == 200)
    {
        swal("Error!", "Data format uncorrect: " + jqXHR.responseText, "error");
    }
    else
    {
        swal("Error!", "Server Error: " + jqXHR.status + " - " + jqXHR.responseText, "error");
    }
}

function doned(data) {
    console.log(data);
}

function userLogged(login=false, callback=null)
{
    let request=makeRequest("POST", "/api/checkToken");
    let logged = false;
    request.fail(function()
    {
        logged=false;
        if (typeof callback === 'function')
        {
            callback(logged);
        }
        return logged;
    });
    request.done(function(data){
        if(data["ris"]!="noToken")
        {
            $("#btnContainer").html(LOGGED_BUTTONS);
            $("#btnDisconnect").on("click", logout);
            $("#userImage").prop({
                "src":`img/User-${data.gender}.png`,
                "alt":"Avatar",
                "class":"avatar"
            });

            logged=true;

        }
        else if (login)
        {
            window.location.href="../login.html";
        }
        else
        {
            //$("#btnContainer").html($("#btnContainer").html() + LI_NOT_LOGGED);
            $("#btnContainer").html($("#btnContainer").html() + ACCESS_BUTTONS);
            logged=false;
        }
        if (typeof callback === 'function')
        {
            callback(logged);
        }
    });
}

function logout()
{
    let reqLogout=makeRequest("POST","api/logout");
    reqLogout.fail(error);
    reqLogout.done(function(data){
        let path = window.location.pathname;
        let page = path.split("/").pop();
        if(page!="userManagement.html" && page!="reserPassword.html")
        {
            window.location.reload(true);
        }
        else
        {
            window.location.href="../index.html";
        }
    });
}

function getParameters()
{
    let params=window.location.search.replace("?", "").split("&");
    let returnedParams={};

    for(let i=0; i<params.length;i++)
    {
        let thisParameter=params[i].split("=");
        returnedParams[thisParameter[0]]=thisParameter[1];
    }
    return returnedParams;
}