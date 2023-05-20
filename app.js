//jshint esversion:6
//temel kütüpahaneler && frameworklar
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//google harici, sadece session bölümü
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
//google gibi üçüncü grup şirketleri için.
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "EMCEYY SecretSession Project.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.set("useCreateIndex", true); 5.11 öncesi için gerekli

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);//bunları model oluşturmdan önce yazmalısın.
//plugin şemayı kınfigüre etmek için kullanıyoruz, yani frameworklarla şemaya ekstra özellikler kazandırıyoruz.

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
//yukardaki serialize ve deserialize methodu ile hepsi çalışır, çünkü bazı serialize ve deserialize methotları farklıdır.
//yukarıdaki her zaman ok.
//bunları ve ayrıntıları passport'un resmi sitesinde bulabilirsin.

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"//optioanl olarak yazdık, yazmazsak google sorun çıkartıyor.
  },
  function(accessToken, refreshToken, profile, cb) {
   //console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {//findorcreat diye bir mongoo fonksiyonu yok.
      //findorcreat bulursa ok bulmazsa yaratır, findorcreat kütüpahanesiyle dahil ettik.
      return cb(err, user);
    });
  }
));


app.get("/", function(req, res){
  res.render("home");
});

// app.get("/auth/google",
//   passport.authenticate('google', { scope: ["profile"] })
// );

app.route("/auth/google")
.get(passport.authenticate("google", {
  scope: ["profile"]
}));

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});
//$ne: null -> not equal to null demek.
app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    const userId = req.user.id; // Assuming req.user contains the authenticated user object

    User.findById(userId, function(err, foundUser) {
      if (err) {
        console.log(err);
      } else {
        if (foundUser && foundUser.secret) {
          res.render("secrets", { userWithSecret: foundUser });
        } else {
          // User not found or user does not have a secret
          res.render("secrets", { userWithSecret: null });
        }
      }
    });
  } else {
    // User is not authenticated
    res.redirect("/login"); // Redirect to the login page or any appropriate action
  }
});


app.get("/submit", function(req, res){
  if (req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.post("/submit", function(req, res){
  const submittedSecret = req.body.secret;

//Once the user is authenticated and their session gets saved, their user details are saved to req.user.
  // console.log(req.user.id);

  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function(){
          res.redirect("/secrets");
        });
      }
    }
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){//register passport-local-mongoose dan geliyor
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});


app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
