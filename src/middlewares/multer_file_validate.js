
function pictureValidate(req,res,next){
    if(!req.file){
        req.body.picture = null;
    }else{
        req.body.picture = req.file.path.replace("assets","");
    }
    next()
}

module.exports = {
    pictureValidate
    }