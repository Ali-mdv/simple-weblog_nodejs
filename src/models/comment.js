const mongoose = require('mongoose');
const humanize = require('humanize');


const commentSchema = new mongoose.Schema({
    user:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
    article:{
        type:mongoose.Types.ObjectId,
        ref:"Article",
        required:true
    },
    message:{
        type:String,
        max:255,
        required:true
    },
    created_at:{
        type:Date,
        default:Date.now(),
        get:(v)=>{
            return humanize.relativeTime(v)
        }
    },
    replies:[this]
});

const Comment = mongoose.model("Comment",commentSchema);

module.exports = Comment;