'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var Url = require('url');
//var cluster = require('cluster');
var AppMgr = require('./appmgr');
var AppConfig = require('./config');

var app_svr = express();

app_svr.use(session({
	resave:false,
	saveUninitialized:true,
	secret:"keyboard cat",
}));

app_svr.use(bodyParser.json({limit: '10mb'})); 
app_svr.use(bodyParser.urlencoded({extended: true}));
app_svr.use(cookieParser());

app_svr.use(function(req, res, next) {
	console.log("access url: " + req.originalUrl);

	function getAppid(req, url) {
		var ref_url = req.get("Referer");
		var appid;
		if (ref_url) {
			ref_url = Url.parse(ref_url, true);
			if (ref_url.path.indexOf("/appid_") == 0) {
				appid =  ref_url.path.substring(7, ref_url.path.indexOf("/", 12));
				return appid;
			}
		} else {
			if (url.path.indexOf("/appid_") == 0) {
				appid =  url.path.substring(7, url.path.indexOf("/", 12));
			} else if (url.query) {
				if (url.query.appid)
					appid = url.query.appid;
			}
		}
		return appid;
	}

	var url = Url.parse(req.originalUrl);
	req.url = url;

	if (req.session.appid) {
		console.log("access app 0: " + req.session.appid);
		next();
		return;
	}

	var appid = getAppid(req, url);
	function apploadcb(appid) {
		if (appid) {
			console.log("load app success: " + appid);
			req.session.appid = appid;
		} else {
			console.log("load app faild : " + url.href);
			res.send("404 url 0: " + req.originalUrl);
			return;
		}
		next();
	}
	
	if (appid) {
		console.log("load app by id:");
		AppMgr.getApp(appid, apploadcb);
	} else {
		console.log("load app by url:");
		AppMgr.getApp(req.hostname, url.path, apploadcb);
	}
});


app_svr.use(express.static(AppConfig.http.root, {index:"index.html"}));


app_svr.all('/svrcmd/:acpid', function(req, res) {
	var acpid = req.params.acpid;
	var app = AppMgr.getApp(req.session.appid);
	if (!app) {
		console.log("505 app not find: " + req.originalUrl);
		res.send("500 App not find: " + req.originalUrl);
	} else {
		app.doAction(acpid, req, res, function(rslt, respone){
			if (rslt != true) {
				res.json({status:"500 action failed: " + req.originalUrl});
			} else {
				res.json({status:"success"});
			}
		});
	}
});


app_svr.use(function(req, res, next) {
	console.log("404 url 0: " + req.originalUrl);
	var app = AppMgr.getApp(req.session.appid);
	if (!app) {
		console.log("505 app not find: " + req.originalUrl);
		res.send("500 App not find: " + req.originalUrl);
	} else {
		var url = req.url;
		app.getResource(url.path, function (success, file){
			if (success) {
				console.log("404 find res: " + file);
				res.sendFile(file, {root: AppConfig.http.root});
			} else {
				console.log("404 url 1: " + req.originalUrl);
				AppMgr.getApp(req.hostname, url, function(appid) {
					if (appid) {
						console.log("404 load app: " + appid);
						req.session.appid = appid;
						res.redirect(req.originalUrl);
					} else {
						console.log("404 load app faild: " + url.href);
						res.send("404 url 1: " + req.originalUrl);
						return;
					}
				});
			}
		});
	}
});


/*
var cpus = require('os').cpus().length;

if (cluster.isMaster) {
	console.log("master start...");
	var worker;
	for (var i = 0; i < 2; i++) {
		worker = cluster.fork();
	}

	cluster.on("listening", function(worker, address) {
		 console.log('listening: worker ' + worker.process.pid +', Address: '+address.address+":"+address.port);
	});

	cluster.on('exit', function (worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
	});

} else {
	AppMgr.start(function() {
		var server = app_svr.listen(8823, function() {
			console.log("started")
		});
		server.on('close', function() {
			AppMgr.stop();
		});
	});
}
*/

function start() {
	var server = app_svr.listen(AppConfig.http.port, AppConfig.http.ip,  function() {
		var host = server.address().address;
		var port = server.address().port;
		console.log("started:" + host + ":" + port);
	});
};
module.exports = start;
