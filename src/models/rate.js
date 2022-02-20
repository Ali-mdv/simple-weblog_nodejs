const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
    article:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    user:{
        type:mongoose.Types.ObjectId,
        required:true
    },
    rate:{
        type:Number,
        min:1,
        max:5,
        required:true
    },
    is_rate:{
        type:Boolean,
        default:false
    }
});

const Rate = mongoose.model("Rate",rateSchema)

module.exports = Rate