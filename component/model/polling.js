var db = require("./db.js");
const uuidV1 = require('uuid/v1');
const async = require('async');
const moment = require('moment');
var mkdirp = require('mkdirp');
var fs = require('fs');
var getDirName = require('path').dirname;
var base64ToImage = require('base64-to-image');
var pollingModel = {};

pollingModel.comments = function(req,cb){
	//2017-01-26 21:15:01
	var userId = req.userId,
		userName = req.userName,
		date = moment().format("YYYY-MM-DD hh:mm:ss"),
		rating = req.rating,
		comment = req.comment ? req.comment : "",
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


pollingModel.deletepoll = function(req,cb) {
	querStr = "isDeleted = 1";
	if(querStr != "") {
		var queryStr = "update pollbox set " + querStr + " where pollingId='"+req.pollId+"'";
		db.query(queryStr, function (error, results, fields) {
			//console.log(error,queryStr)
			if(!error) {
				cb(null,"success")
			} else {
				cb(error)
			}
		})
	} else {
		cb(error);
	}
}
pollingModel.ongoinglist = function(cb) {
	var querystr = "SELECT * FROM pollbox WHERE startDate <= CURDATE() AND  endDate >= CURDATE() and isApproved = 'true' and isStarted='true' and isDeleted = 0";
	db.query(querystr, function (error, results, fields) {
		if(!error) {
			var responseObjFull = [];
			async.each(results,function(currentRes,asyncCb) {
				var responseObj = currentRes;
				responseObj.startDate = responseObj.startDate + " ";
				responseObj.endDate = responseObj.endDate + " ";
				//var querystr = "SELECT * FROM polling where pollId = '" + responseObj.pollingId + "'";
				//db.query(querystr, function (error, pollingRes, fields) {
					//responseObj.pollFor = pollingRes.length > 0?pollingRes:[];
					//var querystr = "SELECT * FROM category where pollId = '" + responseObj.pollingId + "'";
					//db.query(querystr, function (error, categoryRes, fields) {
						//responseObj.Category = categoryRes.length > 0?categoryRes:[];
						responseObj.pollFor = [{"id":responseObj.pollForId,"name":responseObj.pollForName}];
						responseObj.Category = [{"id":responseObj.categoryId,"name":responseObj.categoryName,"selected":true}];						
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
									var querystr = "SELECT COUNT(*) as count,id,name FROM polledbox WHERE pollId = '" + responseObj.pollingId + "' GROUP BY id";
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
					//});
				//})
			},function(err,success) {
				cb(null,responseObjFull)
			})
		} else {
			cb(error)
		}
	});
}


pollingModel.listByuser = function(req,cb) {
	pollingModel.list(req,function(err,succ) {
		if(err) {
			cb(err)
		} else {
			cb(null,succ)
		}
	},"list");
	
}
pollingModel.singlepoll = function(req,cb) {
	//console.log(req)
	pollingModel.list(req,function(err,succ) {
		if(err || succ.length == 0) {
			cb(true)
		} else {
			cb(null,succ[0] || {})
		}
	},"single");
	
}


pollingModel.imageData = function(req,cb) {
	var base64Str = req.imageData;
	var path ='images/';
	var optionalObj = {'fileName': uuidV1(), 'type':'png'};
	var imageInfo = base64ToImage(base64Str,path,optionalObj); ;
	//console.log(optionalObj)
	cb(null,path + optionalObj.fileName + "." + optionalObj.type)
}
pollingModel.list = function(req,cb,listByuser) {
	console.log(req);
	var querystr = "";
	if(listByuser == "single") {
		querystr = "SELECT * FROM pollbox where pollingId = '" + req.pollId + "' and isDeleted = 0";
	} else if(listByuser == "list"){
		querystr = "SELECT * FROM pollbox where generatorId = '" + req.userId + "' and isDeleted = 0";
	} else {
		querystr = "SELECT * FROM pollbox where isApproved = 'true' and isDeleted = 0";
		if(req.user == "admin") {
			querystr = "SELECT * FROM pollbox where isDeleted = 0";
		}
	}
	var deviceDetails ={};
	var querystrDevice = "SELECT * FROM user where deviceId = '" + req.deviceId + "'";
	db.query(querystrDevice, function (error, deviceIdRes, fields) {
		deviceDetails = deviceIdRes.length > 0?deviceIdRes[0]:[];
		db.query(querystr, function (error, results, fields) {
			if(!error) {
				var responseObjFull = [];
				async.each(results,function(currentRes,asyncCb) {
					var responseObj = currentRes;				
					responseObj.startDate = responseObj.startDate + " ";
					responseObj.endDate = responseObj.endDate + " ";
					//var querystr = "SELECT * FROM polling where pollId = '" + responseObj.pollingId + "'";
					//db.query(querystr, function (error, pollingRes, fields) {
						//responseObj.pollFor = pollingRes.length > 0?pollingRes:[];
						//var querystr = "SELECT * FROM category where pollId = '" + responseObj.pollingId + "'";
						//db.query(querystr, function (error, categoryRes, fields) {
							//responseObj.Category = categoryRes.length > 0?categoryRes:[];
							responseObj.pollFor = [{"id":responseObj.pollForId,"name":responseObj.pollForName}];
							responseObj.Category = [{"id":responseObj.categoryId,"name":responseObj.categoryName,"selected":true}];
							responseObj.currentDate = moment().format();
							var querystr = "SELECT * FROM answer where pollId = '" + responseObj.pollingId + "'";
							db.query(querystr, function (error, answerRes, fields) {
								responseObj.options = answerRes.length > 0?answerRes:[];
								var querystr = "SELECT * FROM user where deviceId = '" + responseObj.deviceId + "'";
								db.query(querystr, function (error, deviceIdRes, fields) {
									responseObj.user = deviceIdRes.length > 0?deviceIdRes:[];
									var push = true;									
									if(deviceDetails && deviceDetails.dob && deviceDetails.dob != "0000-00-00" && deviceDetails.isAdmin == 0) {
										//var dob = moment(responseObj.user[0].dob).format();
										var dobCheck = false;
										//console.log(deviceDetails,"dddd")
										if(deviceDetails.dob && deviceDetails.dob != "0000-00-00") {
											var deviveDob = moment(deviceDetails.dob);	
											var curDate = moment();	
											var yeardiff =  curDate.diff(deviveDob,"year");
											//console.log(yeardiff)
											//yeardiff = +yeardiff.split(" ")[0];
											dobCheck = true;											 
										}										
										if(responseObj.pollForId == "p2" && deviceDetails.sex) {
											if(deviceDetails.sex != "female") {
												push = false
											}
										} else if(responseObj.pollForId == "p3" && deviceDetails.sex) {
											if(deviceDetails.sex != "male") {
												push = false
											}											
										} else if(responseObj.pollForId == "p4" && dobCheck) {
											if(yeardiff > 18) {
												push = false
											}											
										} else if(responseObj.pollForId == "p5" && dobCheck) {
											//console.log("in")
											if(yeardiff < 18 || yeardiff > 30) {
												push = false
											}
										}										
										//console.log(yeardiff)
									}
									if(push) {
										var querystr = "SELECT * FROM comments where pollingId = '" + responseObj.pollingId + "'";
										db.query(querystr, function (error, deviceIdRes, fields) {
											responseObj.comments = deviceIdRes.length > 0?deviceIdRes:[];
											responseObj.commentsCount = deviceIdRes.length;
											var querystr = "SELECT COUNT(*) as count,id,name FROM polledbox WHERE pollId = '" + responseObj.pollingId + "' GROUP BY id";
											db.query(querystr, function (error, resultsRes, fields) {
												responseObj.results = resultsRes.length > 0?resultsRes:[];
												if(req.deviceId) {
													var querystr = "SELECT * FROM polledbox WHERE pollId = '" + responseObj.pollingId + "' and deviceId='" + req.deviceId +"'";
													db.query(querystr, function (error, votedRes, fields) {
														responseObj.userVoted = votedRes.length > 0?true:false;
														responseObjFull.push(responseObj)
														asyncCb();
													});
												} else {
													responseObj.userVoted = false;
													responseObjFull.push(responseObj)
													asyncCb();
												}
											});									
										});
									} else {
										asyncCb();
									}
										
									//responseObjFull.push(responseObj)
									//asyncCb();
									//})
								});
							});
						//});
					//})
				},function(err,success) {
					cb(null,responseObjFull)
				})
			} else {
				cb(error)
			}
		});
	});
	//console.log(querystr)
	
}
pollingModel.create = function(request,cb) {
	var isAdmin = request.admin,
		isApproved = request.admin?true:false,
		charttype = request.chartType,
		optionCount = request.optionCount,
		Question = request.Question,
		photo = request.photo,
		startDate = moment(request.startDate,"YYYY-MM-DD").format("YYYY-MM-DD"),
		endDate = moment(request.endDate,"YYYY-MM-DD").format("YYYY-MM-DD"),
		deviceId = request.deviceId,	
		pollGenerator = request.pollGenerator,	
		generatorId = request.generatorId,	
		friend = request.friend,	
		optionsType = request.optionsType,	
		pollingId = uuidV1(),
		pollForId = request.pollFor[0].id,
		pollForName = request.pollFor[0].name,
		categoryId = request.Category[0].id,
		categoryName = request.Category[0].name;
	//var queryStr = "insert into pollbox(isAdmin,isApproved,charttype,optionCount,Question,photo,startDate,endDate,pollingId,deviceId,pollGenerator,generatorId,friend,optionsType) values('" + isAdmin +"','" + isApproved+"','" + charttype+"','" + optionCount+"','" + Question+"','" + photo+"','" + startDate+"','" + endDate+"','"+pollingId+"','"+deviceId+"','"+ pollGenerator+"','" + generatorId+"','"+friend+"','"+optionsType+"')";
	var queryStr = "insert into pollbox(isAdmin,isApproved,charttype,optionCount,Question,photo,startDate,endDate,pollingId,deviceId,pollGenerator,generatorId,friend,optionsType,pollForId,pollForName,categoryId,categoryName) values('" + isAdmin +"','" + isApproved+"','" + charttype+"','" + optionCount+"','" + Question+"','" + photo+"','" + startDate+"','" + endDate+"','"+pollingId+"','"+deviceId+"','"+ pollGenerator+"','" + generatorId+"','"+friend+"','"+optionsType+"','"+pollForId+"','"+pollForName+"','"+categoryId+"','"+categoryName+"')";
	db.query(queryStr, function (error, results, fields) {
		//console.log(error,queryStr)
		if(!error) {
			//pollingModel.pollfor(request,pollingId,function(err,succ) {
				//if(!err) {
					//pollingModel.category(request,pollingId,function(err,succ) {
						//if(!err) {
							pollingModel.answer(request,pollingId,function(err,succ) {
								if(!err) {
									cb(null,"succ")
								}
							})
						//}
					//})
				//}
			//})
			
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
			pollingModel.singlepoll({pollId:pollId},function(err,succ) {
				cb(null,succ)
			})
			
		} else {
			cb(error)
		}
	})
}



pollingModel.updatePoll = function(request,cb) {
	var pollId = request.pollingId,
		status = request.status,
		isStarted = request.isStarted,
		querStr = "";
		if(status != undefined) {
			querStr = "isApproved='"+status+"' ";
		}
		if(isStarted != undefined) {
			querStr = "isStarted='"+isStarted+"' ";
		}
		if(querStr != "") {
			var queryStr = "update pollbox set " + querStr + " where pollingId='"+pollId+"'";
			db.query(queryStr, function (error, results, fields) {
				//console.log(error,queryStr)
				if(!error) {
					cb(null,"success")
				} else {
					cb(error)
				}
			})
		} else {
			cb(error);
		}
	
}
pollingModel.toppoll = function(request,cb) {
	var querystr = "SELECT *,COUNT(*) AS cnt FROM polledbox GROUP BY pollId ORDER BY cnt DESC LIMIT " + (request.limit || 5);
	db.query(querystr, function (error, results, fields) {
		if(!error) {
			var responseObjFull = [];
			async.each(results,function(currentRes,asyncCb) {
				var querystr = "SELECT * FROM pollbox where isApproved = 'true' and pollingId = '" + currentRes.pollId + "' and isDeleted = 0";
				db.query(querystr, function (error, pollingResMain, fields) {
					var responseObj = pollingResMain[0];
					//var querystr = "SELECT * FROM polling where pollId = '" + currentRes.pollId + "'";
					//db.query(querystr, function (error, pollingRes, fields) {
						//responseObj.pollFor = pollingRes.length > 0?pollingRes:[];
						//var querystr = "SELECT * FROM category where pollId = '" + currentRes.pollId + "'";
						//db.query(querystr, function (error, categoryRes, fields) {
							//responseObj.Category = categoryRes.length > 0?categoryRes:[];
							responseObj.pollFor = [{"id":responseObj.pollForId,"name":responseObj.pollForName}];
							responseObj.Category = [{"id":responseObj.categoryId,"name":responseObj.categoryName,"selected":true}];						
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
										var querystr = "SELECT COUNT(*) as count,id,name FROM polledbox WHERE pollId = '" + currentRes.pollId + "' GROUP BY id";
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
						//});
					//})
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