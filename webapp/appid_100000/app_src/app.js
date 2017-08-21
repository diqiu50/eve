'use strict'

var component = {
	doAction: function (eventid) {
		switch (arguments.length) {
			case 2:
				component[eventid](arguments[1]);	
				break;
			case 3:
				component[eventid](arguments[1], arguments[2]);	
				break;
			case 4:
				component[eventid](arguments[1], arguments[2], arguments[3]);	
				break;
			case 5:
				component[eventid](arguments[1], arguments[2], arguments[5]);	
				break;
			default:		
				console.err("do action mising args");
				break;
		};
	},

	oninit : function(app, callback) {
		console.log("app init");
		app.loadResource("/app_src/init.sql")
		app.mDb.query("source /app_src/init.mysql
		callback();
	},
	onstart : function(app) {

	},
	onstop : function(app) {

	}
}

module.exports = component; 
