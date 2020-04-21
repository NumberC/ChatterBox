var bcrypt = require("bcrypt");
var mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const uri = process.env.MONGO_PRODUCTION_URL;
const friendsUri = process.env.MONGO_DEVELOPMENT_URL;

const productionConn = mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const friendsConn = mongoose.createConnection(friendsUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Profile = new Schema({
    _id: {
        type: ObjectId,
        ref: "ids"
    },
    name: String,
    quote: String,
    description: String
}, { versionKey: false });

const UserSchema = new Schema({
    _id: {
        type: ObjectId,
        ref: "ids"
    },
    name: String,
    email: String,
    password: String,
    OAuth: String
}, {versionKey: false});

const MessageSchema = new Schema({
    _id: {
        type: ObjectId,
        ref: "ids"
    },
    Group: [{type : ObjectId, ref: 'userIDs'}],
    Messages: [{
        Content: String,
        Date: Date
    }]
}, {versionKey: false});

UserSchema.statics.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

async function trying(members, users, subArray){
    members.forEach((memberID) => {
        users.findById(memberID, (err, req) => {
            console.log(req.name);
            subArray.push(req.name);
            console.log(subArray);
        });
    });
}

UserSchema.methods.getGroups = async function(users, messages) {
    var result = [];
    messages.find({Group: this._id}, (err, group) => {
        for(var i = 0; i < group.length; i++){
            var members = group[i].Group;
            var subArray = [];

            members.forEach((memberID) => {
                users.findById(memberID, (err, req) => {
                    console.log(req.name);
                    subArray.push(req.name);
                    console.log(subArray);
                });
            });

            //After function finishes:
            console.log(subArray);
            result.push(subArray);
            subArray = [];
        }
    });
};

mongoose.pluralize(false);

module.exports.FriendModel = friendsConn.model("friends", Profile);
module.exports.UserModel = productionConn.model("users", UserSchema)
module.exports.MessageModel = productionConn.model("messages", MessageSchema);