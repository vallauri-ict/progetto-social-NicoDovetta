"use strict"

let errorNumber = 0;//Dopo 3 inserimenti di password errati viene richiamato il logout

$(document).ready(function(){

    userLogged(true);
    let emailRgEx = /^[A-z0-9\.\+_-]+@[A-z0-9\._-]+\.[A-z]{2,6}$/;
    let strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    let mediumPassword = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

    let _userMan=$("#userMan");

    let _txtName=$("#txtName").prop("correct", true);
    let _txtSurname=$("#txtSurname").prop("correct", true);
    let _txtUsername=$("#txtUsername").prop("correct", true);
    let _txtDOB=$("#dob").prop("correct", true);
    let _txtEmail=$("#txtEmail").prop("correct", true);
    let _txtPassword=$("#txtPassword").prop("correct", true);
    let _txtPasswordConf=$("#txtPasswordConf").prop("correct", true);
    let _lblError=$("#lblError").hide();
    let _btnMod=$("#btnMod").prop("disabled", false);
    let _btnCancel=$("#btnCancel");

    let cantConfirm=false;

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

    _userMan.prop("href","");

    let request = makeRequest("POST","/api/getInfo");
    request.fail(error);
    request.done(function(data){
        if(data.gender=="Male")
        {
            $("#rdMale").prop("checked",true);
        }
        else if(data.gender=="Female")
        {
            $("#rdFemale").prop("checked", true);
        }
        else
        {
            $("#rdOther").prop("checked",true);
        }
        $("#imgUserMan").prop("src", $("#userImage").prop("src"));
        _txtUsername.val(data["username"]).addBorder("green");
        _txtName.val(data["name"]).addBorder("green");
        _txtSurname.val(data["surname"]).addBorder("green");
        focusDate(_txtDOB);
        _txtDOB.val(data["dob"]).addBorder("green");
        _txtEmail.val(data["email"]).addBorder("green");
    });

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

    _btnCancel.on("click", function(){
        history.back();
    });

    _btnCancel.on("mouseover", function()
    {
        btnMouseOver($(this));
    });

    _btnCancel.on("mouseout", function()
    {
        btnMouseOut($(this));
    });

    _txtDOB.on("focus", function()
    {
        let _this=$(this);
        focusDate(_this);
    });

    _txtDOB.on("blur", function()
    {
        let _this=$(this);
        if(_this.val()=="")
        {
            _this.prop("type","text");
        }
    });

    /*_txtEmail.on("input",function()
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
    });*/

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

    $("#divMan").on("mouseover", function(){
        if(cantConfirm)
        {
            _btnMod.css("color", "white");
        }
    });

    _btnMod.on("click", function(){
        if(!cantConfirm)
        {
            modify();
        }
    });

    _btnMod.on("mouseover", function()
    {
        btnMouseOver($(this));
    });

    _btnMod.on("mouseout", function()
    {
        btnMouseOut($(this));
    });

    function btnMouseOver(_this)
    {
        if(!cantConfirm)
        {
            _this.css(
            {
                "color": "#3fc43a",
                "background": "white"
            });
        }
    }

    function btnMouseOut(_this)
    {
        if(!cantConfirm)
        {
            _this.css(
            {
                "color": "white",
                "background": "-webkit-linear-gradient(bottom right, #3fc43a, #77d640)"
            });
        }
    }

    $(document).on('keydown', function(e) {
        if (e.keyCode == 13 && !cantConfirm)
        {
            modify();
        }
    });

    _lblError.children("div").children("div").children("button").on("click", function(){
		_lblError.hide();
    });

    _btnMod.on("click", function(){
        if(!cantConfirm)
        {
            modify();
        }
    });

    function modify()
    {
        cantConfirm=true;
        Swal.fire({
            title: 'To confirm enter your password',
            html: `<input type="password" id="password" class="swal2-input" placeholder="Password">`,
            icon:"warning",
            confirmButtonText: 'Confirm',
            focusConfirm: false,
            preConfirm: () => {
              const password = Swal.getPopup().querySelector('#password').value
              if (!password) {
                Swal.showValidationMessage(`Please enter login password`)
              }
              return {password: password }
            }
        }).then((result) => {
            let request = makeRequest("POST", "/api/login/",
            {
                "email":_txtEmail.val(),
                "password":CryptoJS.MD5(result.value.password).toString()
            });

            request.fail(function (jqXHR, testStatus, strError){
                if (jqXHR.status == 0)
                {
                    swal("Error!", "Password incorrect. Please try again.", "error");
                    errorCount();
                }
                else
                {
                    error(jqXHR, testStatus, strError);
                }
            });
            request.done(function(data){
                if(data["ris"]=="ok")
                {
                    let passwordVal;
                    if(_txtPassword.val()!="")
                    {
                        passwordVal=CryptoJS.MD5($("#txtPassword").val()).toString();
                    }
                    else
                    {
                        passwordVal="404";
                    }

                    let rqChange=makeRequest("POST","/api/updateUser/",{
                        "name":_txtName.val(),
                        "surname":_txtSurname.val(),
                        "email": _txtEmail.val(),
                        "gender":$('input[name="rdbGender"]:checked').val(),
                        "username":_txtUsername.val(),
                        "dob":_txtDOB.val(),
                        "password": passwordVal});
                    rqChange.fail(error);
                    rqChange.done(function(data){
                        console.log(data);
                        Swal.fire("Success!","User modified correctily.","success").then(function(){
                            if(passwordVal=="404")
                            {
                                window.location.reload(true);
                            }
                            else
                            {
                                logout();
                            }
                        });
                    });
                }
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
                if(controlName=="Password")
                {
                    control.prop("correct", true);
                }
                else
                {
                    control.prop("correct", false);
                }
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
            _btnMod.prop("disabled", false);
            cantConfirm=false;
        }
        else
        {
            _btnMod.prop("disabled", true);
            cantConfirm=true;
        }
    }

    function focusDate(_this)
    {
        if(_this.prop("type")=="text")
        {
            let date=new Date();
            date.setFullYear(date.getFullYear() - 18);
            _this.prop("type","date");
            _this.prop("min","1900-01-01");
            _this.prop("max", date.toISOString().split("T")[0]);
        }
    }

    function errorCount()
    {
        if(errorNumber != 3)
        {
            errorNumber++;
        }
        else
        {
            logout();
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

    function setCorrect(color, controlName, control) 
    {
        control.addBorder(color);
        problems.splice(problems.indexOf(controlName), 1);
        setlblErrorText();
        if(problems.length==0)
        {
            _lblError.hide();
        }
    }

    function setlblErrorText() 
    {
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