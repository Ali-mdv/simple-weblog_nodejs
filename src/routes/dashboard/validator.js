const {check} = require("express-validator");
const path = require("path");

module.exports = new (class{
    createArticle(){
        return [
            check("title","title is required").notEmpty(),
            check("title","max character for title is 255").isLength({max:255}),
            check("slug","slug is required").notEmpty(),
            check("slug","max character for slug is 155").isLength({max:155}),
            check("description","description is required").notEmpty(),
            check("description","max character for description is 20000").isLength({max:20000}),
            check("category","atleast select one category").notEmpty(),
            check("picture","picture is required").notEmpty(),
            check("picture","file format not be correct").custom(val=>{
                if(!val) return true;
                if(![".png",".jpg",".jpeg"].includes(path.extname(val))){
                    throw new Error("file format not be correct");
                }
                return val;
            }),
        ]
    };

    updateArticle(){
        return [
            check("title","title is required").notEmpty(),
            check("title","max character for title is 255").isLength({max:255}),
            check("slug","slug is required").notEmpty(),
            check("slug","max character for slug is 155").isLength({max:155}),
            check("description","description is required").notEmpty(),
            check("description","max character for description is 20000").isLength({max:20000}),
            check("category","atleast select one category").notEmpty(),
            check("picture","file format not be correct").custom(val=>{
                if(!val) return true;
                if(![".png",".jpg",".jpeg"].includes(path.extname(val))){
                    throw new Error("file format not be correct");
                }
                return val;
            }),
        ]
    };


    createCategory(){
        return [
            check("title","title is required").notEmpty(),
            check("title","max character for title is 20").isLength({max:20}),
            check("slug","slug is required").notEmpty(),
            check("slug","max character for slug is 20").isLength({max:20}),
        ]
    };


    createUser(){
        return [
            check("username","username is required").notEmpty(),
            check("username","username must be  5-20 character").isLength({min:5,max:20}),
            check("first","max character for first name is 20").isLength({max:20}),
            check("last","max character for last name is 20").isLength({max:20}),
            check("email","email is required").notEmpty(),
            check("email","max character for email name is 40").isLength({max:40}),
        ]
    }
})