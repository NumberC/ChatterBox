var LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var m_users;

module.exports = (Users, passport) => {
    m_users = Users;
    // passport.use(new GoogleStrategy({
    //     clientID: process.env.GOOGLE_CLIENT_ID,
    //     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //     callbackURL: "http://www.example.com/auth/google/callback"
    //   },
    //   (token, tokenSecret, profile, done) => {
    //       return done(true, null);
    //     //   User.findOrCreate({ googleId: profile.id }, function (err, user) {
    //     //     return done(err, user);
    //     //   });
    //   }
    // ));

    passport.use(new LocalStrategy( (username, password, done) => {
        Users.findOne({ email: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.validPassword(password)) {
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
        if(err){
            console.log("error");
        }
        if(!res){
            var newUser = new m_users({
                name: email.split("@")[0],
                email: email,
                password: m_users.generateHash(password),
                OAuth: null
            });
            m_users.insertMany(newUser);
        } else{
            console.log("That Email is Already Used");
        }
    });
};