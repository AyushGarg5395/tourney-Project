var express = require("express");
var fileuploader = require("express-fileupload");
var mysql2 = require("mysql2");
var cloudinary = require("cloudinary").v2;

var app = express(); //this fx  returns an object (app is an object)

// *******Important lines*****
app.use(express.static("public"));
app.use(express.urlencoded(true));
app.use(fileuploader());
// ***************************

app.listen(2001, function () {
  console.log("Server Started");
});

app.get("/", function (req, resp) {
  let path = __dirname + "/public/index.html";
  resp.sendFile(path);
});

//******** Cloudinary web server to maintain pics, videos and other assests *********
// Configuration
cloudinary.config({
  cloud_name: "doulqwvdb",
  api_key: "529613161891335",
  api_secret: "Db0uZQhC5Mrjt0Hvj83CHuyqFh0", // Click 'View API Keys' above to copy your API secret
});
// ****************************************************************

// ***********Database Connectivity with mySql2***********
let config =
  "mysql://avnadmin:AVNS_RQM7mAqxtGFhnS8Qv2b@mysql-1bedec8e-demodb-project.c.aivencloud.com:26018/defaultdb";

let mysqlServer = mysql2.createConnection(config);
mysqlServer.connect(function (err) {
  if (err == null)
    console.log("Connected to aiven database server Succesfully");
  else console.log(err.message);
});
// ********************************************************

// **************File Uploder Save data of Signup user *************************

app.get("/signup", function (req, resp) {
  let email = req.query.txtEmail;
  let pwds = req.query.txtPassword;
  let utype = req.query.userType;
  mysqlServer.query(
    "insert into users(emailid,pwd,utype,ustatus,dos) values(?,?,?,?,current_date())",
    [email, pwds, utype, 1],
    function (err) {
      if (err == null) resp.send("Signed in Succesfully");
      else resp.send(err.message);
    }
  );
});
//************************************************** */

//******* Check Availiabiltiy ********************* */
app.get("/check-user", function (req, resp) {
  let email = req.query.txtEmail;
  mysqlServer.query(
    "select * from users where emailid=?",
    [email],
    function (err, jsonArray) {
      if (err != null) resp.send(err.message);
      else if (jsonArray.length == 1) resp.send("Already Exists");
      else resp.send("Its Available");
    }
  );
});
//***************** ******************************* */

//************* Login Users *********************** */
app.post("/login", function (req, resp) {
  let email = req.body.txtLoginEmail;
  let pwd = req.body.txtLoginPassword;

  console.log("Email:", email);
  console.log("Password:", pwd);

  mysqlServer.query(
    "SELECT * FROM users WHERE emailid = ? AND pwd = ?",
    [email, pwd],
    function (err, jsonArray) {
      if (err) {
        console.error("Database error:", err);
        resp.status(500).send("Internal Server Error");
        return;
      }

      if (jsonArray.length === 1) {
        let user = jsonArray[0];
        console.log(user);
        let utype = user.utype; // Assuming the user type is stored in a `usertype` column

        if (utype === "host") {
          let path = __dirname + "/public/dashOrganizer.html";
          resp.sendFile(path);
        } else if (utype === "player") {
          let path = __dirname + "/public/dashPlayer.html";
          resp.sendFile(path);
        } else if (utype === "admin") {
          let path = __dirname + "/public/profileAdmin.html";
          resp.sendFile(path);
        } else {
          resp.status(400).send("Unknown user type");
        }
      } else {
        resp.status(401).send("Incorrect credentials");
      }
    }
  );
});


//***************************************************/

/********* Fetch Data *******************************/
app.get("/fetch-data", function (req, resp) {
  let email = req.query.txtEmail;
  console.log(email);
});
/****************************************************/

/******************** Saving of data of Organization****************/
app.post("/save", async function (req, resp) {
  console.log(req.body);
  let filename = "";
  if (req.files == null) {
    filename = "nopic.jpg";
  } else {
    filename = req.files.formFileMultiple.name;
    let path = __dirname + "/public/uploads/" + filename;
    console.log(path);
    await req.files.formFileMultiple.mv(path);

    await cloudinary.uploader.upload(path).then(function (result) {
      filename = result.url; //will give u the url of the pic on cloudinary server
      console.log(filename);
    });
  }
  req.body.picpath = filename; //new name-value pair added in body object
  //save data acc to columns in seq in aiven vala database
  mysqlServer.query(
    "insert into organizations(emailid, organization,contact,address,city,state,zip,proof,ppic,sports,prev,website,insta) values(?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      req.body.txtMail,
      req.body.orgName,
      req.body.orgMobNo,
      req.body.orgAddress,
      req.body.inputCity,
      req.body.inputState,
      req.body.inputZip,
      req.body.idProofInput,
      req.body.picpath,
      req.body.sportsSelect.toString(),
      req.body.formControlTextarea1,
      req.body.instagramUrl,
      req.body.facebookUrl
    ],
    function (err) {
      if (err == null) resp.send("Record Saved Successfully...");
      else {
        resp.send(err.message);
        console.log(err.message);
      }
    }
  );
});
//*****************************************************/

