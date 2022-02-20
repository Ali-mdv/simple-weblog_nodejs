require('express-async-errors');
const express = require("express");
const route = require("./src/routes");
const mongoose = require("mongoose");
const config = require("config");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo")
const passport = require('passport');
const winston = require("winston");
const morgan = require('morgan');
const methodOverride = require('method-override')
const app = express();
const port = process.env.PORT || config.get("PORT");
require("dotenv").config();
require('app-module-path').addPath(__dirname);

mongoose.connect(config.get("db.address"))
    .then(()=>{console.log("connected to database")})
    .catch(()=>{console.log("could not connected to database")})



app.set('view engine', 'ejs');
app.use(express.static(__dirname+"/assets"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(cookieParser(process.env.cookie_secret));
app.use(session({
    secret:process.env.session_secret,
    resave:true,
    saveUninitialized:true,
    // cookie:{
    //     expires:new Date(Date.now() + 60*60)
    // },
    store:MongoStore.create({
            mongoUrl:config.get("db.address")
    })
}));
app.use(flash());


require("./passport/auth");
app.use(passport.initialize());
app.use(passport.session());


winston.add(new winston.transports.File({filename:"app_log.log"}));

app.use(morgan("tiny"));

app.use(methodOverride("method"));

app.set("trust proxy",true);

app.use(route);


process.on("uncaughtException",(err)=>{
    winston.error(err.message,err)
    console.log(err.message);
});
process.on("unhandledRejection",(err)=>{
    winston.error(err.message,err)
    console.log(err.message);
});


app.listen(port,()=>{
    console.log(`app on port 8000\nhttp://localhost:${port}`);
});