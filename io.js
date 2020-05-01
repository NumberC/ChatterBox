var io = null;
var messages = null;
module.exports = (server, schemas) => {
    io = require("socket.io")(server);
    messages = schemas.MessageModel;
    messages.find({}, (err, res) => {
        res.forEach(group => {
            addNSP(group._id);
        });
    })
};

function addNSP(ID){
    var nsp = io.of("/" + ID);
    nsp.on('connection', (socket) => {
        socket.on("message", (data) => {
            socket.broadcast.emit("message", data);
            messages.sendMsg(data.ID, data.SenderID, data.content);
        })
    });
}

module.exports.addNSP = function(ID){addNSP(ID)};