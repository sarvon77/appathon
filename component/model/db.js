var mysql      = require('mysql');
var mysqlConfig = require('../../config/config');
var connection = mysql.createConnection(mysqlConfig.db);
connection.connect();

module.exports = connection;