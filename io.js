module.exports = (server) => {
    const io = require("socket.io")(server);
    io.on("connection", client => {
        client.on("join", (data) => {
            console.log(data);
        });
        client.on("message", (data) => {
            console.log(data);
            io.emit("message", data);
        })
    });
};