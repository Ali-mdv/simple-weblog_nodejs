const mongoose = require('mongoose');
const humanize = require('humanize');


const contactUsSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        max:30
    },
    email:{
        type: String,
        required:true,
        max:40
    },
    subject:{
        type: String,
        max:30
    },
    message:{
        type: String,
        required:true,
        max:1500
    },
    created_at:{
        type:Date,
        default:Date.now(),
        get:(v)=>{
            return humanize.relativeTime(v)
        }
    },
    is_read:{
        type:Boolean,
        default:false
    }
});

contactUsSchema.index({name:"text", email:"text", subject:"text"});

const ContactUs = mongoose.model("ContactUs",contactUsSchema);

module.exports = ContactUs;