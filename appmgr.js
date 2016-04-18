'use strict'

var mysql = require('mysql');                    
var Application = require('./application');                    
var AppConfig = require('./config');

var db = mysql.createConnection({
		host : AppConfig.db_ipaddr,
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
			}
		);
	},

	loadApp: function(){
		if (arguments.length==3) {
			var hostname = arguments[0];
			var url = arguments[1];
			var callback = arguments[2];
			if (url == "/") url = "/index.html";
			var key = hostname + "_" + url;	
			var appid = AppMgr.smMapping[key];
			if (appid) {
				return callback(appid);
			}
			AppMgr.createApp(hostname, url, callback);
		} else if (arguments.length==2) {
			var appid = arguments[0];
			var callback = arguments[1];
			if (AppMgr.smApps[appid]) {
				return callback(appid);
			}
			AppMgr.createApp(appid, callback);
		}
	},

	createApp: function(){
		if (arguments.length==3) {
			var hostname = arguments[0];
			var url = arguments[1];
			var callback = arguments[2];
			//console.log("SELECT * from apps_t where (hostname='" + hostname + "' or hostname='*') and url='" + url + "'");
			db.query("SELECT * from apps_t where (hostname='" + hostname + "' or hostname='*') and url='" + url + "'",
				function(err, rows, fields){
					if (err) throw err;
					var appid;
					if (rows.length == 1) {
						//console.log("find app: " + rows[0].app_id);
						appid = rows[0].app_id;
						var app = Application.create(appid, rows[0], db);
						AppMgr.smApps[appid] = app;
						var key = hostname + "_" + url;	
						AppMgr.smMapping[key] = appid;
					} else {
						//console.log("not find app: "+ hostname + " " + url);
					}
					callback(appid);
				}
			);
		} else if (arguments.length==2) {
			var appid = arguments[0];
			var callback = arguments[2];
			//console.log("SELECT * from apps_t where app_id=" + appid);
			db.query("SELECT * from apps_t where app_id=" + appid,
				function(err, rows, fields){
					if (err) throw err;
					var appid = rows[0].app_id;;
					AppMgr.smApps[100000] = Application.create(appid, rows[0], db);
					callback(appid);
				}
			);
		}
	},

	getApp:function(appid) {
		return AppMgr.smApps[appid];
	},

	stop : function() {
		db.end();
	}
}


module.exports = AppMgr;
