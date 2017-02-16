var config = {
	login: {
		fb:{
			clientID: "1831616943717224",
			clientSecret: "e7f6783aa478eb2957aeae8e3233bed9",
			callbackURL: "http://localhost:3000/facebook-callback"
	  }
	},
	"db": process.env.PORT || true ? {
	  host     : 'sql8.freemysqlhosting.net',
	  user     : 'sql8159158',
	  password : 'zI7jzHUIRb',
	  database : 'sql8159158'
	} : {
		host     : 'localhost',
		user     : 'root',
	    password : '',
	    database : 'appathon'
	}
};
/*
"db": {
	  host     : 'sql8.freemysqlhosting.net',
	  user     : 'sql8159158',
	  password : 'zI7jzHUIRb',
	  database : 'sql8159158'
}*/
module.exports = config;