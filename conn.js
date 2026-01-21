var mysql = require("mysql");
var util = require("util");

var conn = mysql.createConnection({
    host: "bpymqbywetmhx5z7t7al-mysql.services.clever-cloud.com",
    user: "uolfkrhomg0qd9dp",
    password: "8ttioK4MlZkG6JrD8p91",
    database: "bpymqbywetmhx5z7t7al",
    port: "3306"
});

var exe = util.promisify(conn.query).bind(conn);

module.exports = exe;
