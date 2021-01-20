"use strict"

$(document).ready(function()
{
    let param = getParameters();
    if(param["id"])
    {
        let request = makeRequest("GET","/api/confirmSignUp/",{"id":param["id"]});
        request.fail(error);
        request.done(function(data){
            if(data["ris"]=="ok")
            {
                swal("Now you have joined our community!", {
                    icon: "success",
                    title: "Good!",
                    buttons: {
                        cancel: false,
                        confirm: "Login"
                    }
                }).then((value) => {
                    window.location.href = "./login.html";
                });
            }
            else
            {
                swal("We don't have find your id. If you think this is an error please contact us at agenversincofficial@gmail.com", {
                    icon: "warning",
                    title: "Sorry!",
                    buttons: {
                        cancel: false,
                        confirm: "Home"
                    }
                }).then((value) => {
                    window.location.href = "./index.html";
                });
            }
        });
    }
});