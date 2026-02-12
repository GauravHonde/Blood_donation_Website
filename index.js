var express = require("express");
var bodyparser = require("body-parser");
const fileUpload = require("express-fileupload");
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var url = require("url");
var session = require("express-session");

var app = express();

app.use(bodyparser.urlencoded({ extended: true }));

app.use(session({
    secret: 'blood_donation_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

app.use(express.static("public/"));
app.use(express.json());
app.use(fileUpload());

app.use(express.static("public"));

app.use("/", userRouter);
app.use("/admin", adminRouter);

app.listen(3002);



