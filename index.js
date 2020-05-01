const dotenv = require('dotenv');
dotenv.config();

const fs = require("fs");
const http = require("http");
const express = require("express");
var session = require('express-session')
const ehb  = require("express-handlebars");
var bodyParser = require('body-parser');
const app = express();
const port = 3000;
const passport = require("passport");

//Database Configuration
const mongo = require("mongodb");

var path = require('path');

//Initial Setup
app.use(express.static(path.join(__dirname, "views")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({"secret": "keyboard cat"}));
app.use(passport.initialize());
app.use(passport.session());

app.engine('handlebars', ehb());
app.set('view engine', 'handlebars');

//Setup Database
var schemas = require(path.resolve( __dirname, "./schema.js"));
 
//Socket.io
const server = http.createServer(app);
var ioHandler = require(path.resolve( __dirname, "./io.js"));
ioHandler(server, schemas);

//Routes
var routes = require(path.resolve( __dirname, "./routes/route.js"))(app, schemas, mongo, ioHandler);

server.listen(port);
// console.log(process.env.MONGO_PASSWORD);
// console.log(process.env.MONGO_PRODUCTION_URL);