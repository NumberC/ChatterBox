module.exports = (app, schemas, mongo, ioHandler) => {
    const friends = schemas.FriendModel;
    const users = schemas.UserModel;
    const messages = schemas.MessageModel;

    const path = require('path');
    const passport = require("passport");
    const login = require(path.resolve( __dirname, "../login.js"));
    login(users, passport);

    var errorCodes = {
                        400: {status: 400, error: "No User With That ID"},
                        401: {status: 401, error: "You Must Be Signed In"}
                    };

    app.get("/", (req, res) => {
        if(!req.user) return res.render("home", {loggedIn: req.user});

        users.findById(req.user._id, async (err, result) => {
            var groups = await result.getGroups(users, messages);
            res.render("home", {loggedIn: req.user, group: groups})
        });
    });

    app.get("/profile", (req, res) => {
        if(req.user) return res.render("profile", {User: req.user});
        return res.redirect("/");
    });

    app.get("/register", (req, res) => {
        if(!req.user) return res.render("login", {isLogin: false, loggedIn: req.user});
        return res.redirect("/");
    });

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

    app.get("/login", (req, res) => {
        if(!req.user) return res.render("login", {isLogin: true, loggedIn: req.user});
        return res.redirect("/");
    });

    app.post("/login",  passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login', failureFlash: false }));

    app.post("/deleteProfile", (req, res) => {
        var UID = req.body.UID;

        if(!req.user) return res.status(401).send(errorCodes[401]);
        if(req.user._id !== UID) return;

        var userPassword = req.body.UserPassword;
        users.findById(UID, (err, result) => {
            if(!result) return res.status(400).send(errorCodes[400]);
            if(!result.validPassword(userPassword)) return res.status(401).send(errorCodes[401]);

            result.remove(() => {
                req.session.destroy();
                res.redirect("/");
            });
        });
    });

    app.get("/logout", (req, res) => {
        if(!req.session) return res.redirect("/login");
        req.session.destroy((err) => {
            return res.redirect("/");
        });
    });

    app.post("/updateProfile", (req, res) => {
        if(!req.user) return res.status(401).send(errorCodes[401]);

        var newUsername = req.body.NewUsername;
        users.findById(req.user._id, (err, result) => {
            result.name = newUsername;
            result.save();
        });
        res.redirect("/");
    });

    app.get("/search/:email", (req, res) => {
        var email = req.params.email;
        if(req.user && email == req.user.email) return res.status(400).send(errorCodes[400]);

        users.findOne({email: email}, (err, result) => {
            if(err || !result) return res.status(400).send(errorCodes[400]);
            return res.json({name: result.name, id: result._id});            
        });
    });

    app.post("/createGroup", (req, res) => {
        var IDs = req.body.memberIDs || [];
        if(!req.user) return res.status(401).send(errorCodes[401]);

        IDs.push(req.user._id);

        messages.find({Group: { "$size" : IDs.length, "$all": IDs }}, (err, result) => {
            if(err || !result || result.length == 0){
                groupUID = mongo.ObjectID();
                var newMsg = new messages({
                    _id: groupUID,
                    Group: IDs, 
                    Messages: []
                });
                messages.insertMany(newMsg);
                ioHandler.addNSP(groupUID);
            }
        });
    });

    app.get("/messages/:groupUID", (req, res) => {
        var groupUID = req.params.groupUID;
        messages.findById(mongo.ObjectID(groupUID), (err, result) => {
            if(!result) return res.status(400).send(errorCodes[400]);
            return res.json(result.Messages);
        })
    });

    app.get("/searchByID/:UID", (req, res) => {
        var id = req.params.UID;
        users.findById(mongo.ObjectID(id), (err, result) => {
            if(!result) return res.status(400).send(errorCodes[400]);
            return res.json(result);
        });
    });
}
 