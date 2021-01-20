"use strict"

let strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
let mediumPassword = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
let emailRgEx = /^[A-z0-9\.\+_-]+@[A-z0-9\._-]+\.[A-z]{2,6}$/;

$(document).ready(function()
{
    let _txtEmail=$("#txtEmail").prop("correct", false);
    let _txtPassword=$("#txtPassword").prop("correct", false);
    let _txtPasswordConf=$("#txtPasswordConf").prop("correct", false);
    let _lblError=$("#lblError").hide();
    let _btnChange=$("#btnChange").prop("disabled",true);

    let _emailContainer=$("#emailContainer");
    let _pwContainer=$("#pwContainer");
    let _pwConfContainer=$("#pwConfContainer");

    let cantChange=true;

    let problems=[];

    $.fn.addBorder = function(color){
        $(this).css({"border":`5px solid ${color}`});
    }

    $.fn.removeBorder = function(){
        $(this).css({"border":""});
    }

    let request=makeRequest("POST", "/api/checkToken");
    request.fail(error);
    request.done(function(data){
        console.log(data);
        if(data["ris"]=="token")
        {
            window.location.href="userManagement.html";
        }
    });

    let param = getParameters();
    if(param["id"])
    {
        _emailContainer.hide();
        _txtEmail.prop("correct", true);
    }
    else
    {
        _pwContainer.hide();
        _pwConfContainer.hide();
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
                            setCorrect("green", "Email", _this);
                            allControlCorrect();
                            _pwContainer.show();
                            _pwConfContainer.show();
                        }
                        else if(data["email"]=="find" && data.collection=="Transition")
                        {
                            swal("This account isn't ready yet!", "Please check your inbox.","warning")
                            _this.prop("correct", false);
                            setError("Email", _this);
                            allControlCorrect();
                            _pwContainer.hide();
                            _pwConfContainer.hide();
                        }
                        else
                        {
                            _this.prop("correct", false);
                            setError("Email", _this);
                            allControlCorrect();
                            _pwContainer.hide();
                            _pwConfContainer.hide();
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
                    _pwConfContainer.hide();
                }
            }
            else
            {
                //lunghezza minima non raggiunta
                _this.prop("correct", false);
                setError("Email", _this);
                allControlCorrect();
                _pwContainer.hide();
                _pwConfContainer.hide();
            }
        });
    });

    _txtPassword.on("input", function()
    {
        //Per maggiori info riferifsi a https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
        checking($(this), "Password", function(_this)
        {
            let password = _this.val();

            if(password.match(strongPassword))
            {
                _this.addBorder("purple");
                _txtPasswordConf.prop("borderColor", "purple");
            }
            else if(password.match(mediumPassword))
            {
                _this.addBorder("orange");
                _txtPasswordConf.prop("borderColor", "orange");
            }
            else
            {
                _this.addBorder("yellow");
                _txtPasswordConf.prop("borderColor", "yellow");
            }
            _this.prop("correct", true);

            if(_txtPasswordConf.val()!="")
            {
                confirmPW();
            }
        }, function(){
            confirmPW();
            if(_txtPassword.val()=="" && _txtPasswordConf.val()=="")
            {
                _txtPasswordConf.removeBorder();
            }
        });
    });

    _txtPasswordConf.on("input", function()
    {
        checking($(this), "Password", function(_this)
        {
            confirmPW();
        });
    });

    $("#divChange").on("mouseover", function(){
        if(cantChange)
        {
            _btnChange.css("color", "white");
        }
    });

    _btnChange.on("click", function(){
        if(!cantChange)
        {
            change();
        }
    });
    
    _btnChange.on("mouseover", function()
    {
        if(!cantChange)
        {
            _btnChange.css(
            {
                "color": "#3fc43a",
                "background": "white"
            });
        }
    });

    _btnChange.on("mouseout", function()
    {
        if(!cantChange)
        {
            _btnChange.css(
            {
                "color": "white",
                "background": "-webkit-linear-gradient(bottom right, #3fc43a, #77d640)"
            });
        }
    });

    $(document).on('keydown', function(e) {
        if (e.keyCode == 13 && !cantChange)
        {
            change();
        }
    });

    _lblError.children("div").children("div").children("button").on("click", function(){
		_lblError.hide();
    });

    function change() {
        cantChange=true;
        let request;
        if(param["id"])
        {
            request = makeRequest("POST","/api/changePassword",{"password":CryptoJS.MD5($("#txtPassword").val()).toString(),"id":param["id"]});
        }
        else
        {
            request = makeRequest("POST","/api/changePassword",{"password":CryptoJS.MD5($("#txtPassword").val()).toString(),"email":$("#txtEmail").val()});
        }
        request.fail(error);
        request.done(function(data)
        {
            swal("Password changed.", {
                icon: "success",
                title: "Good!",
                buttons: {
                    cancel: false,
                    confirm: "Login"
                }
            }).then((value) => {
                window.location.href = "./login.html";
            });
        });
    }

    function checking(control, controlName, controlFunction, ifNullFunc=null)
    {
        setTimeout(function(){
            if(control.val()=="")
            {
                if (typeof ifNullFunc === 'function')
                {
                    ifNullFunc();
                }
                control.prop("correct", false);
                setCorrect("", controlName, control);
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
        if(_txtEmail.prop("correct") && _txtPassword.prop("correct") && _txtPasswordConf.prop("correct"))
        {
            _btnChange.prop("disabled", false);
            cantChange=false;
        }
        else
        {
            _btnChange.prop("disabled", true);
            cantChange=true;
        }
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

    function setCorrect(color, controlName, control) {
        control.addBorder(color);
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

    function confirmPW()
    {
        if(_txtPassword.val() == _txtPasswordConf.val())
        {
            _txtPasswordConf.prop("correct", true);
            setCorrect(_txtPasswordConf.prop("borderColor"), "Password", _txtPasswordConf);
        }
        else
        {
            _txtPasswordConf.prop("correct", false);
            setError("Password", _txtPasswordConf);
        }
        allControlCorrect();
    }
});