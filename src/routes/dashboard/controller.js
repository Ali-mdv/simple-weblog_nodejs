const BaseController = require("./../controller");
const {convert} = require("html-to-text")
const Article = require("./../../models/article");
const Category = require("./../../models/category");
const Comment = require("./../../models/comment");
const ContactUs = require("./../../models/contact_us");
const Rate = require("./../../models/rate");
const fs = require("fs");
const bcrypt = require("bcrypt");


module.exports = new(class extends BaseController{
    async home(req,res){
        let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
        let pageInatedBy = parseInt(req.query.entries) || 10;
        
        let query = req.user.is_admin?{}:{author:req.user.id};
        
        if(req.query.search){
            query = {...query,$text:{$search:req.query.search}};
        };

        const articles = await Article.find(query)
                        .populate("category")
                        .populate("author","first last username","User")
                        .sort({status:-1,published_at:-1})
                        .skip(pageInatedBy * (page-1))
                        .limit(pageInatedBy);

        const count = await Article.count(query);
        
        const context = {
            user:req.user,
            articles :articles,
            errors:req.flash("errors"),
            info:req.flash("info"),
            page,
            pages:Math.ceil(count/pageInatedBy),
            count,
            page_by:pageInatedBy,
            search:req.query.search
        };
        
        return res.render("dashboard/home",context);
    };

    async createArticleForm(req,res){
        const categories = await Category.find()
        const context = {
            user:req.user,
            errors:req.flash("errors"),
            info:req.flash("info"),
            article:{},
            categories
        };

        if(req.params.slug){
            const article = await Article.findOne({slug:req.params.slug});

            if(!article){
                return res.redirect("/dashboard/article/create");
            };
            if(!(req.user.is_admin || article.author == req.user.id)){
                return res.render("status/status-404");
            };

            context.article = article;
        };

        return res.render("dashboard/create_article",context);
    };

    async createArticle(req,res){
        let newArticle = await Article.findOne({slug:req.body.slug});

        if(newArticle){
            req.flash("errors",["slug already exist"]);
            return res.redirect("/dashboard/article/create");
        };
        
        newArticle = new Article({
            author : req.user.id,
            title : req.body.title,
            slug : req.body.slug,
            category : req.body.category,
            description : req.body.description,
            picture : req.body.picture
        });

        if(req.body.status && req.user.is_admin){
            newArticle.status = true;
            newArticle.published_at =Date.now();
        };

        await newArticle.save();
        req.flash("info","article send to admin for publish");
        res.redirect("/dashboard/article/create");
    };

    async updateArticle(req,res){
        if(req.params.slug !== req.body.slug){
            const article = await Article.findOne({slug:req.body.slug});
            if(article){
                    req.flash("errors",["slug already exist"]);
                    return res.redirect(`/dashboard/article/${req.params.slug}`);
            };
        };

        const article = await Article.findOne({slug:req.params.slug});

        if(article.status){
            if(!req.user.is_admin){
                req.flash("errors","article published and you dont have edited this");
                return res.redirect(`/dashboard/article/${req.params.slug}`);
            };
        };

        if(!(req.user.is_admin || article.author == req.user.id)){
            return res.render("status/status-404");
        };
        
        article.title = req.body.title;
        article.slug = req.body.slug;
        article.description = req.body.description,
        article.category = req.body.category,
        article.status = req.body.status? true:false;
        article.published_at = article.status? Date.now():"";
        if(req.body.picture) article.picture = req.body.picture;

        await article.save();

        req.flash("info","article updated and send to admin");
        res.redirect("/dashboard/articles");
    };

    async deleteArticle(req,res){
        const article = await Article.findOne({slug:req.params.slug});

        if(article.status){
            if(!req.user.is_admin){
                req.flash("errors","article published and you dont deleted this");
                return res.redirect(`/dashboard/article/${req.params.slug}`);
            };
        };

        if(req.user.is_admin || req.user.id == article.author){
            fs.unlink("assets/" + article.picture,(err)=>{
                if(err){
                    req.flash("errors",err.message);
                    return res.redirect("/dashboard/articles");
                };
            })
            await Rate.deleteMany({article:article._id});
            await Comment.deleteMany({article:article._id});
            await article.delete();
        };
        res.redirect("/dashboard/articles");
    }


    async actionsArticle(req,res){
        if(!req.user.is_admin){
            return res.redirect("/dashboard/articles")
        };
        const article = await Article.findOne({slug:req.params.slug});
        if(!article){
            return res.redirect("/dashboard/articles")
        };

        article.status = !article.status;
        article.published_at = article.status? Date.now():"";
        await article.save();

        res.redirect("/dashboard/articles")
    }

/////////////////////// categories route for admin //////////////////////////////////

    async categoryList(req,res){
        let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
        let pageInatedBy = parseInt(req.query.entries) || 10;

        let query = {}
        if(req.query.search){
            query = {...query,$text:{$search:req.query.search}};
        };

        const categories = await Category.find(query)
            .sort({status:-1});
    
        const count = await Category.count(query);

        const context = {
            user:req.user,
            categories:categories,
            errors:req.flash("errors"),
            info:req.flash("info"),
            page,
            pages:Math.ceil(count/pageInatedBy),
            count,
            page_by:pageInatedBy,
            search:req.query.search
        };

        return res.render("dashboard/category_list",context);
    };

    async categorySingle(req,res){
        const context = {
            user:req.user,
            category:{},
            errors:req.flash("errors"),
            info:req.flash("info")
        };

        if(req.params.slug){
            const category = await Category.findOne({slug:req.params.slug});
            if(category){
                context.category = category;
            };
        };
        return res.render("dashboard/category_single",context);
    };

    async createCategory(req,res){
        let newCategory = await Category.findOne({slug:req.body.slug});
        
        if(newCategory){
            req.flash("errors",["slug already exist"]);
            return res.redirect("/dashboard/category/create");
        };
        
        newCategory = new Category({
            title:req.body.title,
            slug:req.body.slug
        });
        if(req.body.status) newCategory.status = true;

        await newCategory.save();
        req.flash("info",`${newCategory.title} added to categories`);

        return res.redirect("/dashboard/categories");
    };

    async updateCategory(req,res){
        if(req.params.slug !== req.body.slug){
            const  category = await Category.findOne({slug:req.body.slug});
            if(category){
                    req.flash("errors",["slug already exist"]);
                    return res.redirect(`/dashboard/category/${req.params.slug}`);
            };
        };
        
        const category = await Category.findOne({slug:req.params.slug});
        
        category.title = req.body.title;
        category.slug = req.body.slug;
        category.status = req.body.status;
        await category.save();
        req.flash("info","article updated and send to admin");

        return res.redirect("/dashboard/categories");
    };

    async deleteCategory(req,res){
        const category = await Category.findOne({slug:req.params.slug});
        if(category){
            await category.delete();
        };
        res.redirect("/dashboard/categories");
    };


/////////////////////// users route for admin //////////////////////////////////

    async userList(req,res){
        let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
        let pageInatedBy = parseInt(req.query.entries) || 10;

        let query = {};
        if(req.query.search){
            query = {...query,$text:{$search:req.query.search}};
        };

        const users = await this.User.find(query)
            .skip(pageInatedBy * (page-1))
            .limit(pageInatedBy)
            .sort({is_admin:-1,is_special:-1,is_active:-1});

        const count = await this.User.count(query);

        const context = {
            user:req.user,
            users:users,
            errors:req.flash("errors"),
            info:req.flash("info"),
            page,
            pages:Math.ceil(count/pageInatedBy),
            count,
            page_by:pageInatedBy,
            search:req.query.search
        };

        return res.render("dashboard/user_list",context);
    };


    async userSingle(req,res){
        const context = {
            user:req.user,
            other_user:{},
            errors:req.flash("errors"),
            info:req.flash("info")
        };

        if(req.params.username){
            const otherUser = await this.User.findOne({username:req.params.username});
            if(otherUser){
                context.other_user = otherUser;
            };
        };
        return res.render("dashboard/user_single",context);
    };


    async createUser(req,res){
        let newUser = await this.User.findOne({username:req.body.username});
        
        if(newUser){
            req.flash("errors",["username already exist"]);
            return res.redirect("/dashboard/user/create");
        };
        
        newUser = new this.User({
            username:req.body.username,
            first:req.body.first,
            last:req.body.last,
            email:req.body.email,
            about_me:req.body.about_me,
            is_active:req.body.is_active ? true:false,
            is_admin:req.body.is_admin ? true:false,
            is_special:req.body.is_special ? true:false
        });

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash("12345",salt);

        await newUser.save();
        req.flash("info",`${newUser.username} added to users`);

        return res.redirect("/dashboard/users");
    };


    async updateUser(req,res){
        if(req.params.username !== req.body.username){
            const user = await this.User.findOne({username:req.body.username});
            if(user){
                    req.flash("errors",["username already exist"]);
                    return res.redirect(`/dashboard/user/${req.params.username}`);
            };
        };
        
        const user = await this.User.findOne({username:req.params.username});
        
        user.username = req.body.username;
        user.first = req.body.first;
        user.last = req.body.last;
        user.email = req.body.email;
        user.is_active = req.body.is_active ? true:false;
        user.is_admin = req.body.is_admin ? true:false;
        user.is_special = req.body.is_special ? true:false;

        await user.save();
        req.flash("info",`user ${user.username} updated`);

        return res.redirect("/dashboard/users");
    };


    async deleteUser(req,res){
        const user = await this.User.findOne({username:req.params.username});
        if(user){
            await user.delete();
        };
        res.redirect("/dashboard/users");
    };


/////////////////////// contact_us route for admin //////////////////////////////////

    async contactUsList(req,res){
        let page = req.query.page > 0 ? parseInt(req.query.page) : 1;
        let pageInatedBy = parseInt(req.query.entries) || 10;

        let query = {};
        if(req.query.search){
            query = {...query,$text:{$search:req.query.search}};
        };

        const contacts = await ContactUs.find(query)
            .skip(pageInatedBy * (page-1))
            .limit(pageInatedBy)
            .sort({is_read:1,created_at:-1});

        const count = await ContactUs.count(query);

        const context = {
            user:req.user,
            contacts:contacts,
            errors:req.flash("errors"),
            info:req.flash("info"),
            page,
            pages:Math.ceil(count/pageInatedBy),
            count,
            page_by:pageInatedBy,
            search:req.query.search
        };

        return res.render("dashboard/contact_list",context);
    };


    async contactUsSingle(req,res){
        const contact = await ContactUs.findById(req.params.id);
        if(!contact){
            return res.redirect("/dashboard/contact-us");
        };

        contact.is_read = true;
        await contact.save();

        const context = {
            user:req.user,
            contact,
            errors:req.flash("errors"),
            info:req.flash("info")
        };

        return res.render("dashboard/contact_single",context);
    };


    async contactUser(req,res){
        const contact = await ContactUs.findById(req.params.id);
        if(contact){
            await contact.delete();
        };
        return res.redirect("/dashboard/contact-us");
    };

});