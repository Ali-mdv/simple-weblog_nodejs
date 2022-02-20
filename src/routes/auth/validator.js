const { check } = require('express-validator');

module.exports = new(class{
    loginValidator(){
        return [
            check("username")
                .notEmpty()
                .isLength({ min:5,max:20 })
                .withMessage("username must be between 5-20 character"),
            check("password")
                .notEmpty()
                .isLength({ min:10,max:20 })
                .withMessage("current password must be between 10-20 character")
        ];
    };

    registerValidator(){
        return [
            check("username")
                .notEmpty()
                .isLength({ min:5,max:20 }),
            check("password1")
                .notEmpty()
                .isLength({ min:10,max:20 })
                .withMessage("password must be between 10-20 character"),
            check("password2")
                .notEmpty()
                .isLength({ min:10,max:20 })
                .withMessage("confirm password must be between 10-20 character"),
            check("email")
                .notEmpty()
                .isLength({ max:30 })
                .withMessage("email must be between 0-30charachter character"),
            check("email","email format is not correct").isEmail()
        ];
    };

    resetPassword(){
        return [
            check("email")
                .notEmpty()
                .isLength({ max:30 })
                .withMessage("email must be between 0-30charachter character"),
            check("email","email format is not correct").isEmail()
        ];
    };

    resetPasswordConfirm(){
        return [
            check("password1")
                .notEmpty()
                .isLength({ min:10,max:20 })
                .withMessage("password must be between 10-20 character"),
            check("password2")
                .notEmpty()
                .isLength({ min:10,max:20 })
                .withMessage("confirm password must be between 10-20 character"),
        ];
    };
});