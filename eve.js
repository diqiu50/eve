'use strict'
var mysql = require('mysql');                    
var httpserver = require('./http_server');                    
var AppConfig = require('./config');
var EveService = require('./service');

var EveSystem = {
	start: function(callback) {
		var db = mysql.createConnection({
			host : AppConfig.sysdb.ip,
			port : AppConfig.sysdb.port,
			user : AppConfig.sysdb.user,
			password : AppConfig.sysdb.passowrd,
			database : AppConfig.sysdb.dbname
		});
		db.connect();
		EveService.sysdb = db;

		httpserver();
	},

	stop : function() {
		this.sysdb.end();
	}
}

EveSystem.start();

