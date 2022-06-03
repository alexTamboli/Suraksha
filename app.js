const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const sql = require(__dirname + "/sqlConfig.js");
const session = require("express-session");
const passport = require("passport");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//   secret: "keyboard cat",
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }));

// app.use(passport.initialize());
// app.use(passport.session());


app.route("/")
  .get(function(req, res) {
    res.render("index");
  })
  .post(function(req, res){
    console.log("req recieved");
    res.render("info", {filer_name: "haha"});
  });


app.route("/login")
  .get(function(req, res) {
    res.render("login");
  })
  .post(function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    
    sql.runQuery("select * from userdetails where username = '" + username +"' and password = '" + password + "'", function(result){   
      if(result.length == 0) res.send("failure");
      else {   
        sql.runQuery("SELECT * FROM `fir` WHERE username= '"+username+"'",function(result2){  
          res.render("dashboard", { userdetails: result[0],
                                    FIRs: result2 });
        });
      }
    });
  });


app.route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {
    const name = req.body.name;
    const f_name = req.body.f_name;
    const email = req.body.email;
    const phone_num = req.body.phone_num;
    const address = req.body.address;
    const state = req.body.state;
    const postal = req.body.postal;
    const username = req.body.username;
    const password = req.body.password;

    const query = "INSERT INTO userdetails (name, f_name, email, phone_num, address,  state, postal, username, password) VALUES ('"+name+"','"+f_name+"', '"+email+"', '"+phone_num+"', '"+address+"', '"+state+"', '"+postal+"', '"+username+"', '"+password+"')"
    sql.runQuery(query, function (result) {
      console.log("1 record inserted");
    });
    res.render("login");
  });

app.get("/logout", function(req, res){
  res.redirect("/");
});


app.route("/dashboard")
  .get(function(req, res) {
    res.render("dashboard");
  })
  .post();


app.route("/p_login")
  .get(function(req, res) {
    res.render("p_login");
  })
  .post(function(req, res) {
    const id = req.body.police_station_id;
    const password = req.body.police_station_password;
    const query = "SELECT * FROM police_station WHERE police_station_id='"+id+"' AND `police_station_password`='"+password+"'";

    sql.runQuery(query, function(result){
      if(result.length == 0) res.send("failure");
      else res.render("p_dashboard");
    });
    
  });



app.route("/fir")
  .get(function(req, res) {
    res.render("fir");
  })
  .post(function(req, res){
    const filer_name = req.body.filer_name;
    const asserted_name = req.body.asserted_name;
    const fir_place = req.body.fir_place;
    const fir_time = req.body.fir_time;
    const fir_nature = req.body.fir_nature;

    const query = "insert into fir (username,complainer_name, reffral_name, nature, time, incident_place, public_consent,state) values ('"+username+"', '"+complainer_name+"', '"+refferal_name+"', '"+nature+"', '"+time+"', '"+incident_place+"', '"+public_consent+"', '"+state+"')";
    console.log(query);
    sql.runQuery(query, function (result) {
      console.log("1 record inserted");
    });
    res.render("info", {filer_name: filer_name});
  });


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on https://sheltered-tor-04410.herokuapp.com/ or local port 3000");
});
