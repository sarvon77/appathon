var db = require("./db.js");
const uuidV1 = require('uuid/v1');
const moment = require('moment');
var loginModule = {};


loginModule.userCheck = function(request,cb) {
	var queryStr = "SELECT * from user where emailId='" + request.email + "'";
	db.query(queryStr, function (error, results, fields) {
	  if (error) {
		  cb(error)
	  } else {		 
		 if(results.length == 0) {
			loginModule.adduser(request,function(err,succ) {
				if(!err) {
					request.userId = succ.userId;
					loginModule.addloginRecord(request,function(loginerror,successLogin) {
						if(!loginerror) {
							succ.token = successLogin.token;
							cb(null,succ);
						} else {							
							cb(loginerror);
						}
					}); 
				} else {
					cb(err);
				}
			})
		 } else {
			loginModule.addloginRecord(results[0],function(loginerror,successLogin) {
				if(!loginerror) {
					results[0].token = successLogin.token;
					var responseTxt = {
						token: successLogin.token,
						userId: results[0].userId,
						userName: results[0].userName,
						emailId: results[0].emailId,
						type:results[0].userType,
						isAdmin:results[0].isAdmin == 0 ? false:true
					}
					cb(null,responseTxt);
				} else {
					cb(loginerror);
				}
			}); 
		 }
	  }
	});
}
loginModule.adduser = function (req,cb) {
	var userId = uuidV1(),
		userName = req.name,
		emailId = req.email,
		userObj = JSON.stringify(req),
		userType = req.type,
		isAdmin = 0,
		AccountId = req.id;
	var queryStr = "insert into user(userId,userName,emailId,userObj,userType,isAdmin,AccountId) values('" + userId + "','" + userName + "','" + emailId + "','" +userObj + "','" + userType + "','" + isAdmin + "','" + AccountId + "')";
	db.query(queryStr, function (error, results) {
		if(error) {
			cb(error)
		} else {
			cb(null,{userId:userId,userName:userName,emailId:emailId,type:userType,isAdmin:isAdmin == 0 ? false:true})
		}
	})
}

loginModule.addloginRecord = function(req,cb) {
	var authToken = uuidV1();
	var queryStr = "insert into login(userId,logincode) values('" + req.userId + "','" + authToken +"')";
	db.query(queryStr, function (error, results) {	
		if(error) {
			cb(error)
		} else {
			cb(null,{token:authToken})
		}
	})
}

loginModule.loginUser = function(request,cb) {
	var queryStr = "SELECT * from user where deviceId='" + request.deviceId + "'";
	//console.log(queryStr)
	db.query(queryStr, function (error, results, fields) {
		if (error) {
		  cb({msg:error})
	  } else {		 
		 if(results.length > 0) {
			 results[0].isAdmin = results[0].isAdmin == 0 ? false : true;
			 cb(null,results[0]);
		 } else {
			 cb({msg:"no record found"});
		 }
	  }
	})
}
loginModule.registerUser = function(request,cb) {
	var queryStr = "SELECT * from user where deviceId='" + request.deviceId + "'";
	db.query(queryStr, function (error, results, fields) {
		if (error) {
		  cb({msg:error})
	  } else {		 
		 if(results.length != 0) {
			cb({msg:"error"})
		 } else {
			var userId = uuidV1(),
				AccountId = request.userId,
				userName = request.name,
				emailId = request.email,
				userType = request.loginPortal,
				isAdmin = 0,
				deviceId = request.deviceId,
				thumbnail = request.thumbnail,
				dob = moment(request.dob,"DD MMMM, YYYY").format("YYYY-MM-DD"),
				nationality = request.nationality,
				sex = request.sex,
				phoneNumber = request.phoneNumber,
				appId = request.appId,
				os = request.os;			
			var queryStr = "insert into user(userId,userName,emailId,userType,isAdmin,AccountId,deviceId,thumbnail,dob,nationality,sex,phoneNumber,appId,os) values('" + userId + "','" + userName +"','" + emailId + "','" + userType +"','" + isAdmin + "','" +AccountId +"','" + deviceId +"','" + thumbnail + "','" + dob +"','" + nationality + "','" + sex +"','" + phoneNumber + "','" + appId +"','"+os+"')";
			db.query(queryStr, function (error, results,row) {	
				//console.log(queryStr,error, results,row)
	  
				if(error) {
					cb(error)
				} else {
					var selQuery = "select * from user where Id = '" + results.insertId+ "'";
					db.query(selQuery, function (error, results,row) {			
						results[0].isAdmin = results[0].isAdmin == 0 ? false : true;
					//console.log(error || results)					
						cb(null,results[0] || "success")
					});
				}
			})
		 }
	  }
	});
}
module.exports = loginModule;