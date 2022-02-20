const multer = require("multer");


const storage = multer.diskStorage({
    destination: function(req,file,cb){
        let [type,extname] = file.mimetype.split("/");
        if(type=="image"){
            return cb(null,"./assets/media/article");
        }
        cb(null,"./assets/media/trash")
    },

    filename:function(req,file,cb){
        cb(null,Date.now() + "-" + file.originalname);
    }
});

const upload = multer({storage:storage});

module.exports = upload;