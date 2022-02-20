const nodemailer = require("nodemailer");
const passport = require('passport');
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const baseController = require("../controller");
const Token = require("./../../models/token");


module.exports = new(class extends baseController{
    loginForm(req,res){
        if(req.isAuthenticated()){
            return res.redirect("/user/profile");
        };
        res.render("auth/login",{errors:req.flash("errors")});
    };

    login(req,res){
        passport.authenticate("login-strategy",(err,user)=>{
            if(!user){
                return res.redirect("/auth/login");
            };
            req.logIn(user,(err)=>{
                return res.redirect("/user/profile");
            });
        })(req,res);
    };

    logout(req,res){
        req.logout();
        res.redirect("/auth/login");
    };

    registerForm(req,res){
        if(req.isAuthenticated()){
            return res.redirect("/user/profile");
        };
        res.render("auth/register",{errors:req.flash("errors")});
    };

    async register(req,res){
        passport.authenticate("register-strategy",{
            successRedirect:"/auth/login",
            failureRedirect:"/auth/register",
            failureFlash:true
        })(req,res);
    };

    async sendVerifyEmail(req,res){
        if(!req.isAuthenticated()){
            return res.redirect("/auth/login");
        };
        if(req.user.is_active){
            return res.redirect("/user/profile");
        };
        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth: {
                user: process.env.email_username,
                pass: process.env.email_password,
                },
            secure: true,
            });

        const user_token = await Token.findOne({user:req.user._id});
        const mailData = {
            from: process.env.email_username, 
            to: req.user.email, 
            subject: 'Email Verification',
            html:`<p><a href="http://localhost:8000/auth/verify/${user_token.token}">رای فعال سازی حساب کاربری خود کلیک کنید</a></p>`
            };
        
        transporter.sendMail(mailData,(err,info)=>{
            if(err){
                req.flash("errors",["somethings wrong, please try again"]);
                return res.redirect("/user/profile");
            }else{
                req.flash("info","sending you verification email");
                res.redirect("/user/profile");
            };
        });
    };

    async checkVerifyEmail(req,res){
        const token = await Token.findOne({token:req.params.token});
        if(!token){
            return res.send("لینک فعال سازی شما منقضی شده است دوباره تلاش کنید");
        };

        const user = await this.User.findOne({_id:token.user});
        user.is_active = true;
        await user.save();
        await token.delete();
        req.flash("info","your account sucessfully actived");
        res.redirect("/user/profile");
    };

    resetPasswordForm(req,res){
        if(req.user){
            return res.redirect("/user/profile");
        };

        const context = {
            errors:req.flash("errors"),
            info:req.flash("info"),
        } 
        res.render("auth/reset_password",context)
    };

    async resetPassword(req,res){
        if(req.isAuthenticated()){
            return res.redirect("/user/profile");
        };

        const user = await this.User.findOne({email:req.body.email})
        if(!user){
            req.flash("info","reset password link send to your email");
            return res.redirect("/auth/reset_password")
        }

        const newToken = await new Token({
            user:user._id,
            token:crypto.randomBytes(32).toString("hex")
        });
        await newToken.save()

        const transporter = nodemailer.createTransport({
            service:"gmail",
            auth: {
                user: process.env.email_username,
                pass: process.env.email_password,
                },
            secure: true,
            });

        const mailData = {
            from: process.env.email_username, 
            to: user.email, 
            subject: 'Reset Email Password',
            html:`<p><a href="http://localhost:8000/auth/reset_password/${newToken.token}">reset password</a></p>`
            };
        
        transporter.sendMail(mailData,(err,info)=>{
            if(err){
                req.flash("errors",["somethings wrong, please try again"]);
                return res.redirect("/auth/reset_password");
            }else{
                req.flash("info","reset password link send to your email");
                res.redirect("/auth/reset_password");
            };
        });
    };

    async resetPasswordConfirmForm(req,res){
        if(req.isAuthenticated()){
            return res.redirect("/user/profile");
        };

        const token = await Token.findOne({token:req.params.token});
        if(!token){
            req.flash("errors","لینک فعال سازی شما منقضی شده است دوباره تلاش کنید")
            return res.redirect("/auth/reset_password");
        };

        const context = {
            errors:req.flash("errors"),
            info:req.flash("info"),
            token:req.params.token
        } 
        res.render("auth/reset_password_confirm",context)
    };

    async resetPasswordConfirm(req,res){
        if(req.isAuthenticated()){
            return res.redirect("/user/profile");
        };

        const token = await Token.findOne({token:req.params.token});
        if(!token){
            req.flash("errors","لینک فعال سازی شما منقضی شده است دوباره تلاش کنید");
            return res.redirect("/auth/reset_password");
        };

        if(req.body.password1 !== req.body.password2){
            req.flash("errors","new password and new confirm password does not match");
            return res.redirect(`/auth/reset_password/${token.token}`);
        };

        const user = await this.User.findById(token.user);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password1,salt);
        await user.save();
        await token.delete();
        console.log(user)
        console.log(req.body.password1)

        res.redirect("/auth/login")
    }
});
