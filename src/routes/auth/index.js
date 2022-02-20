const router = require('express').Router();
const controller = require('./controller');
const validator = require('./validator');

router.get("/login",
    controller.loginForm
);

router.post("/login",
    controller.login
);

router.get("/logout",
    controller.logout
);

router.get("/register",
    validator.loginValidator(),
    controller.registerForm
);

router.post("/register",
    validator.registerValidator(),
    controller.validate,
    controller.register
);

router.get("/verify",
    controller.sendVerifyEmail
);

router.get("/verify/:token",
    controller.checkVerifyEmail
);


router.get("/reset_password",
    controller.resetPasswordForm
);


router.post("/reset_password",
    validator.resetPassword(),
    controller.validate,
    controller.resetPassword
);

router.get("/reset_password/:token",
    controller.resetPasswordConfirmForm
);


router.post("/reset_password/:token",
    validator.resetPasswordConfirm(),
    controller.validate,
    controller.resetPasswordConfirm
);

module.exports = router