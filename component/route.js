var login = require("./controller/login");
var polling = require("./controller/polling");
const Joi = require('joi');

var route = [
	{
		method: 'GET',
		path:'/fblogin', 
		//handler: login.fbLogin,
		config: {
			handler: function() {},
		}
	},
	{
		method: 'GET',
		path:'/facebook-callback', 
		//handler:login.fbLoginCallback,
		config: {
			handler: function() {}
		}
	},
	{
		method: 'POST',
		path:'/register',
		config: {		
			handler:login.registerUser,
			description: 'register new User',
			notes: 'register',
			tags: ['api'],
			validate: {
				payload: {
					name: Joi.string().required(),
					userId: Joi.number().required(),
					loginPortal: Joi.string().required(),
					email: Joi.string().required(),
					thumbnail: Joi.string().optional().allow(''),
					dob: Joi.string().optional().allow(''),
					nationality: Joi.string().optional().allow(''),
					sex: Joi.string().optional().allow(''),
					phoneNumber: Joi.string().optional().allow(''),
					deviceId: Joi.string().required(),
					appId: Joi.string().required(),
					os: Joi.string().optional().allow('')
				}
			}
		}
	},
	{
		method: 'POST',
		path:'/login',
		config: {		
			handler:login.loginUser,
			description: 'login User',
			notes: 'login',
			tags: ['api'],
			validate: {
				payload: {
					deviceId: Joi.string().required()
				}
			}
		}
	},
	{
		method: 'get',
		path:'/list-poll/{user}',
		config: {		
			handler:polling.list,
			description: 'list polling',
			notes: 'polling',
			tags: ['api'],
			validate: {
				params: {
					user:Joi.string().required().allow('admin','user')
				}
			}
		}
	},
	{
		method: 'post',
		path:'/comments',
		config: {		
			handler:polling.comments,
			description: 'add comments polling',
			notes: 'polling',
			tags: ['api'],
			validate: {
				payload: {
					pollingId:Joi.string().required(),
					userId:Joi.string().required(),
					userName:Joi.string().required(),
					rating:Joi.number().required(),
					comment:Joi.string().optional(),
				}
			}
		}
	},	
	{
		method: 'post',
		path:'/poll-submit',
		config: {		
			handler:polling.pollSubmit,
			description: 'add comments polling',
			notes: 'polling',
			tags: ['api'],
			validate: {
				payload: {
					pollingId:Joi.string().required(),
					userId:Joi.string().required(),
					VoterName:Joi.string().required(),
					name:Joi.string().required(),
					id:Joi.string().required(),
					deviceId:Joi.string().required(),
				}
			}
		}
	},
	{
		method: 'put',
		path:'/update-poll',
		config: {		
			handler:polling.updatePoll,
			description: 'update polling',
			notes: 'polling',
			tags: ['api'],
			validate: {
				payload: {
					status:Joi.string().optional(),
					pollingId:Joi.string().required(),
					isStarted:Joi.boolean().optional()
				}
			}
		}
	},
	{
		method: 'get',
		path:'/top-poll/{limit}',
		config: {		
			handler:polling.toppoll,
			description: 'top polling',
			notes: 'polling',
			tags: ['api'],
			validate: {
				params: {
					limit:Joi.number().required()
				}
			}
		}
	},
	{
		method: 'POST',
		path:'/create-poll',
		config: {		
			handler:polling.create,
			description: 'create polling',
			notes: 'polling',
			tags: ['api'],
			validate: {
				payload: {
					"admin":Joi.boolean().required(),
					"pollGenerator":Joi.string().required(),
					"generatorId":Joi.string().required(),
					"friend":Joi.string().required(),
					"pollId":Joi.string().required(),
					"pollFor":  Joi.array().items(Joi.object({
						"id":Joi.string().required(),
						"name":Joi.string().required()
					})).optional(),
					"chartType":Joi.string().required(),
					"optionCount":Joi.number().required(),
					"Question":Joi.string().required(),
					"optionsType":Joi.string().required(),
					"options":Joi.array().items(Joi.object({
						"id":Joi.string().required(),
						"name":Joi.string().required()
					})).optional(),
					"Category":Joi.array().items(Joi.object({
						"id":Joi.string().required(),
						"name":Joi.string().required(),
						"selected":Joi.boolean().required()
					})).optional(),					
					"deviceId":Joi.string().required(),
					"photo":Joi.string().optional().allow(''),
					"startDate":Joi.string().optional().allow(''),
					"endDate":Joi.string().optional().allow('')
				}
			}
		}
	}
];

module.exports = route;