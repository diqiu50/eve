'use strict'

var component = { doAction: function (req, res, callback) {
		callback(true, {status:"success!"})
	}
};

module.exports = component; 
