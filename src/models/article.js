const mongoose = require('mongoose');


const articleSchema = new mongoose.Schema({
    author:{type:mongoose.Types.ObjectId,required:true},
    title:{type:String,required:true,max:255},
    slug:{type:String,required:true,max:155,unique:true},
    description:{type:String,required:true,max:20000},
    category:[{
        type:mongoose.Types.ObjectId,
        ref:"Category",
        required:true
    }],
    picture:{type:String},
    comments:[{
        type:mongoose.Types.ObjectId,
        ref:"Comment"
    }],
    is_special:{type:Boolean,default:false},
    status:{type:Boolean,default:false},
    hits : {type:[String]},
    rate:[{
        type:mongoose.Types.ObjectId,
        ref:"Rate"
    }],
    published_at:{
        type:Date,
        get:(v)=>{
            if(v){
                return `${v.toLocaleDateString('fa-IR')}\n${v.toLocaleTimeString("fa-IR")}`;
            }
        }
    },
    created_at:{
        type:Date,default:Date.now(),
        get:(v)=>{
            return `${v.toLocaleDateString('fa-IR')}\n${v.toLocaleTimeString("fa-IR")}`;
        }
    },
    updated_at:{type:Date,default:Date.now()}
});

articleSchema.index({ title : 'text', description : 'text'});

const Article = mongoose.model("Article",articleSchema);

module.exports = Article;