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
        Sender: {type : ObjectId},
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

UserSchema.methods.getGroups = async function(users, messages) {
    var result = [];

    await messages.find({Group: this._id}).map(async Groups => {
        var subArray = [];

        for(const Group of Groups){
            for(const memberID of Group.Group){
                await users.findById(memberID).map(async req => {
                    var name = "User Deleted";
                    if(req) name = req.name;
                    subArray.push(name);
                });
            }
            result.push({ID: Group._id, Members: subArray});
            console.log("SB: " + subArray);
            subArray = [];
        }
        return result;
    });
    console.log("----------7----------");
    console.log(result);
    return result;
};

MessageSchema.statics.sendMsg = function(id, senderID, msg){
    this.findById(id, (err, res) => {
        if(!res){
            console.log("Group Does Not Exist");
        } else{
            var currentDate = new Date();
            res.Messages.push({Sender: senderID, Content: msg, Date: currentDate.getTime()});
            res.save();
        }
    });
}

mongoose.pluralize(false);

module.exports.FriendModel = friendsConn.model("friends", Profile);
module.exports.UserModel = productionConn.model("users", UserSchema)
module.exports.MessageModel = productionConn.model("messages", MessageSchema);