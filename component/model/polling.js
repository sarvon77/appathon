var db = require("./db.js");
const uuidV1 = require('uuid/v1');
const async = require('async');
const moment = require('moment');
var pollingModel = {};

pollingModel.comments = function(req,cb){
	//2017-01-26 21:15:01
	var userId = req.userId,
		userName = req.userName,
		date = moment().format("YYYY-MM-DD hh:mm:ss"),
		rating = req.rating,
		comment = req.comment,
		pollingId = req.pollingId;
	var insertQuery = "insert into comments(userId,userName,date,rating,comment,pollingId) values('"+ userId +"','"+ userName +"','"+ date +"','"+ rating +"','"+ comment +"','"+ pollingId +"')";
	db.query(insertQuery, function (error, results, fields) {
		if(!error) {
			cb(null,"success")
		} else {
			cb(error)
		}
	});
}

pollingModel.list = function(req,cb) {
	var querystr = "SELECT * FROM pollbox where isApproved = 'true'";
	if(req.user == "admin") {
		querystr = "SELECT * FROM pollbox";
	}
	db.query(querystr, function (error, results, fields) {
		if(!error) {
			var responseObjFull = [];
			async.each(results,function(currentRes,asyncCb) {
				var responseObj = currentRes;
				var querystr = "SELECT * FROM polling where pollId = '" + responseObj.pollingId + "'";
				db.query(querystr, function (error, pollingRes, fields) {
					responseObj.pollFor = pollingRes.length > 0?pollingRes:[];
					var querystr = "SELECT * FROM category where pollId = '" + responseObj.pollingId + "'";
					db.query(querystr, function (error, categoryRes, fields) {
						responseObj.Category = categoryRes.length > 0?categoryRes:[];
						var querystr = "SELECT * FROM answer where pollId = '" + responseObj.pollingId + "'";
						db.query(querystr, function (error, answerRes, fields) {
							responseObj.options = answerRes.length > 0?answerRes:[];
							//var querystr = "SELECT * FROM user where deviceId = '" + responseObj.deviceId + "'";
							//db.query(querystr, function (error, deviceIdRes, fields) {
								//responseObj.user = deviceIdRes.length > 0?deviceIdRes:[];
								var querystr = "SELECT * FROM comments where pollingId = '" + responseObj.pollingId + "'";
								db.query(querystr, function (error, deviceIdRes, fields) {
									responseObj.comments = deviceIdRes.length > 0?deviceIdRes:[];
									responseObj.commentsCount = deviceIdRes.length;
									var querystr = "SELECT COUNT(*) as count,id FROM polledbox WHERE pollId = '" + responseObj.pollingId + "' GROUP BY id";
									db.query(querystr, function (error, resultsRes, fields) {
										responseObj.results = resultsRes.length > 0?resultsRes:[];
										responseObjFull.push(responseObj)
										asyncCb();
									});									
								});
								//responseObjFull.push(responseObj)
								//asyncCb();
							//});
						});
					});
				})
			},function(err,success) {
				cb(null,responseObjFull)
			})
		} else {
			cb(error)
		}
	});
}
pollingModel.create = function(request,cb) {
	var isAdmin = request.admin,
		isApproved = request.admin?true:false,
		charttype = request.chartType,
		optionCount = request.optionCount,
		Question = request.Question,
		photo = request.photo,
		startDate = request.startDate,
		endDate = request.endDate,
		deviceId = request.deviceId,	
		pollGenerator = request.pollGenerator,	
		generatorId = request.generatorId,	
		friend = request.friend,	
		optionsType = request.optionsType,	
		pollingId = uuidV1()
	var queryStr = "insert into pollbox(isAdmin,isApproved,charttype,optionCount,Question,photo,startDate,endDate,pollingId,deviceId,pollGenerator,generatorId,friend,optionsType) values('" + isAdmin +"','" + isApproved+"','" + charttype+"','" + optionCount+"','" + Question+"','" + photo+"','" + startDate+"','" + endDate+"','"+pollingId+"','"+deviceId+"','"+ pollGenerator+"','" + generatorId+"','"+friend+"','"+optionsType+"')";
	db.query(queryStr, function (error, results, fields) {
		//console.log(error,queryStr)
		if(!error) {
			pollingModel.pollfor(request,pollingId,function(err,succ) {
				if(!err) {
					pollingModel.category(request,pollingId,function(err,succ) {
						if(!err) {
							pollingModel.answer(request,pollingId,function(err,succ) {
								if(!err) {
									cb(null,"succ")
								}
							})
						}
					})
				}
			})
			
		} else {
			cb(error)
		}
	})
}
pollingModel.pollfor = function(request,pollingId,cb) {
	if(request.pollFor && request.pollFor.length > 0) {
		async.each(request.pollFor,function(objectins,asyCb) {
			var queryStr = "insert into polling(id,name,pollId) values('" + objectins.id +"','" + objectins.name +"','" + pollingId+"')";
			db.query(queryStr, function (error, results, fields) {
				asyCb()
			})
		},function() {
			cb(null,"succ")
		})
	} else {
		cb(null,"succ")
	}
}

