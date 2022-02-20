const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("./../src/models/user");
const Token = require("./../src/models/token");


passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser(async(id,done)=>{
    let user = await User.findById(id);
    if(user){
        done(null,user);
    };
});



passport.use("register-strategy",new LocalStrategy({
    usernameField:"username",
    passwordField:"password1",
    confirmPasswordField:"password2",
    passReqToCallback:true
    },
    async(req,username,password,done)=>{
        if(!(req.body.password1 === req.body.password2)){
            return done(null,false,req.flash("errors",["Password and confirm password do not match"]))
        };

        let newUser = await User.findOne({"email":req.body.email});
        if(newUser){
            return done(null,false,req.flash("errors",["َUser already exist"]))
        };

        newUser = await User.findOne({"username":req.body.username});
        if(newUser){
            return done(null,false,req.flash("errors",["Username is not acceptable"]))
        };

        newUser = new User({
            first:req.body.first,
            last:req.body.last,
            username:req.body.username,
            email:req.body.email,
            password:req.body.password1
        });
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(newUser.password,salt);
        await newUser.save();

        const newToken = await new Token({
            user:newUser._id,
            token:crypto.randomBytes(32).toString("hex")
        });
        await newToken.save();
        done(null,newUser);
    }
));



passport.use("login-strategy",new LocalStrategy({
    usernameField:"username",
    passwordField:"password",
    passReqToCallback:true
    },
    async(req,username,password,done)=>{
        let user = await User.findOne({"username":req.body.username});
        if(!user){
            return done(null,false,req.flash("errors",["user does not exist"]))
        };
        const isValid = await bcrypt.compare(req.body.password,user.password);
        if(!isValid){
            return done(null,false,req.flash("errors",["username or password invalid"]));
        };
        done(null,user);
    }
))

