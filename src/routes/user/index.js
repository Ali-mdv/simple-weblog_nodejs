const router = require("express").Router();
const controller = require("./controller");
const validator = require("./validator");



router.get("/profile",
    controller.profileForm
);


router.post("/profile",
    validator.editProfile(),
    controller.validate,
    controller.editProfile
);


router.get("/change_password",
    controller.changePasswordForm
);


router.post("/change_password",
    validator.changePassword(),
    controller.validate,
    controller.changePassword
);


module.exports = router;