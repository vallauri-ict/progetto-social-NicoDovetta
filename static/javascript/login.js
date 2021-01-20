"use strict"

$(document).ready(function()
{
    let emailRgEx = /^[A-z0-9\.\+_-]+@[A-z0-9\._-]+\.[A-z]{2,6}$/;

    let _txtEmail=$("#txtEmail").prop("correct", false);
    let _txtPassword=$("#txtPassword").prop("correct", false);
    let _lblError=$("#lblError").hide();
    let _btnLogin=$("#btnLogin").prop("disabled",true);

    let _pwContainer=$("#pwContainer").hide();

    let cantLogin=true;

    let problems=[];

    $.fn.addBorder = function(color){
        $(this).css({"border":`5px solid ${color}`});
    }

    $.fn.removeBorder = function(){
        $(this).css({"border":""});
    }

    _txtEmail.on("input",function()
    {
        checking($(this), "Email", function(_this)
        {
            if(!_this.val().length < 5)
            {
                if(_this.val().match(emailRgEx) && !_this.prop("correct"))
                {
                    let request = makeRequest("GET", "/api/findMail/", {"email":_this.val()});
                    request.fail(error);

                    request.done(function(data)
                    {
                        console.log(data);
                        if(data["email"]=="find" && data.collection=="Users")
                        {
                            _this.prop("correct", true);
                            setCorrect("Email", _this);
                            allControlCorrect();
                            _pwContainer.show();
                        }
                        else if(data["email"]=="find" && data.collection=="Transition")
                        {
                            swal("This account isn't ready yet!", "Please check your inbox.","warning")
                            _this.prop("correct", false);
                            setError("Email", _this);
                            allControlCorrect();
                            _pwContainer.hide();
                        }
                        else
                        {
                            _this.prop("correct", false);
                            setError("Email", _this);
                            allControlCorrect();
                            _pwContainer.hide();
                        }
                    });
                }
                else
                {
                    //email non valida
                    _this.prop("correct", false);
                    setError("Email", _this);
                    allControlCorrect();
                    _pwContainer.hide();
                }
            }
            else
            {
                //lunghezza minima non raggiunta
                _this.prop("correct", false);
                setError("Email", _this);
                allControlCorrect();
                _pwContainer.hide();
            }
        });
    });

    _txtPassword.on("input", function()
    {
        checking($(this), "Password", function(_this)
        {
            if(_this.val()=="")
            {
                _this.prop("correct", false);
                setError("Password", _this);
                allControlCorrect();
            }
            else
            {
                _this.prop("correct", true);
                setCorrect("Password", _this);
                allControlCorrect();
            }
        });
    });

    $("#divLogin").on("mouseover", function(){
        if(cantLogin)
        {
            _btnLogin.css("color", "white");
        }
    });

    _btnLogin.on("click", function(){
        if(!cantLogin)
        {
            login();
        }
    });

    _btnLogin.on("mouseover", function()
    {
        if(!cantLogin)
        {
            _btnLogin.css(
            {
                "color": "#3fc43a",
                "background": "white"
            });
        }
    });

    _btnLogin.on("mouseout", function()
    {
        if(!cantLogin)
        {
            _btnLogin.css(
            {
                "color": "white",
                "background": "-webkit-linear-gradient(bottom right, #3fc43a, #77d640)"
            });
        }
    });

    $(document).on('keydown', function(e) {
        if (e.keyCode == 13 && !cantLogin)
        {
            login();
        }
    });

    _lblError.children("div").children("div").children("button").on("click", function(){
		_lblError.hide();
    });

    function checking(control, controlName, controlFunction)
    {
        setTimeout(function(){
            if(control.val()=="")
            {
                control.prop("correct", false);
                setCorrect(controlName, control);
                control.removeBorder();
                allControlCorrect();
            }
            else
            {
                controlFunction(control);
            }
        }, 250);
    }

    function allControlCorrect()
    {
        if(_txtEmail.prop("correct") && _txtPassword.prop("correct"))
        {
            _btnLogin.prop("disabled", false);
            cantLogin=false;
        }
        else
        {
            _btnLogin.prop("disabled", true);
            cantLogin=true;
        }
    }

    function login()
    {
        cantLogin=true;
        console.log("Login");
        let passMd5 = CryptoJS.MD5(_txtPassword.val()).toString();
        let request = makeRequest("POST", "/api/login/",
        {
            "email":_txtEmail.val(),
            "password":passMd5
        });

        request.fail(function(jqXHR, testStatus, strError)
        {
            error(jqXHR, testStatus, strError);
            cantLogin=false;
            _btnLogin.css(
            {
                "color": "white",
                "background": "-webkit-linear-gradient(bottom right, #3fc43a, #77d640)"
            });
        });
        request.done(function(data)
        {
            console.log(data);
            let previousPath = document.referrer;
            let previousPage = previousPath.split("/").pop();
            console.log(previousPage);
            if(previousPage=="signUp.html" || previousPage=="resetPassword.html" || previousPage.includes("confirmSubscription.html"))
            {
                window.location.href="../index.html";
            }
            else
            {
                history.back();
            }
        });
    }

    function setError(controlName, control)
    {
        if(problems.indexOf(controlName)==-1)
        {
            control.addBorder("red");
            problems.push(controlName);
            setlblErrorText();
        }
        _lblError.show();
    }

    function setCorrect(controlName, control) {
        control.addBorder("green");
        problems.splice(problems.indexOf(controlName), 1);
        setlblErrorText();
        if(problems.length==0)
        {
            _lblError.hide();
        }
    }

    function setlblErrorText() {
        let str="<strong>Error!</strong> Problems with:";
        for (let i = 0; i < problems.length; i++) {
            str+=`<br>${problems[i]}`;
        }
        $("#lblText").html(str);
    }
});