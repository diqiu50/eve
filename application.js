'use strict'

var fs = require('fs');
var mkdirp = require('mkdirp');
var AppConfig = require('./config');

var Application = {
	create : function(appid, app_conf, db) {
		var app = {};
		app.appid = appid;
		app.appname = app_conf["appname"];
		app.mDbConn = db;
		app.mResources = [],
		app.mComponents= [],
		app.loadResource = function(url, callback){
			var path = "/appid_" + this.appid + "/";
			if (url.indexOf(path) == 0) {
				url = url.substring(path.length-1);
			}
			if (url == "/") url = "/index.html"
			
			console.log("SELECT uri, contents from res_t where uri='" + 
					url + "' and app_id='" + this.appid + "'");
			this.mDbConn.query("SELECT uri, contents from res_t where uri='" + 
					url + "' and app_id='" + this.appid + "'", function(err, rows, fields) {
				if (err) throw err;	
				if (rows.length != 1) {
					callback(false, "")
					return;
				}
				
				var filename = AppConfig.web_base + "/appid_" + app.appid + rows[0].uri;
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
			if (this.mComponents[acpid]) {
				this.mComponents[acpid].doAction(req, res, callback);
			} else {
				var filename = AppConfig.web_base + "/appid_" + this.appid + "/" + acpid + ".js";
				fs.exists(filename, function(exists) {
					if (!exists) {
						app.loadResource("/"+ acpid+".js", function(rslt, filename) {
							if (rslt) {
								var moudule = require("./"+filename);		
								app.mComponents[acpid] = moudule;
								moudule.doAction(req, res, callback);
							} else {
								callback(false);
							}

						});
					} else {
						var moudule = require("./" + filename);		
						app.mComponents[acpid] = moudule;
						moudule.doAction(req, res, callback);
					}
				});
			}
		}
		return app;
	}
};

module.exports = Application;
