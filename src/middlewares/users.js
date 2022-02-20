function isAuthenticated(req,res,next){
    if(!req.isAuthenticated()){
        res.redirect("/auth/login");
    };
    next();
};


function isActive(req,res,next){
    if(!req.user.is_active){
        req.flash("info","your account in not activate\nfor create article neet to active account");
        res.redirect("/user/profile");
    };
    next();
};

function isAdmin(req,res,next){
    if(!req.user.is_admin){
        req.flash("info","your account in not activate\nfor create article neet to active account");
        res.redirect("/dashboard/articles");
    };
    next();
};


module.exports = {
    isAuthenticated,
    isActive,
    isAdmin
}