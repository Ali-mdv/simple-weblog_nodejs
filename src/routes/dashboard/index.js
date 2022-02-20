const router = require("express").Router();
const controller = require("./controller");
const validator = require("./validator");
const {pictureValidate} = require("./../../middlewares/multer_file_validate");
const multer = require("../../../multer/upload_file")
const {isAdmin} = require("./../../middlewares/users");



/////////////////////// articles route //////////////////////////////////
router.get("/articles",
    controller.home
);


router.get("/article/create",
    controller.createArticleForm
);


router.post("/article/create",
    multer.single("picture"),
    pictureValidate,
    validator.createArticle(),
    controller.validate,
    controller.createArticle
);

router.get("/article/:slug",
    controller.createArticleForm
);


router.put("/article/:slug",
    multer.single("picture"),
    pictureValidate,
    validator.updateArticle(),
    controller.validate,
    controller.updateArticle
);


router.delete("/article/:slug",
    controller.deleteArticle,
);


router.put("/article/actions/:slug",
    controller.actionsArticle
);



/////////////////////// categories route for admin //////////////////////////////////
router.get("/categories",
    isAdmin,
    controller.categoryList,
);


router.get("/category/create",
    isAdmin,
    controller.categorySingle,
);


router.get("/category/:slug",
    isAdmin,
    controller.categorySingle,
);

router.post("/category/create",
    isAdmin,
    validator.createCategory(),
    controller.validate,
    controller.createCategory
);

router.put("/category/:slug",
    isAdmin,
    validator.createCategory(),
    controller.validate,
    controller.updateCategory
);

router.delete("/category/:slug",
    isAdmin,
    controller.deleteCategory,
);


/////////////////////// users route for admin //////////////////////////////////
router.get("/users",
    isAdmin,
    controller.userList,
);


router.get("/user/create",
    isAdmin,
    controller.userSingle,
);


router.get("/user/:username",
    isAdmin,
    controller.userSingle,
);


router.post("/user/create",
    isAdmin,
    validator.createUser(),
    controller.validate,
    controller.createUser
);


router.put("/user/:username",
    isAdmin,
    validator.createUser(),
    controller.validate,
    controller.updateUser
);


router.delete("/user/:username",
    isAdmin,
    controller.deleteUser,
);


/////////////////////// contact_us route for admin //////////////////////////////////
router.get("/contact-us",
    isAdmin,
    controller.contactUsList,
);


router.get("/contact-us/:id",
    isAdmin,
    controller.contactUsSingle,
);


router.delete("/contact-us/:id",
    isAdmin,
    controller.contactUser,
);


module.exports = router;