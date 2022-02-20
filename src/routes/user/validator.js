const {check} = require("express-validator");

module.exports = new (class{
    editProfile(){
        return [
            check("first","maximum character for last name is 20 character")
                .isLength({ max:20 })
            ,
            check("last","maximum character for last name is 20 character")
                .isLength({ max:20 })
        ]
    };

    changePassword(){
        return[
            check("password")
                .notEmpty()
                .withMessage("current password not be empty")
            ,
            check("password1")
                .notEmpty()
                .isLength({ min:10,max:20 })
                .withMessage("new password must be between 10-20 character")
            ,
            check("password2")
                .notEmpty()
                .isLength({ min:10,max:20 })
                .withMessage("confirm new password must be between 10-20 character")
            ,
        ]
    }
});