const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const sql = require(__dirname + "/sqlConfig.js");
const session = require("express-session");
const flash = require('connect-flash');
//const data_fetch = require(__dirname + "/data_fetch.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

function isAuthenticated (req, res, next) {
  if (req.session.user) next();
  else {
    // var error = new Error("User Not Authenticated");
    // error.status = 403;
    // return next(error);
    next("/");
  }
}


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
        req.session.regenerate(function (err) {
          if (err) next(err)

          req.session.user = req.body.username;
          req.session.maxAge = 1200000;
          req.session.save(function (err) {
            if (err) return next(err);
            res.redirect("/dashboard");
          });
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
    res.redirect("/login");
  });


app.get("/logout", function(req, res){
  req.session.user = null
  req.session.save(function (err) {
    if (err) next(err)
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.redirect('/')
    });
  });
});


app.route("/dashboard")
  .get(isAuthenticated ,function(req, res, next) {
    sql.runQuery("select * from userdetails where username = '" + req.session.user +"'", function(result){   
      if(result.length == 0) res.send("failure");
      else {   
        sql.runQuery("SELECT * FROM `fir` WHERE username= '"+req.session.user+"'",function(result2){ 
          res.render("dashboard", { userdetails: result[0],
                                    FIRs: result2 });          
        });
      }
    });   
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
      else {
        req.session.regenerate(function (err) {
          if (err) next(err)

          req.session.user = req.body.police_station_id;
          req.session.maxAge = 1200000;
          req.session.save(function (err) {
            if (err) return next(err);
            res.redirect("/p_dashboard");
          });
        }); 
      }
    });
    
  });


app.get("/p_dashboard", isAuthenticated, function(req, res){
  sql.runQuery("SELECT * FROM police_station WHERE police_station_id= '"+req.session.user+"'", function(result){
    res.render("p_dashboard", {police_id: req.session.user, p_details: result[0]});
  });
});


app.route("/fir")
  .get(function(req, res) {
    res.render("fir", {username: req.session.user, insert: false});
  })
  .post(isAuthenticated ,function(req, res){
    const complainer_name = req.body.complainer_name;
    const reffral_name = req.body.reffral_name;
    const incident_place = req.body.incident_place;
    const time = req.body.time;
    const nature = req.body.nature;
    const state = req.body.state;
    const public_consent = req.body.public_consent;

    const query = "insert into fir (username,complainer_name, reffral_name, nature, time, incident_place, public_consent,state) values ('"+req.session.user+"', '"+complainer_name+"', '"+reffral_name+"', '"+nature+"', '"+time+"', '"+incident_place+"', '"+public_consent+"', '"+state+"')";
    sql.runQuery(query, function (result) {
      console.log("1 record inserted");
    });
    res.render("fir", {username: req.session.user, insert: true});
  });


app.get("/piechart" ,function(req, res){
  const query = "select nature, count(nature) as counts from suraksha.fir GROUP BY nature HAVING COUNT(nature) > 1";
  sql.runQuery(query, function(result){
    res.render("piechart", {username: req.session.user, arr: result});
  });
});


app.get("/barchart", function(req, res){
  const query = "select state, count(state) as counts from suraksha.userDetails group by state having count(state) >= 0 order by state";
  sql.runQuery(query, function(result){
    res.render("barchart", {username: req.session.user, arr: result});
  });
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on https://frozen-oasis-19006.herokuapp.com/ or local port 3000");
});
