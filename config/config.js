var config = {
	login: {
		fb:{
			clientID: "1831616943717224",
			clientSecret: "e7f6783aa478eb2957aeae8e3233bed9",
			callbackURL: "http://localhost:3000/facebook-callback"
	  }
	},
	"db": {
	  //host     : 'sql6.freemysqlhosting.net',
	  host     : 'localhost',
	  //user     : 'sql6154934',
	  user     : 'root',
	  //password : 'IGuRqBJvyV',
	  password : '',
	  //database : 'sql6154934'
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