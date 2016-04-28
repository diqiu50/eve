'use strict'

var mysql = require('mysql');                    
var Application = require('./application');                    
var AppConfig = require('./config');
var EveService = require('./service');

var AppMgr = {
	smApps:[],
	smMapping:[],

	getApp: function(){
		if (arguments.length==1) {
			var appid = arguments[0];
			return AppMgr.smApps[appid];
		} else if (arguments.length==3) {
			var hostname = arguments[0];
			var url = arguments[1];
			var callback = arguments[2];
			if (url == "/") url = "/index.html";
			var key = hostname + "_" + url;	
			var appid = AppMgr.smMapping[key];
			if (appid) {
				return callback(appid);
			}
			AppMgr.loadApp(hostname, url, callback);
		} else if (arguments.length==2) {
			var appid = arguments[0];
			var callback = arguments[1];
			if (AppMgr.smApps[appid]) {
				return callback(appid);
			}
			AppMgr.loadApp(appid, callback);
		}
	},

	loadApp: function(){
		if (arguments.length==3) {
			var hostname = arguments[0];
			var url = arguments[1];
			var callback = arguments[2];
			//console.log("SELECT * from apps_t where (hostname='" + hostname + "' or hostname='*') and url='" + url + "'");
			EveService.sysdb.query("SELECT * from apps_t where (hostname='" + hostname + "' or hostname='*') and url='" + url + "'",
				function(err, rows, fields){
					if (err) throw err;
					var appid;
					if (rows.length == 1) {
						//console.log("find app: " + rows[0].app_id);
						appid = rows[0].app_id;
						Application.create(appid, rows[0], function(app) {
							if (app){
								AppMgr.smApps[appid] = app;
								var key = hostname + "_" + url;	
								AppMgr.smMapping[key] = appid;
							}
							callback(appid);
						});
					} else {
						//console.log("not find app: "+ hostname + " " + url);
						callback(appid);
					}
				}
			);
		} else if (arguments.length==2) {
			var appid = arguments[0];
			var callback = arguments[2];
			//console.log("SELECT * from apps_t where app_id=" + appid);
			EveSystem.sysdb.query("SELECT * from apps_t where app_id=" + appid,
				function(err, rows, fields){
					if (err) throw err;
					var appid = rows[0].app_id;;
					AppMgr.smApps[100000] = Application.create(appid, rows[0]);
					callback(appid);
				}
			);
		}
	}
}


module.exports = AppMgr;
