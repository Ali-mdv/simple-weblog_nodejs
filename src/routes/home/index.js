const router = require('express').Router();
const controller = require('./controller');
const validator = require('./validator');

router.get("/",
    controller.home
);


router.get("/articles",
    controller.articleList
);


router.get("/categories",
    controller.categoryList
);


router.get("/article/:slug",
    controller.single
);


router.get("/articles/author/:username",
    controller.authorArticlesList
);


router.get("/articles/category/:cat",
    controller.categoryArticlesList
);


router.post("/article/:slug",
    validator.commentValidator(),
    controller.validate,
    controller.createComment
);


router.get("/about-us",
    controller.aboutUs
);

router.post("/about-us",
    validator.aboutUsValidator(),
    controller.validate,
    controller.contactUs
);


router.post("/rate_article",
    validator.rateValidator(),
    controller.validate,
    controller.ratingArticle
);

module.exports = router;