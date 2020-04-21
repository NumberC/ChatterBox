module.exports = (app, schemas, mongo) => {
    const friends = schemas.FriendModel;
    const users = schemas.UserModel;
    const messages = schemas.MessageModel;

    const path = require('path');
    const passport = require("passport");
    const login = require(path.resolve( __dirname, "../login.js"));
    login(users, passport);

    app.get("/", (req, res) => {
        res.render("home", {loggedIn: req.user});
        if(req.user){
            console.log(req.user);
            console.log("WOAHO");
        }
    });

    app.get("/login", (req, res) => {
        if(!req.user){
            res.render("login", {isLogin: true, loggedIn: req.user});
        } else{
            res.redirect("/");
        }
    });

    app.get("/register", (req, res) => {
        if(!req.user){
            res.render("login", {isLogin: false, loggedIn: req.user});
        } else{
            res.redirect("/");
        }
    });

    app.get("/logout", (req, res) => {
        if(req.session){
            req.session.destroy((err) => {
                res.redirect("/");
            });
        } else {
            res.redirect("/login");
        }
    });

    app.get("/test", async (req, res) => {
        //return [["test"], ["test", "fadi"]]
        var result = [];

        users.findById(mongo.ObjectID("5e9c684f3a2c433d7c54be70"), async (err, res) => {
            await res.getGroups(users, messages);
        });

        res.redirect("/");
    });

    app.post("/sendMsg", (req, res) => {
        //5e9c684f3a2c433d7c54be70 - test
        //5e9cab798350690c0c29f560 - me

        var id = req.body.ID;
        var idStrArray = req.body.ID.split(", ");
        var idArray = [];
        idStrArray.forEach(element => {
            console.log(element.toString());
            idArray.push(mongo.ObjectID(element.toString()));
        });
        var msg = req.body.msg;

        // messages.findOne({Group: idArray}, (err, res) => {
        //     var currentDate = new Date();
        //     if(!res){
        //         var msgObj = {Group: idArray, Messages: [{Content: msg, Date: currentDate.getTime()}]};
        //         messages.insertMany(msgObj);
        //     } else{
        //         res.Messages.push({Content: msg, Date: currentDate.getTime()});
        //         res.save();
        //     }
        // })
        res.redirect("/");
    });

    app.post("/login",  passport.authenticate('local', { successRedirect: '/',failureRedirect: '/error', failureFlash: false }));

    app.post("/register", (req, res) => {
        var email = req.body.username;
        var password = req.body.password;
        var confirm = req.body.passwordConfirm;

        if(confirm == password){
            login.addUser(email, password);
        } else {
            console.log("Enter the password");
        }
        res.redirect("/login");
    });

    app.get("/error", (req, res) => {
        res.render("error", {"code": 200, "description": "Not Valid ID"})
    });
    
    app.post("/error", (req, res) => {
        console.log(req.body);
        var name = req.body.name;
        var quote = req.body.quote;
        var description = req.body.description;
    
        console.log(name);
        console.log(quote);
        console.log(description);
    
        var newUser = {"name": name, "quote": quote, "description": description};
        friends.insertMany([newUser]);
        res.redirect("/");
    });
    
    app.get("/search/:name", (req, res) => {
        var name = req.params.name;
        console.log(name);
    
        friends.findOne({name: name}, (err, result) => {
            if(err || !result){
                res.redirect("/error")
            } else {
                var data = {"name": result.name, "quote": result.quote, "description": result.description};
                res.render("profile", data);
                //5e99bfa892071e20ccb5cb89
                //5e99bfa892071e20ccb5cb8a
            }  
        })
    });
    
    app.get("/users/:id", (req, res) => {
        var id = req.params.id;
        console.log(id);
    
        friends.findById(mongo.ObjectID(id), (err, result) => {
            if(err || !result){
                res.redirect("/error")
            } else{
                console.log(result);
                var data = {"name": result.name, "quote": result.quote, "description": result.description};
                res.render("profile", data);
                //5e99bfa892071e20ccb5cb89
                //5e99bfa892071e20ccb5cb8a
            }
        })
    });

    app.get("/message", (req, res) => {
        res.render("message");
    });
}
 