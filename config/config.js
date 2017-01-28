var config = {
	login: {
		fb:{
			clientID: "1831616943717224",
			clientSecret: "e7f6783aa478eb2957aeae8e3233bed9",
			callbackURL: "http://localhost:3000/facebook-callback"
	  }
	},
	"db": process.env.PORT ? {
	  host     : 'sql6.freemysqlhosting.net',
	  user     : 'sql6155984',
	  password : 'rN2U2glarH',
	  database : 'sql6155984'
	} : {
		host     : 'localhost',
		user     : 'root',
	    password : '',
	    database : 'appathon'
	}
};
/*
"db": {
	  host     : 'sql6.freemysqlhosting.net',
	  user     : 'sql6154934',
	  password : 'IGuRqBJvyV',
	  database : 'sql6154934'
}*/
module.exports = config;