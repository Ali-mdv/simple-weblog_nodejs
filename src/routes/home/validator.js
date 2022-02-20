const {check} = require("express-validator")


module.exports = new class{
    commentValidator(){
        return[
            check("message","message not be empty")
                .notEmpty(),
            check("message","maximum charachter for message is 255")
                .isLength({max:255})
        ]
    };

    rateValidator(){
        return[
            check("rate",'Rating must be a number between 0 and 5')
                .isNumeric({ min: 1, max: 5 })
        ]
    };

    aboutUsValidator(){
        return[
            check("name","name not be empty")
                .notEmpty(),
            check("name","maximum charachter for name is 30")
                .isLength({max:30})
            ,
            check("email","email not be empty")
                .notEmpty(),
            check("email","email format wrong")
                .isEmail(),
            check("email","maximum charachter for email is 40")
                .isLength({max:40})
            ,
            check("subject","maximum charachter for subject is 30")
                .isLength({max:30})
            ,
            check("message","message not be empty")
                .notEmpty(),
            check("message","maximum charachter for message is 1500")
                .isLength({max:1500})
        ]
    }
};