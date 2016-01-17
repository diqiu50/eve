function event(type, env) {
	this.type = type;
	this.env = env;	
}


var ev = new event("login", {})
