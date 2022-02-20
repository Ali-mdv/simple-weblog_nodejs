const { type } = require("express/lib/response");
const mongoose = require("mongoose");


const tokenSchema = new mongoose.Schema({
    user:{
        type: mongoose.Types.ObjectId,
        ref:"User",
        required: true,
    },
    token:{type: String,required:true}
});

const Token = mongoose.model("Token",tokenSchema);


module.exports = Token
