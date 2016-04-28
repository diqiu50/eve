'use strict'

var fs = require('fs');
var mkdirp = require('mkdirp');
var Promise = require('promise');
var AppConfig = require('./config');
var EveService = require('./service');

var Application = {
	create : function(appid, app_conf, callback) {
		var app = {};
		app.appid = appid;
		app.appname = app_conf["appname"];
		app.mDb = {};
		app.mResources = [],
		app.mComponents= [],

		app.getComponent= function(acpid, callback) {
			if (this.mComponents[acpid]) {
				callback(this.mComponents[acpid]);
			} else {
				var filename = AppConfig.http.root + "/appid_" + this.appid + "/app_src/" + acpid + ".js";
				fs.exists(filename, function(exists) {
					if (!exists) {
						app.loadResource("/app_src/"+ acpid+".js", function(rslt, filename) {
							if (rslt) {
								var moudule = require("./"+filename);		
								app.mComponents[acpid] = moudule;
								callback(moudle);
							} else {
								callback();
							}

						});
					} else {
						var moudule = require("./" + filename);		
						app.mComponents[acpid] = moudule;
						callback(moudule);
					}
				});
			}
		};
		
		app.loadResource = function(url, callback){
			var path = "/appid_" + this.appid + "/";
			if (url.indexOf(path) == 0) {
				url = url.substring(path.length-1);
			}
			if (url == "/") url = "/index.html"
			
			//console.log("SELECT uri, contents from res_t where uri='" + 
			//		url + "' and app_id='" + this.appid + "'");
			EveService.sysdb.query("SELECT uri, contents from res_t where uri='" + 
					url + "' and app_id='" + this.appid + "'", function(err, rows, fields) {
				if (err) throw err;	
				if (rows.length != 1) {
					callback(false, "")
					return;
				}
				
				var filename = AppConfig.http.root + "/appid_" + app.appid + rows[0].uri;
				var dirname = filename.substring(0, filename.lastIndexOf('/'));
				if (!fs.existsSync(dirname)) {
					mkdirp.sync(dirname);
				}
				fs.writeFile(filename, rows[0].contents, function(err) {
					if (err) throw err;	
					//console.log("write file: " + filename); 
					callback(true, "/appid_" + app.appid + rows[0].uri);
				});
			});
		},

		app.doAction = function(acpid, req, res, callback) {
			app.getComponent(acpid, function(cmp) {
				if (cmp) {
					cmp.doAction(req, res, callback);
				} else {
					callback(false);	
				}
			});
		}


		function setAppStatus() {
			/*
			app.mDb.excubeSql(, function(err, rows){
				if (err) {
					error(err);
				} else {
					su
				}
			});
			*/
			return new Promise(function(resolve, reject){
				resolve();
			});
		};

		function doAppInit(cmp) {
			return new Promise(function(resolve, reject){
				cmp.doAction("oninit", cmp, function(){
					resolve(1,2);
				});
			});
		};

		function createDefDb() {
			return new Promise(function(resolve, reject){
				EveService.sysdb.query("create database if not exists appid_" + app.appid, 
					function(err, rows, fields) {
					if (err) {
						reject(err);	
					}
					if (rows.length != 1) {
						resolve()
					}
				});
			});
		};

		function getAppInitCmp() {
			return new Promise(function (success, error) {
				app.getComponent("app", function(cmp){
					if(cmp) {
						success(cmp);
					} else {
						error();
					}
				});	
			});
		};
		
		createDefDb().then(getAppInitCmp)
			.then(doAppInit)
			.then(setAppStatus)
			.then(function(){
				callback(app)
			})
			.catch( function(err){
				console.log("Error" + err)
				callback(app)
			});
	}
};

module.exports = Application;
