var LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var m_users;

module.exports = (Users, passport) => {
    m_users = Users;
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    }, (token, tokenSecret, profile, done) => {
        var email = profile.emails[0].value;
        m_users.findOne({email: email}, async (err, res) => {
            if(err) return done(err);
            if(res){
                if(res.OAuth != profile.id) return done(null, false, {message: "Account Already Exists"});
                return done(null, res);
            }

            var newUser = new m_users({
                name: profile.displayName,
                email: email,
                password: null,
                OAuth: profile.id
            });
            newUser.save((err, res) => {
                if (err) return done(err);
                return done(null, res);
            });
        });
      }
    ));

    passport.use(new LocalStrategy( (username, password, done) => {
        Users.findOne({ email: username }, function(err, user) {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'Incorrect username.' });

            if (!user.validPassword(password) || user.isSocial()){
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user);
    });
    
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
}

module.exports.addUser = function addUser(email, password){
    m_users.findOne({email: email}, (err, res) => {
        if(err) return done(err);
        if(res) return done(null, false, {message: "That Email is Already Used"});
        var newUser = new m_users({
            name: email.split("@")[0],
            email: email,
            password: m_users.generateHash(password),
            OAuth: null
        });
        m_users.insertMany(newUser);
    });
};