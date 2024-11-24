$(document).ready(function () {
  $("#txtEmail").keyup(function () {
    let email = $("#txtEmail").val();
    if (email === "") {
      $("#errEmail").html("");
      return;
    }
    let expp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let res = expp.test(email);
    if (res == true) {
      $("#errEmail").html("It's Valid");
      $("#errEmail").addClass("text-success").removeClass("text-danger");
    } else $("#errEmail").html("Invalid Email Id").addClass("text-danger").removeClass("text-success");
  });

  $("#txtPassword").keyup(function () {
    let pwd = $("#txtPassword").val();
    if (pwd === "") {
      $("#errPassword").html(""); // Clear error message if input is empty
      return; // Exit function if the field is empty
    }
    let expp =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    let res = expp.test(pwd);
    if (res === true) {
      $("#errPassword")
        .html("It's valid")
        .addClass("text-success")
        .removeClass("text-danger");
    } else {
      $("#errPassword")
        .html("Invalid PassWord")
        .addClass("text-danger")
        .removeClass("text-success");
    }
  });

  $("#txt-Confirm-password").keyup(function () {
    let confirmPassword = $("#txt-Confirm-password").val();
    let pwd = $("#txtPassword").val();
    if (confirmPassword === "") {
      $("#confirmPasswordError").html("");
      return;
    }

    if (confirmPassword === pwd) {
      $("#confirmPasswordError")
        .html("Password Matched")
        .addClass("text-success")
        .removeClass("text-danger");
    } else $("#confirmPasswordError").html("Password Not Matched").addClass("text-danger").removeClass("text-success");
  });

  //********** Ajax Request *********************** */
  $("#txtEmail").blur(function () {
    let email = $(this).val();

    let obj = {
      type: "get",
      url: "/check-user",
      data: {
        txtEmail: email,
      },
    };
    // Fire AJAX request
    $.ajax(obj)
      .done(function (response) {
        alert(response);
      })
      .fail(function (err) {
        alert(err.message);
      });
  });
  //*************************************************/

  //************* Sign Up Button  ******************* */
  $("#btnsignup").click(function() {
    let email = $("#txtEmail").val();
    let pwd = $("#txtPassword").val();
    let utype = $("#userType").val();
    let obj = {
      type: "get",
      url: "/signup",
      data: {
        txtEmail: email,
        txtPassword: pwd,
        userType: utype,
      },
    };
    $.ajax(obj)
      .done(function (response) {
        alert(response);
      })
      .fail(function (err) {
        alert("Server Error");
      });
  });
  //***************** ******************************* */

  //************Login Button ************************ */
  $("#btnLoginUser").click(function() {
    let email = $("#txtLoginEmail").val();
    let pwd = $("#txtLoginPassword").val();
    let obj={
      type:"get",
      url:"/login",
      data:{
        txtLoginEmail: email,
        txtLoginPassword: pwd
      }
    }
    $.ajax(obj).done(function(response) {
      alert(response);
      resp = response;
      if(resp=="host"){
        location.href="dashOrganizer.html";
      } else if (resp=="player"){
        location.href="dashPlayer.html";
      } else {
        alert("invalid Credentials");
      }
    }).fail(function(err) {
      alert("server error");
    })
  })
    //***************** ******************************* */
});
