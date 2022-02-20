const mongoose = require("mongoose");

categorySchema = new mongoose.Schema({
    title:{type:String,required:true},
    slug:{type:String,unique:true,required:true},
    status:{type:Boolean,default:false}
});

categorySchema.index({title:'text',slug:'text'});

const Category = mongoose.model("Category",categorySchema);

module.exports = Category;