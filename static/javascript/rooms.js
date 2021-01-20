"use strict"

let logged;

$(document).ready(function()
{
    userLogged(false, function (isLogged) {
        logged = isLogged;
        if(!logged)
        {
            $("#btnPrivateRoom").addClass('disabled');
            $("#btnGroupRoom").addClass('disabled');
        }
    });
});