var passport = require('passport'),
    requestify = require('requestify'),
	FacebookStrategy = require('passport-facebook').Strategy,
	config = require("../../config/config"),
	loginModel = require("../model/login"),
	loginController = {},
	_this = this;
	
loginController.registerUser = function(req,reply) {
	loginModel.registerUser(req.payload,function(err,succ) {
		if(err) {
			return reply({"status":400,"message":err.msg});	
		} else {
			return reply({"status":200,"message":"Device registered successfully","userData":succ})
		}
	})
}
loginController.loginUser = function(req,reply) {
	//console.log(req.payload)
	loginModel.loginUser(req.payload,function(err,userDetails) {
		//console.log(err , userDetails)
		if(err) {
			return reply({"status":400,"message":err.msg});	
		} else {
			return reply({"status":200,userDetails:userDetails})
		}
	})
}


loginController.fbLogin = function(request,reply) {
	var fbData = config.login.fb;
	reply.redirect("http://www.facebook.com/dialog/oauth?client_id=" + fbData.clientID + "&redirect_uri=" + fbData.callbackURL + "&state=" + (new Date().getTime() )+ "&scope=email");
}

loginController.fbLoginCallback = function(request,reply) {
	var responseObject = request.query;
	if(!responseObject.error_code) {
		loginController.accessToken(responseObject,function(err,success) {
			if(err) {
				return reply({"status":400,"message":"failed"})	
			} else {
				success.status = 200;
				success.message = "success";
				return reply(success);
			}
					
		})
	} else {
		return reply({"status":401,"message":"unauthorized"})
	}
}

loginController.accessToken = function(requestObj,cb) {
	var fbData = config.login.fb;
	var urlData = "https://graph.facebook.com/v2.8/oauth/access_token?client_id=" + fbData.clientID + "&redirect_uri=" + fbData.callbackURL  + "&client_secret=" + fbData.clientSecret + "&code=" + requestObj.code;
	requestify.get(urlData).then(function(response) {
		response = response.getBody();
		response.type = "facebook";
		response.code = requestObj.code;
		var profileurl = "https://graph.facebook.com/v2.8/me?fields=id,name,email,gender,location,picture&access_token=" + response.access_token
		requestify.get(profileurl).then(function(profile) {
			profile = profile.getBody();
			var objectKey = Object.keys(profile) || [];
			objectKey.map(function(arrayVal) {
				response[arrayVal] = profile[arrayVal]
			});
			//console.log(response);
			loginModel.userCheck(response,function(err,success) {
				if(err) {
					cb(err)
				} else {
					cb(null,success)
				}
			})
		})
	}).fail(function(response) {
        cb(err);
    });
}

module.exports = loginController;