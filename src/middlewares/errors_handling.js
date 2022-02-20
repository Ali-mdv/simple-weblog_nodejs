const winston = require('winston');

function async_error(err,req,res,next){
    console.log(err.message);
    winston.error(err.message,err)
    res.render("status/status-500")
}

module.exports = {
    async_error
};