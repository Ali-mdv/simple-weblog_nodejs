const BaseController = require("./../controller");
const _ = require("lodash");
const bcrypt = require("bcrypt");


module.exports = new(class extends BaseController{
    profileForm(req,res){
        if(!req.user.is_active){
            req.flash("info","your email in not verified");
        };
        return res.render("dashboard/profile",
            {user:req.user,errors:req.flash("errors"),info:req.flash("info")
        });
    };

    async editProfile(req,res){
        const user = await this.User.findById(req.user.id);
        
        user.first = req.body.first;
        user.last = req.body.last;
        await user.save();

        req.flash("info","profile edited");
        res.redirect("/user/profile");
    };

    changePasswordForm(req,res){
        return res.render("dashboard/change_password",
            {user:req.user,errors:req.flash("errors"),info:req.flash("info")
        });
    };

    async changePassword(req,res){
        const user = await this.User.findById(req.user.id);
        
        const isValid = await bcrypt.compare(req.body.password,user.password);
        if(!isValid){
            req.flash("errors","password is wrong");
            return res.redirect("/user/change_password");
        };

        if(req.body.password1 !== req.body.password2){
            req.flash("errors","new password and confirm new password not be match");
            return res.redirect("/user/change_password");
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password1,salt);
        await user.save();
        
        req.flash("info","password sucessfully changed");
        res.redirect("/user/profile");
    }
});