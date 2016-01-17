'use strict'

var mysql = require('mysql');                    
var Application = require('./application');                    
var async = require('async')

var db = mysql.createConnection({
		host : '192.168.99.184',
		user : 'root',
		password : '12345',
		database : 'ice_db'
});

var AppMgr = {
	smApps:[],
	smMapping:[],
	start: function(callback) {
		db.connect(); 
		db.query("SELECT * from apps_t where app_id=100000",
			function(err, rows, fields){
				if (err) throw err;
				AppMgr.smApps[100000] = Application.create(100000, rows[0], db);
				callback();
			});
	},

	loadApp: function(hostname, url, callback){
		if (url.path == "/") url.path = "/index.html";
		var key = hostname + "_" + url.path;	
		var appid = AppMgr.smMapping[key];
		if (appid) {
			return callback(appid);
		}
		AppMgr.createApp(hostname, url.path, callback);
	},

	createApp: function(hostname, url, callback){
		//console.log("SELECT * from apps_t where hostname='" + hostname + "' and url='" + url + "'");
		db.query("SELECT * from apps_t where hostname='" + hostname + "' and url='" + url + "'",
			function(err, rows, fields){
				if (err) throw err;
				var appid;
				if (rows.length == 1) {
					//console.log("find app: " + rows[0].app_id);
					var app = Application.create(rows[0].app_id, rows[0], db);
					AppMgr.smApps[rows[0].app_id] = app;
					appid = rows[0].app_id;
				} else {
					//console.log("not find app: "+ hostname + " " + url);
				}
				callback(appid);
			});
	},
	getApp: function(appid){
		return AppMgr.smApps[appid];
	},
	stop : function() {
		db.end();
	}
}


module.exports = AppMgr;
