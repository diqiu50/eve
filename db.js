'use strict'

var mysql = require('mysql');
var connection = mysql.createConnection({
	host : '192.168.99.184',
	user : 'root',
	password : '12345',
	database : 'ice_db'
});

connection.connect();

connection.query('SELECT * from user', function(err, rows, fields) {
	if (err) throw err;

	console.log('The solution is: ', rows);
});

connection.query('insert into user values("young", 12345)', function(err, rows, fields) {
	if (err) throw err;

	console.log('The solution is: ', rows);
});

connection.end();

