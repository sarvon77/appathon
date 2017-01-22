var pollingModel = require("../model/polling");
var pollingController = {};

pollingController.create = function(req,reply){
	pollingModel.create(req.payload,function(err,succ) {
		if(!err) {
			return reply({status:200,"message":"success"});
		} else {
			return reply({status:400,"message":"failed"})
		}
	})
}
pollingController.list = function(req,reply){
	pollingModel.list(req.params,function(err,succ) {
		if(err) {
			return reply({status:400,"message":"failed"});
		} else {
			return reply({status:200,"data":succ})
		}
	})
}
pollingController.toppoll = function(req,reply){
	pollingModel.toppoll(req.params,function(err,succ) {
		if(err) {
			return reply({status:400,"message":"failed"});
		} else {
			return reply({status:200,"data":succ})
		}
	})
}


pollingController.pollSubmit = function(req,reply){
	pollingModel.pollSubmit(req.payload,function(err,succ) {
		if(!err) {
			return reply({status:200,"message":"success"});
		} else {
			return reply({status:400,"message":"failed"})
		}
	})
}
pollingController.comments = function(req,reply){
	pollingModel.comments(req.payload,function(err,succ) {
		if(err) {
			return reply({status:400,"message":"failed"});
		} else {
			return reply({status:200,"message":"success"})
		}
	})
}

module.exports = pollingController