"use strict"

$(document).ready(function()
{
    let emailRgEx = /^[A-z0-9\.\+_-]+@[A-z0-9\._-]+\.[A-z]{2,6}$/;
    let strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    let mediumPassword = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

    let _txtName=$("#txtName").prop("correct", false);
    let _txtSurname=$("#txtSurname").prop("correct", false);
    let _txtUsername=$("#txtUsername").prop("correct", false);
    let _txtDOB=$("#dob").prop("correct", false);
    let _txtEmail=$("#txtEmail").prop("correct", false);
    let _txtPassword=$("#txtPassword").prop("correct", false);
    let _txtPasswordConf=$("#txtPasswordConf").prop("correct", false);
    let _lblError=$("#lblError").hide();
    let _btnSignUp=$("#btnSignUp").prop("disabled",true);

    let cantSignUp=true;

    let problems=[];

    $.fn.addBorder = function(color){
        $(this).css({"border":`5px solid ${color}`});
    }

    $.fn.removeBorder = function(){
        $(this).css({"border":""});
    }

    $.fn.getAge = function(birthDate){
        let today = new Date();
        let bDate = new Date(birthDate);
        let age = today.getFullYear() - bDate.getFullYear();
        let m = today.getMonth() - bDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < bDate.getDate()))
        {
            age--;
        }

        return age;
    }

    _txtName.on("input", function()
    {
        checking($(this), "Name", easyBorder);
    });

    _txtSurname.on("input", function()
    {
        checking($(this), "Surname", easyBorder);
    });

    _txtUsername.on("input", function()
    {
        checking($(this), "Username", easyBorder);
    });

    _txtDOB.on("input", function()
    {
        checking($(this), "Date of Birth", function(_this)
        {
            if(_this.val()>=_this.prop("min") && _this.val()<=_this.prop("max"))
            {
                let age=_this.getAge(_this.val());
                if(age >= 18)
                {
                    console.log("adult");
                    _this.prop("correct", true);
                    setCorrect("green", "Date of Birth", _this);
                }
                else
                {
                    console.log("underage");
                    _this.prop("correct", false);
                    setError("Date of Birth", _this);
                }
                allControlCorrect();
            }
            else
            {
                console.log("Invalid date");
                _this.prop("correct", false);
                setError("Date of Birth", _this);
                allControlCorrect();
            }
        });
    });

    _txtDOB.on("focus", function()
    {
        let _this=$(this);
        if(_this.prop("type")=="text")
        {
            let date=new Date();
            date.setFullYear(date.getFullYear() - 18);
            _this.prop("type","date");
            _this.prop("min","1900-01-01");
            _this.prop("max", date.toISOString().split("T")[0]);
        }
    });

    _txtDOB.on("blur", function()
    {
        let _this=$(this);
        if(_this.val()=="")
        {
            _this.prop("type","text");
        }
    });

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
                        if(data["email"]=="find")
                        {
                            if(data.collection=="Transition")
                            {
                                setError("Email<br>(Check your email box<br>to complete the subscription)", _this);
                            }
                            else
                            {
                                setError("Email<br>(User already subscribed)", _this);
                            }
                            _this.prop("correct", false);
                            allControlCorrect();
                        }
                        else
                        {
                            _this.prop("correct", true);
                            setCorrect("green", "Email", _this);
                            allControlCorrect();
                        }
                    });
                }
                else
                {
                    //email non valida
                    _this.prop("correct", false);
                    setError("Email", _this);
                    allControlCorrect();
                }
            }
            else
            {
                //lunghezza minima non raggiunta
                _this.prop("correct", false);
                setError("Email", _this);
                allControlCorrect();
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

    $("#divSignUp").on("mouseover", function(){
        if(cantSignUp)
        {
            _btnSignUp.css("color", "white");
        }
    });

    _btnSignUp.on("click", function(){
        if(!cantSignUp)
        {
            signUp();
        }
    });

    _btnSignUp.on("mouseover", function()
    {
        if(!cantSignUp)
        {
            _btnSignUp.css(
            {
                "color": "#3fc43a",
                "background": "white"
            });
        }
    });

    _btnSignUp.on("mouseout", function()
    {
        if(!cantSignUp)
        {
            _btnSignUp.css(
            {
                "color": "white",
                "background": "-webkit-linear-gradient(bottom right, #3fc43a, #77d640)"
            });
        }
    });

    $(document).on('keydown', function(e) {
        if (e.keyCode == 13 && !cantSignUp)
        {
            signUp();
        }
    });

    _lblError.children("div").children("div").children("button").on("click", function(){
		_lblError.hide();
    });

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

    function easyBorder(control)
    {
        control.addBorder("green");
        control.prop("correct", true);
        allControlCorrect();
    }

    function allControlCorrect()
    {
        if(_txtName.prop("correct") && _txtSurname.prop("correct") && _txtUsername.prop("correct") &&
           _txtDOB.prop("correct") && _txtEmail.prop("correct") && _txtPassword.prop("correct") && _txtPasswordConf.prop("correct"))
        {
            _btnSignUp.prop("disabled", false);
            cantSignUp=false;
        }
        else
        {
            _btnSignUp.prop("disabled", true);
            cantSignUp=true;
        }
    }

    function signUp()
    {
        cantSignUp=true;
        console.log("Sign up");
        let gender=$('input[name="rdbGender"]:checked').val();
        let passMd5 = CryptoJS.MD5(_txtPassword.val()).toString();
        let request = makeRequest("POST", "/api/signUp/",
        {
            "name":_txtName.val(),
            "surname":_txtSurname.val(),
            "username":_txtUsername.val(),
            "gender":gender,
            "dob":_txtDOB.val(),
            "email":_txtEmail.val(),
            "password":passMd5
        });

        request.fail(function(jqXHR, testStatus, strError)
        {
            error(jqXHR, testStatus, strError);
            cantSignUp=false;
            _btnSignUp.css(
            {
                "color": "white",
                "background": "-webkit-linear-gradient(bottom right, #3fc43a, #77d640)"
            });
        });
        request.done(function(data){
            console.log(data);
            swal("Registration almost done! To complete it please check your email and follow the instruction.", {
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
        for (let i = 0; i < problems.length; i++) {
            if(problems[i].includes("<br>(already used)"))
            {
                problems[i] = problems[i].replace("<br>(already used)", "");
            }
        }
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