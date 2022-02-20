const baseController = require("./../controller");
const Article = require("./../../models/article");
const Category = require("./../../models/category");
const Comment = require("./../../models/comment");
const Rate = require("./../../models/rate");
const ContactUs = require("./../../models/contact_us");


module.exports = new (class extends baseController{
    async home(req,res){
        const new_articles = await Article.find({status:true})
                        .populate("author","first last username","User")
                        .sort("-published_at")
                        .limit(6);
        
        // //Articles that have the most comments
        // const hot_articles = await Comment.aggregate([
        //     {
        //         $group:
        //         {
        //             _id:"$article",
        //             count:{$sum:1}
        //         }
        //     },
        //     {$sort: { count: -1 } },
        //     {$limit:4},
        //     {$lookup: 
        //         {from: 'articles',
        //             localField: '_id',
        //             foreignField: '_id',
        //             as: 'article'
        //         } 
        //     }
        // ]);

        // //Articles with the highest rate
        const best_articles = await Rate.aggregate([
            {
                $group:                        
                    {
                    _id:"$article",
                    avgRating: { $avg: "$rate" },
                    }
            },
            {$sort: { avgRating: -1 } },
            {$limit:4},
            {$lookup: 
                {from: 'articles',
                 localField: '_id',
                 foreignField: '_id',
                 as: 'article'
                } 
            }
        ]);

        // //Articles with the highest view
        const popular_articles = await Article.find({status:true})
        .sort("-hits")
        .limit(4);
        
        const context = {
            new_articles,
            // hot_articles,
            best_articles,
            popular_articles,
            user : req.user,
            search:""
        };

        res.render("blog/index",context);
    };


    async articleList(req,res){
        let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
        let pageInatedBy = 5;

        let query = {status:true};
        if(req.query.search){
            query = {...query,$text:{$search:req.query.search}};
        };
        
        const articles = await Article.find(query)
                        .populate("author","first last","User")
                        .sort("-published_at")
                        .skip(pageInatedBy * (page-1))
                        .limit(pageInatedBy);
        
        const count = await Article.count(query);
        
        const context = {
            route :req.query.search? "search":"",
            user : req.user,
            articles,
            page,
            pages:Math.ceil(count/pageInatedBy),
            search:req.query.search
        };
        
        res.render("blog/list",context);
    };
    

    async categoryList(req,res){
        const categories = await Category.find({status:true})
        const context = {
            user : req.user,
            categories,
            search:req.query.search
        };
        res.render("blog/category",context);
    };


    async single(req,res){
        const article = await Article.findOne({slug:req.params.slug,status:true})
                .populate("author","first last username","User")
                .populate("category","title slug","Category")
                .populate({
                    path:"comments",
                    populate:[
                        {
                            path:"user",
                            model:"User"
                        },
                        {
                            path:"replies",
                            model:"Comment",
                            populate:{
                                path:"user",
                                model:"User"
                            }
                        }
                    ]
                }
        );
        if(!article){
            return res.render("status/status-404");
        };
        
        const rate = await Rate.findOne({article:article._id,user:req.user.id}) || null;

        const ip = req.ip;
        if(!article.hits.includes(ip)){
            article.hits.push(ip);
            await article.save();
        };

        const context = {
            article,
            user : req.user,
            rate:rate,
            info:req.flash("info"),
            errors:req.flash("errors"),
            search:""
        };
        res.render("blog/single",context);
    };


    async authorArticlesList(req,res){
        let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
        let pageInatedBy = 5;

        const author = await this.User.findOne({username:req.params.username});
        if(!author) return res.redirect("/articles");

        let query = {author:author._id,status:true};
        
        const articles = await Article.find(query)
                        .populate("author","first last","User")
                        .sort("-published_at")
                        .skip(pageInatedBy * (page-1))
                        .limit(pageInatedBy);
        
        const count = await Article.count(query);
        
        const context = {
            route:"author",
            user : req.user,
            author,
            articles,
            page,
            pages:Math.ceil(count/pageInatedBy),
            search:""
        };
        
        res.render("blog/list",context);
    };


    async categoryArticlesList(req,res){
        let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
        let pageInatedBy = 5;

        const category = await Category.findOne({slug:req.params.cat});
        if(!category) return res.redirect("/articles");

        let query = {category:category._id,status:true};
        
        const articles = await Article.find(query)
                        .populate("author","first last","User")
                        .sort("-published_at")
                        .skip(pageInatedBy * (page-1))
                        .limit(pageInatedBy);
        
        const count = await Article.count(query);
        
        const context = {
            route:"category",
            user : req.user,
            category,
            articles,
            page,
            pages:Math.ceil(count/pageInatedBy),
            search:""
        };
        
        res.render("blog/list",context);
    };


    aboutUs(req,res){
        const context = {
            user : req.user,
            search:"",
            info:req.flash("info"),
            errors:req.flash("errors")
        };
        res.render("blog/about",context);
    };


    async contactUs(req,res){
        const newContactUs = new ContactUs({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message
        });

        await newContactUs.save();
        req.flash("info","Your message was sent, thank you!");
        res.redirect("/about-us");
    }


    async createComment(req,res){
        const newComment = new Comment({
            user: req.user.id,
            article:req.body.article_id,
            message: req.body.message
        });

        if(req.body.comment_id){
            const parrentComment = await Comment.findById(req.body.comment_id);
            if(parrentComment){
                parrentComment.replies.push(newComment._id);
                await parrentComment.save();
            };
        }else{
            const article = await Article.findOne({slug:req.params.slug,status:true});
            if(!article){
                return res.render("status/status-404");
            };
            article.comments.push(newComment._id);
            await article.save();
        };

        await newComment.save();
        return res.redirect(`/article/${req.params.slug}`);
    };


    async ratingArticle(req,res){
        if(!req.isAuthenticated()){
            return res.redirect(`/article/${req.body.article}`);
        };
        const article  = await Article.findOne({slug:req.body.article});
        if(!article){
            return res.redirect(`/article/${req.body.article}`);
        };
        
        const rate = await Rate.updateOne(
            {article: article._id,user:req.user.id},
            {$set:{
                article:article._id,
                user:req.user.id,
                rate:req.body.rate,
                is_rate:true
                }
            }, 
            {upsert: true, setDefaultsOnInsert: true}
        );
        
        res.redirect(`/article/${req.body.article}`);
    }
});