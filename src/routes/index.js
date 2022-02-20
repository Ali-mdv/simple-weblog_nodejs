const router = require('express').Router();
const homeRouter = require("./home");
const authRouter = require("./auth");
const dashboardRouter = require("./dashboard");
const userRouter = require("./user");
const {isAuthenticated,isActive} = require("./../middlewares/users");
const {async_error} = require("../middlewares/errors_handling");

router.use("/",homeRouter);

router.use("/auth",authRouter);


router.use("/dashboard",
    isAuthenticated,
    isActive,
    dashboardRouter
);

router.use("/user",
    isAuthenticated,
    userRouter
);


router.use(async_error)


router.all("*",
    function(req,res){
        res.render("status/status-404",{url:req.originalUrl});
    }
);

module.exports = router;