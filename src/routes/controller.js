const autoBind = require("auto-bind");
const { validationResult } = require('express-validator');
const User = require("./../models/user")

module.exports = class {
    constructor(){
        autoBind(this);
        this.User = User;
    };

    validationBody(req,res){
        const validate = validationResult(req);
        let errors = null;
        if(!validate.isEmpty()){
            errors = validate.array().map(v=>v.msg);
            req.flash("errors",errors);
            return false;
        };
        return true;
    };

    validate(req,res,next){
        if(!this.validationBody(req,res)){
            return res.redirect(req.originalUrl);
        };
        next()
    }
};