pollingModel.answer = function(request,pollingId,cb) {
	if(request.options && request.options.length > 0) {
		async.each(request.options,function(objectins,asyCb) {
			var queryStr = "insert into answer(answerid,name,pollId) values('" + objectins.id +"','" + objectins.name +"','" + pollingId+"')";
			db.query(queryStr, function (error, results, fields) {
				asyCb()
			})
		},function() {
			cb(null,"succ")
		})
	} else {
		cb(null,"succ")
	}
}

pollingModel.category = function(request,pollingId,cb) {
	if(request.Category && request.Category.length > 0) {
		async.each(request.Category,function(objectins,asyCb) {
			var queryStr = "insert into category(id,name,selected,pollId) values('" + objectins.id +"','" + objectins.name +"','"+ objectins.selected +"','" + pollingId+"')";
			db.query(queryStr, function (error, results, fields) {
				asyCb()
			})
		},function() {
			cb(null,"succ")
		})
	} else {
		cb(null,"succ")
	}
}

pollingModel.pollSubmit = function(request,cb) {
	var VoterName = request.VoterName,
		userId = request.userId,
		pollId = request.pollingId,
		id = request.id,
		name = request.name,
		deviceId = request.deviceId,
		submittedOn = moment().format("YYYY-MM-DD hh:mm:ss");
	var queryStr = "insert into polledbox(VoterName,userId,pollId,id,name,submittedOn,deviceId) values('" + VoterName +"','" + userId +"','"+ pollId +"','" + id+"','" + name +"','"+ submittedOn +"','" + deviceId+"')";
	db.query(queryStr, function (error, results, fields) {
		//console.log(error,queryStr)
		if(!error) {
			cb(null,"success")
		} else {
			cb(error)
		}
	})
}
pollingModel.toppoll = function(request,cb) {
	var querystr = "SELECT *,COUNT(*) AS cnt FROM polledbox GROUP BY pollId ORDER BY cnt DESC LIMIT " + (request.limit || 5);
	db.query(querystr, function (error, results, fields) {
		if(!error) {
			var responseObjFull = [];
			async.each(results,function(currentRes,asyncCb) {
				var querystr = "SELECT * FROM pollbox where isApproved = 'true' and pollingId = '" + currentRes.pollId + "'";
				db.query(querystr, function (error, pollingResMain, fields) {
					var responseObj = pollingResMain[0];
					var querystr = "SELECT * FROM polling where pollId = '" + currentRes.pollId + "'";
					db.query(querystr, function (error, pollingRes, fields) {
						responseObj.pollFor = pollingRes.length > 0?pollingRes:[];
						var querystr = "SELECT * FROM category where pollId = '" + currentRes.pollId + "'";
						db.query(querystr, function (error, categoryRes, fields) {
							responseObj.Category = categoryRes.length > 0?categoryRes:[];
							var querystr = "SELECT * FROM answer where pollId = '" + currentRes.pollId + "'";
							db.query(querystr, function (error, answerRes, fields) {
								responseObj.options = answerRes.length > 0?answerRes:[];
								//var querystr = "SELECT * FROM user where deviceId = '" + currentRes.deviceId + "'";
								//db.query(querystr, function (error, deviceIdRes, fields) {
									//responseObj.user = deviceIdRes.length > 0?deviceIdRes:[];
									var querystr = "SELECT * FROM comments where pollingId = '" + currentRes.pollId + "'";
									db.query(querystr, function (error, deviceIdRes, fields) {
										responseObj.comments = deviceIdRes.length > 0?deviceIdRes:[];
										responseObj.commentsCount = deviceIdRes.length;
										var querystr = "SELECT COUNT(*) as count,id FROM polledbox WHERE pollId = '" + currentRes.pollId + "' GROUP BY id";
										db.query(querystr, function (error, resultsRes, fields) {
											responseObj.results = resultsRes.length > 0?resultsRes:[];
											responseObjFull.push(responseObj)
											asyncCb();
										});									
									});
									//responseObjFull.push(responseObj)
									//asyncCb();
								//});
							});
						});
					})
				});
			},function(err,success) {
				cb(null,responseObjFull)
			})
		} else {
			cb(error)
		}
	});
};
module.exports = pollingModel;