app.get("/dashOrganizer",function(req,resp) {
  let path = __dirname + "/public/dashOrganizer.html";
  resp.sendFile(path);
})

app.get("/dashPlayer",function(req,resp) {
  let path = __dirname + "/public/dashPlayer.html";
  resp.sendFile(path);
})

app.get("/profileOrganizer",function(req,resp) {
  let path = __dirname + "/public/profileOrganizer.html";
  resp.sendFile(path);
})

app.get("/profilePlayer",function(req,resp) {
  let path = __dirname + "/public/profilePlayer.html";
  resp.sendFile(path);
})

app.get("/publish-tournaments",function(req,resp) {
  let path = __dirname + "/public/publish-tournaments.html";
  resp.sendFile(path);
})

app.get("/tournamentFinder",function(req,resp) {
  let path = __dirname + "/public/tournament-finder.html";
  resp.sendFile(path);
})

/******************** Saving of data of Publish Tounament****************/
app.post("/posted-event",async function(req,resp) {
  console.log(req.body);
  let filenamePoster = "";
  if (req.files == null) {
    filenamePoster = "nopic.jpg";
  } else {
    filenamePoster = req.files.tourPoster.name;
    let path = __dirname + "/public/uploads/" + filenamePoster;
    console.log(path);
    await req.files.tourPoster.mv(path);

    await cloudinary.uploader.upload(path).then(function (result) {
      filenamePoster = result.url; //will give u the url of the pic on cloudinary server
      console.log(filenamePoster);
    });
  }
  req.body.picpathPoster = filenamePoster; //new name-value pair added in body object
  //save data acc to columns in seq in aiven vala database

  mysqlServer.query(
    "insert into tournaments(tournament_id ,emailid ,game ,title ,fee , dot , city , location ,zip ,prizes ,poster ,info ) values(null,?,?,?,?,?,?,?,?,?,?,?)",
    [
      req.body.txtMail,
      req.body.tourGame,
      req.body.tourTitle,
      req.body.entryFees,
      req.body.tourDate,
      req.body.tourCity,
      req.body.inputLocation,
      req.body.tourZip,
      req.body.tourPrizes,
      req.body.picpathPoster,
      req.body.tourInfo
    ],
    function (err) {
      if (err == null) resp.send("Record Saved Successfully...");
      else {
        resp.send(err.message);
        console.log(err.message);
      }
    }
  )
})

//********Angular File***************** */
app.get("/fetch-all-tournaments",function(req,resp) {
  var city = req.query.city;
  var game = req.query.game;
  mysqlServer.query("select * from tournaments where city=? and game=?",[city,game],function(err,jsonArray){
    if(err!=null)
    {
      resp.send(err.message);
    }
    else
      resp.send(jsonArray);
  })
})

app.get("/fetch-all-cities",function(req,resp) {
  mysqlServer.query("select distinct city from tournaments",function(err,jsonArray) {
    if(err!=null)
    {
      resp.send(err.message);
    }
    else 
      resp.send(jsonArray);
  })
})

app.get("/fetch-all-games",function(req,resp) {
  mysqlServer.query("select distinct game from tournaments",function(err,jsonArray) {
    if(err!=null) {
      resp.send(err.message)
    }
    else 
      resp.send(jsonArray);
  })
})

// *********************************
app.get("/update",function(req,resp){
  let email=req.query.txtEmail;
  let curpwd=req.query.txtcurPwd;
  let newpwd=req.query.txtnewPwd;
  db.query("update users set pwd=? where emailid=? and pwd=?",[newpwd,email,curpwd,],function(err,result){
      // resp.send(jsonArray)
     // console.log(jsonArray);
     console.log(affectedRows);
      if(result.affectedRows==1)
      {
          resp.send("updated");
          
      }
      else
          resp.send("Invalid");
    })
})





