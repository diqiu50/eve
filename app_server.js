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
	var appid;
	var url = Url.parse(req.originalUrl, true);
	if (url.path.indexOf("/appid_") == 0) {
		appid =  url.path.substring(7, url.path.indexOf("/", 12));			
		if (AppMgr.getApp(appid)) {
			req.session.appid = appid;
		}else {
			req.session.appid = null;
		}
	} else if (url.query.appid) {
			appid = url.query.appid;
		if (AppMgr.getApp(appid)) {
			req.session.appid = appid;
		}else {
			req.session.appid = null;
		}
	}

	if (req.session.appid) {
		console.log("access app: " + req.session.appid);
		next();
		return;
	}

	AppMgr.loadApp(req.hostname, url, function(appid) {
		if (appid) {
			console.log("load app: " + appid);
			req.session.appid = appid;
		} else {
			console.log("load app faild : " + url.href);
			res.send("404 url 0: " + req.originalUrl);
			return;
		}
		next();
	});
});


app_svr.use(express.static(AppConfig.web_base, {index:"index.html"}));


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
		var url = Url.parse(req.originalUrl);
		app.loadResource(url.path, function (success, file){
			if (success) {
				console.log("404 find res: " + file);
				res.sendFile(file, {root: AppConfig.web_base});
			} else {
				console.log("404 url 1: " + req.originalUrl);
				AppMgr.loadApp(req.hostname, url, function(appid) {
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

AppMgr.start(function() {
	var server = app_svr.listen(8823, function() {
		var host = server.address().address;
		var port = server.address().port;
		console.log("started")
	});
	server.on('close', function() {
		AppMgr.stop();
	});
});
