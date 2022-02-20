const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    first:{type:String,max:20},
    last:{type:String,max:20},
    username:{type:String,required:true,unique:true,min:5,max:20},
    email:{type:String,required:true,unique:true,max:40},
    about_me:{type:String,max:255},
    password:{type:String,required:true,max:50},
    is_active:{type:Boolean,default:false},
    is_admin:{type:Boolean,default:false},
    is_special:{type:Boolean,default:false}
});

userSchema.index({username:"text",email:"text",last:"text"});

const User = mongoose.model("User",userSchema);


module.exports = User